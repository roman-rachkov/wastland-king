import { useEffect } from 'react';

export const useSpoilerHandler = () => {
  useEffect(() => {
    const handleSpoilerClick = (event: Event) => {
      const target = event.target as HTMLImageElement;
      
      if (target.tagName === 'IMG' && target.hasAttribute('data-spoiler')) {
        event.preventDefault();
        event.stopPropagation();
        
        // Toggle revealed state
        if (target.classList.contains('revealed')) {
          target.classList.remove('revealed');
          target.style.filter = 'blur(15px) brightness(0.3)';
        } else {
          target.classList.add('revealed');
          target.style.filter = 'none';
        }
      }
    };
    
    // Add click listeners to all spoiler images
    const addSpoilerListeners = () => {
      const spoilerImages = document.querySelectorAll('img[data-spoiler]:not([data-spoiler-initialized])');
      spoilerImages.forEach(img => {
        img.setAttribute('data-spoiler-initialized', 'true');
        img.addEventListener('click', handleSpoilerClick);
        
        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.className = 'spoiler-indicator';
        indicator.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: bold;
          z-index: 5;
          pointer-events: none;
          white-space: nowrap;
          transition: opacity 0.3s ease;
        `;
        indicator.textContent = '👁️ Click to reveal';
        
        // Create wrapper if needed
        let wrapper = img.parentElement;
        if (!wrapper || !wrapper.classList.contains('spoiler-wrapper')) {
          wrapper = document.createElement('div');
          wrapper.className = 'spoiler-wrapper';
          wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            max-width: 100%;
          `;
          img.parentNode?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
        }
        
        wrapper.appendChild(indicator);
        
        // Show/hide indicator on hover
        wrapper.addEventListener('mouseenter', () => {
          if (!img.classList.contains('revealed')) {
            indicator.style.opacity = '0';
          }
        });
        
        wrapper.addEventListener('mouseleave', () => {
          if (!img.classList.contains('revealed')) {
            indicator.style.opacity = '1';
          }
        });
      });
    };
    
    // Initial setup
    addSpoilerListeners();
    
    // Watch for new spoiler images (for dynamic content)
    const observer = new MutationObserver(addSpoilerListeners);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      observer.disconnect();
      // Remove listeners
      const spoilerImages = document.querySelectorAll('img[data-spoiler-initialized]');
      spoilerImages.forEach(img => {
        img.removeEventListener('click', handleSpoilerClick);
        img.removeAttribute('data-spoiler-initialized');
      });
    };
  }, []);
}; 