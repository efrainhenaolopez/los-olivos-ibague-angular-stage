import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../../servicios/search';

@Component({
  selector: 'app-search-overlay',
  imports: [FormsModule],
  templateUrl: './search-overlay.html',
  styleUrl: './search-overlay.scss',
})
export class SearchOverlay {
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);

  public close = output<boolean>();
  public query = '';

  search(): void {
    if (!this.query.trim()) return;
    this.searchService.search(this.query);
    this.router.navigate(['/busqueda'], { queryParams: { s: this.query } });
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit(false);
  }
}
