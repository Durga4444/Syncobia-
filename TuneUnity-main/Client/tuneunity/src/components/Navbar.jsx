import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useNavigate,useLocation } from 'react-router-dom';

const Navbar = () => {
  const [logout, setLogout] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  console.log(loc.pathname)
  const handleLogout = () => {
    localStorage.removeItem('userdata');
    navigate('/');
  };

  const hour = new Date().getHours();
  const welcomeTypes = ["Good Morning", "Good Afternoon", "Good Evening"];
  const welcomeText =
    hour < 12 ? welcomeTypes[0] : hour < 18 ? welcomeTypes[1] : welcomeTypes[2];

  return (
    <div className="w-screen h-20 bg-black flex justify-between items-center px-6">
      <p className="text-2xl text-white font-bold">{welcomeText}</p>

      <div className="relative">

        <button onClick={() => setLogout(!logout)}>
          <Settings className="text-white w-6 h-6" />
        </button>

       
        {logout && (
          <div
            className="absolute right-0 mt-2 bg-white text-black rounded shadow px-4 py-2 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
