import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  date: string;
  startTime?: string;
  endTime?: string;
}

interface AvailabilityFormProps {
  freelancerId?: number;
}

function AvailabilityForm({ freelancerId = 6 }: AvailabilityFormProps) {
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Monday');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [message, setMessage] = useState<string>('');
  const [calendarView, setCalendarView] = useState<string>('dayGridWeek');
  const navigate = useNavigate();

  // Track auth check status
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const token = localStorage.getItem('token');

  // Redirect if not logged in, else allow render
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [token, navigate]);

  // Show loading until auth check done
  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  // Generate 7-day date range from today
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

  const mapToCalendarEvents = (slots: AvailabilitySlot[]): EventInput[] => {
    return slots.map((slot) => ({
      title: 'Available',
      start: `${slot.date}T${slot.startTime || '00:00'}:00`,
      end: `${slot.date}T${slot.endTime || '23:59'}:00`,
      allDay: !slot.startTime || !slot.endTime,
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    }));
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
      try {
        const res = await axios.get<AvailabilitySlot[]>(
          `${import.meta.env.VITE_API_URL}/api/availability/${freelancerId}/available-slots`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { dateRange: dateRange.rangeString },
          }
        );
        setAvailabilities(res.data);
        setEvents(mapToCalendarEvents(res.data));
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
  }, [freelancerId, token, dateRange, navigate]);

  const handleAddAvailability = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (startTime >= endTime) {
      setMessage('End time must be after start time');
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/planning/freelancers/${freelancerId}/availability`,
        {
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Availability added!');

      // Refresh available slots
      const res = await axios.get<AvailabilitySlot[]>(
        `${import.meta.env.VITE_API_URL}/api/availability/${freelancerId}/available-slots`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dateRange: dateRange.rangeString },
        }
      );
      setAvailabilities(res.data);
      setEvents(mapToCalendarEvents(res.data));
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        console.error(error);
        setMessage('Error adding availability');
      }
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (window.confirm(`Are you sure you want to delete this availability slot?`)) {
      // Implement delete functionality if needed
      console.log('Event would be deleted:', clickInfo.event);
    }
  };

  return (
    <div className="availability-container">
      <h2>Set Your Availability</h2>
      <p>
        Showing availability from {dateRange.start} to {dateRange.end}
      </p>

      <div className="calendar-container">
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
          editable={true}
          selectable={true}
          weekends={true}
          dayMaxEvents={true}
        />
      </div>

      <div className="availability-form">
        <h3>Add New Availability</h3>
        <form onSubmit={handleAddAvailability}>
          <div className="form-group">
            <label>
              Day of Week:
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-group">
            <label>
              Start Time:
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              End Time:
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className="submit-btn">
            Add Availability
          </button>
        </form>
      </div>

      {message && <div className="message">{message}</div>}

      <style>{`
        .availability-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .calendar-container {
          margin: 1rem 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        .availability-form {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 4px;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
        select,
        input[type='time'] {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
          max-width: 200px;
        }
        .submit-btn {
          background: #4caf50;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .message {
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 4px;
          background: ${message.includes('Error') ? '#ffebee' : '#e8f5e9'};
          color: ${message.includes('Error') ? '#c62828' : '#2e7d32'};
        }
      `}</style>
    </div>
  );
}

export default AvailabilityForm;
