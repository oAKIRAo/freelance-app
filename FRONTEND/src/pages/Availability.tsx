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
  const [calendarView, setCalendarView] = useState<string>('dayGridMonth');
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const token = localStorage.getItem('token');

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
      if (decoded?.role !== 'client') {
        setAccessDenied(true);
      }
    } catch {
      setAccessDenied(true);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

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

  // Helper function to format time to 12-hour format
  const formatTimeTo12Hour = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${minutes !== '00' ? ':' + minutes : ''}${ampm}`;
  };

  const mapToCalendarEvents = (slots: AvailabilitySlot[], _calendarView: string): EventInput[] => {
    return slots.map((slot) => {
      const startTime = slot.startTime || '00:00';
      const endTime = slot.endTime || '23:59';
      


      return {
        title: `Available`,
        start: `${slot.date}T${startTime}:00`,
        end: `${slot.date}T${endTime}:00`,
        allDay: false,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
      };
    });
  };

  useEffect(() => {
    const updateRangeAtMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
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
      <div className="availability-container">
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
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
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            datesSet={(info) => setCalendarView(info.view.type)}
          />
        </div>

        {isPopupOpen && selectedSlot && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Confirm Booking</h2>
              <p>
                Date: {selectedSlot.date}
                <br />
                Time: {formatTimeTo12Hour(selectedSlot.startTime || '00:00')} - {formatTimeTo12Hour(selectedSlot.endTime || '23:59')}
              </p>
              {popupMessage && (
                <p style={{ color: popupMessage.includes('success') ? 'green' : 'red' }}>
                  {popupMessage}
                </p>
              )}
              <button className="confirm-btn" onClick={handleConfirmBooking}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={handleClosePopup}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <div style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default AvailabilityForm;