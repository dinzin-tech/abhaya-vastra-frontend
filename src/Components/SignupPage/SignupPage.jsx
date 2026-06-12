import React, { useState, useContext } from 'react';
import './SignupPage.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api';
import { AuthContext } from '../../context/AuthContext';

const SignupPage = () => {
  const [signupForm, setSignupForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm({ ...signupForm, [name]: value });
    if (message) setMessage('');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (signupForm.password !== signupForm.confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }

    // Validate password strength
    if (signupForm.password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await API.post('/register', {
        name: signupForm.name,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
        password_confirmation: signupForm.confirmPassword,
        address: signupForm.address,
        state: signupForm.state,
        city: signupForm.city,
        zip: signupForm.zip,
        useAsShipping: signupForm.useAsShipping || false,
      });

      // Use the login function from AuthContext to properly set user state
      const loginSuccess = await login({
        access_token: response.data.access_token,
        user: response.data.user
      });
      
      if (loginSuccess) {
        toast.success('Login successful');
        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        throw new Error('Failed to process registration');
      }
      
    } catch (error) {
      let errorMessage = 'An error occurred during registration.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data.errors) {
          // Handle Laravel validation errors
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors)[0][0]; // Get the first error message
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please try again later.';
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="auth-container">
        <div className="form-card">
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <h2>Create Your Account</h2>
            <div className="input-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                name="name"
                value={signupForm.name}
                onChange={handleSignupChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="signup-email">Email</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                type="tel"
                id="signup-phone"
                name="phone"
                value={signupForm.phone}
                onChange={handleSignupChange}
                placeholder="000-000-0000"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                name="password"
                value={signupForm.password}
                onChange={handleSignupChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="signup-confirm-password"
                name="confirmPassword"
                value={signupForm.confirmPassword}
                onChange={handleSignupChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className='input-group'>
              <label htmlFor="signup-address">Address</label>
              <input 
                type="text" 
                id="signup-address" 
                name="address"
                value={signupForm.address} 
                onChange={handleSignupChange} 
                placeholder='e.g. 124 st, 2nd Main, Gandhi Nagar'
              />
            </div>
            <div className='input-group'>
              <label htmlFor="signup-state">State</label>
              <input 
                type="text" 
                id="signup-state" 
                name="state"
                value={signupForm.state}
                onChange={handleSignupChange}
                placeholder='e.g. Chennai'
              />
            </div>
            <div className='input-group'>
              <label htmlFor="signup-city">City</label>
              <input 
                type="text" 
                id="signup-city" 
                name="city"
                value={signupForm.city}
                onChange={handleSignupChange}
                placeholder='e.g. Chennai'
              />
            </div>
            <div className='input-group'>
              <label htmlFor="signup-pin">ZIP Code</label>
              <input 
                type="text" 
                id="signup-zip" 
                name="zip"
                value={signupForm.zip}
                onChange={handleSignupChange} 
                placeholder='e.g. 600001'
              />
            </div>
            <div className="input-group checkbox-group">
              <input
                type="checkbox"
                id="signup-default-shipping"
                name="useAsShipping"
                checked={signupForm.useAsShipping || false}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, useAsShipping: e.target.checked })
                }
              />
              <label htmlFor="signup-default-shipping">
                Use this address as my default shipping address
              </label>
            </div>

            {message.text && (
              <p className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
                {message.text}
              </p>
            )}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <Link to="/login" className="toggle-text">
              Already have an account? Login
            </Link>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
