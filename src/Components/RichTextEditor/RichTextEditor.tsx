import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { imageUploadConfig } from '../../config/imageUpload';
import { useImageUpload } from './useImageUpload';
import { useImageZoom } from '../../hooks/useImageZoom';
import { Spoiler } from './extensions';
import EditorToolbar from './EditorToolbar';
import ServiceStatus from './ServiceStatus';
import EditorTips from './EditorTips';
import './ResponsiveImage.scss';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = ''
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'responsive-image',
        },
      }),
      Spoiler,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary text-decoration-underline'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Color,
      TextStyle,
      Underline
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'form-control border-0 focus:outline-none min-h-[200px] p-3'
      }
    }
  });

  const {
    isUploading,
    uploadError,
    handleImageUpload,
    handlePaste,
    handleDrop,
    addSpoiler
  } = useImageUpload(editor);

  // Enable image zoom functionality
  useImageZoom();

  // Global paste handler as fallback
  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      // Only handle if editor is focused
      if (!editor?.isFocused) return;
      
      console.log('Global paste event triggered');
      
      try {
        const items = Array.from(event.clipboardData?.items || []);
        console.log('Global clipboard items:', items.map(item => item.type));
        
        const imageItem = items.find(item => item.type.startsWith('image/'));
        
        if (imageItem) {
          console.log('Global image item found:', imageItem.type);
          event.preventDefault();
          
          const file = imageItem.getAsFile();
          console.log('Global file from clipboard:', file);
          
          if (file) {
            handleImageUpload(file);
          }
        }
      } catch (error) {
        console.error('Error in global paste handler:', error);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [editor, handleImageUpload]);

  const setLink = () => {
    const url = window.prompt('Enter URL');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div 
      className={`rich-text-editor ${className}`}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <ServiceStatus service={imageUploadConfig.service} />
      
      <EditorToolbar
        editor={editor}
        isUploading={isUploading}
        onImageUpload={handleImageUpload}
        onAddSpoiler={addSpoiler}
        onSetLink={setLink}
      />
      
      {/* Error Message */}
      {uploadError && (
        <div className="alert alert-warning alert-sm mt-2">
          {uploadError}
        </div>
      )}

      <div 
        className="border border-secondary border-top-0 rounded-bottom"
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <EditorContent 
          editor={editor} 
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        />
      </div>
      
      <EditorTips service={imageUploadConfig.service} />
    </div>
  );
};

export default RichTextEditor;