import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/navbar';
import { decodeToken } from '@/lib/decodeToken';
import AccessDenied from '@/components/AccesDenied';
import '../styles/AvailabilityForm.css';

interface AvailabilitySlot {
  date: string;
  startTime?: string;
  endTime?: string;
}

function AvailabilityForm() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const [, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [message, setMessage] = useState<string>('');
  const [calendarView, setCalendarView] = useState<string>('dayGridWeek');
  const navigate = useNavigate();

  // Auth states
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const token = localStorage.getItem('token');

  // Popup state
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setAccessDenied(true);
      setCheckingAuth(false);
      return;
    }
    try {
      const decoded = decodeToken(token);
      if (decoded?.role !== 'client') {  // Adjust the role check as needed
        setAccessDenied(true);
      }
    } catch {
      setAccessDenied(true);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Helper to get current week's date range
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

  // Update dateRange at midnight
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

  // Fetch availability after auth check passes
  useEffect(() => {
    async function fetchAvailability() {
      if (!freelancerId || !token || accessDenied || checkingAuth) return;
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
  }, [freelancerId, token, dateRange, navigate, calendarView, accessDenied, checkingAuth]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const start = event.start;
    const end = event.end;
    if (!start || !end) return;

    const date = start.toISOString().split('T')[0];
    const startTime = start.toTimeString().slice(0, 5);
    const endTime = end.toTimeString().slice(0, 5);

    setSelectedSlot({ date, startTime, endTime });
    setPopupMessage('');
    setIsPopupOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !token || !freelancerId) return;
    try {
      const res = await fetch(
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
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Booking failed');
      }

      setPopupMessage('Availability successfully booked!');
      setIsPopupOpen(false);

      // Refresh availabilities after booking
      const refreshRes = await axios.get<AvailabilitySlot[]>(
        `${import.meta.env.VITE_API_URL}/api/availability/${freelancerId}/available-slots`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dateRange: dateRange.rangeString },
        }
      );
      setAvailabilities(refreshRes.data);
      setEvents(mapToCalendarEvents(refreshRes.data, calendarView));
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

  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <div className="availability-container" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Checking authentication...
        </div>
      </>
    );
  }

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <>
      <Navbar />
      <div
        className="availability-container"
        style={{
          maxWidth: '900px',
          margin: '2rem auto',
          padding: '1rem',
          backgroundColor: '#f7fafc',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          className="calendar-container"
          style={{
            maxHeight: '650px',
            overflowY: 'auto',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
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
            datesSet={(info) => setCalendarView(info.view.type)}
          />
        </div>

        {/* Booking Popup */}
        {isPopupOpen && selectedSlot && (
          <div
            className="popup-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <div
              className="popup-content"
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <h2>Confirm Booking</h2>
              <p>
                Date: {selectedSlot.date}
                <br />
                Time: {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
              {popupMessage && (
                <p style={{ color: popupMessage.includes('success') ? 'green' : 'red' }}>
                  {popupMessage}
                </p>
              )}
              <button
                onClick={handleConfirmBooking}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '1rem',
                }}
              >
                Confirm
              </button>
              <button
                onClick={handleClosePopup}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <div
            style={{
              color: 'red',
              marginTop: '1rem',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default AvailabilityForm;
