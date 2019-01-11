interface ListItem {
    name: string;
    qty: number;
    price: number;
    pinned?: boolean;
    complete?: boolean;
    checkout?: number;
}

export interface ShopList {

    name: string;
    total: number;
    estimate: number;
    items: Array<ListItem>;

}