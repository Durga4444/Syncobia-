/*import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Navigate } from 'react-router-dom';
import logogroic from '../assets/logo-groic.png';

export const Login = () => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userdata');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        setRedirect(true);
      } catch (error) {
        console.error('Invalid JSON in localStorage:', error);
        localStorage.removeItem('userdata');
      }
    }
  }, []);


  if (redirect) {
    return <Navigate to="/home" />;
  }


  return (
    <div
  className="d-flex justify-content-center align-items-center vh-100 vw-100"
  style={{ background: "url('')  center / cover no-repeat" }}
>
      <div
        className="d-flex flex-column justify-content-center align-items-center p-4 rounded shadow"
        style={{
          width: '400px',
          backgroundColor:'#b3005f',
          backdropFilter: 'blur(20px)',
          gap: '1rem',
        }}
      >
<div className="d-flex justify-content-start w-100 text-white fw-semibold" style={{ fontSize: '2rem' }}>

          <div>Hey There!</div>
          <div>
          <img src={logogroic} alt="Logo" style={{ width: '100px', height: '80px' }} />

          </div>
        </div>
        <div
          className="d-flex justify-content-start w-100 fw-light"
          style={{ color: '#64748b', fontSize: '20px' }} 
        >

          Let's get started
        </div>
        <div className="p-3">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const { credential } = credentialResponse;
              console.log('Google Token:', credential);
              const decodedToken = JSON.parse(atob(credential.split('.')[1])); 
       
              const userData = {
                name: decodedToken.name,
                email: decodedToken.email,
                picture: decodedToken.picture,
              };

              
              console.log("Data:"+JSON.stringify(userData));
              
            localStorage.setItem('userdata', JSON.stringify(userData)); 

            console.log(localStorage.getItem('userdata'));
               if (credential) {
                 setRedirect(true);
               }
            }}
            onError={() => {
              console.error('Login Failed');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;*/


import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Navigate } from 'react-router-dom';
import 'animate.css';

const Login = () => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userdata');
    if (token) {
      try {
        JSON.parse(token);
        setRedirect(true);
      } catch (error) {
        console.error('Invalid JSON in localStorage:', error);
        localStorage.removeItem('userdata');
      }
    }
  }, []);

  if (redirect) return <Navigate to="/home" />;

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]"
    >
      <div
        className="flex flex-col items-center p-10 rounded-3xl shadow-2xl animate__animated animate__fadeInDown"
        style={{
          width: '420px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          borderRadius: '20px',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Logo and Title */}
        <div className="flex items-center justify-between w-full mb-6 animate__animated animate__bounceInLeft">
          <h1 className="text-white text-3xl font-extrabold">Hey There!</h1>
        
        </div>

        {/* Subtitle */}
        <p className="text-gray-300 text-md text-left w-full mb-4 animate__animated animate__fadeIn animate__delay-1s">
          Let’s get started with <span className="text-[#00ffd1] font-medium">Syncobia</span>
        </p>

        {/* Google Login Button */}
        <div className="mt-4 mb-4 w-full flex justify-center animate__animated animate__zoomIn animate__delay-2s">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const { credential } = credentialResponse; 
              console.log(credential)
              const decodedToken = JSON.parse(atob(credential.split('.')[1]));
              const hi = JSON.parse(atob(credential.split('.')[0]));
              console.log(hi)
              console.log(decodedToken)

              const userData = {
                name: decodedToken.name,
                email: decodedToken.email,
                picture: decodedToken.picture,
              };
              localStorage.setItem('userdata', JSON.stringify(userData));
              setRedirect(true);
            }}
            onError={() => {
              console.error('Login Failed');
            }}
          />
        </div>

        {/* Footer Note */}
        <div className="text-sm text-gray-400 text-center mt-4 animate__animated animate__fadeInUp animate__delay-3s">
          Secure login powered by Google
        </div>

        <div className="w-full h-[1px] bg-white opacity-10 my-6 animate__animated animate__fadeIn animate__delay-3s" />

        <p className="text-xs text-gray-500 text-center animate__animated animate__fadeInUp animate__delay-4s">
          By signing in, you agree to our{' '}
          <span className="text-[#00ffd1] hover:underline cursor-pointer">Terms</span> and{' '}
          <span className="text-[#00ffd1] hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
