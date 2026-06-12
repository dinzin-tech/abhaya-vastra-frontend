// import React, { useState } from 'react';
// import './LoginPage.css';
// import { Link } from 'react-router-dom';

// const LoginPage = () => {
//   const [loginForm, setLoginForm] = useState({ email: '', password: '' });

//   const handleLoginChange = (e) => {
//     const { name, value } = e.target;
//     setLoginForm({ ...loginForm, [name]: value });
//   };

//   const handleLoginSubmit = (e) => {
//     e.preventDefault();
//     console.log('Login Form Submitted:', loginForm);
//   };

//   return (
//     <>
//       <div className="auth-container">
//         <div className="form-card">
//           <form onSubmit={handleLoginSubmit} className="auth-form">
//             <h2>Welcome Back!</h2>
//             <div className="input-group">
//               <label htmlFor="login-email">Email</label>
//               <input
//                 type="email"
//                 id="login-email"
//                 name="email"
//                 value={loginForm.email}
//                 onChange={handleLoginChange}
//                 placeholder="you@example.com"
//                 required
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="login-password">Password</label>
//               <input
//                 type="password"
//                 id="login-password"
//                 name="password"
//                 value={loginForm.password}
//                 onChange={handleLoginChange}
//                 placeholder="••••••••"
//                 required
//               />
//             </div>
//             <button type="submit" className="submit-btn">Login</button>
//             <Link to ="/register" className="toggle-text">
//               Don't have an account? Sign Up
//             </Link>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default LoginPage;


// new login page code
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../../api';
import { AuthContext } from '../../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    console.log('Login attempt with:', loginForm.email);

    try {
      const response = await API.post('/login', {
        email: loginForm.email,
        password: loginForm.password
      });

      console.log('Login response:', response.data);
      
      if (!response.data.access_token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      // Call the login function from AuthContext and wait for it to complete
      console.log('Calling login with data:', response.data);
      const loginSuccess = await login({
        access_token: response.data.access_token,
        user: response.data.user
      });
      
      if (loginSuccess) {
        console.log('Login successful, redirecting to home...');
        toast.success('Login successful');
        // Use window.location to ensure a full page reload and state reset
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Failed to process login');
      }
      
    } catch (error) {
      let errorMessage = 'An error occurred during login.';
      
      if (error.response) {
        // Handle validation errors from Laravel
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors)[0][0];
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again later.';
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
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
      <div className="auth-container">
        <div className="form-card">
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <h2>Welcome Back!</h2>
            <div className="input-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                required
              />
            </div>
            {/* Message display removed as we're using toast notifications */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="auth-links">
              <Link to="/register" className="toggle-text">
                Don't have an account? Sign Up
              </Link>
              <Link to="/forgot-password" style={{ 
                  marginLeft: "14px", 
                  textAlign: "center", 
                  fontSize: "18px", 
                  color: "#c88a0b", 
              }}>
                <small>Forgot Password?</small>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;