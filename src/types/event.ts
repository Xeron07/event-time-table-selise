// Event type definitions
export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  allDay?: boolean;
  venueIds: string[]; // Multiple venues
}

export type EventFormData = Omit<Event, "id">;

export interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: string;
  selectedVenueId?: string;
  editingEvent?: Event;
}

// Venue type definitions
export type Venue = {
  id: string;
  name: string;
  color?: string;
  capacity?: number;
};
