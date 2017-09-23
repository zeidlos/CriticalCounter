import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database'

import { Geolocation } from '@ionic-native/geolocation'
import { FIREBASE_CREDENTIALS } from './firebase.credentials'

import { CriticalCounterApp } from './app.component';
import { CounterPageModule } from './../pages/counter/counter.module';

@NgModule({
  declarations: [
    CriticalCounterApp,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(CriticalCounterApp),
    // Initialize AngularFireModule
    AngularFireModule.initializeApp(FIREBASE_CREDENTIALS),
    AngularFireDatabaseModule,
    CounterPageModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    CriticalCounterApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
