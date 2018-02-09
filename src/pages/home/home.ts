import { Observable } from 'rxjs/Observable';
import { OptionsPage } from './options';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ListService } from '../../services/list.service';
import { ShopList } from '../../models/shop-list.model';
import { ListPage } from '../list/list';
import { Storage } from '@ionic/storage';
import { PopoverController } from 'ionic-angular/components/popover/popover-controller';
import { AuthService } from '../../services/auth.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import 'rxjs/Rx';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  listPage = ListPage;
  addListForm: FormGroup;
  lists: Observable<any[]>;

  constructor(
    public navCtrl: NavController,
    private listSrv: ListService,
    private storage: Storage,
    private popoverCtrl: PopoverController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
  }

  ngOnInit(){

    // //Pull saved lists from local storage
    // this.storage.get('lists').then((val) => {
    //   if( val ){
    //     JSON.parse(val).forEach((list, idx)=>{
    //       this.listSrv.UpdateList(JSON.stringify(list), idx)
    //     });
    //     this.RefreshLists();
    //   }
    // });

    this.InitAddListForm();

    // this.listSrv.listSave.subscribe((data)=>{
    //   let cache = [];
    //   this.storage.set('lists', JSON.stringify(this.listSrv.GetLists()));
    //   cache = null;
    // });

    //this.lists = this.listSrv.lists;
    //this.listSrv.FirebaseConnect();
  }

  ionViewDidEnter(){

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
    this.listSrv.RemoveListFromLists(list);
  }

  onShowOptions(event: MouseEvent){
    const loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    const popover = this.popoverCtrl.create(OptionsPage);
    popover.present({ev: event});
    popover.onDidDismiss(
      data => {
        if(!data){
          return;
        }
        if(data.action == 'load'){
          loading.present();
          this.authService.GetActiveUser().getToken()
            .then((token: string)=>{
              this.listSrv.RemoteFetch(token)
              .subscribe(
                (lists: ShopList[]) => {
                  loading.dismiss();
                  if(lists){
                    lists.forEach((list, idx)=>{
                      this.listSrv.UpdateList(JSON.stringify(list), idx)
                    });
                    //this.RefreshLists();
                  }else{
                    //this.lists = [];
                  }
                },
                error => {
                  loading.dismiss();
                  this.HandleError(error.json().error);
                }
              );
            });
        }else if(data.action == 'store'){
          loading.present();
          this.authService.GetActiveUser().getToken()
            .then((token: string)=>{
              this.listSrv.RemoteStore(token);
              // .subscribe(
              //   () => loading.dismiss(),
              //   error => {
              //     loading.dismiss();
              //     this.HandleError(error.json().error);
              //   }
              // );
            });
            loading.dismiss();
        }else if(data.action == 'connect'){
          this.lists = this.listSrv.FirebaseConnect();
        }
      }
    )
  }

  private HandleError(errorMsg: string){
    const alert = this.alertCtrl.create({
      title: 'An error occurred!',
      message: errorMsg,
      buttons: ['Ok']
    });
    alert.present();
  }

}
