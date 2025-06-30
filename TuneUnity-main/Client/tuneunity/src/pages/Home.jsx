/*import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { Navigate, useNavigate } from 'react-router-dom';
import img from '../assets/img.jpg';
import { X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import load2 from '../assets/load2.gif';
import { nanoid } from 'nanoid';

export const Home = () => {
  
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);
  const [downbar1, setDownbar1] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);

  const idref = useRef(null);
  const userData = JSON.parse(localStorage.getItem('userdata'));

  const notify = (message, icon = "😊") =>
    toast(message, {
      icon,
    });
 

    useEffect(() => {
  setTimeout(() => {
    setLoading(false);
  }, 1000); 
}, []);

  const handleDownBar1 = () => {
    setDownbar1(!downbar1);
  };

  const handleJoin = () => {
    const room = idref.current.value.trim();
    if (!room) {
      alert("Please enter a valid room code.");
      return;
    }
    setRoomId(room);
    navigate('/player', { state: { propValue: room } });
  };

  const handleCreate = () => {
    const newRoomId = nanoid(5); 
    setRoomId(newRoomId);
    navigate('/player', { state: { propValue: newRoomId } });
  };



  if (redirect) {
    return <Navigate to="/player" state={{ id: roomId }} />;
  }

  return (
    <>
      
      {loading ? (
        <div className="flex items-center justify-center w-screen h-screen bg-black">
          <img src={load2} alt="Loading..." />
        </div>
      ) : (
        <>
          <Navbar />
          <div className="flex flex-col w-screen h-screen bg-black">
            <div className="flex justify-center w-screen space-x-5 h-28">
              <div
                onClick={handleCreate}
                className="font-semibold bg-white text-black w-[45%] h-14 rounded-sm flex justify-center items-center"
              >
                New Room
              </div>
              <div
                className="font-semibold text-white border border-white w-[45%] h-14 rounded-sm flex justify-center items-center"
                onClick={handleDownBar1}
              >
                Join with code
              </div>
            </div>
          
            <div className="w-screen h-[500%] flex flex-col space-y-5 justify-center items-center">

              <img className="w-[300px] h-[300px] mb-10" src={img} alt="Tune Unity Background" />
              <p className="text-2xl font-bold text-white">Get a Link That You Can Share</p>
              <div className="flex flex-col items-center justify-center w-full">
                <p className="text-white font-extralight">Tap New Room to get a link that</p>
                <p className="text-white font-extralight">you can share with people you want to listen to songs with.</p>
              </div>
            </div>
          </div>
          {downbar1 && (
            <div className="w-screen h-[50%] bg-[#121212] fixed bottom-0 rounded-xl">
              <div className="flex items-center justify-between w-full h-16">
                <div className="ml-5">
                  <p className="text-2xl font-semibold text-white">Join with Code</p>
                </div>
                <div className="mr-5" onClick={handleDownBar1}>
                  <X color="white" />
                </div>
              </div>
              <div className="flex flex-col items-center w-screen mt-5 space-y-5">
                <input
                  type="text"
                  className="w-[70%] p-3 bg-gray-800 text-white rounded-md"
                  ref={idref}
                  placeholder="Enter Code"
                />
                <div
                  className="p-2 pt-3 pb-3 pl-5 pr-5 text-lg font-semibold text-white bg-green-500 rounded-md cursor-pointer"
                  onClick={handleJoin}
                >
                  Join
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Home;
*/
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

  const handleJoin = () => {
    const room = idref.current.value.trim();
    if (!room) {
      notify('Please enter a valid room code.', '⚠️');
      return;
    }
    setRoomId(room);
    navigate('/player', { state: { propValue: room } });
  };

  const handleCreate = () => {
    const newRoomId = nanoid(5);
    setRoomId(newRoomId);
    navigate('/player', { state: { propValue: newRoomId } });
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
