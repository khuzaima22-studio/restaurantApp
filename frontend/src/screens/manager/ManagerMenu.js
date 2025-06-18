import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../Modal';


function ManagerMenu() {
  const { branchId } = useAuth();
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editFields, setEditFields] = useState({ itemID: '', name: '', price: '', category: '', image: '', imagePreview: '' });

  // useEffect(() => {

  //   fetch(`${API_URL}?manager=${managerId}&branch=${branchId}`)
  //     .then(res => res.json())
  //     .then(data => setMenu(data))
  //     .catch(() => setMenu([]));
  // }, [managerId, ]);

  const fetchMenu = async () => {
    // console.log("branchId", branchId);
    if (!branchId) return;
    try {
      const response = await fetch(`https://restaurantapp-5mka.onrender.com/api/getMenu/${branchId}`);
      const data = await response.json();

      setMenu(data);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [branchId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
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

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (!name || !price || !category) throw new Error("All Fields are Required");
      setLoading(true)
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);

      if (image) formData.append('image', image);
      const res = await fetch(`https://restaurantapp-5mka.onrender.com/api/addItem/${menu._id}`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Item has been Added successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
      setName('');
      setPrice('');
      setCategory('');
      setImage(null);
      setImagePreview('');

      fetchMenu();
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
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this menu item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const res = await fetch(`https://restaurantapp-5mka.onrender.com/api/deleteItem/${menu._id}/item/${id}`, { method: 'DELETE' });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Item has been Deleted successfully!',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchMenu();

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
    });
  };

  const handleEditClick = (item) => {
    // setEditId(item._id);
    setEditFields({
      itemID: item._id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      imagePreview: `https://restaurantapp-5mka.onrender.com/uploads/${item.image}`
    });
    setIsModalOpen(true);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setEditFields(prev => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFields(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('itemId', editFields.itemID);
      formData.append('name', editFields.name);
      formData.append('price', editFields.price);
      formData.append('category', editFields.category);
      if (editFields.image) formData.append('image', editFields.image);

      const res = await fetch(`https://restaurantapp-5mka.onrender.com/api/editItem/${menu._id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Item has been Updated successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
      setIsModalOpen(false);
      fetchMenu();

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
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFields(f => (
      {
        ...f,
        [name]: value
      }))
  }

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
      <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f0ff 100%)', padding: '40px 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(25, 118, 210, 0.08)', padding: 40, minHeight: 700 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 32, color: '#1976d2', marginBottom: 8, letterSpacing: 1 }}>Menu Management</h2>
            <p style={{ color: '#555', fontSize: 18 }}>Add, edit, or remove menu items for your branch. Upload images for a more appealing menu!</p>
          </div>
          <form
            onSubmit={handleAdd}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              marginBottom: 36,
              background: '#f5faff',
              padding: 24,
              borderRadius: 12,
              boxShadow: '0 1px 8px #e3f0ff',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 2, paddingRight: 10, minWidth: 180 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Pizza"
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #b6c6e3',
                  background: '#fafdff',
                }}
              />
            </div>

            <div style={{ flex: 1, paddingRight: 10, minWidth: 120 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Price ($)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #b6c6e3',
                  background: '#fafdff',
                }}
              />
            </div>

            <div style={{ flex: 1, paddingRight: 10, minWidth: 120 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                placeholder="e.g. Kitchen"
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #b6c6e3',
                  background: '#fafdff',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: 8,
                    border: '1px solid #b6c6e3',
                    background: '#fafdff',
                    cursor: 'pointer',
                  }}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: 80,
                      maxHeight: 80,
                      borderRadius: 6,
                      boxShadow: '0 2px 6px #b6c6e3',
                    }}
                  />
                )}
              </div>
            </div>



            <button
              type="submit"
              style={{
                padding: '9px 22px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 18,
                cursor: 'pointer',
                height: 48,
                boxShadow: '0 1px 4px #1976d233',
                whiteSpace: 'nowrap',
              }}
            >
              Add
            </button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px #e3f0ff' }}>
              <thead>
                <tr style={{ background: '#e3f0ff' }}>
                  <th style={{ padding: 14, border: '1px solid #e3f0ff' }}>Image</th>
                  <th style={{ padding: 14, border: '1px solid #e3f0ff' }}>Name</th>
                  <th style={{ padding: 14, border: '1px solid #e3f0ff' }}>Price ($)</th>
                  <th style={{ padding: 14, border: '1px solid #e3f0ff' }}>Category</th>
                  <th style={{ padding: 14, border: '1px solid #e3f0ff' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menu.items?.map(item => (
                  <tr key={item._id}>
                    <>
                      <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center", width: "150px" }}>
                        <img
                          src={item.image ? `https://restaurantapp-5mka.onrender.com/uploads/${item.image}` : '/No_Image_Available.jpg'}
                          alt={item.name}
                          style={{ width: '100px', height: 'auto', borderRadius: '8px' }}
                        />
                      </td>
                      <td style={{ padding: 12, border: '1px solid #e3f0ff', textAlign: "center" }}>{item.name}</td>
                      <td style={{ padding: 12, border: '1px solid #e3f0ff', textAlign: "center" }}>{item.price}</td>
                      <td style={{ padding: 12, border: '1px solid #e3f0ff', textAlign: "center" }}>{item.category}</td>
                      <td style={{ padding: 12, border: '1px solid #e3f0ff', textAlign: "center" }}>
                        <button onClick={() => handleEditClick(item)} style={{ marginRight: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                        <button onClick={() => handleDelete(item._id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                      </td>
                    </>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div style={{ minWidth: 500, maxHeight: 500, margin: '0 auto', background: '#fff', borderRadius: 12, padding: '0 32px', overflowY: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Edit Item</h2>
          <form onSubmit={handleEditSave}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Name:</label>
              <input type="text" value={editFields.name} name='name' onChange={handleEditChange} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Price:</label>
              <input type="number" value={editFields.price} name='price' onChange={handleEditChange} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Category:</label>
              <input type="text" value={editFields.category} name='category' onChange={handleEditChange} required style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Image (optional):</label>
              <input type="file" accept="image/*" onChange={handleEditImageChange} style={{ display: 'block', marginTop: 6 }} />
              <div>
                {!editFields.imagePreview.includes(null) ? (
                  <>
                    <img src={editFields.imagePreview} alt="Preview" style={{ marginTop: 12, maxWidth: '100%', maxHeight: 100, borderRadius: 8, boxShadow: '0 1px 6px #ccc' }} />
                  </>
                ) : (
                  <>
                    <img src='/No_Image_Available.jpg' alt="Preview" style={{ marginTop: 12, maxWidth: '100%', maxHeight: 100, borderRadius: 8, boxShadow: '0 1px 6px #ccc' }} />
                  </>
                )}
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '15px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 18, fontWeight: 600, cursor: 'pointer', marginTop: 10, boxShadow: '0 1px 4px #1976d233' }}>Update Item</button>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default ManagerMenu; 