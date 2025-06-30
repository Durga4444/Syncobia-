import React from 'react'
const AdminText = ({ text, name }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-full px-4 py-2 max-w-xs">
        <p className="text-xs text-yellow-300 text-center">{text}</p>
      </div>
    </div>
  );
};

export default AdminText;