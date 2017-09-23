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
  bikes: [Bike];

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
      console.log(data);
      this.location = data;
    })
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CounterPage');
  }

  getLocation(): any {
    this.geoLocation.getCurrentPosition()
      .then(
        (res) => {
          console.log('Location: ', res);
          return res;
        }
      ).catch(
        (err) => {
          console.log('Error getting location: ', err);
        }
      )
  }


  // Adds a new bike to the current count
  // Only avaible if device has a location,
  // so no error handling required.
  addBike() {
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

  // Starts a new count to the current mass
  // You start a new count if you are at a new location and start to count bikes again.
  addCount() {

  }

  // Navigates to a page. Who would have guessed? ;)
  navigateTo(page) {
    this.navCtrl.push(page + 'Page');
  }

}
