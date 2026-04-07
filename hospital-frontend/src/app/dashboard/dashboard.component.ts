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
  loading = false;
  error = '';

  showAddForm = false;
  newDepartmentName = '';
  addingDepartment = false;
  addError = '';

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
    this.loading = true;
    this.pavilionService.getPavilions().subscribe({
      next: (pavilions) => {
        this.pavilions = pavilions;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load departments';
        this.loading = false;
      }
    });
  }

  navigateToPavilion(pavilion: Pavilion): void {
    this.router.navigate(['/pavjon', pavilion.id]);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.newDepartmentName = '';
    this.addError = '';
  }

  submitAddDepartment(): void {
    const name = this.newDepartmentName.trim();
    if (!name) return;

    this.addingDepartment = true;
    this.addError = '';

    this.pavilionService.createDepartment(name).subscribe({
      next: () => {
        this.addingDepartment = false;
        this.showAddForm = false;
        this.newDepartmentName = '';
        this.loadPavilions();
      },
      error: (err) => {
        this.addError = err.error?.message ?? 'Could not create department';
        this.addingDepartment = false;
      }
    });
  }
}
