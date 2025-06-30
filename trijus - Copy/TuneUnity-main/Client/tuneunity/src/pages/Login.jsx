import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Navigate } from 'react-router-dom';
import logogroic from '../assets/logo-groic.png';

const Login = () => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userdata');
    if (token) {
      try {
        JSON.parse(token);
        setRedirect(true);
      } catch (error) {
        localStorage.removeItem('userdata');
      }
    }
  }, []);

  if (redirect) return <Navigate to="/home" />;

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen min-w-full bg-gradient-to-br from-primary via-secondary to-juspayBlue overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-primary opacity-30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-secondary opacity-30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-juspayPurple opacity-20 rounded-full blur-2xl animate-pulse" style={{transform: 'translate(-50%, -50%)'}} />
      </div>
      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl bg-white/10 border-2 border-transparent bg-clip-padding backdrop-blur-xl flex flex-col items-center animate-fade-in">
        {/* Gradient border accent */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary via-secondary to-juspayPurple opacity-80 blur-sm -z-10" />
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-6">
          <img src={logogroic} alt="Logo" className="h-16 w-16 rounded-xl shadow-lg mb-2" />
          <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">Syncobia</h1>
        </div>
        {/* Welcome Text */}
        <h2 className="text-xl text-white font-semibold mb-2 text-center">Welcome! Sign in to continue</h2>
        <p className="text-gray-200 text-center mb-6">Experience seamless music sync and sharing.</p>
        {/* Google Login Button */}
        <div className="w-full flex justify-center mb-4">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const { credential } = credentialResponse;
              const decodedToken = JSON.parse(atob(credential.split('.')[1]));
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
            theme="filled_blue"
            size="large"
            width="300"
          />
        </div>
        {/* Divider */}
        <div className="w-full h-[1px] bg-white opacity-10 my-6" />
        {/* Footer Note */}
        <div className="text-xs text-gray-300 text-center">
          Secure login powered by Google
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          By signing in, you agree to our{' '}
          <span className="text-primary hover:underline cursor-pointer">Terms</span> and{' '}
          <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
