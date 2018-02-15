import { SignupPage } from './../pages/signup/signup';
import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
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
    public afAuth: AngularFireAuth) {


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

