export class Item{
  public pinned: boolean;
  public complete: boolean;
  public key: string;
  public listId: string;
  public checkout: number;

  constructor(
    public name: string,
    public qty: number,
    public price: number,
    complete?,
    pinned?
  ){
    if( typeof complete !== 'undefined'){
      this.complete = complete;
    }else{
      this.complete = false;
    }

    if( typeof pinned !== 'undefined'){
      this.pinned = pinned;
    }else{
      this.pinned = false;
    }
  }
}
