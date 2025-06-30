import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [logout, setLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userdata');
    navigate('/');
  };

  const hour = new Date().getHours();
  const welcomeTypes = ["Good Morning", "Good Afternoon", "Good Evening"];
  const welcomeText =
    hour < 12 ? welcomeTypes[0] : hour < 18 ? welcomeTypes[1] : welcomeTypes[2];

  return (
    <nav className="w-full h-20 bg-gradient-to-r from-primary to-secondary flex justify-between items-center px-8 rounded-b-2xl shadow-lg font-sans">
      <p className="text-2xl text-white font-bold tracking-wide drop-shadow-lg">{welcomeText}</p>
      <div className="relative">
        <button onClick={() => setLogout(!logout)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all shadow-md">
          <Settings className="text-white w-7 h-7" />
        </button>
        {logout && (
          <div
            className="absolute right-0 mt-3 bg-white text-juspayBlue rounded-xl shadow-xl px-6 py-3 cursor-pointer font-semibold z-10 border border-primary animate-fade-in"
            onClick={handleLogout}
          >
            Logout
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
