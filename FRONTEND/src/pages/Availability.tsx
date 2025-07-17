import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/AvailabilityForm.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  date: string;
  startTime?: string;
  endTime?: string;
}

/*function formatTime(time24?: string): string {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}*/

function AvailabilityForm() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const [, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [message, setMessage] = useState<string>('');
  const [calendarView, setCalendarView] = useState<string>('dayGridWeek');
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const token = localStorage.getItem('token');

  // Popup state
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [token, navigate]);

  const getDateRange = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 6);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    return {
      start: formatDate(today),
      end: formatDate(endDate),
      rangeString: `${formatDate(today)},${formatDate(endDate)}`,
    };
  };

  const [dateRange, setDateRange] = useState(getDateRange());

  const mapToCalendarEvents = (slots: AvailabilitySlot[], calendarView: string): EventInput[] => {
    if (calendarView === 'dayGridMonth') {
      const groupedByDate = slots.reduce<Record<string, AvailabilitySlot[]>>((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
      }, {});

      return Object.keys(groupedByDate).map(date => ({
        title: 'Available',
        start: `${date}T00:00:00`,
        end: `${date}T23:59:59`,
        allDay: true,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
      }));
    } else {
      return slots.map((slot) => ({
        title: 'Available',
        start: `${slot.date}T${slot.startTime || '00:00'}:00`,
        end: `${slot.date}T${slot.endTime || '23:59'}:00`,
        allDay: !slot.startTime || !slot.endTime,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
      }));
    }
  };

  useEffect(() => {
    const updateRangeAtMidnight = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
      const msUntilMidnight = midnight.getTime() - now.getTime();

      const timer = setTimeout(() => {
        setDateRange(getDateRange());
        updateRangeAtMidnight();
      }, msUntilMidnight);

      return () => clearTimeout(timer);
    };

    updateRangeAtMidnight();
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      if (!freelancerId || !token) return;
      const id = Number(freelancerId);
      if (isNaN(id)) {
        setMessage('Invalid freelancer ID.');
        return;
      }
      try {
        const res = await axios.get<AvailabilitySlot[]>(
          `${import.meta.env.VITE_API_URL}/api/availability/${id}/available-slots`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { dateRange: dateRange.rangeString },
          }
        );
        setAvailabilities(res.data);
        setEvents(mapToCalendarEvents(res.data, calendarView));
        setMessage('');
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          console.error(err);
          setMessage('Failed to load availability');
        }
      }
    }
    fetchAvailability();
  }, [freelancerId, token, dateRange, navigate, calendarView]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const start = event.start;
    const end = event.end;
    if (!start || !end) return;

    const date = start.toISOString().split('T')[0];
    const startTime = start.toTimeString().slice(0,5);
    const endTime = end.toTimeString().slice(0,5);

    setSelectedSlot({ date, startTime, endTime });
    setPopupMessage('');
    setIsPopupOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !token || !freelancerId) return;
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointment/create/${freelancerId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointment_date: selectedSlot.date,
            start_time: selectedSlot.startTime,
            end_time: selectedSlot.endTime,
          }),
        }
      ).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Booking failed');
        }
      });

      setPopupMessage('Availability successfully booked!');
      setIsPopupOpen(false);

      // Refresh availabilities after booking
      const res = await axios.get<AvailabilitySlot[]>(
        `${import.meta.env.VITE_API_URL}/api/availability/${freelancerId}/available-slots`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dateRange: dateRange.rangeString },
        }
      );
      setAvailabilities(res.data);
      setEvents(mapToCalendarEvents(res.data, calendarView));
    } catch (error: any) {
      console.error(error);
      setPopupMessage(error.message || 'Failed to book availability.');
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedSlot(null);
    setPopupMessage('');
  };

  return (
    <div className="availability-container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {isCheckingAuth ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="calendar-container" style={{ maxHeight: '650px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #ddd' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              nowIndicator={true}
              editable={false}
              selectable={true}
              weekends={true}
              dayMaxEvents={true}
              eventTimeFormat={
                calendarView === 'dayGridMonth'
                  ? undefined
                  : { hour: 'numeric', minute: '2-digit', meridiem: true }
              }
            />
          </div>

          {/* Booking Popup */}
          {isPopupOpen && selectedSlot && (
            <div className="popup-overlay" style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}>
              <div className="popup-content" style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                textAlign: 'center',
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Confirm Booking</h3>
                <p style={{ marginBottom: '1rem' }}>
                  Date: <strong>{selectedSlot.date}</strong><br />
                  Time: <strong>{selectedSlot.startTime} - {selectedSlot.endTime}</strong>
                </p>
                {popupMessage && <p className="popup-message" style={{ marginBottom: '1rem', color: 'green' }}>{popupMessage}</p>}
                <button
                  onClick={handleConfirmBooking}
                  className="confirm-btn"
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '1rem',
                    fontWeight: '600',
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={handleClosePopup}
                  className="cancel-btn"
                  style={{
                    backgroundColor: '#ddd',
                    color: '#333',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`message ${message.includes('Error') ? 'error' : 'success'}`}
              style={{
                padding: '1rem',
                margin: '1rem 0',
                borderRadius: '4px',
                backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                color: message.includes('Error') ? '#c62828' : '#2e7d32',
              }}
            >
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AvailabilityForm;
