// Zustand store for event management
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Event } from "../types/event";

interface EventStore {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: Date) => Event[];
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      updateEvent: (id, updatedEvent) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updatedEvent } : event
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        })),

      getEventsByDate: (date) => {
        const events = get().events;
        return events.filter((event) => {
          const eventDate = new Date(event.start);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        });
      },
    }),
    {
      name: "event-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === "start" || key === "end") {
            return new Date(value as string);
          }
          return value;
        },
      }),
    }
  )
);
