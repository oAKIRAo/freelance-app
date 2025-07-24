import { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Sidebar from "../components/AdminSideBar";
import Modal from "../components/Modal";
import  "../styles/Analytics.css"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface AnalyticsData {
  Total: number;
  Totalcompleted: number;
  TotalCancelled: number;
  TotalInprogress: number;
}

interface ChartDataItem {
  status: string;
  count: number;
}

interface Appointment {
  id: number;
  client_name: string;
  freelancer_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface FormState {
  id: number | null;
  client_name: string;
  freelancer_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

const COLORS = {
    completed: "#10B981", // Green
    canceled: "#EF4444" ,// Red
    booked:"#F59E0B", // orange
};
const legendFormatter = (value: string) => {
  const map: Record<string, string> = {
    completed: " Completed",
    canceled: " Cancelled",
    booked: " In Progress",
  };
  return map[value.toLowerCase()] || value;
};
const ROWS_PER_PAGE = 5;

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    id: null,
    client_name: '',
    freelancer_name: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const API = import.meta.env.VITE_API_URL;

  // This function will fetch all necessary data and refresh the dashboard
  const fetchAllData = () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    axios.get(`${API}/api/appointment/analytics`, { headers }).then((res) => setAnalytics(res.data)).catch((err) => console.error("Error fetching analytics:", err));
    axios.get(`${API}/api/appointment/status/count`, { headers }).then((res) => setChartData(res.data)).catch((err) => console.error("Error fetching chart data:", err));
    fetchAppointments();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const filtered = appointments.filter(appointment =>
      appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.freelancer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointment_date.includes(searchTerm)
    );
    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [appointments, searchTerm]);
  
  const fetchAppointments = () => {
    axios
      .get(`${API}/api/appointment/`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments:", err));
  };

  const handleEdit = (appointment: Appointment) => {
    const formattedDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
    setForm({
      id: appointment.id,
      client_name: appointment.client_name,
      freelancer_name: appointment.freelancer_name,
      appointment_date: formattedDate,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name || !form.freelancer_name || !form.appointment_date || !form.start_time || !form.end_time) {
      setMessage('All fields are required');
      return;
    }
    try {
      await axios.patch(`${API}/api/appointment/update/${form.id}`, { ...form }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, 'Content-Type': 'application/json' } });
      setMessage('Appointment updated successfully');
      setIsModalOpen(false);
      fetchAllData();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      axios
        .delete(`${API}/api/appointment/delete/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        .then(() => {
          setMessage('Appointment deleted successfully');
          fetchAllData();
        })
        .catch((err) => {
          console.error(err);
          setMessage('Failed to delete appointment');
        });
    }
  };

  const maxPage = Math.ceil(filteredAppointments.length / ROWS_PER_PAGE) || 1;
  const appointmentsToShow = filteredAppointments.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const nextPage = () => setCurrentPage(p => Math.min(p + 1, maxPage));

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`} role="alert">
            {message}
          </div>
        )}

        {/* Summary Cards */}
        <div className="summary-cards-container">
          <SummaryCard title="Total" value={analytics?.Total ?? 0} icon={<FaUsers color="#3B82F6" />} />
          <SummaryCard title="Completed" value={analytics?.Totalcompleted ?? 0}icon={<FaCheckCircle color="#10B981"/>} />
          <SummaryCard title="Cancelled" value={analytics?.TotalCancelled ?? 0}icon={<FaTimesCircle color="#EF4444" />} />
          <SummaryCard title="In Progress" value={analytics?.TotalInprogress ?? 0} icon={<FaSpinner color="#F59E0B" />}/>
        </div>

        {/* Pie Chart */}
        <div className="pie-chart-section">
          <h2 className="text-xl font-semibold mb-6">Appointments by Status</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                dataKey="count"
                data={chartData}
                nameKey="status"
                outerRadius={120}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`}
                  fill={COLORS[entry.status as keyof typeof COLORS] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend  formatter={legendFormatter}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments Table */}
        <section className="card table-card">
          <h2>All Appointments</h2>
          <input
            type="search"
            placeholder="Search by client, freelancer, status, or date"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '1rem',
              borderRadius: '12px',
              border: '1px solid #ccc',
            }}
          />
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Freelancer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsToShow.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-data">No appointments found.</td>
                  </tr>
                ) : (
                  appointmentsToShow.map((app) => (
                    <tr key={app.id}>
                      <td className="font-bold">{app.client_name}</td>
                      <td>{app.freelancer_name}</td>
                      <td>{new Date(app.appointment_date).toLocaleDateString()}</td>
                      <td>{app.start_time} - {app.end_time}</td>
                      <td className="capitalize">{app.status}</td>
                      <td className="actions">
                        <button className="btn btn-edit" onClick={() => handleEdit(app)}>Edit</button>
                        <button className="btn btn-delete" onClick={() => handleDelete(app.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredAppointments.length > ROWS_PER_PAGE && (
            <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
              <button className="btn btn-cancel" onClick={prevPage} disabled={currentPage === 1} style={{ marginRight: '0.5rem' }}>Prev</button>
              <button className="btn btn-submit" onClick={nextPage} disabled={currentPage === maxPage}>Next</button>
              <span style={{ marginLeft: '1rem', fontWeight: '600' }}>Page {currentPage} of {maxPage}</span>
            </div>
          )}
        </section>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>Edit Appointment</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>Client Name <span className="required">*</span><input name="client_name" value={form.client_name} onChange={handleChange} required placeholder="Client Name" autoComplete="off" /></label>
            <label>Freelancer Name <span className="required">*</span><input name="freelancer_name" value={form.freelancer_name} onChange={handleChange} required placeholder="Freelancer Name" autoComplete="off" /></label>
            <label>Date <span className="required">*</span><input type="date" name="appointment_date" value={form.appointment_date} onChange={handleChange} required /></label>
            <label>Start Time <span className="required">*</span><input type="time" name="start_time" value={form.start_time} onChange={handleChange} required /></label>
            <label>End Time <span className="required">*</span><input type="time" name="end_time" value={form.end_time} onChange={handleChange} required /></label>
            <label>Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-submit">Update</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;

}

const SummaryCard = ({ title, value ,icon}: SummaryCardProps) => (
  <div className="summary-card">
    <div className="summary-card-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);


export default AdminAnalytics;