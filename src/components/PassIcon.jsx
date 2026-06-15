import React from 'react'

const PassIcon = ({ showPassword }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Main Eye Shape */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <circle cx="12" cy="12" r="3" />
      
      {/* Animated Slash Line */}
      <path 
        strokeLinecap="round" 
        d="M3.5 3.5L20.5 20.5" 
        className={`transition-all duration-300 ease-out origin-center ${
          showPassword ? 'opacity-0 scale-0 rotate-45' : 'opacity-100 scale-100 rotate-0'
        }`}
      />
    </svg>
  )
}

export default PassIcon