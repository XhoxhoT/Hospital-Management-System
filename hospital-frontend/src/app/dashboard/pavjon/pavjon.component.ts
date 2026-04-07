import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PavilionService } from '../../services/pavilion.service';
import { Pavilion, Room, Bed, BedStatus } from '../../models/pavilion.model';

@Component({
  selector: 'app-pavjon',
  templateUrl: './pavjon.component.html',
  styleUrls: ['./pavjon.component.css']
})
export class PavjonComponent implements OnInit {
  pavilion: Pavilion | null = null;
  loading = true;
  error = '';

  // Add room form
  showAddRoomForm = false;
  newRoomNumber = '';
  addingRoom = false;
  addRoomError = '';

  // Add bed form — tracks which room is active
  addBedForRoomId: number | null = null;
  newBedNumber = '';
  addingBed = false;
  addBedError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pavilionService: PavilionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPavilion(+id);
    } else {
      this.error = 'Department ID not provided';
      this.loading = false;
    }
  }

  loadPavilion(id: number): void {
    this.loading = true;
    this.pavilionService.getPavilionById(id).subscribe({
      next: (pavilion) => {
        this.pavilion = pavilion;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error loading department data';
        this.loading = false;
      }
    });
  }

  setBedStatus(bed: Bed, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as BedStatus;

    this.pavilionService.setBedStatus(bed.bedId, newStatus).subscribe({
      next: (updatedBed) => {
        if (this.pavilion) {
          for (const room of this.pavilion.rooms) {
            const idx = room.beds.findIndex(b => b.bedId === updatedBed.bedId);
            if (idx !== -1) {
              room.beds[idx] = updatedBed;
              break;
            }
          }
          this.recalculateStats();
        }
      },
      error: () => {
        select.value = bed.bedStatus;
      }
    });
  }

  toggleAddRoomForm(): void {
    this.showAddRoomForm = !this.showAddRoomForm;
    this.newRoomNumber = '';
    this.addRoomError = '';
  }

  submitAddRoom(): void {
    if (!this.pavilion || !this.newRoomNumber.trim()) return;

    this.addingRoom = true;
    this.addRoomError = '';

    this.pavilionService.createRoom(this.newRoomNumber.trim(), this.pavilion.id).subscribe({
      next: (room) => {
        this.pavilion!.rooms.push({ ...room, beds: [] });
        this.showAddRoomForm = false;
        this.newRoomNumber = '';
        this.addingRoom = false;
      },
      error: (err) => {
        this.addRoomError = err.error?.message ?? 'Could not create room';
        this.addingRoom = false;
      }
    });
  }

  toggleAddBedForm(roomId: number): void {
    this.addBedForRoomId = this.addBedForRoomId === roomId ? null : roomId;
    this.newBedNumber = '';
    this.addBedError = '';
  }

  submitAddBed(room: Room): void {
    if (!this.newBedNumber.trim()) return;

    this.addingBed = true;
    this.addBedError = '';

    this.pavilionService.createBed(this.newBedNumber.trim(), room.id).subscribe({
      next: (bed) => {
        room.beds.push(bed);
        this.addBedForRoomId = null;
        this.newBedNumber = '';
        this.addingBed = false;
        this.recalculateStats();
      },
      error: (err) => {
        this.addBedError = err.error?.message ?? 'Could not create bed';
        this.addingBed = false;
      }
    });
  }

  getFreeBeds(room: Room): number {
    return room.beds.filter(b => b.bedStatus === 'FREE').length;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private recalculateStats(): void {
    if (!this.pavilion) return;
    const allBeds = this.pavilion.rooms.flatMap(r => r.beds);
    this.pavilion.freeBeds = allBeds.filter(b => b.bedStatus === 'FREE').length;
    this.pavilion.totalBeds = allBeds.length;
    this.pavilion.patientCount = allBeds.filter(b => b.bedStatus === 'OCCUPIED').length;
    this.pavilion.unavailableBeds = allBeds.filter(b => b.bedStatus === 'OUT_OF_SERVICE').length;
  }
}
