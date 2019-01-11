import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  //private listsDb: AngularFireList<ShopList>;
  public listSave: Subject<boolean>;
  public listChanged: Subject<ShopList[]>;
  lists: Observable<any[]>;
  listMeta: {key:string, name:string}[];
  private listSubject;

  constructor(private authService: AuthService) {
    this.listMeta = [];
  }

  Descruct(){
    this.listSubject.unsubscribe();
  }

  // FirebaseConnect(){
  //   const userId = this.authService.GetActiveUser().uid;
  //   if(userId){
  //     this.listsDb = this.afDB.list<ShopList>(userId+'/lists');

  //     this.lists = this.listsDb.snapshotChanges().map(actions => {
  //       return actions.map(action => ({ key: action.key, ...action.payload.val() }));
  //     });

  //     this.listSubject = this.lists.subscribe((data)=>{
  //       this.listMeta = [];
  //       for(let idx=0; idx<data.length; idx++){
  //         this.listMeta.push({key: data[idx].key, name: data[idx].name});
  //       }
  //       console.log('listmeta', this.listMeta);
  //     });
  //   }

  //   return this.lists;
  // }

  AddList(name: string){
    //this.listsDb.push( new ShopList(name, 0, 0) );
  }

  AddItemToList(listIdx: string, item: Item){
    //const userId = this.authService.GetActiveUser().uid;
    //this.afDB.list<Item>(userId+'/lists/'+listIdx+'/items').push(item);
  }

  GetLists(){
    //return this.listMeta;
  }

  GetList(idx: string){
    //let listIdx = this.listMeta.findIndex((item=>item.key===idx));
    //return this.listMeta[listIdx];
  }

  RemoveList(list: any){
    //this.listsDb.remove(list);
  }

  UpdateList(listId: string, list: ShopList){
    //this.listsDb.update(listId, list);
  }

  UpdateListTotals(listId: string, newTotal: number, newEstimate: number){
    //const userId = this.authService.GetActiveUser().uid;
    //this.afDB.list(userId+'/lists').update(listId, {total: newTotal, estimate: newEstimate});
  }
}
