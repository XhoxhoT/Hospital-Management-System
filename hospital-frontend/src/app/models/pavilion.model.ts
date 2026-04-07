export type BedStatus = 'FREE' | 'OCCUPIED' | 'OUT_OF_SERVICE';

export interface Bed {
  bedId: number;
  bednumber: string;
  bedStatus: BedStatus;
  roomId: number;
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
