import { Observable } from 'rxjs/Observable';
import { ListService } from './../../services/list.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { Item } from '../../models/item.model';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage implements OnInit {

  public showTotal = false;
  shopListIdx: string;
  public addItemForm: FormGroup;
  items: Observable<any[]>;

  listEstimate = 0;
  listTotal=0;
  listName: string;

  constructor(
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private listSrv: ListService,
    private itemSrv: ItemService
  ) {}

  ngOnInit(){
    console.log('params:',this.navParams.data);
    let shopList = this.navParams.get('list');
    this.listName = shopList.name;
    this.shopListIdx = this.navParams.get('index');
    this.InitAddItemForm();

    this.items = this.itemSrv.LoadItems(this.shopListIdx);

    this.items.subscribe((items: Item[])=>{
      console.log('list updated', items);
      this.listTotal = 0;
      this.listEstimate = 0;
      for(let item of items){
        this.listTotal += item.price*item.qty;
        this.listEstimate += Math.ceil(item.price)*item.qty;
      }
      this.listSrv.UpdateListTotals(this.shopListIdx, this.listTotal, this.listEstimate);
    });

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
    this.itemSrv.AddItem(this.shopListIdx, new Item(this.addItemForm.get('title').value, 1, 0));
    this.addItemForm.reset();
  }

  onRemoveFromList(item: string){
    this.itemSrv.RemoveItem(item);
  }

  onCheckout(){
    this.CreateCheckoutAlert().present();
  }

  CreateCheckoutAlert(){
    return this.alertCtrl.create({
      title:'Checkout',
      subTitle:'Remove purchased items from this list?',
      buttons:[
        {
          text: 'Ok',
          handler: data =>{
            this.itemSrv.DoCheckout(this.shopListIdx);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
  }

  onPinToList(item: Item){
    item.pinned = !item.pinned;
    this.itemSrv.UpdateItem(item.key, item);
  }

  onMoveToList(item: Item){
    this.CreateMoveListAlert(item).present();
  }

  private CreateMoveListAlert(item: Item){

    let listlist = [];

    this.listSrv.GetLists().forEach((list: any)=>{
      listlist.push({
        type: 'radio',
        label: list.name,
        value: list.key,
        checked: false
      });
    });

    return this.alertCtrl.create({
      'title': 'Move To List',
      inputs: listlist,
      buttons: [
        {
          text: 'Move',
          handler: data => {
            console.log('move '+item.name+' to', data);
            this.listSrv.AddItemToList(data, new Item(item.name, item.qty, item.price));
            this.itemSrv.RemoveItem(item.key);
            const toast = this.toastCtrl.create({
              message: item.name+' moved to '+this.listSrv.GetList(data).name,
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
          }
        },
        {
          text: 'New List',
          handler: data => {
            //this.CreateNewListAlert(item).present();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
  }

  // private CreateNewListAlert(item: Item){
  //   return this.alertCtrl.create({
  //     'title': 'Enter Price',
  //     inputs: [
  //       {
  //         name: 'name',
  //         placeholder: 'List Name',
  //         type: 'text'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel'
  //       },
  //       {
  //         text: 'Create',
  //         handler: data => {
  //           if( data.name.trim() == '' || data.name == null){
  //             const toast = this.toastCtrl.create({
  //               message: 'Please enter a valid name!',
  //               duration: 2000,
  //               position: 'bottom'
  //             });
  //             toast.present();
  //             return;
  //           }
  //           //this.shopList.UpdateItemPrice(data.price,index);
  //           let newListIdx = this.listSrv.AddList(data.name);
  //           this.listSrv.AddItemToList(newListIdx, item);
  //           this.RemoveItem(item, this.shopList);
  //         }
  //       }
  //     ]
  //   });
  // }

  onPriceSelect(item: Item){
    this.CreateNewPriceAlert(item).present();
  }

  private CreateNewPriceAlert(item: Item){
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
            item.price = data.price;
            this.itemSrv.UpdateItem(item.key, item);
            //this.UpdateItemPrice(data.price,index, this.shopList);
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

  onQtyUpdate(item: Item){
    item.qty++;
    this.itemSrv.UpdateItem(item.key, item);
  }

  onQtyClear(item: Item){
    this.CreateNewQtyAlert(item).present();
  }

  private CreateNewQtyAlert(item: Item){
    return this.alertCtrl.create({
      'title': 'Enter Quantity',
      inputs: [
        {
          name: 'qty',
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
          text: 'Zero',
          handler: data => {
            item.qty = 0;
            this.itemSrv.UpdateItem(item.key, item);
          }
        },
        {
          text: 'Set',
          handler: data => {
            if( data.qty.trim() == '' || data.qty == null){
              const toast = this.toastCtrl.create({
                message: 'Please enter a number greater than zero.',
                duration: 2500,
                position: 'bottom'
              });
              toast.present();
              return;
            }
            item.qty = data.qty;
            this.itemSrv.UpdateItem(item.key, item);
          }
        }
      ]
    });
  }


}
