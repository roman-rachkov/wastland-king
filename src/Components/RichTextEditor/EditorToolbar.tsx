import React from 'react';
import { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor;
  isUploading: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddSpoiler: () => void;
  onSetLink: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  isUploading,
  onImageUpload,
  onAddSpoiler,
  onSetLink
}) => {
  return (
    <div className="toolbar border border-secondary rounded-top p-2 bg-light d-flex flex-wrap gap-2">
      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`btn btn-sm ${editor.isActive('bold') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`btn btn-sm ${editor.isActive('italic') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`btn btn-sm ${editor.isActive('underline') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`btn btn-sm ${editor.isActive('strike') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Strike"
      >
        <s>S</s>
      </button>
      
      <div className="vr mx-2"></div>
      
      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`btn btn-sm ${editor.isActive('heading', { level: 1 }) ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`btn btn-sm ${editor.isActive('heading', { level: 2 }) ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`btn btn-sm ${editor.isActive('heading', { level: 3 }) ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Heading 3"
      >
        H3
      </button>
      
      <div className="vr mx-2"></div>
      
      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`btn btn-sm ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Numbered List"
      >
        1. List
      </button>
      
      <div className="vr mx-2"></div>
      
      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`btn btn-sm ${editor.isActive({ textAlign: 'left' }) ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Align Left"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`btn btn-sm ${editor.isActive({ textAlign: 'center' }) ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Align Center"
      >
        ↔
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`btn btn-sm ${editor.isActive({ textAlign: 'right' }) ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Align Right"
      >
        →
      </button>
      
      <div className="vr mx-2"></div>
      
      {/* Links and Media */}
      <button
        type="button"
        onClick={onSetLink}
        className={`btn btn-sm ${editor.isActive('link') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Add Link"
      >
        🔗
      </button>
      <div className="btn-group" role="group">
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="d-none"
          id="image-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="image-upload"
          className={`btn btn-sm btn-outline-secondary ${isUploading ? 'disabled' : ''}`}
          title="Upload Image"
        >
          {isUploading ? '⏳' : '🖼️'}
        </label>
      </div>
      <button
        type="button"
        onClick={onAddSpoiler}
        disabled={isUploading}
        className="btn btn-sm btn-outline-warning"
        title="Add Spoiler Image"
      >
        {isUploading ? '⏳' : '🚫'}
      </button>
      
      <div className="vr mx-2"></div>
      
      {/* Blocks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`btn btn-sm ${editor.isActive('blockquote') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Quote"
      >
        "
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`btn btn-sm ${editor.isActive('codeBlock') ? 'btn-primary' : 'btn-outline-secondary'}`}
        title="Code Block"
      >
        {'</>'}
      </button>
    </div>
  );
};

export default EditorToolbar; 