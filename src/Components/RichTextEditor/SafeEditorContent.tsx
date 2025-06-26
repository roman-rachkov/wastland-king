import React, { useRef } from 'react';
import { EditorContent, EditorContentProps } from '@tiptap/react';
import { Editor } from '@tiptap/react';

interface SafeEditorContentProps extends Omit<EditorContentProps, 'editor'> {
  editor: Editor | null;
  onPaste?: (event: React.ClipboardEvent<Element>) => void;
  onDrop?: (event: React.DragEvent<Element>) => void;
  onDragOver?: (event: React.DragEvent<Element>) => void;
}

const SafeEditorContent: React.FC<SafeEditorContentProps> = ({
  editor,
  onPaste,
  onDrop,
  onDragOver,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePaste = (event: React.ClipboardEvent<Element>) => {
    try {
      onPaste?.(event);
    } catch (error) {
      console.warn('Error in paste handler:', error);
    }
  };

  const handleDrop = (event: React.DragEvent<Element>) => {
    try {
      onDrop?.(event);
    } catch (error) {
      console.warn('Error in drop handler:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent<Element>) => {
    try {
      onDragOver?.(event);
    } catch (error) {
      console.warn('Error in dragOver handler:', error);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div ref={containerRef}>
      <EditorContent
        editor={editor}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        {...props}
      />
    </div>
  );
};

export default SafeEditorContent; 