import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-contact-cta',
  imports: [],
  templateUrl: './contact-cta.html',
  styleUrl: './contact-cta.scss',
})
export class ContactCta {
  public background = input<string>('white');
  public phoneClick = output<void>();
}
