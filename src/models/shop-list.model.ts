import { Item } from "./item.model";

export class ShopList{

  private items: Item[];

  constructor(
    public name: string,
    public total: number,
    public estimate: number
  ){}

  addItem(name: string, amount: number){
    this.items.push( new Item(name, amount) );
    console.log(this.items);
  }

  addItems(items: Item[]){
    this.items.push(...items);
  }

  getItems(){
    return this.items.slice();
  }

  removeItem(index: number){
    this.items.splice(index, 1);
  }
}
