import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/navbar';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../styles/AvailabilityForm.css';
import { decodeToken } from '@/lib/decodeToken'; 
import AccessDenied from '@/components/AccesDenied'; // Adjust path as needed

interface Planning {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

function getNextDateOfWeek(dayName: string) {
  const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = new Date();
  const dayIndex = daysOfWeek.indexOf(dayName);
  if (dayIndex === -1) return null;

  const diff = (dayIndex + 7 - today.getDay()) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + diff);
  
  return nextDate.toISOString().split('T')[0];
}

const FreelancerPlanning = () => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAccessDenied(true);
      setCheckingAuth(false);
      return;
    }
    try {
      const decoded = decodeToken(token);
      if (decoded.role !== 'freelancer') {
        setAccessDenied(true);
      }
    } catch {
      setAccessDenied(true);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const fetchPlannings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAccessDenied(true);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/planning/getallplannings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlannings(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch planning.');
    }
  };

  const handleCreatePlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAccessDenied(true);
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/planning/createplanning`,
        {
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('Planning added successfully!');
      setError('');
      setDayOfWeek('');
      setStartTime('');
      setEndTime('');
      setShowModal(false);
      fetchPlannings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add planning.');
      setSuccess('');
    }
  };

  useEffect(() => {
    if (!accessDenied && !checkingAuth) {
      fetchPlannings();
    }
  }, [accessDenied, checkingAuth]);

  const events = plannings
    .map(plan => {
      const date = getNextDateOfWeek(plan.day_of_week);
      if (!date) return undefined;
      return {
        title: `Available`,
        start: `${date}T${plan.start_time}`,
        end: `${date}T${plan.end_time}`,
      };
    })
    .filter((event): event is { title: string; start: string; end: string } => event !== undefined);

  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <div className="availability-container p-8">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (accessDenied) {
    return (
      <>
        <AccessDenied />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="availability-container p-8">
        <h2 className="text-xl font-bold mb-4">Calendar View</h2>

        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}

        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }}
            eventDisplay="list-item"
            height="auto"
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
          />
        </div>

        <button onClick={() => setShowModal(true)} className="submit-btn">
          Add Planning
        </button>

        {showModal && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Add New Planning</h3>
              <form onSubmit={handleCreatePlanning} className="availability-form">
                <div className="form-group">
                  <label>Day of week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    required
                  >
                    <option value="">Select a day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Add Planning
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FreelancerPlanning;
