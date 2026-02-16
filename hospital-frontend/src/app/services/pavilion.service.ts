import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Bed, Pavilion, Room } from '../models/pavilion.model';

@Injectable({
  providedIn: 'root'
})
export class PavilionService {
  private apiUrl = 'http://localhost:3000/api/pavilions';

  private generateRooms(roomCount: number, bedsPerRoom: number, pavilionId: string): Room[] {
    const rooms: Room[] = [];
    for (let r = 1; r <= roomCount; r++) {
      const beds: Bed[] = [];
      for (let b = 1; b <= bedsPerRoom; b++) {
        const rand = Math.random();
        let status: 'free' | 'occupied' | 'unavailable';
        if (rand > 0.4) {
          status = 'free';
        } else if (rand > 0.15) {
          status = 'occupied';
        } else {
          status = 'unavailable';
        }
        beds.push({
          id: `${pavilionId}-r${r}-b${b}`,
          number: b,
          status
        });
      }
      rooms.push({
        id: `${pavilionId}-r${r}`,
        number: r,
        beds
      });
    }
    return rooms;
  }

  private mockPavilions: Pavilion[] = [
    {
      id: '1',
      name: 'Kardiologji',
      description: 'Departamenti i Kardiologjise',
      icon: '❤️',
      color: '#e57373',
      rooms: this.generateRooms(10, 6, '1')
    },
    {
      id: '2',
      name: 'Neurologji',
      description: 'Departamenti i Neurologjise',
      icon: '🧠',
      color: '#9575cd',
      rooms: this.generateRooms(8, 5, '2')
    },
    {
      id: '3',
      name: 'Pediatri',
      description: 'Departamenti i Pediatrise',
      icon: '👶',
      color: '#4fc3f7',
      rooms: this.generateRooms(10, 5, '3')
    },
    {
      id: '4',
      name: 'Ortopedi',
      description: 'Departamenti i Ortopedise',
      icon: '🦴',
      color: '#81c784',
      rooms: this.generateRooms(9, 5, '4')
    },
    {
      id: '5',
      name: 'Urgjence',
      description: 'Departamenti i Urgjences',
      icon: '🚑',
      color: '#ff8a65',
      rooms: this.generateRooms(6, 5, '5')
    },
    {
      id: '6',
      name: 'Kirurgji',
      description: 'Departamenti i Kirurgjise',
      icon: '🏥',
      color: '#4db6ac',
      rooms: this.generateRooms(7, 5, '6')
    },
    {
      id: '7',
      name: 'Onkologji',
      description: 'Departamenti i Onkologjise',
      icon: '🎗️',
      color: '#f06292',
      rooms: this.generateRooms(11, 5, '7')
    },
    {
      id: '8',
      name: 'Psikiatri',
      description: 'Departamenti i Psikiatrise',
      icon: '🧘',
      color: '#7986cb',
      rooms: this.generateRooms(6, 5, '8')
    }
  ];

  constructor(private http: HttpClient) {
    this.mockPavilions = this.mockPavilions.map(p => this.calculateStats(p));
  }

  private calculateStats(pavilion: Pavilion): Pavilion {
    let totalBeds = 0;
    let freeBeds = 0;
    let occupiedBeds = 0;
    let unavailableBeds = 0;
    pavilion.rooms.forEach(room => {
      room.beds.forEach(bed => {
        totalBeds++;
        if (bed.status === 'free') freeBeds++;
        else if (bed.status === 'occupied') occupiedBeds++;
        else if (bed.status === 'unavailable') unavailableBeds++;
      });
    });
    return {
      ...pavilion,
      bedCount: totalBeds,
      availableBeds: freeBeds,
      patientCount: occupiedBeds,
      unavailableBeds: unavailableBeds
    };
  }

  getPavilions(): Observable<Pavilion[]> {
    return of(this.mockPavilions);
  }

  getPavilionById(id: string): Observable<Pavilion | undefined> {
    const pavilion = this.mockPavilions.find(p => p.id === id);
    return of(pavilion);
  }

  setBedStatus(pavilionId: string, roomId: string, bedId: string, status: 'free' | 'occupied' | 'unavailable'): Observable<Pavilion | undefined> {
    const pavilion = this.mockPavilions.find(p => p.id === pavilionId);
    if (pavilion) {
      const room = pavilion.rooms.find(r => r.id === roomId);
      if (room) {
        const bed = room.beds.find(b => b.id === bedId);
        if (bed) {
          bed.status = status;
          const index = this.mockPavilions.findIndex(p => p.id === pavilionId);
          this.mockPavilions[index] = this.calculateStats(pavilion);
          return of(this.mockPavilions[index]);
        }
      }
    }
    return of(undefined);
  }
}
