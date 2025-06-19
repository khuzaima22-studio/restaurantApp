import React, { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';

const ROLES = ['worker', 'branch manager', 'head branch manager'];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editRole, setEditRole] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://restaurantapp-csbk.onrender.com/api/getManagers/ma', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      alert('Failed to fetch users. Check console for details.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditId(user._id);
    setEditRole(user.role);
  };

  const handleEditSave = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`https://restaurantapp-csbk.onrender.com/api/getManagers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      await fetchUsers();
      setEditId(null);
      setEditRole(ROLES[0]);
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', background: '#ffffff', borderRadius: 20, boxShadow: '0 6px 24px rgba(25, 118, 210, 0.08)', padding: 40, minHeight: 500 }} >
      <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#1976d2', marginBottom: 32, borderBottom: '2px solid #1976d2' }} > Manage Users </h2>
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}>
          <ClipLoader color="#991b1b" />
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }} >
          <thead>
            <tr style={{ background: '#f0f4f8', color: '#333', fontSize: 15 }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                {editId === user._id ? (
                  <>
                    <td style={tdStyle}>{user.name}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>
                      <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #b0c4de', fontSize: 15 }} >
                        {ROLES.map(r => (
                          <option key={r} value={r}> {r} </option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEditSave(user._id)} style={{ ...btnBase, background: '#2e7d32', marginRight: 8 }} >
                        Save
                      </button>
                      <button onClick={() => setEditId(null)} style={{ ...btnBase, background: '#9e9e9e' }} >
                        Cancel
                      </button>
                    </td>
                  </>)
                  : (
                    <>
                      <td style={tdStyle}>{user.name}</td>
                      <td style={tdStyle}>{user.email}</td>
                      <td style={tdStyle}>{user.role}</td>
                      <td style={tdStyle}>
                        <button onClick={() => handleEditClick(user)} style={{ ...btnBase, background: '#1976d2' }} > Edit </button>
                      </td>
                    </>
                  )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: 14,
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  fontWeight: 600,
  background: '#f8f9fa'
};

const tdStyle = {
  padding: 14,
  textAlign: 'left',
  fontSize: 15,
  color: '#444',
  verticalAlign: 'middle'
};

const btnBase = {
  padding: '6px 14px',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 14,
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  transition: 'background 0.2s ease'
};

export default ManageUsers; 