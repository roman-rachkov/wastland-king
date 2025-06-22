import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Player } from '../../types/Player';

interface ActionsMenuProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}

const ActionsMenu = ({ player, onEdit, onDelete }: ActionsMenuProps) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
    setShow(!show);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ActionsMenu: handleEdit called for player:', player.name);
    onEdit(player);
    setShow(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(player);
    setShow(false);
  };

  // Закрывать меню при клике вне его
  useEffect(() => {
    if (!show) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  const menuContent = show && (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 9999,
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '0.375rem',
        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
        minWidth: '120px',
      }}
    >
      <button
        onClick={handleEdit}
        style={{
          display: 'block',
          width: '100%',
          padding: '0.5rem 1rem',
          border: 'none',
          backgroundColor: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <i className="bi bi-pencil me-2"></i>
        Edit
      </button>
      <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
      <button
        onClick={handleDelete}
        style={{
          display: 'block',
          width: '100%',
          padding: '0.5rem 1rem',
          border: 'none',
          backgroundColor: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          color: '#dc3545',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <i className="bi bi-trash me-2"></i>
        Delete
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="btn btn-outline-secondary btn-sm px-2"
        style={{ zIndex: 20, position: 'relative' }}
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      {show && createPortal(menuContent, document.body)}
    </>
  );
};

export default ActionsMenu; 