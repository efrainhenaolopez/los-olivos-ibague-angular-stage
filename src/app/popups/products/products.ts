import { Component, input, output } from '@angular/core';

export interface PopupProductPaymentMethod {
  pay: string;
  price: string;
}

export interface PopupProductInformation {
  holder: string;
  affiliate: string;
  paymentMethods?: PopupProductPaymentMethod[];
  additional?: string;
  img: string;
}

export interface PopupProduct {
  title: string;
  description: string;
  informationPopUP: PopupProductInformation;
}

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  public product = input.required<PopupProduct>();
  public close = output<boolean>();

  closeModal(): void {
    this.close.emit(false);
  }
}
