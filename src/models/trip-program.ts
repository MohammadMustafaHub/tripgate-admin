export interface TripStep {
  position: number;
  days: number;
  description: string;
}

export interface TripProgram {
  id: string;
  name: string;
  description: string;
  defaultPricePerSeat: number;
  defaultSeats: number;
  coverImage: string;
  transportMethod: string;
  isInternational: boolean;
  totalDays: number;
  steps: TripStep[];
  images: string[];
  createdAt: string;
}

