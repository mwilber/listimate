import firebase from 'firebase';

export class AuthService{
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
