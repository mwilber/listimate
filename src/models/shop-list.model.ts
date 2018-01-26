import { Item } from "./item.model";

export class ShopList{

  private items: Item[];

  constructor(
    public name: string,
    public total: number,
    public estimate: number
  ){
    this.items = [];
    this.updateTotal();
  }

  addItem(name: string, amount: number){
    this.items.push( new Item(name, amount, 0) );
    console.log(this.items);
    this.updateTotal();
  }

  addItems(items: Item[]){
    this.items.push(...items);
    this.updateTotal();
  }

  getItems(){
    return this.items.slice();
  }

  removeItemByIndex(index: number){
    this.items.splice(index, 1);
    this.updateTotal();
  }

  removeItem(pItem: Item){
    const position = this.items.findIndex((itemEl: Item)=>{
      return itemEl.name === pItem.name;
    });
    this.items.splice(position, 1);
    this.updateTotal();
  }

  updateItemPrice(price:number, index:number){
    this.items[index].price = price;
    this.updateTotal();
  }

  updateItemQty(qty:number, index:number){
    this.items[index].qty = qty;
    this.updateTotal();
  }

  bumpItemQty(index:number){
    this.items[index].qty++;
    this.updateTotal();
  }

  updateTotal(){
    this.total = 0;
    for(let item of this.items){
      this.total += item.price*item.qty;
    }
  }
}
