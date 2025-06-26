import React, { useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { imageUploadConfig } from '../../../config/imageUpload';
import { useImageUpload } from './useImageUpload';
import { useImageZoom } from '../../../hooks/useImageZoom';
import { FontSize, Spoiler } from './extensions';
import EditorToolbar from './EditorToolbar';
import EditorTips from './EditorTips';
import SafeEditorContent from './SafeEditorContent';
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
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
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
      FontSize,
      Underline
    ],
    content: value,
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML();
        onChange(html);
      } catch (error) {
        console.warn('Error updating editor content:', error);
      }
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
    handleDrop
  } = useImageUpload(editor);

  // Enable image zoom functionality
  useImageZoom();

  // Sync editor content with value prop
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      try {
        editor.commands.setContent(value);
      } catch (error) {
        console.warn('Error setting editor content:', error);
      }
    }
  }, [editor, value]);

  // Global paste handler as fallback
  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      // Only handle if editor is focused
      if (!editor?.isFocused) return;
      
      try {
        const items = Array.from(event.clipboardData?.items || []);
        
        const imageItem = items.find(item => item.type.startsWith('image/'));
        
        if (imageItem) {
          event.preventDefault();
          
          const file = imageItem.getAsFile();
          
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
      try {
        editor.chain().focus().setLink({ href: url }).run();
      } catch (error) {
        console.warn('Error setting link:', error);
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div 
      ref={editorRef}
      className={`rich-text-editor ${className}`}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <EditorToolbar
        editor={editor}
        isUploading={isUploading}
        onImageUpload={handleImageUpload}
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
        <SafeEditorContent 
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