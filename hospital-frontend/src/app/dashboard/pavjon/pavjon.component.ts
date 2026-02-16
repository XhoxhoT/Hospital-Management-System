import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PavilionService } from '../../services/pavilion.service';
import { Pavilion, Room, Bed } from '../../models/pavilion.model';

@Component({
  selector: 'app-pavjon',
  templateUrl: './pavjon.component.html',
  styleUrls: ['./pavjon.component.css']
})
export class PavjonComponent implements OnInit {
  pavilion: Pavilion | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pavilionService: PavilionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPavilion(id);
    } else {
      this.error = 'Pavilion ID not provided';
      this.loading = false;
    }
  }

  loadPavilion(id: string): void {
    this.pavilionService.getPavilionById(id).subscribe({
      next: (pavilion) => {
        if (pavilion) {
          this.pavilion = pavilion;
        } else {
          this.error = 'Pavilion not found';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pavilion:', error);
        this.error = 'Error loading pavilion data';
        this.loading = false;
      }
    });
  }

  setBedStatus(room: Room, bed: Bed, event: Event): void {
    if (!this.pavilion) return;

    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as 'free' | 'occupied' | 'unavailable';

    this.pavilionService.setBedStatus(this.pavilion.id, room.id, bed.id, newStatus).subscribe({
      next: (updatedPavilion) => {
        if (updatedPavilion) {
          this.pavilion = updatedPavilion;
        }
      },
      error: (error) => {
        console.error('Error setting bed status:', error);
      }
    });
  }

  getFreeBeds(room: Room): number {
    return room.beds.filter(b => b.status === 'free').length;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
