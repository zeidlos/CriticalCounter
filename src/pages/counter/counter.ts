import { Geolocation } from '@ionic-native/geolocation';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Bike } from './../../models/bike';

@IonicPage()
@Component({
  selector: 'page-counter',
  templateUrl: 'counter.html',
})
export class CounterPage {
  bike: Bike;
  bikeCount: number = 0;
  lastGeopoint: any = {lat: 52.520007, long: 13.404954};

  location: any;

  watch: any;
  bikesRef: FirebaseListObservable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFireDatabase,
    private geoLocation: Geolocation,
  ) {
    this.bikesRef = this.db.list('bike-list');
    this.bikesRef.subscribe();
    this.watch = this.geoLocation.watchPosition();
    this.watch.subscribe((data) => {
      // Debugging output, please leave
      console.log(data);
      this.location = data;
    })
  }

  // Taken from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula and adapted to give metres instead of kilometres
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
    this.bikeCount = 0;
  }

  checkDistance(currentLat, currentLong) {
    if(
      this.getDistanceFromLatLonInM(
        currentLat,
        currentLong,
        this.lastGeopoint.lat,
        this.lastGeopoint.long,
      ) > 100
    ) {
      return true;
    } else {
      return false;
    }
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

    this.bikeCount++;
    this.bike = {
      coords: {
        accuracy: this.location.coords.accuracy,
        altitude: this.location.coords.altitude,
        altitudeAccuracy: this.location.coords.altitudeAccuracy,
        heading: this.location.coords.heading,
        latitude: this.location.coords.latitude,
        longitude: this.location.coords.longitude,
        speed: this.location.coords.speed,
      },
      timestamp: this.location.timestamp,
    }

    console.log('Adding bike ... ', this.bike);
    this.bikesRef.push(this.bike);
  }


  // Navigates to a page. Who would have guessed? ;)
  navigateTo(page) {
    this.navCtrl.push(page + 'Page');
  }

}
