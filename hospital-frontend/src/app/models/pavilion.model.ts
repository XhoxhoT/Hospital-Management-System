export interface Bed {
  id: string;
  number: number;
  status: 'free' | 'occupied' | 'unavailable';
}

export interface Room {
  id: string;
  number: number;
  beds: Bed[];
}

export interface Pavilion {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rooms: Room[];
  patientCount?: number;
  bedCount?: number;
  availableBeds?: number;
  unavailableBeds?: number;
}
