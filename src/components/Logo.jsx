import React from 'react'

const Logo = () => {
  return (
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" width="160" height="48">
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        <g transform="translate(10, 10)">
          <path d="M 65,15 L 115,30 C 115,80 90,115 65,130 C 40,115 15,80 15,30 Z"
            fill="none" stroke="url(#shieldGrad)" strokeWidth="12" strokeLinejoin="round" />

          <path d="M 65,40 L 90,48 C 90,70 80,85 65,95 L 65,40"
            fill="none" stroke="url(#accentGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

          <circle cx="65" cy="60" r="10" fill="#1e3a8a" />
          <polygon points="60,68 70,68 74,88 56,88" fill="#1e3a8a" />
        </g>

        <text x="150" y="85" fontFamily="system-ui, -apple-system, sans-serif" fontSize="52" fontWeight="800" fill="#1e3a8a">Safe</text>
        <text x="260" y="85" fontFamily="system-ui, -apple-system, sans-serif" fontSize="52" fontWeight="800" fill="#10b981">-Pass</text>
        <text x="152" y="118" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="900" fill="#6b7280" letterSpacing="1">SECURE DIGITAL ACCESS</text>
      </svg>
    </div>
  )
}

export default Logo