import { ShopList } from "../models/shop-list.model";
import { Item } from "../models/item.model";

export class ListService{
  private lists: ShopList[];

  constructor(){
    this.lists = [new ShopList('Grocery',0,0)];
    this.lists[0].addItems([
      new Item('Bread', 1, 0),
      new Item('Eggs',4,0),
      new Item('Milk',2,0)
    ]);
    console.log(this.lists);
  }

  addList(name: string){
    this.lists.push( new ShopList(name, 0, 0) );
    console.log(this.lists);
  }

  getLists(){
    return this.lists.slice();
  }

  getList(idx: number){
    return this.lists[idx];
  }

  removeList(index: number){
    this.lists.splice(index, 1);
  }

  RemoveListFromLists(list: ShopList){
    const position = this.lists.findIndex((listEl: ShopList)=>{
      return listEl.name === list.name;
    });
    this.lists.splice(position, 1);
  }

}
