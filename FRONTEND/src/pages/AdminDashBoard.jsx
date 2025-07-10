import React, { useState, useEffect } from 'react';

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

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setUsers(data);
      } catch {
        console.error("Response was not JSON:", text);
        throw new Error("Server returned invalid JSON.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.role) {
      return alert('Please fill in all required fields.');
    }

    const userToCreate = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      specialty: form.role === 'freelancer' ? form.specialty : undefined,
      price_per_hour: form.role === 'freelancer' ? form.price_per_hour : undefined,
    };

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userToCreate),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      alert('User created successfully!');
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'client',
      specialty: user.specialty || '',
      price_per_hour: user.price_per_hour || '',
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const userToUpdate = {
      name: form.name,
      email: form.email,
      ...(form.password && { password: form.password }),
      role: form.role,
      specialty: form.role === 'freelancer' ? form.specialty : undefined,
      price_per_hour: form.role === 'freelancer' ? form.price_per_hour : undefined,
    };

    try {
      const res = await fetch(`/api/users/update/${form.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userToUpdate),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user');
      }

      alert('User updated successfully!');
      resetForm();
      fetchUsers();
      setIsEditing(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/users/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      alert(error.message);
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
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h2>Admin Dashboard</h2>

      <form
        onSubmit={isEditing ? handleUpdateUser : handleAddUser}
        style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
      >
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder={isEditing ? 'New Password (optional)' : 'Password'} value={form.password} onChange={handleChange} required={!isEditing} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        {form.role === 'freelancer' && (
          <>
            <input name="specialty" placeholder="Specialty" value={form.specialty} onChange={handleChange} required />
            <input name="price_per_hour" type="number" placeholder="Price per hour" value={form.price_per_hour} onChange={handleChange} required />
          </>
        )}

        <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
        {isEditing && <button type="button" onClick={() => { resetForm(); setIsEditing(false); }}>Cancel</button>}
      </form>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Specialty</th>
              <th>Price / Hour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.specialty || '-'}</td>
                  <td>{user.price_per_hour || '-'}</td>
                  <td>
                    <button onClick={() => handleEditUser(user)} style={{ marginRight: '0.5rem' }}>Edit</button>
                    <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
