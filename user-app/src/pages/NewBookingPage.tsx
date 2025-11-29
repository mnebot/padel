import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingCalendar, TimeSlotSelector, BookingForm, ParticipantSelector } from '@/components/booking';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { useAvailability } from '@/hooks/useAvailability';
import { useUsers } from '@/hooks/useUsers';
import { isInDirectBookingWindow, isInRequestWindow, toISODateString } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewBookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createDirectBooking } = useBookings();
  const { createRequest } = useBookingRequests();
  const { availability, isLoading: isLoadingAvailability, error: availabilityError, fetchAvailability } = useAvailability();
  const { users, isLoading: isLoadingUsers, fetchUsers } = useUsers();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedCourtName, setSelectedCourtName] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine booking type based on selected date
  const isDirectBooking = selectedDate ? isInDirectBookingWindow(selectedDate) : false;
  const isRequestBooking = selectedDate ? isInRequestWindow(selectedDate) : false;

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Initialize participants with current user
  useEffect(() => {
    if (user && !selectedParticipants.includes(user.id)) {
      setSelectedParticipants([user.id]);
    }
  }, [user]);

  // Fetch availability when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateStr = toISODateString(selectedDate);
      fetchAvailability(dateStr);
      // Reset selections when date changes
      setSelectedTimeSlot(null);
      setSelectedCourtId(null);
      setSelectedCourtName(null);
    }
  }, [selectedDate, fetchAvailability]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (timeSlot: string, courtId?: string) => {
    setSelectedTimeSlot(timeSlot);
    if (courtId && availability) {
      setSelectedCourtId(courtId);
      // Find court name
      const slot = availability.slots.find(s => s.timeSlot === timeSlot);
      const court = slot?.availableCourts.find(c => c.id === courtId);
      setSelectedCourtName(court?.name || null);
    } else {
      setSelectedCourtId(null);
      setSelectedCourtName(null);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedDate || !selectedTimeSlot) {
      toast.error('Falten dades per crear la reserva');
      return;
    }

    if (selectedParticipants.length !== numberOfPlayers) {
      toast.error(`Has de seleccionar exactament ${numberOfPlayers} participant${numberOfPlayers > 1 ? 's' : ''}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = toISODateString(selectedDate);

      if (isDirectBooking) {
        // Direct booking requires court ID
        if (!selectedCourtId) {
          toast.error('Has de seleccionar una pista');
          return;
        }

        await createDirectBooking({
          userId: user.id,
          courtId: selectedCourtId,
          date: dateStr,
          timeSlot: selectedTimeSlot,
          numberOfPlayers,
          participantIds: selectedParticipants,
        });

        toast.success('Reserva creada correctament!');
      } else if (isRequestBooking) {
        // Request booking
        await createRequest({
          userId: user.id,
          date: dateStr,
          timeSlot: selectedTimeSlot,
          numberOfPlayers,
          participantIds: selectedParticipants,
        });

        toast.success('Sol·licitud creada correctament! Rebràs una notificació quan s\'assigni.');
      }

      // Navigate back to dashboard
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error creant la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const canShowParticipantSelector = selectedDate && selectedTimeSlot && (isDirectBooking ? selectedCourtId : true);
  const canShowForm = canShowParticipantSelector && selectedParticipants.length === numberOfPlayers;

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Nova Reserva</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Selecciona una data i horari per crear una reserva o sol·licitud
          </p>
        </div>
      </div>

      {/* Step 1: Select Date */}
      <div>
        <BookingCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
      </div>

      {/* Step 2: Select Time Slot (and Court for direct bookings) */}
      {selectedDate && (
        <div>
          {isLoadingAvailability ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : availabilityError ? (
            <ErrorMessage message={availabilityError} />
          ) : availability && availability.slots.length > 0 ? (
            <TimeSlotSelector
              slots={availability.slots}
              selectedTimeSlot={selectedTimeSlot}
              selectedCourtId={selectedCourtId}
              onTimeSlotSelect={handleTimeSlotSelect}
              isDirectBooking={isDirectBooking}
            />
          ) : (
            <ErrorMessage message="No hi ha horaris disponibles per aquesta data" />
          )}
        </div>
      )}

      {/* Step 3: Select number of players and participants */}
      {canShowParticipantSelector && (
        <div className="space-y-4">
          {/* Number of players selector */}
          <div className="bg-card rounded-lg border p-4">
            <label htmlFor="numberOfPlayers" className="block text-sm font-medium mb-2">
              Nombre de jugadors
            </label>
            <select
              id="numberOfPlayers"
              value={numberOfPlayers}
              onChange={(e) => {
                const newNumber = Number(e.target.value);
                setNumberOfPlayers(newNumber);
                // Reset participants if new number is less than current selection
                if (selectedParticipants.length > newNumber) {
                  setSelectedParticipants(selectedParticipants.slice(0, newNumber));
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value={2}>2 jugadors</option>
              <option value={3}>3 jugadors</option>
              <option value={4}>4 jugadors</option>
            </select>
          </div>

          {/* Participant selector */}
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <ParticipantSelector
              currentUserId={user?.id || ''}
              selectedParticipants={selectedParticipants}
              onParticipantsChange={setSelectedParticipants}
              numberOfPlayers={numberOfPlayers}
              availableUsers={users}
            />
          )}
        </div>
      )}

      {/* Step 4: Confirm Booking */}
      {canShowForm && (
        <div>
          <BookingForm
            date={selectedDate}
            timeSlot={selectedTimeSlot}
            courtName={selectedCourtName || undefined}
            isDirectBooking={isDirectBooking}
            numberOfPlayers={numberOfPlayers}
            participantsCount={selectedParticipants.length}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
