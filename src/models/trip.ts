export interface Trip {
  id: string;
  tripProgramId: string;
  tripProgramName: string;
  takeoffDate: string;
  finalRegistrationDate: string;
  pricePerSeat: number;
  seats: number;
  reservedSeats: number;
  availableSeats: number;
  isInternational: boolean;
  isActive: boolean;
  isOpenForBooking: boolean;
  createdAt: string;
}
