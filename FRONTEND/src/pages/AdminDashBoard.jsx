import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admindashboard.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { MDBBtn, MDBContainer, MDBInput, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'client',
    specialty: '',
    price_per_hour: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [navigate, token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setMessage('Failed to fetch users: ' + error.message);
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || (!isEditing && !form.password) || !form.role) {
      return setMessage('Please fill in all required fields.');
    }

    const endpoint = isEditing 
      ? `${import.meta.env.VITE_API_URL}/api/users/update/${form.id}`
      : `${import.meta.env.VITE_API_URL}/api/users/create`;

    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          ...(!isEditing && { password: form.password }),
          role: form.role,
          ...(form.role === 'freelancer' && {
            specialty: form.specialty,
            price_per_hour: form.price_per_hour
          })
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      setMessage(`${isEditing ? 'Updated' : 'Created'} successfully!`);
      resetForm();
      fetchUsers();
      setIsEditing(false);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      specialty: user.specialty || '',
      price_per_hour: user.price_per_hour || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      setMessage('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      email: '',
      password: '',
      role: 'client',
      specialty: '',
      price_per_hour: '',
    });
  };

  return (
    <MDBContainer className="py-5">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <MDBInput
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <MDBInput
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <MDBInput
                  label={isEditing ? "New Password (optional)" : "Password"}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!isEditing}
                />
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>
            </div>

            {form.role === 'freelancer' && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <MDBInput
                    label="Specialty"
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    required={form.role === 'freelancer'}
                  />
                </div>
                <div className="col-md-6">
                  <MDBInput
                    label="Price per hour"
                    type="number"
                    name="price_per_hour"
                    value={form.price_per_hour}
                    onChange={handleChange}
                    required={form.role === 'freelancer'}
                  />
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end">
              <MDBBtn type="submit" color="primary" className="me-2">
                {isEditing ? 'Update User' : 'Add User'}
              </MDBBtn>
              {isEditing && (
                <MDBBtn type="button" color="secondary" onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}>
                  Cancel
                </MDBBtn>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <MDBTable responsive>
              <MDBTableHead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Specialty</th>
                  <th>Price/Hour</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No users found</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.specialty || '-'}</td>
                      <td>{user.price_per_hour || '-'}</td>
                      <td>
                        <MDBBtn
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </MDBBtn>
                        <MDBBtn
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </MDBBtn>
                      </td>
                    </tr>
                  ))
                )}
              </MDBTableBody>
            </MDBTable>
          )}
        </div>
      </div>
    </MDBContainer>
  );
};

export default AdminDashboard;