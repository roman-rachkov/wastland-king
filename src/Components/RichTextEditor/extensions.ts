import { Node } from '@tiptap/core';

// Spoiler extension
export const Spoiler = Node.create({
  name: 'spoiler',
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      isSpoiler: {
        default: true,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'img[data-spoiler]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['img', { ...HTMLAttributes, 'data-spoiler': 'true' }];
  },
}); 