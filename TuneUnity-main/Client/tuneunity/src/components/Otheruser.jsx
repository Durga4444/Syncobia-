/*import React, { useState } from 'react';
import Chatbg from '../assets/chatbg.png';

const Otheruser = (props) => {
  const [glow,setglow]=useState(true);
  setInterval(()=>{
    setglow(!glow);
  },5000);
  return (
    <>
      {props.song ? (
        <div
          className="w-full h-auto flex text-white flex-col items-start font-bold"
        >
          <div className={glow?(`w-[60%] pl-3 pr-3 pt-2 pb-2 m-2 rounded-2xl bg-black shadow-[0_0_20px_5px_rgba(255,255,0,0.8)]`):(`w-[60%] pl-3 pr-3 pt-2 pb-2 m-2 rounded-2xl bg-black`)}
           style={{
            backgroundImage: `url(${Chatbg})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
          >
            <div className="w-full flex justify-start text-white font-bold">{props.name}</div>
            <p className="">{props.text}</p>
            <p className="w-full flex justify-end">{props.time}</p>
          </div>
        </div> 
      ) : (
        <div className="w-full h-auto flex text-white flex-col items-start">
          <div className="w-[60%] bg-[#252323] pl-3 pr-3 pt-2 pb-2 m-2 rounded-md">
            <div className="w-full flex justify-start text-white font-bold">{props.name}</div>
            <p className="">{props.text}</p>
            <p className="w-full flex justify-end">{props.time}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Otheruser;*/



// Otheruser.js - For other users' messages
import React from 'react';

const Otheruser = ({ text, name, time, song }) => {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md">
        <div className={`rounded-2xl px-4 py-2 ${song ? 'bg-gradient-to-r from-green-600 to-teal-600' : 'bg-gray-600'} text-white`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{name}</span>
            <span className="text-xs opacity-75">{time}</span>
          </div>
          <p className="text-sm break-words">{text}</p>
          {song && (
            <div className="flex items-center mt-1">
              <span className="text-xs opacity-75">🎵 Song Request</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Otheruser;

