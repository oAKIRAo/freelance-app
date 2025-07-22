import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import { X, Check, AlertCircle } from "lucide-react";
import "../styles/FreelancerAppointments.css";
import { decodeToken } from "@/lib/decodeToken";
import AccessDenied from "../components/AccesDenied"; // Add this or replace with your own access denied UI

interface Appointment {
  id: string;
  freelancer_name: string;
  freelancer_email: string;
  date: string;
  start_time: string;
  end_time: string;
  status?: "completed" | "cancelled" | "upcoming";
}

export default function ClientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/appointment/client/appointments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = res.data;
      setAppointments(Array.isArray(data) ? data : data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments. Please try again.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId: string, status: "cancelled") => {
    try {
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status } : app
        )
      );

      const endpoint = `${import.meta.env.VITE_API_URL}/api/appointment/${appointmentId}/cancel`;

      await axios.patch(endpoint, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      fetchAppointments();
      setError("Failed to cancel appointment. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAccessDenied(true);
      setCheckingAuth(false);
      return;
    }
    try {
      const decoded = decodeToken(token);
      if (decoded?.role !== "client") {
        setAccessDenied(true);
      } else {
        fetchAppointments();
      }
    } catch (err) {
      setAccessDenied(true);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <div className="appointments-container">
          <div className="appointments-wrapper">
            <div className="loading-spinner">Checking authentication...</div>
          </div>
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="appointments-container">
          <div className="appointments-wrapper">
            <div className="loading-spinner">Loading appointments...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="appointments-container">
        <div className="appointments-wrapper">
          <h1 className="appointments-title">My Appointments</h1>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {error}
              <button onClick={fetchAppointments} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {!loading && appointments.length === 0 && !error && (
            <p className="appointments-empty">No appointments found.</p>
          )}

          <div className="appointments-cards">
            {appointments.map((app) => (
              <div className="appointment-card" key={app.id}>
                <div className="card-header">
                  <h2 className="client-name">{app.freelancer_name}</h2>
                  <StatusBadge status={app.status || "upcoming"} />
                </div>

                <p className="client-email">{app.freelancer_email}</p>

                <div className="appointment-details">
                  <div>
                    <strong>Date:</strong>{" "}
                    {new Date(app.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div>
                    <strong>Time:</strong> {app.start_time} - {app.end_time}
                  </div>
                </div>

                <div className="card-actions">
                  {app.status !== "cancelled" && (
                    <button
                      onClick={() => updateStatus(app.id, "cancelled")}
                      className="btn-cancel"
                      aria-label="Cancel appointment"
                    >
                      <X className="btn-icon" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatusBadge({
  status,
}: {
  status: "completed" | "cancelled" | "upcoming";
}) {
  const iconMap = {
    completed: <Check className="status-icon" />,
    cancelled: <X className="status-icon" />,
    upcoming: <AlertCircle className="status-icon" />,
  };

  return (
    <span className={`badge ${status}`}>
      {iconMap[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
