import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [NgxSpinnerComponent, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private router = inject(Router);
  private authService = inject(AuthService);
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  showShortlistButton = true;

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showShortlistButton = !event.url.includes('shortlist');
      });
  }

  logout() {
    this.spinner.show();
    this.api.logout().subscribe({
      next: (res) => {
        this.authService.logout();
        this.spinner.hide();
        this.toastr.success('You have been logged out successfully.', 'Logout Successful', {
          timeOut: 2500,
          progressBar: true
        });

      }

    });

  }

  goToShortlist() {
    this.router.navigate(['shortlist']);
  }

}
