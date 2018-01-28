import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ListService } from '../../services/list.service';
import { ShopList } from '../../models/shop-list.model';
import { ListPage } from '../list/list';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  listPage = ListPage;
  addListForm: FormGroup;
  lists: ShopList[];

  constructor(
    public navCtrl: NavController,
    private listSrv: ListService,
    private storage: Storage
  ) {
  }

  ngOnInit(){

    //Pull saved lists from local storage
    this.storage.get('lists').then((val) => {
      if( val ){
        JSON.parse(val).forEach((list, idx)=>{
          this.listSrv.UpdateList(JSON.stringify(list), idx)
        });
        this.RefreshLists();
      }
    });

    this.InitAddListForm();
    this.RefreshLists();

    this.listSrv.listSave.subscribe((data)=>{
      let cache = [];
      this.storage.set('lists', JSON.stringify(this.listSrv.GetLists(), function(key, value) {
          if (typeof value === 'object' && value !== null) {
              if (cache.indexOf(value) !== -1) {
                  // Circular reference found, discard key
                  return;
              }
              // Store value in our collection
              cache.push(value);
          }
          return value;
      }));
      cache = null;
    });
  }

  ionViewDidEnter(){
    this.RefreshLists();
  }

  InitAddListForm(){
    this.addListForm = new FormGroup({
      'title': new FormControl(null, Validators.required)
    });
  }

  onAddList(){
    this.listSrv.AddList(this.addListForm.get('title').value);
    this.addListForm.reset();
    this.RefreshLists();
  }

  RefreshLists(){
    this.lists = this.listSrv.GetLists();
  }

  onRemoveFromLists(list: ShopList){
    this.listSrv.RemoveListFromLists(list);
    this.RefreshLists();
  }

}
