import { Item } from "./item.model";

export class ShopList{

  private items: Item[];

  constructor(
    public name: string,
    public total: number,
    public estimate: number
  ){
    this.items = [];
    this.RefreshList();
  }

  AddItem(name: string, amount: number){
    this.items.push( new Item(name, amount, 0) );
    console.log(this.items);
    this.RefreshList();
  }

  AddItems(items: Item[]){
    this.items.push(...items);
    this.RefreshList();
  }

  GetItems(){
    return this.items.slice();
  }

  RemoveItemByIndex(index: number){
    this.items.splice(index, 1);
    this.RefreshList();
  }

  RemoveItem(pItem: Item){
    const position = this.items.findIndex((itemEl: Item)=>{
      return itemEl.name === pItem.name;
    });
    this.items.splice(position, 1);
    this.RefreshList();
  }

  UpdateItemPrice(price:number, index:number){
    this.items[index].price = price;
    this.RefreshList();
  }

  UpdateItemQty(qty:number, index:number){
    this.items[index].qty = qty;
    this.RefreshList();
  }

  BumpItemQty(index:number){
    this.items[index].qty++;
    this.RefreshList();
  }

  UpdateTotal(){
    this.total = 0;
    for(let item of this.items){
      this.total += item.price*item.qty;
    }
  }

  UpdateEstimate(){
    this.estimate = 0;
    for(let item of this.items){
      this.estimate += Math.ceil(item.price)*item.qty;
    }
  }

  RefreshList(){
    this.UpdateTotal();
    this.UpdateEstimate();
  }
}
