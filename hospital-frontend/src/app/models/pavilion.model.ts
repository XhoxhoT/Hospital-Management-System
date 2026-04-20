export type BedStatus = 'FREE' | 'OCCUPIED' | 'OUT_OF_SERVICE';

export interface OutOfServiceAlert {
  bedId: number;
  bedNumber: string;
  roomNumber: string;
  departmentName: string;
  outOfServiceSince: string;
  minutesInStatus: number;
}

export interface BedStatusHistory {
  id: number;
  previousStatus: BedStatus | null;
  newStatus: BedStatus;
  changedAt: string;
  changedBy: string;
}

export interface Bed {
  bedId: number;
  bednumber: string;
  bedStatus: BedStatus;
  roomId: number;
  statusSince: string | null;
}

export interface Room {
  id: number;
  roomNumber: string;
  departmentId: number;
  beds: Bed[];
}

export interface Pavilion {
  id: number;
  name: string;
  freeBeds: number;
  totalBeds: number;
  rooms: Room[];
  patientCount?: number;
  unavailableBeds?: number;
}
