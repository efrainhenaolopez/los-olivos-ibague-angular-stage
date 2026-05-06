import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-information-contact',
  imports: [],
  templateUrl: './section-information-contact.html',
  styleUrl: './section-information-contact.scss',
})
export class SectionInformationContact {
  public phone = input<string>('300 913 2223');
  public intro = input<string>(
    'Si necesita ayuda en este momento contáctenos',
  );
}
