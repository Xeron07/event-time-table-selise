// Event sheet component - form for creating/editing events
import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Event, Venue } from "../../types/event";
import { useEventStore } from "../../store/eventStore";
import {
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  Palette,
  AlertTriangle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: string;
  selectedVenueId?: string;
  venues: Venue[];
  editingEvent?: Event;
}

const EventSheet = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  selectedVenueId,
  venues,
  editingEvent,
}: EventSheetProps) => {
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    color: "#3b82f6",
    venueIds: [] as string[],
  });

  const colorPalette = [
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#f97316",
    "#8b5cf6",
    "#ec4899",
  ];

  // Generate time slots (15-minute intervals)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if a time/venue combination is available
  const isTimeVenueAvailable = useMemo(() => {
    return (venueId: string, startTime: string, endTime: string): boolean => {
      if (!selectedDate) return true;

      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const proposedStart = new Date(selectedDate);
      proposedStart.setHours(startHours, startMinutes, 0, 0);

      const proposedEnd = new Date(selectedDate);
      proposedEnd.setHours(endHours, endMinutes, 0, 0);

      // Filter events for the same date and venue
      const conflictingEvents = events.filter((event) => {
        // Skip the current event being edited
        if (editingEvent && event.id === editingEvent.id) return false;

        // Check if event is on the same date
        const eventDate = new Date(event.start);
        if (
          eventDate.getDate() !== selectedDate.getDate() ||
          eventDate.getMonth() !== selectedDate.getMonth() ||
          eventDate.getFullYear() !== selectedDate.getFullYear()
        ) {
          return false;
        }

        // Check if event uses this venue
        if (!event.venueIds.includes(venueId)) return false;

        // Check for time overlap
        const eventStart = new Date(event.start).getTime();
        const eventEnd = new Date(event.end).getTime();
        const propStart = proposedStart.getTime();
        const propEnd = proposedEnd.getTime();

        // Events overlap if: start < eventEnd AND end > eventStart
        return propStart < eventEnd && propEnd > eventStart;
      });

      return conflictingEvents.length === 0;
    };
  }, [events, selectedDate, editingEvent]);

  // Check if venue is available for current time range
  const isVenueAvailable = (venueId: string): boolean => {
    if (!formData.startTime || !formData.endTime) return true;
    return isTimeVenueAvailable(venueId, formData.startTime, formData.endTime);
  };

  // Get available end times based on start time and selected venues
  const getAvailableEndTimes = (): string[] => {
    if (!formData.startTime) return timeSlots;

    const startIndex = timeSlots.indexOf(formData.startTime);
    if (startIndex === -1) return [];

    // End time must be after start time
    return timeSlots.slice(startIndex + 1);
  };

  // Calculate initial form data based on props
  const getInitialFormData = () => {
    if (editingEvent) {
      const start = new Date(editingEvent.start);
      const end = new Date(editingEvent.end);
      return {
        title: editingEvent.title,
        description: editingEvent.description || "",
        startTime: `${start.getHours().toString().padStart(2, "0")}:${start
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
        endTime: `${end.getHours().toString().padStart(2, "0")}:${end
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
        color: editingEvent.color || "#3b82f6",
        venueIds: editingEvent.venueIds,
      };
    } else {
      const defaultStartTime = selectedTime || "09:00";
      const [hours, minutes] = defaultStartTime.split(":");
      const defaultEndHours = (parseInt(hours) + 1).toString().padStart(2, "0");
      const defaultEndTime = `${defaultEndHours}:${minutes}`;

      return {
        title: "",
        description: "",
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        color: "#3b82f6",
        venueIds: selectedVenueId ? [selectedVenueId] : [],
      };
    }
  };

  useEffect(() => {
    // Only update form data when sheet opens or editing event changes
    if (isOpen) {
      setFormData(getInitialFormData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingEvent?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || formData.venueIds.length === 0) {
      alert("Please select at least one venue");
      return;
    }

    // Validate no overlaps for each selected venue
    for (const venueId of formData.venueIds) {
      if (
        !isTimeVenueAvailable(venueId, formData.startTime, formData.endTime)
      ) {
        const venue = venues.find((v) => v.id === venueId);
        alert(
          `Time slot is not available for venue: ${
            venue?.name || venueId
          }\nPlease choose a different time or venue.`
        );
        return;
      }
    }

    const [startHours, startMinutes] = formData.startTime
      .split(":")
      .map(Number);
    const [endHours, endMinutes] = formData.endTime.split(":").map(Number);

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: formData.title,
        description: formData.description,
        start: startDateTime,
        end: endDateTime,
        color: formData.color,
        venueIds: formData.venueIds,
      });
    } else {
      const eventId = `${startDateTime.getTime()}-${formData.venueIds.join(
        "-"
      )}`;
      const newEvent: Event = {
        id: eventId,
        title: formData.title,
        description: formData.description,
        start: startDateTime,
        end: endDateTime,
        color: formData.color,
        allDay: false,
        venueIds: formData.venueIds,
      };
      addEvent(newEvent);
    }

    onClose();
    resetForm();
  };

  const handleDelete = () => {
    if (
      editingEvent &&
      confirm("Are you sure you want to delete this event?")
    ) {
      deleteEvent(editingEvent.id);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      color: "#3b82f6",
      venueIds: [],
    });
  };

  const toggleVenue = (venueId: string) => {
    setFormData((prev) => ({
      ...prev,
      venueIds: prev.venueIds.includes(venueId)
        ? prev.venueIds.filter((id) => id !== venueId)
        : [...prev.venueIds, venueId],
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side='right'
        className='w-[450px] sm:max-w-lg grid grid-rows-[auto,1fr,auto] p-0'>
        <SheetHeader className='p-6'>
          <SheetTitle className='flex items-center gap-2 text-xl font-bold'>
            <CalendarIcon className='h-5 w-5' />
            {editingEvent ? "Edit Event" : "Create Event"}
          </SheetTitle>
          <SheetDescription>
            {editingEvent
              ? "Update the details of your event."
              : "Fill in the details to create a new event."}
          </SheetDescription>
        </SheetHeader>

        <div className='overflow-y-auto px-6'>
          <form id='event-form' onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Event Name *</Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder='e.g., Team Sync'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Add a short description...'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startTime'>Start Time *</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, startTime: value, endTime: "" })
                  }
                  required>
                  <SelectTrigger>
                    <Clock className='h-4 w-4 mr-2 text-muted-foreground' />
                    <SelectValue placeholder='Select time' />
                  </SelectTrigger>
                  <SelectContent className='max-h-[300px]'>
                    {timeSlots.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='endTime'>End Time *</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, endTime: value })
                  }
                  required
                  disabled={!formData.startTime}>
                  <SelectTrigger>
                    <Clock className='h-4 w-4 mr-2 text-muted-foreground' />
                    <SelectValue placeholder='Select time' />
                  </SelectTrigger>
                  <SelectContent className='max-h-[300px]'>
                    {getAvailableEndTimes().map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-3'>
              <Label>Venues *</Label>
              <div className='border rounded-md p-2 max-h-[180px] overflow-y-auto space-y-1'>
                {venues.map((venue) => {
                  const available = isVenueAvailable(venue.id);
                  const isSelected = formData.venueIds.includes(venue.id);
                  return (
                    <label
                      key={venue.id}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-md transition-colors",
                        !available && "opacity-50 cursor-not-allowed",
                        available && "cursor-pointer hover:bg-muted",
                        isSelected && "bg-primary/10"
                      )}>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => available && toggleVenue(venue.id)}
                        disabled={!available}
                        className='w-4 h-4 rounded-md bg-white border-2 border-gray-300 text-white accent-green-500 focus:ring-green-500 focus:ring-2 cursor-pointer'
                      />
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: venue.color || "#3b82f6" }}
                      />
                      <span className='flex-1 font-medium text-sm'>
                        {venue.name}
                      </span>
                      {venue.capacity && (
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Users className='h-3 w-3' />
                          <span>{venue.capacity}</span>
                        </div>
                      )}
                      {!available && (
                        <span className='text-xs text-destructive font-medium flex items-center gap-1'>
                          <AlertTriangle className='h-3 w-3' />
                          Not Available
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className='space-y-3'>
              <Label>Event Color</Label>
              <div className='flex items-center gap-2 flex-wrap'>
                {colorPalette.map((color) => (
                  <button
                    type='button'
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all border-2",
                      formData.color.toLowerCase() === color.toLowerCase()
                        ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className='relative h-8 w-8 rounded-full border-2 border-dashed flex items-center justify-center'>
                  <Input
                    type='color'
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                  />
                  <Palette className='h-4 w-4 text-muted-foreground' />
                </div>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className='p-6 bg-muted/20 border-t'>
          <div className='flex justify-between w-full'>
            <div>
              {editingEvent && (
                <Button
                  type='button'
                  onClick={handleDelete}
                  variant='destructive'
                  className='flex items-center gap-2'>
                  <Trash2 className='h-4 w-4' />
                  Delete
                </Button>
              )}
            </div>
            <div className='flex space-x-2'>
              <Button type='button' onClick={onClose} variant='outline'>
                Cancel
              </Button>
              <Button type='submit' form='event-form'>
                {editingEvent ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EventSheet;
