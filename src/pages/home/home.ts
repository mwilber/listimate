import { Observable } from 'rxjs';
import { OnInit, Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ListService } from '../../services/list.service';
import { ListPage } from '../list/list';
import { SignupPage } from '../signup/signup';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  listPage = ListPage;
  addListForm: FormGroup;
  lists: Observable<any[]>;
  nav: NavController;

  constructor(
    public navCtrl: NavController,
    private listSrv: ListService,
    private authService:AuthService,
    public appCtrl: App,
  ) {

    this.nav = this.appCtrl.getRootNav();
  }

  ngOnInit(){
    this.InitAddListForm();
  }

  ionViewDidEnter(){
    this.lists = this.listSrv.FirebaseConnect();

  }

  InitAddListForm(){
    this.addListForm = new FormGroup({
      'title': new FormControl(null, Validators.required)
    });
  }

  onAddList(){
    this.listSrv.AddList(this.addListForm.get('title').value);
    this.addListForm.reset();
  }

  onRemoveFromLists(list: any){
    this.listSrv.RemoveList(list);
  }

  onLogout(){
    this.listSrv.Descruct();
    this.authService.LogOut();
    this.nav.setRoot(SignupPage);

  }


}
