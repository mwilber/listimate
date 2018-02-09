import { Item } from "./item.model";
import { Subject } from "rxjs/Subject";

export class ShopList{

  public items: Item[] = [];
  //public listChanged: Subject<boolean>;

  constructor(
    public name: string,
    public total: number,
    public estimate: number
  ){
    this.items = [];
    //this.RefreshList();
    //this.listChanged = new Subject<boolean>();
  }


}
