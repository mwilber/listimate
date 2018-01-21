import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ListService } from '../../services/list.service';
import { ShopList } from '../../models/shop-list.model';
import { ListPage } from '../list/list';

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
    private listSrv: ListService) {

  }

  ngOnInit(){
    this.InitAddListForm();
    this.RefreshLists();
  }

  InitAddListForm(){
    this.addListForm = new FormGroup({
      'title': new FormControl(null, Validators.required)
    });
  }

  onAddList(){
    this.listSrv.addList(this.addListForm.get('title').value);
    this.addListForm.reset();
    this.RefreshLists();
  }

  RefreshLists(){
    this.lists = this.listSrv.getLists();
  }

  onRemoveFromLists(list: ShopList){
    this.listSrv.RemoveListFromLists(list);
    this.RefreshLists();
  }

}
