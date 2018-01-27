import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { ShopList } from '../../models/shop-list.model';
import { Item } from '../../models/item.model';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage implements OnInit {

  shopList: ShopList;
  public addItemForm: FormGroup;

  constructor(public navParams: NavParams, private alertCtrl: AlertController, private toastCtrl: ToastController) {}

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
    this.shopList.AddItem(this.addItemForm.get('title').value, 0);
    this.addItemForm.reset();
    this.RefreshItems();
  }

  RefreshItems(){
    //TODO: load list back into listsrv and save
  }

  onRemoveFromList(item: Item){
    this.shopList.RemoveItem(item);
    this.RefreshItems();
  }

  onPriceSelect(index:number){
    //this.shopList.UpdateItemPrice(3.69, index);
    this.CreateNewPriceAlert().present();
    this.RefreshItems();
  }

  private CreateNewPriceAlert(){
    return this.alertCtrl.create({
      'title': 'Enter Price',
      inputs: [
        {
          name: 'price',
          placeholder: '',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: data => {
            if( data.price.trim() == '' || data.price == null){
              const toast = this.toastCtrl.create({
                message: 'Please enter a valid value!',
                duration: 1000,
                position: 'bottom'
              });
              toast.present();
              return;
            }
            this.shopList.UpdateItemPrice(data.price,0);
            //(<FormArray>this.recipeForm.get('ingredients')).push(new FormControl(data.name, Validators.required));
            // const toast = this.toastCtrl.create({
            //   message: 'Item Added!',
            //   duration: 1000,
            //   position: 'bottom'
            // });
            //toast.present();
          }
        }
      ]
    });
  }

  onQtyUpdate(index: number){
    this.shopList.BumpItemQty(index);
    this.RefreshItems();
  }

  onQtyClear(index: number){
    this.shopList.UpdateItemQty(0,index);
    this.RefreshItems();
  }

}
