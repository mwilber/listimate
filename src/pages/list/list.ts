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

    // this.shopList.listChanged.subscribe((data)=>{
    //   let cache = [];
    //   this.listSrv.UpdateList(JSON.stringify(this.shopList, function(key, value) {
    //       if (typeof value === 'object' && value !== null) {
    //           if (cache.indexOf(value) !== -1) {
    //               // Circular reference found, discard key
    //               return;
    //           }
    //           // Store value in our collection
    //           cache.push(value);
    //       }
    //       return value;
    //   }), this.shopListIdx);
    //   cache = null;
    // });
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
    this.AddItem(this.addItemForm.get('title').value, 1);
    this.addItemForm.reset();
    this.RefreshItems();
  }

  RefreshItems(){
    //TODO: load list back into listsrv and save
  }

  onRemoveFromList(item: Item){
    this.RemoveItem(item, this.shopList);
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
          text: 'Move',
          handler: data => {
            console.log('move '+item.name+' to', data);
            this.listSrv.AddItemToList(data, item);
            this.RemoveItem(item, this.shopList);
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
            this.CreateNewListAlert(item).present();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
  }

  private CreateNewListAlert(item: Item){
    return this.alertCtrl.create({
      'title': 'Enter Price',
      inputs: [
        {
          name: 'name',
          placeholder: 'List Name',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: data => {
            if( data.name.trim() == '' || data.name == null){
              const toast = this.toastCtrl.create({
                message: 'Please enter a valid name!',
                duration: 2000,
                position: 'bottom'
              });
              toast.present();
              return;
            }
            //this.shopList.UpdateItemPrice(data.price,index);
            let newListIdx = this.listSrv.AddList(data.name);
            this.listSrv.AddItemToList(newListIdx, item);
            this.RemoveItem(item, this.shopList);
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
            this.UpdateItemPrice(data.price,index, this.shopList);
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
    this.BumpItemQty(index, this.shopList);
    this.RefreshItems();
  }

  onQtyClear(index: number){
    this.CreateNewQtyAlert(index).present();
    this.RefreshItems();
  }

  private CreateNewQtyAlert(index:number){
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
            this.UpdateItemQty(0,index, this.shopList);
          }
        },
        {
          text: 'Add',
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
            this.UpdateItemQty(data.qty,index, this.shopList);
          }
        }
      ]
    });
  }


  //////////////////////////////////////////////////////////////////////////////////////
  // From shoplist model

  // LoadJson(jsonData: string){
  //   let rawData = JSON.parse(jsonData);

  //   this.name = rawData.name;
  //   this.total = rawData.total;
  //   this.estimate = rawData.estimate;

  //   rawData.items.forEach((item)=>{
  //     this.items.push(new Item(item.name, item.qty, item.price, item.complete));
  //   });
  // }

  AddItem(name: string, amount: number){
    this.shopList.items.push( new Item(name, amount, 0) );
    console.log(this.shopList.items);
    //this.RefreshList();
  }

  // AddItems(items: Item[]){
  //   this.items.push(...items);
  //   this.RefreshList();
  // }

  GetItems(){
    return this.shopList.items.slice();
  }

  // RemoveItemByIndex(index: number){
  //   this.items.splice(index, 1);
  //   this.RefreshList();
  // }

  RemoveItem(pItem: Item, shopList:ShopList){
    const position = shopList.items.findIndex((itemEl: Item)=>{
      return itemEl.name === pItem.name;
    });
    shopList.items.splice(position, 1);
    //this.RefreshList();
  }

  UpdateItemPrice(price:number, index:number, shopList:ShopList){
    shopList.items[index].price = price;
    //this.RefreshList(index);
  }

  UpdateItemQty(qty:number, index:number, shopList:ShopList){
    shopList.items[index].qty = qty;
    //shopList.RefreshList(index);
  }

  BumpItemQty(index:number, shopList:ShopList){
    shopList.items[index].qty++;
    //this.RefreshList();
  }

  RefreshList(index:number=-1){
    this.shopList.total = 0;
    this.shopList.estimate = 0;
    for(let item of this.shopList.items){
      this.shopList.total += item.price*item.qty;
      this.shopList.estimate += Math.ceil(item.price)*item.qty;
      if(item.price > 0 && item.qty > 0){
        item.complete = true;
      }else if(item.complete){
        item.complete = false;
      }
    }
    // Move completed to bottom of the list
    this.shopList.items.sort((item)=>{
      if(item.complete) return 1; else return 0;
    });
    // if(index > -1){
    //   if(this.items[index].complete) this.items.push(this.items.splice(index, 1)[0]);
    // }
    //this.listChanged.next(true);
    this.listSrv.UpdateList(JSON.stringify(this.shopList), this.shopListIdx);
  }



  //////////////////////////////////////////////////////////////////////////////////////

}
