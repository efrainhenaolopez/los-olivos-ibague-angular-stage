import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeService } from './servicios/font-awesome';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('los-olivos-tolima');
  private readonly fontAwesome = inject(FontAwesomeService);

  ngOnInit(): void {
    this.fontAwesome.load();
  }
}
