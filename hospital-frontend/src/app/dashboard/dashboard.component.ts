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

  searchQuery = '';

  showAddForm = false;
  newDepartmentName = '';
  addingDepartment = false;
  addError = '';

  showUserForm = false;
  newUsername = '';
  newPassword = '';
  newRole = 'EMERGENCY_DOCTOR';
  newDepartmentId: number | null = null;
  newPrivileged = false;
  creatingUser = false;
  userError = '';
  userSuccess = '';

  readonly roles = ['ADMIN', 'EMERGENCY_DOCTOR', 'DEPARTMENT_STAFF'];

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrator',
      'EMERGENCY_DOCTOR': 'Mjek Urgjence',
      'DEPARTMENT_STAFF': 'Staf Departamenti'
    };
    return labels[role] ?? role;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get filteredPavilions(): Pavilion[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.pavilions;
    return this.pavilions.filter(p => p.name.toLowerCase().includes(q));
  }

  getOccupiedCount(pavilion: Pavilion): number {
    return pavilion.totalBeds - pavilion.freeBeds;
  }

  getOccupiedPercent(pavilion: Pavilion): number {
    if (pavilion.totalBeds === 0) return 0;
    return (this.getOccupiedCount(pavilion) / pavilion.totalBeds) * 100;
  }

  getFreePercent(pavilion: Pavilion): number {
    if (pavilion.totalBeds === 0) return 0;
    return (pavilion.freeBeds / pavilion.totalBeds) * 100;
  }

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
        this.error = 'Departamentet nuk mund të ngarkohen';
        this.loading = false;
      }
    });
  }

  navigateToPavilion(pavilion: Pavilion): void {
    this.router.navigate(['/pavjon', pavilion.id]);
  }

  deletePavilion(pavilion: Pavilion, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Jeni i sigurt që doni të fshini departamentin "${pavilion.name}"? Do të fshihen të gjitha dhomat dhe shtretet.`)) return;

    this.pavilionService.deleteDepartment(pavilion.id).subscribe({
      next: () => {
        this.pavilions = this.pavilions.filter(p => p.id !== pavilion.id);
      },
      error: (err) => {
        alert(err.error?.message ?? 'Departamenti nuk mund të fshihet');
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.newDepartmentName = '';
    this.addError = '';
  }

  toggleUserForm(): void {
    this.showUserForm = !this.showUserForm;
    this.newUsername = '';
    this.newPassword = '';
    this.newRole = 'EMERGENCY_DOCTOR';
    this.newDepartmentId = null;
    this.newPrivileged = false;
    this.userError = '';
    this.userSuccess = '';
    if (this.showUserForm) this.showAddForm = false;
  }

  submitCreateUser(): void {
    const username = this.newUsername.trim();
    const password = this.newPassword.trim();
    if (!username || !password) return;
    if (this.newRole === 'DEPARTMENT_STAFF' && !this.newDepartmentId) {
      this.userError = 'Ju lutem zgjidhni një departament për Stafin e Departamentit';
      return;
    }

    this.creatingUser = true;
    this.userError = '';
    this.userSuccess = '';

    const request: any = { username, password, role: this.newRole };
    if (this.newRole === 'DEPARTMENT_STAFF') {
      request.departmentId = this.newDepartmentId;
      request.privileged = this.newPrivileged;
    }

    this.pavilionService.createUser(request).subscribe({
      next: () => {
        this.creatingUser = false;
        this.userSuccess = `Përdoruesi "${username}" u krijua me sukses`;
        this.newUsername = '';
        this.newPassword = '';
        this.newRole = 'EMERGENCY_DOCTOR';
        this.newDepartmentId = null;
      },
      error: (err) => {
        this.userError = err.error?.message ?? 'Përdoruesi nuk mund të krijohet';
        this.creatingUser = false;
      }
    });
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
        this.addError = err.error?.message ?? 'Departamenti nuk mund të krijohet';
        this.addingDepartment = false;
      }
    });
  }
}
