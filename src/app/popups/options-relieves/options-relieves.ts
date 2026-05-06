import { Component, input, output } from '@angular/core';

export type RelievesOption = 'optionOne' | 'optionTwo' | 'optionThree';

export interface RelievesResponse {
  title: string;
  option: RelievesOption;
}

@Component({
  selector: 'app-options-relieves',
  imports: [],
  templateUrl: './options-relieves.html',
  styleUrl: './options-relieves.scss',
})
export class OptionsRelieves {
  public response = input.required<RelievesResponse>();
  public close = output<boolean>();

  closeModal(): void {
    this.close.emit(false);
  }
}
