import React from 'react';

// Coverly logo — delivery van SVG matching the provided image
export default function CoverlyLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 56 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Van body */}
      <rect x="2" y="10" width="36" height="22" rx="5" fill="#5B6FD4" />
      {/* Cab */}
      <rect x="30" y="14" width="18" height="18" rx="4" fill="#4A5FC4" />
      {/* Window cab */}
      <rect x="33" y="16" width="10" height="8" rx="2" fill="#A8C4E8" opacity="0.8" />
      {/* Package on top */}
      <rect x="4" y="4" width="12" height="10" rx="2" fill="#E8A020" />
      <line x1="10" y1="4" x2="10" y2="14" stroke="#C47A10" strokeWidth="1.5" />
      <line x1="4" y1="9" x2="16" y2="9" stroke="#C47A10" strokeWidth="1.5" />
      {/* C letter on van */}
      <text x="14" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="10" fill="white" opacity="0.9">C</text>
      {/* Wheels */}
      <circle cx="12" cy="32" r="5" fill="#2A2A3A" />
      <circle cx="12" cy="32" r="2.5" fill="#6B7280" />
      <circle cx="40" cy="32" r="5" fill="#2A2A3A" />
      <circle cx="40" cy="32" r="2.5" fill="#6B7280" />
      {/* Speed lines */}
      <line x1="0" y1="20" x2="4" y2="20" stroke="#8697C4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="0" y1="24" x2="3" y2="24" stroke="#8697C4" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
