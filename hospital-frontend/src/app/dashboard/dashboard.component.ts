import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PavilionService } from '../services/pavilion.service';
import { User } from '../models/user.model';
import { Pavilion } from '../models/pavilion.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  pavilions: Pavilion[] = [];

  constructor(
    private authService: AuthService,
    private pavilionService: PavilionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadPavilions();
  }

  loadPavilions(): void {
    this.pavilionService.getPavilions().subscribe({
      next: (pavilions) => {
        this.pavilions = pavilions;
      },
      error: (error) => {
        console.error('Error loading pavilions:', error);
      }
    });
  }

  navigateToPavilion(pavilion: Pavilion): void {
    this.router.navigate(['/pavjon', pavilion.id]);
  }
}
