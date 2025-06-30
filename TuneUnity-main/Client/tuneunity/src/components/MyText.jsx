import React from 'react'
const MyText = ({ text, name, time, song }) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-xs lg:max-w-md">
        <div className={`rounded-2xl px-4 py-2 ${song ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-blue-600'} text-white`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">You</span>
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

export default MyText;