import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss'
})
export class NavBarComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  profileOpen = false;

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }

  @HostListener('document:click', ['$event'])
  closeProfileOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.profileOpen = false;
    }
  }

  logout(): void {
    this.profileOpen = false;
    this.authService.logout().subscribe({
      complete: () => this.router.navigate(['/']),
      error: () => {
        // Even if the API call fails, drop the local session so the UI
        // reflects a logged-out state.
        this.authService.clearSession();
        this.router.navigate(['/']);
      }
    });
  }
}
