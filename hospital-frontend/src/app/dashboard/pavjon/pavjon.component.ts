import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PavilionService } from '../../services/pavilion.service';
import { Pavilion, Room, Bed, BedStatus, BedStatusHistory, OutOfServiceAlert } from '../../models/pavilion.model';

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

  // Inline name editing
  editingRoomId: number | null = null;
  editRoomName = '';
  editingBedId: number | null = null;
  editBedName = '';

  // Add bed form — tracks which room is active
  addBedForRoomId: number | null = null;
  newBedNumber = '';
  addingBed = false;
  addBedError = '';

  // Out-of-service alerts
  alerts: OutOfServiceAlert[] = [];
  alertsDismissed = false;
  alertBedIds = new Set<number>();

  // Bed history panel
  historyBed: Bed | null = null;
  historyEntries: BedStatusHistory[] = [];
  historyLoading = false;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get canManageRooms(): boolean {
    return this.authService.isAdmin() || this.authService.isDepartmentStaff();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private pavilionService: PavilionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPavilion(+id);
    } else {
      this.error = 'ID e departamentit nuk është dhënë';
      this.loading = false;
    }
  }

  loadPavilion(id: number): void {
    this.loading = true;
    this.pavilionService.getPavilionById(id).subscribe({
      next: (pavilion) => {
        this.pavilion = pavilion;
        this.loading = false;
        this.loadAlerts();
      },
      error: () => {
        this.error = 'Gabim gjatë ngarkimit të të dhënave të departamentit';
        this.loading = false;
      }
    });
  }

  loadAlerts(): void {
    this.pavilionService.getOutOfServiceAlerts(2).subscribe({
      next: (all: OutOfServiceAlert[]) => {
        const deptName = this.pavilion?.name ?? '';
        this.alerts = all.filter(a => a.departmentName === deptName);
        this.alertBedIds = new Set(this.alerts.map(a => a.bedId));
        this.alertsDismissed = false;
      },
      error: () => {}
    });
  }

  dismissAlerts(): void {
    this.alertsDismissed = true;
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
        this.addRoomError = err.status === 403
          ? 'Ju nuk keni akses ose nuk i përkisni këtij departamenti'
          : err.error?.message ?? 'Dhoma nuk mund të krijohet';
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
        this.addBedError = err.status === 403
          ? 'Ju nuk keni akses ose nuk i përkisni këtij departamenti'
          : err.error?.message ?? 'Shtrati nuk mund të krijohet';
        this.addingBed = false;
      }
    });
  }

  startEditRoom(room: Room): void {
    this.editingRoomId = room.id;
    this.editRoomName = room.roomNumber;
  }

  cancelEditRoom(): void {
    this.editingRoomId = null;
    this.editRoomName = '';
  }

  saveRoomName(room: Room): void {
    const name = this.editRoomName.trim();
    if (!name || name === room.roomNumber) { this.cancelEditRoom(); return; }

    this.pavilionService.updateRoomName(room.id, name).subscribe({
      next: (updated) => {
        room.roomNumber = (updated as any).roomNumber ?? name;
        this.cancelEditRoom();
      },
      error: (err) => {
        alert(err.status === 403
          ? 'Ju nuk keni akses ose nuk i përkisni këtij departamenti'
          : err.error?.message ?? 'Emri i dhomës nuk mund të ndryshohet');
      }
    });
  }

  startEditBed(bed: Bed): void {
    this.editingBedId = bed.bedId;
    this.editBedName = bed.bednumber;
  }

  cancelEditBed(): void {
    this.editingBedId = null;
    this.editBedName = '';
  }

  saveBedName(bed: Bed): void {
    const name = this.editBedName.trim();
    if (!name || name === bed.bednumber) { this.cancelEditBed(); return; }

    this.pavilionService.updateBedName(bed.bedId, name).subscribe({
      next: (updated) => {
        bed.bednumber = (updated as any).bednumber ?? name;
        this.cancelEditBed();
      },
      error: (err) => {
        alert(err.status === 403
          ? 'Ju nuk keni akses ose nuk i përkisni këtij departamenti'
          : err.error?.message ?? 'Emri i shtratit nuk mund të ndryshohet');
      }
    });
  }

  deleteRoom(room: Room): void {
    if (!confirm(`Jeni i sigurt që doni të fshini dhomën ${room.roomNumber}? Do të fshihen edhe të gjithë shtretet.`)) return;

    this.pavilionService.deleteRoom(room.id).subscribe({
      next: () => {
        this.pavilion!.rooms = this.pavilion!.rooms.filter(r => r.id !== room.id);
        this.recalculateStats();
      },
      error: (err) => {
        alert(err.status === 403
          ? 'Ju nuk keni akses ose nuk i përkisni këtij departamenti'
          : err.error?.message ?? 'Dhoma nuk mund të fshihet');
      }
    });
  }

  deleteBed(bed: Bed, room: Room): void {
    if (!confirm(`Jeni i sigurt që doni të fshini shtratin ${bed.bednumber}?`)) return;

    this.pavilionService.deleteBed(bed.bedId).subscribe({
      next: () => {
        room.beds = room.beds.filter(b => b.bedId !== bed.bedId);
        this.recalculateStats();
      },
      error: (err) => {
        alert(err.status === 403
          ? 'Ju nuk keni akses ose nuk i përkisni këtij departamenti'
          : err.error?.message ?? 'Shtrati nuk mund të fshihet');
      }
    });
  }

  openHistory(bed: Bed): void {
    this.historyBed = bed;
    this.historyEntries = [];
    this.historyLoading = true;
    this.pavilionService.getBedHistory(bed.bedId).subscribe({
      next: (entries) => {
        this.historyEntries = entries;
        this.historyLoading = false;
      },
      error: () => {
        this.historyLoading = false;
      }
    });
  }

  closeHistory(): void {
    this.historyBed = null;
    this.historyEntries = [];
  }

  statusLabel(status: BedStatus | null): string {
    if (!status) return '—';
    return status === 'FREE' ? 'I lirë' : status === 'OCCUPIED' ? 'I zënë' : 'Jo i disponueshëm';
  }

  statusDuration(bed: Bed): string {
    if (!bed.statusSince) return '';
    const ms = Date.now() - new Date(bed.statusSince).getTime();
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
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
