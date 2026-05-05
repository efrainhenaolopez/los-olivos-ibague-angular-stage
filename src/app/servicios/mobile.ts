import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MobileService {

  constructor() {}

  isMobile(): boolean {
    if (this.isClient()) {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
    }
    return false; // Valor predeterminado si no está en el cliente
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined';
  }


}



