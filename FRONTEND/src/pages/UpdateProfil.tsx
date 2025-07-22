import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import "../styles/updateProfile.css"; 
import AccessDenied from "@/components/AccesDenied";

interface UserProfile {
  name: string;
  email: string;
  role?: string;
  specialty?: string;
  price_per_hour?: string;
}

export default function UpdateProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "",
    specialty: "",
    price_per_hour: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem('Item');
  useEffect(() => {
     

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          role: res.data.role || "",
          specialty: res.data.specialty || "",
          price_per_hour: res.data.price_per_hour ? String(res.data.price_per_hour) : "",
        });
      } catch (err) {
        setError("Failed to fetch profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!profile.name.trim() || !profile.email.trim()) {
      setError("Name and Email are required");
      return;
    }

    if (password.trim() || confirmPassword.trim()) {
      if (password.trim() !== confirmPassword.trim()) {
        setError("Passwords do not match");
        return;
      }
      if (password.trim().length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const updateData: any = {
        name: profile.name,
        email: profile.email,
      };

      if (profile.role?.toLowerCase() === "freelancer") {
        updateData.specialty = profile.specialty;
        updateData.price_per_hour = profile.price_per_hour;
      }

      if (password.trim()) {
        updateData.password = password.trim();
      }

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/updateProfile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    }
  };

  const isFreelancer = profile.role?.toLowerCase() === "freelancer";

  if (loading) return <p className="update-profile-container">Loading profile...</p>;


  return (
    <>
      <Navbar />
      <div className="update-profile-container">
        <h1 className="update-profile-title">Update Profile</h1>
        <p className="update-profile-subtitle">
          Update your profile details to keep your account current.
        </p>

        <form onSubmit={handleSubmit} className="update-profile-form">
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">Profile updated successfully!</p>}

          <input
            type="text"
            placeholder="Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="update-profile-input"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="update-profile-input"
            required
          />

          {isFreelancer && (
            <>
              <input
                type="text"
                placeholder="Specialty (e.g., Web Development)"
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                className="update-profile-input"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price per Hour ($)"
                value={profile.price_per_hour}
                onChange={(e) =>
                  setProfile({ ...profile, price_per_hour: e.target.value })
                }
                className="update-profile-input"
              />
            </>
          )}

          <input
            type="password"
            placeholder="New Password (leave blank to keep current)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="update-profile-input"
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="update-profile-input"
            autoComplete="new-password"
          />

          <button type="submit" className="gradient-btn">
            Update Profile
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
