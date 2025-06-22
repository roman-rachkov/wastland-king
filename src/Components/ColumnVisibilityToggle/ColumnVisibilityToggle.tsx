import { useRef, useEffect, useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { Column } from '@tanstack/react-table';

interface ColumnVisibilityToggleProps {
  columns: Column<any, unknown>[];
  onToggleColumn: (columnId: string, visible: boolean) => void;
}

const ColumnVisibilityToggle = ({ columns, onToggleColumn }: ColumnVisibilityToggleProps) => {
  const [show, setShow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрывать меню только при клике вне меню
  useEffect(() => {
    if (!show) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show]);

  const handleToggle = (columnId: string, visible: boolean) => {
    onToggleColumn(columnId, visible);
    // Не закрываем меню при клике на чекбокс
  };

  return (
    <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)}>
      <Dropdown.Toggle variant="outline-secondary" size="sm">
        <i className="bi bi-gear"></i> Columns
      </Dropdown.Toggle>

      <Dropdown.Menu ref={menuRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Dropdown.Header>Toggle Columns</Dropdown.Header>
        {columns.map((column) => {
          // Skip the Actions column from the toggle list
          if (column.id === 'actions') return null;
          
          return (
            <Dropdown.Item key={column.id} as="div" className="px-3 py-2" onClick={e => e.stopPropagation()}>
              <Form.Check
                type="checkbox"
                id={`toggle-${column.id}`}
                label={column.columnDef.header as string}
                checked={column.getIsVisible()}
                onChange={(e) => handleToggle(column.id, e.target.checked)}
                className="d-flex align-items-center"
              />
            </Dropdown.Item>
          );
        })}
        <Dropdown.Divider />
        <Dropdown.Item 
          onClick={e => {e.stopPropagation(); columns.forEach(col => {if (col.id !== 'actions') {onToggleColumn(col.id, true);}});}}
        >
          Show All
        </Dropdown.Item>
        <Dropdown.Item 
          onClick={e => {
            e.stopPropagation(); 
            columns.forEach(col => {
              if (col.id === 'actions') return; // Не трогаем столбец действий
              
              // Показываем только нужные столбцы
              const essentialColumns = ['id', 'name', 'alliance', 'marchSize', 'rallySize', 'isAttack', 'isCapitan'];
              onToggleColumn(col.id, essentialColumns.includes(col.id));
            });
          }}
        >
          Show Essential Only
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ColumnVisibilityToggle; 