import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import Modal from '../components/Modal';
import Sidebar from '../components/AdminSideBar';
import '../styles/adminDashboard.css';
import { decodeToken } from '@/lib/decodeToken';
import AccessDenied from '@/components/AccesDenied';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | string;
  specialty?: string;
  price_per_hour?: string | number;
}

interface FormState {
  id: number | null;
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer' | string;
  specialty: string;
  price_per_hour: string;
}

const ROWS_PER_PAGE = 5;

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState>({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'client',
    specialty: '',
    price_per_hour: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Pagination states for each table
  const [clientPage, setClientPage] = useState(1);
  const [freelancerPage, setFreelancerPage] = useState(1);

  // Debounce search input (300ms)
  const debouncedChangeHandler = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchTerm(value.toLowerCase());
        setClientPage(1);
        setFreelancerPage(1);
      }, 300),
    []
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedChangeHandler(e.target.value);
  };

  // Filtered users by search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(debouncedSearchTerm) ||
    user.email.toLowerCase().includes(debouncedSearchTerm) ||
    user.role.toLowerCase().includes(debouncedSearchTerm) ||
    (user.specialty && user.specialty.toLowerCase().includes(debouncedSearchTerm))
  );

  // Separate filtered users by role
  const filteredClients = filteredUsers.filter(u => u.role === 'client');
  const filteredFreelancers = filteredUsers.filter(u => u.role === 'freelancer');

  // Pagination slices
  const clientsToShow = filteredClients.slice((clientPage - 1) * ROWS_PER_PAGE, clientPage * ROWS_PER_PAGE);
  const freelancersToShow = filteredFreelancers.slice((freelancerPage - 1) * ROWS_PER_PAGE, freelancerPage * ROWS_PER_PAGE);

  // Pagination handlers
  const maxClientPage = Math.ceil(filteredClients.length / ROWS_PER_PAGE) || 1;
  const maxFreelancerPage = Math.ceil(filteredFreelancers.length / ROWS_PER_PAGE) || 1;

  const prevClientPage = () => setClientPage(p => Math.max(p - 1, 1));
  const nextClientPage = () => setClientPage(p => Math.min(p + 1, maxClientPage));
  const prevFreelancerPage = () => setFreelancerPage(p => Math.max(p - 1, 1));
  const nextFreelancerPage = () => setFreelancerPage(p => Math.min(p + 1, maxFreelancerPage));

  useEffect(() => {
    if (!token) {
      setAccessDenied(true);
      setIsCheckingAuth(false);
    } else {
      try {
        const decoded = decodeToken(token);
        if (!decoded || decoded.role !== 'admin') {
          setAccessDenied(true);
        } else {
          fetchUsers();
        }
      } catch {
        setAccessDenied(true);
      } finally {
        setIsCheckingAuth(false);
      }
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || (!isEditing && !form.password)) {
      setMessage('All required fields must be filled');
      return;
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          ...(isEditing ? {} : { password: form.password }),
          role: form.role,
          specialty: form.specialty || '',
          price_per_hour: form.price_per_hour || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');
      console.log(`${isEditing ? 'Updated' : 'Created'} successfully`);
      setForm({ id: null, name: '', email: '', password: '', role: 'client', specialty: '', price_per_hour: '' });
      setIsEditing(false);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const openCreateModal = () => {
    setForm({
      id: null,
      name: '',
      email: '',
      password: '',
      role: 'client',
      specialty: '',
      price_per_hour: '',
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      specialty: user.specialty || '',
      price_per_hour: user.price_per_hour ? user.price_per_hour.toString() : '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setMessage('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      setMessage(error.message);
    }
  }};

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (isCheckingAuth) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <div className="admin-dashboard-container">
      <Sidebar />
      <div className="admin-container">
        <h1 className="title">Users</h1>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`} role="alert">
            {message}
          </div>
        )}

        <button onClick={openCreateModal} className="btn btn-submit" style={{ marginBottom: '1rem' }}>
          + Create New User
        </button>

        <input
          type="search"
          placeholder="Search by name, email, role, or specialty"
          value={searchTerm}
          onChange={handleSearchChange}
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

        {/* Clients Table */}
        <section className="card table-card">
          <h2>Clients</h2>
          {loading ? (
            <div className="loading">Loading clients...</div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsToShow.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="no-data">
                          No clients found.
                        </td>
                      </tr>
                    ) : (
                      clientsToShow.map(user => (
                        <tr key={user.id}>
                          <td className="font-bold">{user.name}</td>
                          <td>{user.email}</td>
                          <td className="capitalize">{user.role}</td>
                          <td className="actions">
                            <button className="btn btn-edit" onClick={() => handleEdit(user)}>
                              Edit
                            </button>
                            <button className="btn btn-delete" onClick={() => handleDelete(user.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {filteredClients.length > ROWS_PER_PAGE && (
                <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                  <button
                    className="btn btn-cancel"
                    onClick={prevClientPage}
                    disabled={clientPage === 1}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-submit"
                    onClick={nextClientPage}
                    disabled={clientPage === maxClientPage}
                  >
                    Next
                  </button>
                  <span style={{ marginLeft: '1rem', fontWeight: '600' }}>
                    Page {clientPage} of {maxClientPage}
                  </span>
                </div>
              )}
            </>
          )}
        </section>

        {/* Freelancers Table */}
        <section className="card table-card">
          <h2>Freelancers</h2>
          {loading ? (
            <div className="loading">Loading freelancers...</div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Specialty</th>
                      <th>Rate ($/hr)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freelancersToShow.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="no-data">
                          No freelancers found.
                        </td>
                      </tr>
                    ) : (
                      freelancersToShow.map(user => (
                        <tr key={user.id}>
                          <td className="font-bold">{user.name}</td>
                          <td>{user.email}</td>
                          <td className="capitalize">{user.role}</td>
                          <td>{user.specialty || '-'}</td>
                          <td>{user.price_per_hour || '-'}</td>
                          <td className="actions">
                            <button className="btn btn-edit" onClick={() => handleEdit(user)}>
                              Edit
                            </button>
                            <button className="btn btn-delete" onClick={() => handleDelete(user.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {filteredFreelancers.length > ROWS_PER_PAGE && (
                <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                  <button
                    className="btn btn-cancel"
                    onClick={prevFreelancerPage}
                    disabled={freelancerPage === 1}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-submit"
                    onClick={nextFreelancerPage}
                    disabled={freelancerPage === maxFreelancerPage}
                  >
                    Next
                  </button>
                  <span style={{ marginLeft: '1rem', fontWeight: '600' }}>
                    Page {freelancerPage} of {maxFreelancerPage}
                  </span>
                </div>
              )}
            </>
          )}
        </section>

        {/* Modal for create/edit user */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>{isEditing ? 'Edit User' : 'Create User'}</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Name <span className="required">*</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full Name"
                autoComplete="off"
              />
            </label>

            <label>
              Email <span className="required">*</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email Address"
                autoComplete="off"
              />
            </label>

            <label>
              {isEditing ? 'New Password (optional)' : 'Password'}{' '}
              {!isEditing && <span className="required">*</span>}
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required={!isEditing}
                placeholder={isEditing ? 'Leave blank to keep current password' : 'Password'}
                autoComplete="new-password"
              />
            </label>

            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </label>

            {form.role === 'freelancer' && (
              <>
                <label>
                  Specialty
                  <input
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    placeholder="e.g., Web Development"
                  />
                </label>

                <label>
                  Price per Hour ($)
                  <input
                    name="price_per_hour"
                    type="number"
                    min="0"
                    value={form.price_per_hour}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                  />
                </label>
              </>
            )}

            <div className="form-actions">
              <button type="button" className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-submit">
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
