import { OnInit, Injectable } from '@angular/core';
import { Item } from './../models/item.model';
import { ShopList } from "../models/shop-list.model";
import { Subject } from 'rxjs/Subject';
import { Http } from "@angular/http";
import 'rxjs/Rx';
import { AuthService } from './auth.service';
import { Response } from '@angular/http/src/static_response';

@Injectable()
export class ListService implements OnInit{
  private lists: ShopList[];
  public listSave: Subject<boolean>;

  constructor(private http: Http, private authService: AuthService) {

    this.listSave = new Subject<boolean>();

    //this.lists = [new ShopList('Grocery',0,0),new ShopList('Costco',0,0)];
    this.lists = [];
    // this.AddList('Grocery');
    // this.AddList('Costco');
    // this.lists[0].AddItems([
    //   new Item('Bread', 1, 0),
    //   new Item('Eggs',4,0),
    //   new Item('Milk',2,0),
    //   new Item('Beef',1,0)
    // ]);

    console.log(this.lists);
  }

  ngOnInit(){

  }

  AddList(name: string){
    this.lists.push( new ShopList(name, 0, 0) );
    // this.lists[this.lists.length-1].listChanged.subscribe((data)=>{
    //   console.log("list change detected");
    //   this.SaveLists();
    // });
    console.log(this.lists);
    this.SaveLists();
    return this.lists.length-1;
  }

  AddItemToList(listIdx: number, item: Item){
    this.lists[listIdx].AddItem(item.name, item.qty);
    this.SaveLists();
  }

  GetLists(){
    return this.lists.slice();
  }

  GetList(idx: number){
    return this.lists[idx];
  }

  RemoveList(index: number){
    this.lists.splice(index, 1);
    this.SaveLists();
  }

  RemoveListFromLists(list: ShopList){
    const position = this.lists.findIndex((listEl: ShopList)=>{
      return listEl.name === list.name;
    });
    this.lists.splice(position, 1);
    this.SaveLists();
  }

  UpdateList(listJSON:string, listIdx:number){

    this.lists[listIdx] = new ShopList('',0,0);
    this.lists[listIdx].LoadJson(listJSON);
    this.SaveLists();
  }

  SaveLists(){
    this.listSave.next(true);
    //console.log('all lists saved', this.lists);
    //this.storage.set('lists',JSON.stringify(this.lists));
  }



  RemoteStore(token: string){
    const userId = this.authService.GetActiveUser().uid;
    return this.http
      .put('https://listimate.firebaseio.com/'+userId+'/lists.json?auth='+token, this.lists)
      .map((response: Response)=>{
        return response.json();
      });
  }

  RemoteFetch(token: string){
    const userId = this.authService.GetActiveUser().uid;
    return this.http
      .get('https://listimate.firebaseio.com/'+userId+'/lists.json?auth='+token)
      .map((response: Response)=>{
        const ingredients: ShopList[] = response.json() ? response.json() : [];
        for(let ingredient of ingredients){
          if(!ingredient.hasOwnProperty('name')){
            ingredient.name = "unnamed";
          }
        }
        return ingredients;
      })
      .do((data)=>{
        //this.ingredients = data;
      });
  }

}
