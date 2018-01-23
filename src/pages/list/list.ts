import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { ShopList } from '../../models/shop-list.model';
import { Item } from '../../models/item.model';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage implements OnInit {

  shopList: ShopList;
  public addItemForm: FormGroup;

  constructor(public navParams: NavParams) {}

  ngOnInit(){
    this.shopList = this.navParams.data;
    this.InitAddItemForm();
  }

  InitAddItemForm(){
    this.addItemForm = new FormGroup({
      'title': new FormControl(null, Validators.required)
    });
  }

  onAddItem(){
    this.shopList.addItem(this.addItemForm.get('title').value, 0);
    this.addItemForm.reset();
    this.RefreshItems();
  }

  RefreshItems(){
    //TODO: load list back into listsrv and save
  }

  onRemoveFromList(item: Item){
    //this.listSrv.RemoveListFromLists(list);
    this.RefreshItems();
  }

}
