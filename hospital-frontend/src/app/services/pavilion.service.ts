import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Bed, BedStatus, BedStatusHistory, OutOfServiceAlert, Pavilion, Room } from '../models/pavilion.model';
import { CreateUserRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PavilionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPavilions(): Observable<Pavilion[]> {
    return this.http.get<Pavilion[]>(`${this.apiUrl}/api/departments`).pipe(
      map(departments => departments.map(d => ({ ...d, rooms: [] })))
    );
  }

  getPavilionById(id: number): Observable<Pavilion> {
    return forkJoin({
      departments: this.http.get<Pavilion[]>(`${this.apiUrl}/api/departments`),
      rooms: this.http.get<Room[]>(`${this.apiUrl}/api/department/${id}/rooms`)
    }).pipe(
      switchMap(({ departments, rooms }) => {
        const dept = departments.find(d => d.id === id);
        if (rooms.length === 0) {
          return of({
            id,
            name: dept?.name ?? '',
            freeBeds: dept?.freeBeds ?? 0,
            totalBeds: dept?.totalBeds ?? 0,
            rooms: [],
            patientCount: 0,
            unavailableBeds: 0
          } as Pavilion);
        }
        const bedRequests = rooms.map(room =>
          this.http.get<Bed[]>(`${this.apiUrl}/api/room/${room.id}/beds`).pipe(
            map(beds => ({ ...room, beds }))
          )
        );
        return forkJoin(bedRequests).pipe(
          map(roomsWithBeds => {
            const totalBeds = roomsWithBeds.reduce((sum, r) => sum + r.beds.length, 0);
            const freeBeds = roomsWithBeds.reduce((sum, r) => sum + r.beds.filter(b => b.bedStatus === 'FREE').length, 0);
            const patientCount = roomsWithBeds.reduce((sum, r) => sum + r.beds.filter(b => b.bedStatus === 'OCCUPIED').length, 0);
            const unavailableBeds = roomsWithBeds.reduce((sum, r) => sum + r.beds.filter(b => b.bedStatus === 'OUT_OF_SERVICE').length, 0);
            return {
              id,
              name: dept?.name ?? '',
              freeBeds,
              totalBeds,
              rooms: roomsWithBeds,
              patientCount,
              unavailableBeds
            } as Pavilion;
          })
        );
      })
    );
  }

  setBedStatus(bedId: number, bedStatus: BedStatus): Observable<Bed> {
    return this.http.patch<Bed>(`${this.apiUrl}/api/beds/${bedId}/status`, { bedStatus });
  }

  createDepartment(name: string): Observable<Pavilion> {
    return this.http.post<Pavilion>(`${this.apiUrl}/api/departments`, { name });
  }

  createRoom(roomNumber: string, departmentId: number): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/api/rooms/room`, { roomNumber, departmentId });
  }

  createBed(bedNumber: string, roomId: number): Observable<Bed> {
    return this.http.post<Bed>(`${this.apiUrl}/api/bed/beds`, { bedNumber, roomId });
  }

  getBedHistory(bedId: number): Observable<BedStatusHistory[]> {
    return this.http.get<BedStatusHistory[]>(`${this.apiUrl}/api/beds/${bedId}/history`);
  }

  getOutOfServiceAlerts(minutes: number = 2): Observable<OutOfServiceAlert[]> {
    return this.http.get<OutOfServiceAlert[]>(`${this.apiUrl}/api/beds/alerts?minutes=${minutes}`);
  }

  createUser(request: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/users`, request);
  }

  updateRoomName(roomId: number, roomNumber: string): Observable<Room> {
    return this.http.patch<Room>(`${this.apiUrl}/api/rooms/${roomId}`, { name: roomNumber });
  }

  updateBedName(bedId: number, bedNumber: string): Observable<Bed> {
    return this.http.patch<Bed>(`${this.apiUrl}/api/beds/${bedId}/name`, { name: bedNumber });
  }

  deleteDepartment(departmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/departments/${departmentId}`);
  }

  deleteRoom(roomId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/rooms/${roomId}`);
  }

  deleteBed(bedId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/beds/${bedId}`);
  }
}
