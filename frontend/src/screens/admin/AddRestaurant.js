import React, { useEffect, useRef, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';

const CUISINE_OPTIONS = [
  'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'Japanese', 'French', 'Mediterranean', 'Other'
];

function AddRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');
  const [managerId, setManagerId] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [managersArray, setManagersArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const isDisabled = managersArray.length === 0;


  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch('https://restaurantapp-5mka.onrender.com/api/getManagers');
        const data = await response.json();

        setManagersArray(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    setManager(managersArray[0]?.name)
    setManagerId(managersArray[0]?._id)
  }, [managersArray])

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    console.log("imahe", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };


  const handleCuisineChange = (e) => {
    const value = e.target.value;
    setCuisines(prev =>
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        formData.append("cuisines[]", cuisine); // or just "cuisines" depending on backend handling
      });

      const response = await fetch("https://restaurantapp-5mka.onrender.com/api/addBranch", {
        method: "POST",
        body: formData // no headers needed; browser sets them for you
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'The restaurant has been added successfully!',
        timer: 2000,
        showConfirmButton: false,
      });

      setName('');
      setAddress('');
      setManager(managersArray[0]?.name);
      setManagerId(managersArray[0]?._id);
      setCuisines([]);
      setImage(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error during add:", error);
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
      <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Add Restaurant</h2>
        <form onSubmit={handleSubmit}>
          {isDisabled && (
            <p style={{ color: '#d32f2f', fontSize: 16, textAlign: 'center', marginBottom: 18 }}>
              ⚠️ No managers available. Please create a manager first.
            </p>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Branch Name:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={isDisabled} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Address:</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} disabled={isDisabled} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6 }}>Cuisine(s):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {CUISINE_OPTIONS.map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 400, background: cuisines.includes(option) ? '#e3f2fd' : '#f5f5f5', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={cuisines.includes(option)}
                    onChange={handleCuisineChange}
                    disabled={isDisabled}
                    style={{ accentColor: '#1976d2' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Manager</label>
            <select value={manager} onChange={e => { setManager(e.target.value.name); setManagerId(e.target.value._id) }} disabled={isDisabled} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} >
              {managersArray && managersArray.map(r => (
                <option key={r.name} value={r}>{r.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Image (optional):</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} disabled={isDisabled} style={{ display: 'block', marginTop: 6 }} />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={{ marginTop: 12, maxWidth: '100%', maxHeight: 180, borderRadius: 8, boxShadow: '0 1px 6px #ccc' }} />
            )}
          </div>
          <button type="submit" disabled={isDisabled} style={{ width: '100%', padding: '12px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 18, fontWeight: 600, cursor: isDisabled ? 'not-allowed' : 'pointer', marginTop: 10, boxShadow: '0 1px 4px #1976d233' }}>Add Restaurant</button>
        </form>
      </div>
    </>
  );
}

export default AddRestaurant; 