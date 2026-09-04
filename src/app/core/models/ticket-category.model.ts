export interface TicketCategory {
  id: number;
  name: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}

export interface OrganiserTicketCategory extends TicketCategory {
  totalBooked: number;
}

export interface CreateTicketCategoryRequest {
  name: string;
  price: number;
  totalSeats: number;
}
