import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class FontAwesomeService {
  private document = inject(DOCUMENT);
  private loaded = false;

  load(): void {
    if (this.loaded) return;
    this.loaded = true;

    if (this.document.head.querySelector('link[href*="font-awesome"]')) return;

    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    this.document.head.appendChild(link);
  }
}
