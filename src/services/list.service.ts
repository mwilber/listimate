import { ShopList } from "../models/shop-list.model";

export class ListService{
  private lists: ShopList[];

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

}
