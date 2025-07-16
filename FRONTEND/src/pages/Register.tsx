import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../styles/register.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { motion, AnimatePresence } from 'framer-motion';  
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBCheckbox,
} from 'mdb-react-ui-kit';

interface FormState {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer';
  specialty: string;
  price_per_hour: string; // keep as string because input value is string, can convert later if needed
}

const Register: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    role: 'client',
    specialty: '',
    price_per_hour: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body: any = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    if (form.role === 'freelancer') {
      body.specialty = form.specialty;
      body.price_per_hour = form.price_per_hour;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('You registered successfully!');
      } else {
        setMessage(data.message || data.error || 'Registration failed');
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
      <MDBCard className="m-5" style={{ maxWidth: '600px', zIndex: 1 }}>
        <MDBCardBody className="px-5">
          <h2 className="text-uppercase text-center mb-5">Create an account</h2>

          <form onSubmit={handleSubmit}>
            <MDBInput
              wrapperClass="mb-4"
              label="Your Name"
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
              label="Your Email"
              size="lg"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            {/* Password with show/hide toggle */}
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
                title={showPassword ? 'Hide password' : 'Show password'}
              >
              </span>
            </div>

            <div className="mb-4">
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>

            <AnimatePresence initial={false}>
              {form.role === 'freelancer' && (
                <motion.div
                  key="freelancer-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Specialty"
                    size="lg"
                    id="specialty"
                    name="specialty"
                    type="text"
                    value={form.specialty}
                    onChange={handleChange}
                    required
                  />

                  <MDBInput
                    wrapperClass="mb-4"
                    label="Price per hour ($)"
                    size="lg"
                    id="price_per_hour"
                    name="price_per_hour"
                    type="number"
                    step="0.01"
                    value={form.price_per_hour}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="d-flex justify-content-center mb-4">
              <MDBCheckbox
                name="terms"
                id="terms"
                label="I agree to the Terms of Service"
                required
              />
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
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default Register;
