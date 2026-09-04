export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: number;
  bookingRef: string;
  eventId: string;
  eventTitle: string;
  ticketCategoryName: string;
  quantity: number;
  status: BookingStatus | string;
  createdAt: string;
}

export interface CreateBookingRequest {
  ticketCategoryId: number;
  quantity: number;
}
