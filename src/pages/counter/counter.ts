import {
  NativeGeocoder,
  NativeGeocoderReverseResult,
} from '@ionic-native/native-geocoder';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Insomnia } from '@ionic-native/insomnia';
import { Geolocation } from '@ionic-native/geolocation';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Bikes } from './../../models/bikes';

@IonicPage({
  segment: 'counter'
})
@Component({
  selector: 'page-counter',
  templateUrl: 'counter.html',
})
export class CounterPage {
  // Tells the app if native geocoding is avaible or not.
  geoCodingAvaible: boolean = false;

  // If we have native geocoding, the location
  // will be stored in here.
  locationName: any = 'unknown';

  // Keeps the count of bikes local, to prevent hickups
  // with bad internet connection
  localCount: number = 0;

  // saves the last geolocation in order to compare if
  // counting device has moved
  lastGeopoint: any = {lat: 52.520007, long: 13.404954};

  // Unique device ID
  deviceId: any;

  // For each entry into the database, create a unique id
  entryId: string = '';

  // Stores coordinates from the Geolocation API
  location: any;

  // Watches Geolocation and it's changes
  watch: any;

  // Database reference
  bikesRef: FirebaseListObservable<any>;

  // Database
  database: AngularFireDatabase;

  // Object reference in which counting entries are stored.
  bikes: Bikes;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFireDatabase,
    private geoLocation: Geolocation,
    private insomnia: Insomnia,
    private uniqueDeviceID: UniqueDeviceID,
    private nativeGeoCoder: NativeGeocoder,
  ) {
    this.bikesRef = this.db.list('bike-list');
    this.bikesRef.subscribe();

    this.watch = this.geoLocation.watchPosition();
    this.watch.subscribe((data) => {
      // Debugging output, please leave
      console.log(data);
      this.location = data;
      if(this.geoCodingAvaible) {
        this.getGeoCode(
          this.location.coords.latitude,
          this.location.coords.longitude
        ).then(
          (res) => {
            this.locationName = res.administrativeArea;
          }
        )
      }
    })
  }

  // Taken from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  // and adapted to give metres instead of kilometres
  getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // this.deg2rad below
    var dLon = this.deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c * 1000; // Distance in m
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  resetCounter() {
    this.localCount = 0;
    this.generateEntryId();
  }

  // Saves current count object to the database
  saveData(obj) {
    return this.bikesRef.update(this.entryId, obj);
  }

  // Tries to get a unique device ID.
  generateDeviceId(): Promise<any> {
    return this.uniqueDeviceID.get()
    .then(
      (uuid: any) => {
        return uuid
      }
    )
    // If that is not possible, it generates a temporary,
    // hopefully unique ID.
    .catch(
      (error: any) => {
        console.log(error);
        return Math.floor(Math.random() * (1123581321 - 1)) + 1;
      }
    );
  }

  // Generates a unique id for the counting entry
  generateEntryId() {
    this.entryId = 'entry_' + this.deviceId + '__' + Math.floor(Math.random() * (1123581321 - 1)) + 1;
  }

  // Kind of self explaining function name. :)
  checkDistance(currentLat, currentLong) {
    if(
      this.getDistanceFromLatLonInM(
        currentLat,
        currentLong,
        this.lastGeopoint.lat,
        this.lastGeopoint.long,
      ) > 500
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Tries to get a location name based on Coordinates
  // Only works on iOS and Android
  getGeoCode(lat, long): Promise<any> {
    return this.nativeGeoCoder.reverseGeocode(lat, long)
      .then((res: NativeGeocoderReverseResult) => {
        this.geoCodingAvaible = true;
        return res;
      })
      // If it doesn't work, set to false
      .catch((err) => {
        console.log(err);
        this.geoCodingAvaible = false;
      })
  }

  // Adds a new bike to the current count
  // Only avaible if device has a location,
  // so no error handling required.

  // Also only resets the counter after having moved more than
  // 100m and also clicking to re-count
  addBike() {
    if(this.checkDistance(this.location.coords.latitude, this.location.coords.longitude)) {
      console.log('Distance is huuuge!');
      this.resetCounter();
    }

    this.lastGeopoint = {
      lat: this.location.coords.latitude,
      long: this.location.coords.longitude,
    };

    this.localCount++;
    this.bikes = {
      reporterId: this.deviceId,
      count: this.localCount,
      lastCoords: {
        locationName: this.locationName,
        accuracy: this.location.coords.accuracy,
        latitude: this.location.coords.latitude,
        longitude: this.location.coords.longitude,
      },
      // FIXME: Only updates if location changes.
      lastTime: this.location.timestamp,
      canceled: false,
    }

    console.log('Adding bike ... ', this.bikes);
    this.saveData(this.bikes);
  }


  // Navigates to a page. Who would have guessed? ;)
  navigateTo(page) {
    this.navCtrl.push(page + 'Page');
  }

  cancelCurrent() {
    this.bikes.canceled = true;
    this.saveData(this.bikes)
      .then(
        (res) => this.resetCounter()
      )
  }

  ionViewDidLoad(){
    this.generateDeviceId()
      .then((res) => {
        this.deviceId = res;
        this.generateEntryId();
      })
    // Prevents device from falling asleep
    this.insomnia.keepAwake()
      .then(
        () => console.log('Device got Espresso!'),
        () => console.log('Device is still sleepy. :(')
      )
  }
}
