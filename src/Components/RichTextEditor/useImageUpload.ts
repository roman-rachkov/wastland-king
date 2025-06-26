import { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { uploadImage } from '../../services/imageUpload';

export const useImageUpload = (editor: Editor | null) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addImage = useCallback(async (file: File) => {
    if (!editor || !file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Selected file is not an image');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadImage(file);
      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const handleImageUpload = useCallback((input: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | null = null;
    
    if (input instanceof File) {
      file = input;
    } else {
      file = input.target?.files?.[0] || null;
      // Reset input safely
      if (input.target) {
        try {
          input.target.value = '';
        } catch (error) {
          console.warn('Error resetting input:', error);
        }
      }
    }
    
    if (file) {
      addImage(file);
    }
  }, [addImage]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    console.log('Paste event triggered');
    
    try {
      // Check if clipboardData exists
      if (!event.clipboardData) {
        console.log('No clipboardData available');
        return;
      }
      
      // Convert to array and find image
      const items = Array.from(event.clipboardData.items);
      console.log('Clipboard items:', items.map(item => item.type));
      
      const imageItem = items.find(item => item.type.startsWith('image/'));
      
      if (imageItem) {
        console.log('Image item found:', imageItem.type);
        event.preventDefault();
        event.stopPropagation();
        
        const file = imageItem.getAsFile();
        console.log('File from clipboard:', file);
        
        if (file) {
          addImage(file);
        }
      } else {
        console.log('No image item found in clipboard');
      }
    } catch (error) {
      console.error('Error in handlePaste:', error);
    }
  }, [addImage]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    if (!event.dataTransfer?.files) return;
    
    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      addImage(imageFile);
    }
  }, [addImage]);

  return {
    isUploading,
    uploadError,
    addImage,
    handleImageUpload,
    handlePaste,
    handleDrop
  };
}; 