import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { ShopList } from '../../models/shop-list.model';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage implements OnInit {

  shopList: ShopList;

  constructor(public navParams: NavParams) {}

  ngOnInit(){
    this.shopList = this.navParams.data;
  }

}
