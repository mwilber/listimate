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
    this.RefreshList(index);
  }

  UpdateItemQty(qty:number, index:number){
    this.items[index].qty = qty;
    this.RefreshList(index);
  }

  BumpItemQty(index:number){
    this.items[index].qty++;
    this.RefreshList();
  }

  RefreshList(index:number=-1){
    this.total = 0;
    this.estimate = 0;
    for(let item of this.items){
      this.total += item.price*item.qty;
      this.estimate += Math.ceil(item.price)*item.qty;
      if(item.price > 0 && item.qty > 0){
        item.complete = true;
      }else if(item.complete){
        item.complete = false;
      }
    }
    // Move completed to bottom of the list
    this.items.sort((item)=>{
      if(item.complete) return 1; else return 0;
    });
    // if(index > -1){
    //   if(this.items[index].complete) this.items.push(this.items.splice(index, 1)[0]);
    // }
  }
}
