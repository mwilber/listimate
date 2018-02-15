import { Item } from "./item.model";

export class ShopList{

  public items: Item[] = [];
  //public listChanged: Subject<boolean>;

  constructor(
    public name: string,
    public total: number,
    public estimate: number
  ){
    this.items = [];
  }


}
