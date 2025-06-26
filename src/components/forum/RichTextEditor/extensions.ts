import { Node, Mark } from '@tiptap/core';

// Font Size extension
export const FontSize = Mark.create({
  name: 'fontSize',
  
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.size) {
            return {};
          }
          return {
            style: `font-size: ${attributes.size}`,
          };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span[style*="font-size"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },
});

// Spoiler extension - can wrap any content
export const Spoiler = Node.create({
  name: 'spoiler',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      title: {
        default: 'Spoiler',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-spoiler]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-spoiler': 'true' }, 0];
  },
}); 