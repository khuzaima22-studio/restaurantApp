import React, { useEffect, useState } from 'react';

const ROLES = ['worker', 'branch manager', 'head branch manager'];

function ApproveUsers() {
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
      const res = await fetch('http://localhost:3001/api/getManagers/ma', {
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
      const res = await fetch(`http://localhost:3001/api/getManagers/${id}`, {
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
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(25, 118, 210, 0.08)', padding: 40, minHeight: 500 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Approve Workers</h2>
      {loading && <p>Loading...</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #eee' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Name</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Email</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Role</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              {editId === user._id ? (
                <>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>{user.name}</td>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>{user.email}</td>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>
                    <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>
                    <button onClick={() => handleEditSave(user._id)} style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', marginRight: 6 }}>Save</button>
                    <button onClick={() => setEditId(null)} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>{user.name}</td>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>{user.email}</td>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>{user.role}</td>
                  <td style={{ padding: 10, border: '1px solid #eee' }}>
                    <button onClick={() => handleEditClick(user)} style={{ marginRight: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApproveUsers; 