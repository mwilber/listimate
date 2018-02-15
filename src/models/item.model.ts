export class Item{
  public complete: boolean;
  public key: string;
  public listId: string;
  public checkout: number;

  constructor(
    public name: string,
    public qty: number,
    public price: number,
    complete?
  ){
    if( typeof complete !== 'undefined'){
      this.complete = complete;
    }else{
      this.complete = false;
    }
  }
}
