import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/register.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { MDBBtn, MDBContainer, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    role: string;
  };
  error?: string;
  message?: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data: LoginResponse = await res.json();
      if (res.ok) {
        setMessage('Logged in successfully!');
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user?.role === 'freelancer') {
          navigate('/freelancer/home');
        } else {
          navigate('/');
        }
      } else {
        setMessage(data.message||data.error || 'Login failed');
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
          <h2 className="login-heading ">Login</h2>

          <form onSubmit={handleSubmit}>
            <MDBInput
              wrapperClass="mb-4"
              label="Email"
              size="lg"
              id="email"
              name="email"
              type="email"
              autoComplete='new-email'
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
                autoComplete='new-password'
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
                  userSelect: 'none',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
              </span>
            </div>
            <div className="d-flex justify-content-between mb-4">
              <a href="/ResetPassword" className="auth-link">Forgot password?</a>
              <a href="/register" className="auth-link">New here? Register</a>
            </div>

            <MDBBtn className="mb-4 w-100 gradient-custom-4" size="lg" type="submit">
              Login
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

export default Login;
