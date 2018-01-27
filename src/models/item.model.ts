export class Item{
  public complete: boolean;

  constructor(
    public name: string,
    public qty: number,
    public price: number
  ){
    this.complete = false;
  }
}
