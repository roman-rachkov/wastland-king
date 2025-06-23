import React, { useState } from 'react';

interface SpoilerImageProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const SpoilerImage: React.FC<SpoilerImageProps> = ({ 
  children, 
  title = 'Spoiler', 
  className = '' 
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRevealed(!isRevealed);
  };

  return (
    <div className={`spoiler-container ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className={`spoiler-toggle btn btn-sm ${isRevealed ? 'btn-outline-secondary' : 'btn-warning'}`}
        title={isRevealed ? 'Hide content' : 'Show content'}
      >
        {isRevealed ? '🔒 Hide' : '🚫 Show'} {title}
      </button>
      
      {isRevealed && (
        <div className="spoiler-content mt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default SpoilerImage; 