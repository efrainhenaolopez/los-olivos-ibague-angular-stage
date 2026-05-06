import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface NotificationData {
  title: string;
  message: string;
  background: string;
}

@Component({
  selector: 'app-notification',
  imports: [NgStyle],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification {
  public data = input.required<NotificationData>();
  public close = output<boolean>();

  closeModal(): void {
    this.close.emit(false);
  }
}
