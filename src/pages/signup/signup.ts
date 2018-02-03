import { SigninPage } from './../signin/signin';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  signinPage:any = SigninPage;

  constructor(public navCtrl: NavController, public navParams: NavParams, private authService: AuthService, private alertCtrl:AlertController, private loadingController: LoadingController) {
  }

  onSignup(form: NgForm){
    const loading = this.loadingController.create({
      content: "Signing you up..."
    });
    loading.present();
    this.authService.SignUp(form.value.email, form.value.password)
      .then((data)=>{
        loading.dismiss();
      })
      .catch(error=> {
        loading.dismiss();
        const alert = this.alertCtrl.create({
          title: 'Signup failed',
          message: error.message,
          buttons: ['Ok']
        });
        alert.present();
      });
  }

}
