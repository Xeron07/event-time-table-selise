// Zustand store for venue management
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Venue } from "../types/event";
import { mockVenues } from "../utils/mockData";

interface VenueStore {
  venues: Venue[];
  addVenue: (venue: Venue) => void;
  deleteVenue: (id: string) => void;
  updateVenue: (id: string, venue: Partial<Venue>) => void;
}

export const useVenueStore = create<VenueStore>()(
  persist(
    (set) => ({
      venues: mockVenues,

      addVenue: (venue) =>
        set((state) => ({
          venues: [...state.venues, venue],
        })),

      deleteVenue: (id) =>
        set((state) => ({
          venues: state.venues.filter((venue) => venue.id !== id),
        })),

      updateVenue: (id, updatedVenue) =>
        set((state) => ({
          venues: state.venues.map((venue) =>
            venue.id === id ? { ...venue, ...updatedVenue } : venue
          ),
        })),
    }),
    {
      name: "venue-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
