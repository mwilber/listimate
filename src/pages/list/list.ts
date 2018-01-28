import { ListService } from './../../services/list.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { ShopList } from '../../models/shop-list.model';
import { Item } from '../../models/item.model';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { ActionSheetController } from 'ionic-angular/components/action-sheet/action-sheet-controller';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage implements OnInit {

  public showTotal = false;
  shopList: ShopList;
  shopListIdx: number;
  public addItemForm: FormGroup;

  constructor(
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private listSrv: ListService
  ) {}

  ngOnInit(){
    console.log('params:',this.navParams.data);
    this.shopList = this.navParams.get('list');
    this.shopListIdx = this.navParams.get('index');
    this.InitAddItemForm();
  }

  onTotalPress(){
    this.showTotal = true;
  }

  onTotalRelease(){
    this.showTotal = false;
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

  onMoveToList(item: Item){
    this.CreateMoveListAlert(item).present();
  }

  private CreateMoveListAlert(item: Item){

    let listlist = [];

    this.listSrv.GetLists().forEach((list, idx)=>{
      listlist.push({
        type: 'radio',
        label: list.name,
        value: idx,
        checked: false
      });
    });

    return this.alertCtrl.create({
      'title': 'Move To List',
      inputs: listlist,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Move',
          handler: data => {
            console.log('move '+item.name+' to', data);
            this.listSrv.AddItemToList(data, item);
            this.shopList.RemoveItem(item);
            const toast = this.toastCtrl.create({
              message: item.name+' moved to '+this.listSrv.GetList(data).name,
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
          }
        }
      ]
    });
  }

  onPriceSelect(index:number){
    //this.shopList.UpdateItemPrice(3.69, index);
    this.CreateNewPriceAlert(index).present();
    this.RefreshItems();
  }

  private CreateNewPriceAlert(index:number){
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
            this.shopList.UpdateItemPrice(data.price,index);
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
