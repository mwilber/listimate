import { AngularFireDatabase } from 'angularfire2/database';
import { ListService } from './../services/list.service';
import { SignupPage } from './../pages/signup/signup';
import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

import { HomePage } from '../pages/home/home';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { AuthService } from '../services/auth.service';
import { SigninPage } from '../pages/signin/signin';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = SigninPage;
  signinPage:any = SigninPage;
  signupPage:any = SignupPage;
  isAuthenticated = false;
  @ViewChild('nav') nav: NavController;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private menuCtrl: MenuController,
    private authService:AuthService,
    private listSrv: ListService,
    public afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase) {
    // firebase.initializeApp({
    //   apiKey: "AIzaSyDMTmZp8ApiHFQRNwnHV_LlvQcPGKUFAb0",
    //   authDomain: "listimate.firebaseapp.com",
    //   databaseURL: "https://listimate.firebaseio.com",
    //   projectId: "listimate",
    //   storageBucket: "listimate.appspot.com",
    //   messagingSenderId: "564163854220"
    // });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit(){

    this.afAuth.authState.subscribe((user)=>{
      //alert('pause');
      if(user){
        this.isAuthenticated = true;
        this.authService.uid = user.uid;
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

