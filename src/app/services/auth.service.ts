import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public uid = null;

  SignUp(email: string, password: string){
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  SignIn(email: string, password: string){
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  LogOut(){
    firebase.auth().signOut();
  }

  GetActiveUser(){
      return firebase.auth().currentUser;

  }
}
