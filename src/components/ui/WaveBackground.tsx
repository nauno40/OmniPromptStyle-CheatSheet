import React from 'react';

export const WaveBackground: React.FC = () => {
    // Beautiful seamless wavy lines pattern (Zen garden / Sand / Topography style)
    // Encoded SVG for background-image
    const svgPattern = `data:image/svg+xml,%3Csvg width='120' height='45' viewBox='0 0 120 45' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 15 C 40 -5, 80 35, 120 15' fill='none' stroke='rgba(255,255,255,0.035)' stroke-width='2'/%3E%3Cpath d='M 0 30 C 40 10, 80 50, 120 30' fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='1.5'/%3E%3Cpath d='M 0 45 C 40 25, 80 65, 120 45' fill='none' stroke='rgba(255,255,255,0.025)' stroke-width='1'/%3E%3C/svg%3E`;

    return (
        <div style={{
            position: 'fixed',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            zIndex: -1,
            pointerEvents: 'none',
            overflow: 'hidden',
            backgroundImage: `url("${svgPattern}")`,
            backgroundSize: '120px 45px',
            backgroundRepeat: 'repeat',
            transform: 'rotate(-20deg) translateZ(0)', // Hardware acceleration
            willChange: 'transform',
        }} />
    );
};
