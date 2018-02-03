import { SignupPage } from './../signup/signup';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {

  signupPage:any = SignupPage;

  constructor(public navCtrl: NavController, public navParams: NavParams, private authService: AuthService, private loadingCtrl: LoadingController, private alertCtrl: AlertController) {
  }

  onSignin(form: NgForm){
    const loading = this.loadingCtrl.create({
      content: 'Signing in...'
    });
    loading.present();
    this.authService.SignIn(form.value.email, form.value.password)
      .then( data => {
        loading.dismiss();
      })
      .catch( error => {
        loading.dismiss();
        const alert = this.alertCtrl.create({
          title: 'Failed!',
          message: error.message,
          buttons: ['Ok']
        });
        alert.present();
      })
  }

}
