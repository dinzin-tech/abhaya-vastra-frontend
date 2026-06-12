// import React, { useState } from 'react';
import React, { useState, useEffect, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProfilePage.css';
import API from '../../api'; // Axios instance
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [address, setAddress] = useState('123 Main St');
  const [city, setCity] = useState('Anytown');
  const [zip, setZip] = useState('12345');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Fetch profile from API only if token exists
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    API.get(`/user/profile?_=${new Date().getTime()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        const data = res.data.data;
        setName(data.name || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setZip(data.zip || '');
        setShippingAddress(data.shipping_address || '');
        setShippingCity(data.shipping_city || '');
        setShippingZip(data.shipping_zip || '');

        // Check if shipping matches billing
        if (
          data.shipping_address === data.address &&
          data.shipping_city === data.city &&
          data.shipping_zip === data.zip
        ) setSameAsBilling(true);
      })
      .catch(err => toast.error('Failed to fetch profile'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    // Simulate saving profile data
    console.log('Saving profile settings...');
    // toast.success('Settings saved successfully!');

    API.post(
      '/user/profile',
      {
        name,
        email,
        address,
        city,
        zip,
        shipping_address: sameAsBilling ? address : shippingAddress,
        shipping_city: sameAsBilling ? city : shippingCity,
        shipping_zip: sameAsBilling ? zip : shippingZip,
        same_as_billing: sameAsBilling,
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(res => toast.success(res.data.message))
      .catch(err =>
        toast.error(err.response?.data?.message || 'Failed to save profile')
      );

  };

  const handleCopyBilling = (e) => {
    setSameAsBilling(e.target.checked);
    if (e.target.checked) {
      setShippingAddress(address);
      setShippingCity(city);
      setShippingZip(zip);
    } else {
      setShippingAddress('');
      setShippingCity('');
      setShippingZip('');
    }
  };

  return (
    <>
      {/* Toast will appear fixed in browser top-right */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="settings-container">
        <div className="settings-header">
          <h1>My Profile Settings</h1>
        </div>

        <form onSubmit={handleSave}>
          {/* Personal Information */}
          <div className="settings-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="form-field">
                <label>City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="form-field">
                <label>ZIP Code</label>
                <input value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="settings-section">
            <h2 className="section-title">Shipping Information</h2>
            <div className="shipping-checkbox">
              <input type="checkbox" checked={sameAsBilling} onChange={handleCopyBilling} />
              <label>Same as Personal Information</label>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Address</label>
                <input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} disabled={sameAsBilling} />
              </div>
              <div className="form-field">
                <label>City</label>
                <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} disabled={sameAsBilling} />
              </div>
              <div className="form-field">
                <label>ZIP Code</label>
                <input value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} disabled={sameAsBilling} />
              </div>
            </div>
          </div>

          {/* Password Management */}
          <div className="settings-section">
            <h2 className="section-title">Password Management</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="form-field">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Confirm New Password</label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              </div>
            </div>
          </div>     

          <div className="save-button-container">
            <button type="submit" className="save-button">Save Changes</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfilePage;
