import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { Navigate, useNavigate } from 'react-router-dom';
import img from '../assets/img.jpg';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import load2 from '../assets/load2.gif';
import { nanoid } from 'nanoid';
import 'animate.css';

export const Home = () => {
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);
  const [downbar1, setDownbar1] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);

  const idref = useRef(null);
  const userData = JSON.parse(localStorage.getItem('userdata'));

  const notify = (message, icon = '😊') =>
    toast(message, {
      icon,
    });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleDownBar1 = () => setDownbar1(!downbar1);

  const handleJoin = async () => {
    const room = idref.current.value.trim();
    if (!room) {
      notify('Please enter a valid room code.', '⚠️');
      return;
    }
    try {
      const res = await fetch('http://localhost:199/api/session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: room, userId: userData._id }),
      });
      if (!res.ok) throw new Error('Failed to join session');
      setRoomId(room);
      navigate('/player', { state: { propValue: room } });
    } catch (err) {
      notify('Failed to join room. It may not exist.', '❌');
    }
  };

  const handleCreate = async () => {
    const newRoomId = nanoid(5);
    try {
      const res = await fetch('http://localhost:199/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: newRoomId, createdBy: userData._id }),
      });
      if (!res.ok) throw new Error('Failed to create session');
      setRoomId(newRoomId);
      navigate('/player', { state: { propValue: newRoomId } });
    } catch (err) {
      notify('Failed to create room.', '❌');
    }
  };

  if (redirect) {
    return <Navigate to="/player" state={{ id: roomId }} />;
  }

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center w-screen h-screen bg-black">
          <img src={load2} alt="Loading..." className="w-24 h-24 animate__animated animate__fadeIn animate__infinite" />
        </div>
      ) : (
        <>
          <Navbar />
          <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-4">
            <div className="flex justify-center items-center gap-5 w-full max-w-md mt-8 animate__animated animate__fadeInDown">
              <button
                onClick={handleCreate}
                className="w-1/2 py-3 bg-[#00ffd1] text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
              >
                ➕ New Room
              </button>
              <button
                onClick={handleDownBar1}
                className="w-1/2 py-3 border border-white text-white font-bold rounded-xl hover:bg-white hover:text-black transition duration-300"
              >
                🔑 Join with Code
              </button>
            </div>

            <div className="flex flex-col items-center justify-center mt-16 animate__animated animate__zoomIn">
              <img className="w-[280px] h-[280px] rounded-xl shadow-lg" src={img} alt="Background" />
              <p className="text-2xl font-bold text-white mt-8">Get a Link You Can Share</p>
              <p className="text-white text-center mt-2 text-sm opacity-80">
                Tap <span className="text-[#00ffd1] font-semibold">New Room</span> to generate a code that you can share
                with friends to sync and listen together.
              </p>
            </div>
          </div>

          {downbar1 && (
            <div className="fixed bottom-0 w-full h-72 bg-[#121212] rounded-t-3xl shadow-2xl p-6 animate__animated animate__fadeInUp">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-xl font-semibold">Join with Code</p>
                <button onClick={handleDownBar1}>
                  <X color="white" />
                </button>
              </div>

              <input
                type="text"
                ref={idref}
                placeholder="Enter Room Code"
                className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none"
              />

              <button
                onClick={handleJoin}
                className="w-full mt-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:scale-105 transition duration-300"
              >
                Join
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Home;
