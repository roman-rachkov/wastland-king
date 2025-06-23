import React from 'react';
import ResponsiveImage from './RichTextEditor/ResponsiveImage';
import SpoilerImage from './SpoilerImage/SpoilerImage';

interface ForumImageProcessorProps {
  content: string;
}

const ForumImageProcessor: React.FC<ForumImageProcessorProps> = ({ content }) => {
  const processContent = (htmlContent: string): React.ReactNode => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const processNode = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // Handle spoiler blocks
        if (element.hasAttribute('data-spoiler')) {
          const title = element.getAttribute('data-title') || 'Spoiler';
          const children = Array.from(element.childNodes).map((child, childIndex) => 
            processNode(child, childIndex)
          );
          
          return (
            <SpoilerImage key={`spoiler-${index}`} title={title}>
              {children}
            </SpoilerImage>
          );
        }
        
        // Handle images
        if (element.tagName === 'IMG') {
          const src = element.getAttribute('src');
          const alt = element.getAttribute('alt') || '';
          
          if (src) {
            return (
              <ResponsiveImage
                key={`img-${index}`}
                src={src}
                alt={alt}
              />
            );
          }
        }
        
        // Handle other elements recursively
        const children = Array.from(element.childNodes).map((child, childIndex) => 
          processNode(child, childIndex)
        );
        
        // Recreate the element with processed children
        const props: any = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          // Skip style attribute to avoid React style prop errors
          if (attr.name !== 'style') {
            // Convert 'class' to 'className' for React
            if (attr.name === 'class') {
              props.className = attr.value;
            } else {
              props[attr.name] = attr.value;
            }
          }
        }
        
        // Create element with proper key
        return React.createElement(element.tagName.toLowerCase(), {
          ...props,
          key: `${element.tagName.toLowerCase()}-${index}`
        }, ...children);
      }
      
      return null;
    };
    
    return Array.from(tempDiv.childNodes).map((node, index) => 
      processNode(node, index)
    );
  };
  
  return <>{processContent(content)}</>;
};

export default ForumImageProcessor; 