// Venues View - for managing venues
import { useState, useEffect } from "react";
import { useVenueStore } from "@/store/venueStore";
import { useEventStore } from "@/store/eventStore";
import type { Venue } from "@/types/event";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Building2, Plus, Trash2, Edit } from "lucide-react";

interface VenueFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  venue?: Venue | null;
}

const VenueFormDialog = ({ isOpen, onOpenChange, venue }: VenueFormDialogProps) => {
  const { addVenue, updateVenue } = useVenueStore();
  const [formData, setFormData] = useState({ name: "", color: "#4ECDC4", capacity: 100 });

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name,
        color: venue.color || "#4ECDC4",
        capacity: venue.capacity || 0,
      });
    } else {
      setFormData({ name: "", color: "#4ECDC4", capacity: 100 });
    }
  }, [venue, isOpen]);

  const handleSubmit = () => {
    if (!formData.name) return;

    if (venue) {
      updateVenue(venue.id, formData);
    } else {
      const newVenue: Venue = {
        id: `venue_${Date.now()}`,
        ...formData,
      };
      addVenue(newVenue);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{venue ? "Edit Venue" : "Create New Venue"}</DialogTitle>
          <DialogDescription>
            {venue ? "Update the details of your venue." : "Fill in the details to add a new venue."}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Venue Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='e.g., Main Auditorium'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='capacity'>Capacity</Label>
              <Input
                id='capacity'
                type='number'
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='color'>Venue Color</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='color'
                  type='color'
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className='w-12 h-10 p-1'
                />
                 <span className='text-sm text-gray-500'>{formData.color}</span>
              </div>
            </div>
          </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{venue ? "Save Changes" : "Create Venue"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const VenuesView = () => {
  const { venues, deleteVenue } = useVenueStore();
  const { events, updateEvent, deleteEvent: deleteAssociatedEvent } = useEventStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const handleOpenCreate = () => {
    setEditingVenue(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setIsDialogOpen(true);
  };

  const handleDeleteVenue = (venueId: string) => {
    // Handle associated events
    events.forEach(event => {
      if (event.venueIds.includes(venueId)) {
        const updatedVenueIds = event.venueIds.filter(id => id !== venueId);
        if (updatedVenueIds.length === 0) {
          // If no venues are left, delete the event
          deleteAssociatedEvent(event.id);
        } else {
          // Otherwise, just update the event to remove the venue
          updateEvent(event.id, { venueIds: updatedVenueIds });
        }
      }
    });

    // Delete the venue itself
    deleteVenue(venueId);
  };

  return (
    <div className='flex-1 p-8 bg-gray-50 overflow-y-auto'>
      <div className='flex justify-between items-center mb-8'>
        <div className='flex items-center gap-3'>
          <Building2 className='h-8 w-8 text-gray-700' />
          <h1 className='text-3xl font-bold text-gray-800'>Venue Management</h1>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className='h-4 w-4 mr-2' />
          Create Venue
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {venues.map((venue) => (
          <div key={venue.id} className='bg-white border rounded-lg shadow-sm transition-all hover:shadow-md'>
            <div className='p-5'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-4'>
                  <div
                    className='w-4 h-16 rounded'
                    style={{ backgroundColor: venue.color || "#3b82f6" }}
                  />
                  <div>
                    <h3 className='text-lg font-bold text-gray-800'>{venue.name}</h3>
                    {venue.capacity && (
                      <p className='text-sm text-gray-500'>
                        Capacity: {venue.capacity}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                   <Button variant='ghost' size='icon' className='text-gray-400 hover:text-blue-600' onClick={() => handleOpenEdit(venue)}>
                      <Edit className='h-4 w-4' />
                    </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='ghost' size='icon' className='text-gray-400 hover:text-destructive'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the venue
                          and remove it from all associated events.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteVenue(venue.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <VenueFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        venue={editingVenue}
      />
    </div>
  );
};

export default VenuesView;