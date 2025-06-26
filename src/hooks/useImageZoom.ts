import { useEffect, useRef } from 'react';

export const useImageZoom = () => {
  const isModalOpenRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleImageClick = (event: Event) => {
      const target = event.target as HTMLImageElement;
      
      // Prevent if modal is already open, image is in modal, or has spoiler attribute
      if (isModalOpenRef.current || 
          target.tagName !== 'IMG' || 
          target.hasAttribute('data-spoiler') || 
          target.closest('.image-modal-overlay') ||
          target.hasAttribute('data-modal-image')) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      isModalOpenRef.current = true;
      
      // Create modal overlay
      const modal = document.createElement('div');
      modalRef.current = modal;
      modal.className = 'image-modal-overlay';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(5px);
      `;
      
      // Create modal content
      const content = document.createElement('div');
      content.className = 'image-modal-content';
      content.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        position: relative;
      `;
      content.onclick = (e) => e.stopPropagation();
      
      // Create image
      const img = document.createElement('img');
      img.src = target.src;
      img.alt = target.alt || '';
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 0.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      `;
      
      // Prevent the modal image from triggering zoom
      img.setAttribute('data-modal-image', 'true');
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'btn-close btn-close-white position-absolute';
      closeBtn.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 10000;
      `;
      closeBtn.innerHTML = '<span class="visually-hidden">Close</span>';
      
      // Close modal function
      const closeModal = () => {
        if (modal && document.body.contains(modal)) {
          try {
            document.body.removeChild(modal);
          } catch (error) {
            console.warn('Error removing modal:', error);
          }
          document.body.style.overflow = '';
          isModalOpenRef.current = false;
          modalRef.current = null;
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      
      closeBtn.onclick = closeModal;
      modal.onclick = closeModal;
      
      // Add keyboard support
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Add elements to DOM
      content.appendChild(img);
      content.appendChild(closeBtn);
      modal.appendChild(content);
      
      // Safely append to body
      try {
        document.body.appendChild(modal);
        // Focus close button for accessibility
        closeBtn.focus();
      } catch (error) {
        console.error('Error appending modal to body:', error);
        isModalOpenRef.current = false;
        modalRef.current = null;
      }
    };
    
    // Add click listeners to all images
    const addImageListeners = () => {
      const images = document.querySelectorAll('img:not([data-zoom-initialized]):not([data-modal-image])');
      images.forEach(img => {
        if (!img.hasAttribute('data-zoom-initialized')) {
          img.setAttribute('data-zoom-initialized', 'true');
          img.addEventListener('click', handleImageClick);
        }
      });
    };
    
    // Initial setup
    addImageListeners();
    
    // Watch for new images (for dynamic content)
    const observer = new MutationObserver((mutations) => {
      let shouldAddListeners = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'IMG' || element.querySelector('img')) {
                shouldAddListeners = true;
              }
            }
          });
        }
      });
      
      if (shouldAddListeners) {
        addImageListeners();
      }
    });
    
    observerRef.current = observer;
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      // Remove listeners
      const images = document.querySelectorAll('img[data-zoom-initialized]');
      images.forEach(img => {
        img.removeEventListener('click', handleImageClick);
        img.removeAttribute('data-zoom-initialized');
      });
      
      // Clean up any open modals
      if (modalRef.current && document.body.contains(modalRef.current)) {
        try {
          document.body.removeChild(modalRef.current);
        } catch (error) {
          console.warn('Error removing modal during cleanup:', error);
        }
      }
      
      // Reset state
      isModalOpenRef.current = false;
      modalRef.current = null;
      document.body.style.overflow = '';
    };
  }, []);
}; 