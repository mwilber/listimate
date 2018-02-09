import { ItemsortPipe } from './sort.pipe';
import { ItemService } from './../services/item.service';
import { SignupPage } from './../pages/signup/signup';
import { SigninPage } from './../pages/signin/signin';
import { AuthService } from './../services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListService } from '../services/list.service';
import { ListPage } from '../pages/list/list';
import { IonicStorageModule } from '@ionic/storage';
import { OptionsPage } from '../pages/home/options';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDMTmZp8ApiHFQRNwnHV_LlvQcPGKUFAb0",
  authDomain: "listimate.firebaseapp.com",
  databaseURL: "https://listimate.firebaseio.com",
  projectId: "listimate",
  storageBucket: "listimate.appspot.com",
  messagingSenderId: "564163854220"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    OptionsPage,
    SigninPage,
    SignupPage,
    ItemsortPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpModule,
    IonicStorageModule.forRoot({
      name: 'listimate',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    OptionsPage,
    SigninPage,
    SignupPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireDatabase,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ListService,
    ItemService,
    AuthService
  ]
})
export class AppModule {}
