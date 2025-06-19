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

      const response = await fetch("https://restaurantapp-csbk.onrender.com/api/addBranch", {
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

      fetchManagers();
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
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#ffffff', borderRadius: 20, boxShadow: '0 6px 24px rgba(25, 118, 210, 0.08)', padding: 40, overflowY: 'auto' }} >
        <h2 style={{ textAlign: 'center', color: '#1976d2', fontSize: 26, fontWeight: 700, borderBottom: '2px solid #1976d2',marginBottom: 28 }} > Add Restaurant </h2>
        <form onSubmit={handleSubmit}> {isDisabled && (<p style={{ color: '#d32f2f', fontSize: 16, fontWeight: 500, textAlign: 'center', marginBottom: 24 }} >
          ⚠️ No managers available. Please create a manager first. </p>)}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Branch Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isDisabled}
              required
              style={{
                width: '100%',
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: '1px solid #ccdcec',
                fontSize: 16
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              disabled={isDisabled}
              required
              style={{
                width: '100%',
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: '1px solid #ccdcec',
                fontSize: 16
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, color: '#333', marginBottom: 8, display: 'block' }}>
              Cuisine(s)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {CUISINE_OPTIONS.map(option => (
                <label
                  key={option}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: cuisines.includes(option) ? '#e3f2fd' : '#f1f1f1',
                    border: cuisines.includes(option) ? '1px solid #1976d2' : '1px solid #ddd',
                    borderRadius: 20,
                    padding: '6px 12px',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
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

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Manager</label>
            <select
              value={manager}
              onChange={e => {
                const selected = managersArray.find(r => r.name === e.target.value);
                if (selected) {
                  setManager(selected.name);
                  setManagerId(selected._id);
                }
              }}
              disabled={isDisabled}
              required
              style={{
                width: '100%',
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: '1px solid #ccdcec',
                fontSize: 16
              }}
            >
              <option value="">-- Select a Manager --</option>
              {managersArray &&
                managersArray.map(r => (
                  <option key={r._id} value={r.name}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Image (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isDisabled}
              style={{ display: 'block', marginTop: 8 }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  marginTop: 12,
                  maxWidth: '100%',
                  maxHeight: 180,
                  borderRadius: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              width: '100%',
              padding: '14px 0',
              background: isDisabled ? '#ccc' : '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 600,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              marginTop: 16,
              boxShadow: '0 2px 6px rgba(25, 118, 210, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Add Restaurant
          </button>
        </form>
      </div>
    </>
  );
}

export default AddRestaurant; 