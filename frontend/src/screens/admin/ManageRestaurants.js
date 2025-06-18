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
    try {
      const response = await fetch('https://restaurantapp-5mka.onrender.com/api/getBranches');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('https://restaurantapp-5mka.onrender.com/api/getManagers');
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
        const response = await fetch("https://restaurantapp-5mka.onrender.com/api/deleteBranches", {
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
    setImagePreview(`https://restaurantapp-5mka.onrender.com/uploads/${branch.image}`)
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

      const response = await fetch(`https://restaurantapp-5mka.onrender.com/api/editBranch/${editingBranch._id}`, {
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
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(25, 118, 210, 0.08)', padding: 40, minHeight: 500 }}>
        <h2  style={{ textAlign: 'center', marginBottom: 24 }}>Manage Restaurants</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 10, border: '1px solid #eee' }}>Image</th>
              <th style={{ padding: 10, border: '1px solid #eee' }}>Name</th>
              <th style={{ padding: 10, border: '1px solid #eee' }}>Address</th>
              <th style={{ padding: 10, border: '1px solid #eee' }}>Cuisines</th>
              <th style={{ padding: 10, border: '1px solid #eee' }}>Manager</th>
              <th style={{ padding: 10, border: '1px solid #eee' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map(r => (
              <tr key={r._id}>
                <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center", width: "150px" }}>
                  <img
                    src={r.image ? `https://restaurantapp-5mka.onrender.com/uploads/${r.image}` : '/No_Image_Available.jpg'}
                    alt={r.name}
                    style={{ width: '100px', height: 'auto', borderRadius: '8px' }}
                  />
                </td>

                <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>{r.name}</td>
                <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>{r.address}</td>
                <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>{r.cuisines.join(', ')}</td>
                <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>{r.manager.name}</td>
                <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>
                  <button onClick={() => handleEdit(r)} style={{ marginRight: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(r._id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default ManageRestaurants; 