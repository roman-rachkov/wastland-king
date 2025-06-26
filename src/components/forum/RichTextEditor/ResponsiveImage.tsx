import React, { useState } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt?: string;
  className?: string;
  isSpoiler?: boolean;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt = '',
  className = '',
  isSpoiler = false
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageClick = () => {
    if (!isSpoiler) {
      setIsZoomed(!isZoomed);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="image-error p-3 text-center text-muted border rounded">
        <small>Failed to load image</small>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`responsive-image-container ${isSpoiler ? 'spoiler-image' : ''} ${className}`}
        onClick={handleImageClick}
      >
        {isLoading && (
          <div className="image-loading p-3 text-center text-muted">
            <small>Loading...</small>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`responsive-image ${isLoading ? 'd-none' : ''} ${isSpoiler ? 'spoiler-blur' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            maxWidth: '100%',
            height: 'auto',
            cursor: isSpoiler ? 'default' : 'pointer',
            transition: 'transform 0.2s ease-in-out'
          }}
        />
        {!isSpoiler && !isLoading && (
          <div className="image-overlay">
            <small className="text-white bg-dark bg-opacity-75 px-2 py-1 rounded">
              Click to zoom
            </small>
          </div>
        )}
      </div>

      {/* Modal for zoomed image */}
      {isZoomed && (
        <div 
          className="image-modal-overlay"
          onClick={() => setIsZoomed(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div 
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative'
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            <button
              className="btn-close btn-close-white position-absolute top-0 end-0 m-2"
              onClick={() => setIsZoomed(false)}
              style={{ zIndex: 10000 }}
            >
              <span className="visually-hidden">Close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveImage; 