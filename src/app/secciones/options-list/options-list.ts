import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface OptionItem {
  number: number;
  label: string;
  link: string;
  fragment?: string;
}

@Component({
  selector: 'app-options-list',
  imports: [RouterLink],
  templateUrl: './options-list.html',
  styleUrl: './options-list.scss',
})
export class OptionsList {
  public options = input.required<OptionItem[]>();
  public columns = input<number>(4);
  public numberBg = input<string>('#004176');
  public bodyBg = input<string>('#004176');
  public bodyColor = input<string>('white');
}
