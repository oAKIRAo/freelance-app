import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/register.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBIcon,
} from 'mdb-react-ui-kit';

interface ResetPasswordForm {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<ResetPasswordForm>({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/Reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, newPassword: form.newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successfully!');
        setForm({ email: '', newPassword: '', confirmPassword: '' });
        navigate('/login');
      } else {
        setMessage(data.message || 'Password reset failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error');
    }
  };

  return (
    <MDBContainer
      fluid
      className="d-flex align-items-center justify-content-center bg-image"
      style={{
        backgroundImage:
          'url(https://mdbcdn.b-cdn.net/img/Photos/new-templates/search-box/img4.webp)',
        minHeight: '100vh',
      }}
    >
      <div className="mask gradient-custom-3 w-100 h-100 position-absolute top-0 start-0"></div>
      <MDBCard className="m-5 w-50" style={{ maxWidth: '500px', zIndex: 1 }}>
        <MDBCardBody className="px-5">
          <h2 className="login-heading">Reset Password</h2>

          <form onSubmit={handleSubmit}>
            <MDBInput
              wrapperClass="mb-4"
              label="Email"
              size="lg"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            {/* New Password Field */}
            <div className="mb-4 position-relative">
              <MDBInput
                label="New Password"
                size="lg"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                <MDBIcon icon={showPassword ? 'eye-slash' : 'eye'} />
              </span>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-4 position-relative">
              <MDBInput
                label="Confirm Password"
                size="lg"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                <MDBIcon icon={showConfirmPassword ? 'eye-slash' : 'eye'} />
              </span>
            </div>

            <MDBBtn className="mb-4 w-100 gradient-custom-4" size="lg" type="submit">
              <MDBIcon fas icon="redo-alt" className="me-2" />
              Reset Password
            </MDBBtn>

            {message && (
              <p
                className={`text-center fw-bold ${
                  message.includes('successfully') ? 'text-success' : 'text-danger'
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default ResetPassword;
