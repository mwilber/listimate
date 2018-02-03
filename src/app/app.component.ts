import { SignupPage } from './../pages/signup/signup';
import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import firebase from 'firebase';

import { HomePage } from '../pages/home/home';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { AuthService } from '../services/auth.service';
import { SigninPage } from '../pages/signin/signin';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  signinPage:any = SigninPage;
  signupPage:any = SignupPage;
  isAuthenticated = false;
  @ViewChild('nav') nav: NavController;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private menuCtrl: MenuController, private authService:AuthService) {
    firebase.initializeApp({
      apiKey: "AIzaSyDMTmZp8ApiHFQRNwnHV_LlvQcPGKUFAb0",
      authDomain: "listimate.firebaseapp.com"
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit(){
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.isAuthenticated = true;
        this.rootPage = HomePage;
      }else{
        this.isAuthenticated = false;
        this.rootPage = SignupPage;
      }
    });
  }

  onLoad(page: any){
    this.nav.setRoot(page);
    this.menuCtrl.close();
  }

  onLogout(){
    this.authService.LogOut();
    this.menuCtrl.close();
    this.nav.setRoot(SignupPage);
  }
}

