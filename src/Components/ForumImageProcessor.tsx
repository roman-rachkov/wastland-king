import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ResponsiveImage from './RichTextEditor/ResponsiveImage';

interface ForumImageProcessorProps {
  content: string;
  className?: string;
}

const ForumImageProcessor: React.FC<ForumImageProcessorProps> = ({
  content,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Find all img tags in the container
    const imgTags = container.querySelectorAll('img');
    
    // Replace each img tag with a ResponsiveImage component
    imgTags.forEach((img) => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
      const isSpoiler = img.hasAttribute('data-spoiler');
      
      if (src) {
        // Create a wrapper div for the ResponsiveImage
        const wrapper = document.createElement('div');
        wrapper.className = 'responsive-image-wrapper';
        
        // Replace the img tag with the wrapper
        img.parentNode?.replaceChild(wrapper, img);
        
        // Create the ResponsiveImage component
        const responsiveImage = React.createElement(ResponsiveImage, {
          src,
          alt,
          isSpoiler,
          className: 'forum-post-image'
        });
        
        // Render the React component into the wrapper
        const root = createRoot(wrapper);
        root.render(responsiveImage);
      }
    });
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={`forum-content forum-post ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ForumImageProcessor; 