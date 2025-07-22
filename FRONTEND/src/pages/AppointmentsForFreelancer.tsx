import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import { Check, X, AlertCircle } from "lucide-react";
import "../styles/FreelancerAppointments.css";
import { decodeToken } from "@/lib/decodeToken";
import AccessDenied from "../components/AccesDenied"; // Your access denied component

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  date: string;
  start_time: string;
  end_time: string;
  status?: "completed" | "cancelled" | "upcoming";
}

export default function FreelancerAppointments() {
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
        `${import.meta.env.VITE_API_URL}/api/appointment/freelancer/appointments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = res.data;
      if (Array.isArray(data)) {
        setAppointments(data);
      } else if (Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments. Please try again.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    appointmentId: string,
    status: "completed" | "cancelled"
  ) => {
    try {
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status } : app
        )
      );

      const endpoint =
        status === "completed"
          ? `${import.meta.env.VITE_API_URL}/api/appointment/${appointmentId}/complete`
          : `${import.meta.env.VITE_API_URL}/api/appointment/${appointmentId}/cancel`;

      await axios.patch(endpoint, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      fetchAppointments();
      setError("Failed to update appointment status. Please try again.");
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
      // Check if user role is "freelancer"
      if (decoded?.role !== "freelancer") {
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
                  <h2 className="client-name">{app.client_name}</h2>
                  <StatusBadge status={app.status || "upcoming"} />
                </div>

                <p className="client-email">{app.client_email}</p>

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
                  {app.status !== "completed" && (
                    <button
                      onClick={() => updateStatus(app.id, "completed")}
                      className="btn-complete"
                      aria-label="Mark as completed"
                    >
                      <Check className="btn-icon" />
                      Complete
                    </button>
                  )}
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
