import React, { useState } from 'react';

interface SpoilerImageProps {
  src: string;
  alt?: string;
  className?: string;
}

const SpoilerImage: React.FC<SpoilerImageProps> = ({ src, alt, className = '' }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleClick = () => {
    setIsRevealed(true);
  };

  return (
    <div className={`spoiler-container ${isRevealed ? 'revealed' : ''} ${className}`}>
      <img
        src={src}
        alt={alt || 'Spoiler image'}
        className={`img-fluid ${isRevealed ? 'revealed' : ''}`}
        style={{
          filter: isRevealed ? 'none' : 'blur(10px) brightness(0.3)',
          transition: 'all 0.3s ease',
          cursor: isRevealed ? 'default' : 'pointer',
          borderRadius: '0.5rem'
        }}
        onClick={isRevealed ? undefined : handleClick}
      />
      {!isRevealed && (
        <div 
          className="spoiler-overlay"
          onClick={handleClick}
        >
          <div className="spoiler-text">
            <div>🚫 SPOILER</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Click to reveal</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpoilerImage; 