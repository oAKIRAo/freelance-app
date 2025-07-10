import React, { useState } from 'react';
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

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Registered successfully!');
        // redirect or other logic
      } else {
        setMessage(data.error || 'Registration failed');
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
          <h2 className="text-uppercase text-center mb-5">Register</h2>

          <form onSubmit={handleSubmit}>
            <MDBInput
              wrapperClass="mb-4"
              label="Name"
              size="lg"
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />

            <MDBInput
              wrapperClass="mb-4"
              label="Email"
              size="lg"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="mb-4 position-relative">
              <MDBInput
                label="Password"
                size="lg"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
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

            <MDBBtn className="mb-4 w-100 gradient-custom-4" size="lg" type="submit">
              Register
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

            <div className="text-center">
              <a href="/login" className="auth-link text-muted">Already have an account? Login</a>
            </div>
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default Register;
