import { AuthService } from './auth.service';
import { Item } from './../models/item.model';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ItemService {
  private itemsDb: AngularFireList<Item>;
  public items: Observable<any[]>;
  private itemSubject;

  constructor(private authService: AuthService, private afDB: AngularFireDatabase) {}

  LoadItems(listId: string){
    const userId = this.authService.GetActiveUser().uid;
    console.log('uid',userId);
    this.itemsDb = this.afDB.list<Item>(userId+'/lists/'+listId+'/items');

    this.items = this.itemsDb.snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    });

    return this.items;
  }

  AddItem(listIdx: string, item: Item){
    this.itemsDb.push(item);
  }

  RemoveItem(itemId: string){
    this.itemsDb.remove(itemId);
  }

  DoCheckout(listIdx: string){
    const userId = this.authService.GetActiveUser().uid;
    let test = this.afDB.list<Item>(userId+'/lists/'+listIdx+'/items').valueChanges().subscribe((items)=>{
      items.forEach((item)=>{
        if(item.complete && !item.pinned){
          console.log('archive', item);
          item.listId = listIdx;
          item.checkout = new Date().getTime();
          this.afDB.list(userId+'/archive/').push(item);
          this.itemsDb.remove(item.key);
        }else if(item.complete && item.pinned){
          console.log('archive pinned', item);
          item.listId = listIdx;
          item.checkout = new Date().getTime();
          this.afDB.list(userId+'/archive/').push(item);
          this.itemsDb.push(new Item(item.name, item.qty, 0, false, item.pinned));
          this.itemsDb.remove(item.key);
        }
      });
      test.unsubscribe();
    });
  }

  UpdateItem(itemId: string, item: Item){
    if(item.price > 0 && item.qty > 0){
      item.complete = true;
    }else if(item.complete){
      item.complete = false;
    }
    console.log('updating item', item);
    this.itemsDb.update(itemId, item);
  }

}
