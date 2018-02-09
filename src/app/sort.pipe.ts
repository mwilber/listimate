import { Pipe } from "@angular/core";
import { Item } from "../models/item.model";

@Pipe({
  name: "itemsort"
})
export class ItemsortPipe {
  transform(items: any) {
    if(items){
      items.sort((item)=>{
        if(item.complete) return 1; else return 0;
      });
    }
    return items;
  }
}
