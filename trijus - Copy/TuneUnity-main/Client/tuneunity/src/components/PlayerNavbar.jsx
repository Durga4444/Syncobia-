import React, { useState } from 'react'
import {Share2,DoorClosed} from 'lucide-react';
import logogroic from '../assets/logo-groic.png'
import {Link} from 'react-router-dom'
export const PlayerNavbar = (props) => {
  const data=localStorage.getItem('userdata');
  const userData=JSON.parse(data);
  const [down,setDown]=useState(false);
  const handleShare=()=>{
     setDown(!down);
  }
  return (
    <>
    <div className='w-full h-20 bg-gradient-to-r from-primary to-secondary flex justify-between items-center px-8 rounded-b-2xl shadow-lg font-sans'>
        <div className='w-[110px] flex items-center'> 
            <img src={logogroic} alt="logo" className="h-12 w-auto rounded-xl shadow-md" />
        </div>
        <div className='flex flex-col justify-center items-center'>
            <p className='text-slate-200 text-xs'>Created by</p>
            <p className='text-white font-semibold text-lg'>{userData.name}</p>
        </div>
        <div className='flex space-x-4 p-2'>
          <button className='bg-white/20 hover:bg-white/30 rounded-xl p-3 shadow-md transition-all' onClick={handleShare}><Share2 className="text-white"/></button>
          <Link to='/'><button className='bg-red-600 hover:bg-red-700 rounded-xl p-3 shadow-md transition-all'><DoorClosed color='white'/></button></Link>
        </div>
    </div>
    {
      down&&(
        <div className='w-screen h-screen flex justify-center items-center backdrop-blur-2xl fixed top-0 left-0 z-20' onClick={handleShare}>
          <div className='w-[320px] p-8 bg-white font-bold text-juspayBlue flex flex-col justify-center items-center space-y-5 rounded-2xl shadow-2xl border-2 border-primary relative animate-fade-in'>
              <button className='absolute top-2 right-4 text-2xl text-red-600' onClick={handleShare}>×</button>
              <p>Copy the code</p>
              <input type="text" disabled value={props.id} className='pl-5 pr-5 pt-3 pb-3 text-center rounded-lg border border-secondary bg-accent text-lg' />
          </div>
        </div>
      )
    }
    </>
  )
}

export default PlayerNavbar