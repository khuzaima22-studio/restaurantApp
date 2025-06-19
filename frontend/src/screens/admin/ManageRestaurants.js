import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import Modal from '../../Modal.js';

const CUISINE_OPTIONS = [
  'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'Japanese', 'French', 'Mediterranean', 'Other'
];

function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');
  const [managerId, setManagerId] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [managersArray, setManagersArray] = useState([]);
  const fileInputRef = useRef(null);
  const [editingBranch, setEditingBranch] = useState()
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://restaurantapp-csbk.onrender.com/api/getBranches');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }finally{
      setLoading(false)
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('https://restaurantapp-csbk.onrender.com/api/getManagers');
      const data = await response.json();
      setManagersArray(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchManagers();
  }, [])


  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this restaurant?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const response = await fetch("https://restaurantapp-csbk.onrender.com/api/deleteBranches", {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        fetchBranches();

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'The restaurant has been deleted successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleEdit = (branch) => {
    setIsModalOpen(true);
    setName(branch.name);
    setAddress(branch.address);
    setManager(branch.manager.name);
    setManagerId(branch.manager._id);
    setImagePreview(`https://restaurantapp-csbk.onrender.com/uploads/${branch.image}`)
    setImage(branch.image)
    setCuisines(branch.cuisines || [])
    setEditingBranch(branch)

    setManagersArray(prev => {
      const exists = prev.some(m => m._id === branch.manager._id);
      return exists ? prev : [...prev, branch.manager];
    });
  };

  const editSubmit = async (e) => {
    e.preventDefault();
    const isSameName = editingBranch.name === name;
    const isSameAddress = editingBranch.address === address;
    const isSameManager = editingBranch.manager === manager;
    const isSameCuisines = JSON.stringify(editingBranch.cuisines?.sort()) === JSON.stringify(cuisines.slice().sort());
    const isSameImage = typeof image === 'string' && image === editingBranch.image;

    // console.log(editingBranch.image)

    if (isSameName && isSameAddress && isSameManager && isSameCuisines && isSameImage) {
      Swal.fire({
        icon: 'info',
        title: 'No Changes Detected',
        text: 'Nothing was changed in the form.',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }


    if (cuisines.length === 0) {
      Swal.fire({
        icon: 'error',
        title: "Error",
        text: "Please select at least one cuisine.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("manager", managerId);
      formData.append("image", image); // image is a File object

      cuisines.forEach(cuisine => {
        formData.append("cuisines", cuisine); // or just "cuisines" depending on backend handling
      });

      const response = await fetch(`https://restaurantapp-csbk.onrender.com/api/editBranch/${editingBranch._id}`, {
        method: "PUT",
        body: formData // no headers needed; browser sets them for you
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'The restaurant has been edited successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
      setIsModalOpen(false);
      setName('');
      setAddress('');
      setManager('');
      setCuisines([]);
      setImage(null);
      setImagePreview('');
      fetchBranches();
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error during edit:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }

  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // store the File object for upload
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl); // set the preview URL
    } else {
      // user cleared the file input
      setImage(null);
      setImagePreview('');
    }
  };



  const handleCuisineChange = (e) => {
    const { value, checked } = e.target;
    setCuisines(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value)
    );
  };


  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <ClipLoader color="#ffffff" />
        </div>
      )}
      <div style={{ maxWidth: 1000, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 6px 24px rgba(25, 118, 210, 0.08)', padding: 40, minHeight: 500 }} >
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#1976d2', marginBottom: 32, borderBottom: '2px solid #1976d2' }} > Manage Restaurants </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 12, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }} >
            <thead>
              <tr style={{ background: '#f0f4f8', color: '#333', fontSize: 15 }}>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Cuisines</th>
                <th style={thStyle}>Manager</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <img src={r.image ? `https://restaurantapp-csbk.onrender.com/uploads/${r.image}` : '/No_Image_Available.jpg'} alt={r.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
                  </td>
                  <td style={tdStyle}>{r.name}</td>
                  <td style={tdStyle}>{r.address}</td>
                  <td style={tdStyle}>{r.cuisines.join(', ')}</td>
                  <td style={tdStyle}>{r.manager.name}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => handleEdit(r)} style={{ ...btnBase, background: '#1976d2', marginRight: 6 }} > Edit </button>
                    <button onClick={() => handleDelete(r._id)} style={{ ...btnBase, background: '#d32f2f' }} > Delete </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div style={{ maxWidth: 500, maxHeight: 500, margin: '0 auto', background: '#fff', borderRadius: 12, padding: '0 32px', overflowY: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Edit Restaurant</h2>
          <form onSubmit={editSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Branch Name:</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Address:</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 6 }}>Cuisine(s):</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {CUISINE_OPTIONS.map(option => (
                  <label key={option.toLowerCase()} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 400, background: cuisines.includes(option.toLowerCase()) ? '#e3f2fd' : '#f5f5f5', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      value={option.toLowerCase()}
                      checked={cuisines.includes(option.toLowerCase())}
                      onChange={handleCuisineChange}
                      style={{ accentColor: '#1976d2' }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Manager</label>
              <select
                value={managerId} // Use managerId for controlled value
                onChange={e => {
                  const selected = managersArray.find(m => m._id === e.target.value);
                  if (selected) {
                    setManager(selected.name);
                    setManagerId(selected._id);
                  }
                }}
                required
                style={{
                  width: '100%',
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
              >
                {managersArray.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>

            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Image (optional):</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', marginTop: 6 }} />
              <div>
                {!imagePreview.includes(null) ? (
                  <>
                    <img src={imagePreview} alt="Preview" style={{ marginTop: 12, maxWidth: '100%', maxHeight: 100, borderRadius: 8, boxShadow: '0 1px 6px #ccc' }} />
                  </>
                ) : (
                  <>
                    <img src='/No_Image_Available.jpg' alt="Preview" style={{ marginTop: 12, maxWidth: '100%', maxHeight: 100, borderRadius: 8, boxShadow: '0 1px 6px #ccc' }} />
                  </>
                )}
              </div>
            </div>
            <button type="submit" style={{ width: '100%', padding: '15px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 18, fontWeight: 600, cursor: 'pointer', marginTop: 10, boxShadow: '0 1px 4px #1976d233' }}>Update Restaurant</button>
          </form>
        </div>
      </Modal>
    </>
  );
}

const thStyle = {
  padding: 14,
  textAlign: 'center',
  borderBottom: '1px solid #ddd',
  fontWeight: 600,
  background: '#f8f9fa'
};

const tdStyle = {
  textAlign: "center",
  padding: 14,
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

export default ManageRestaurants; 