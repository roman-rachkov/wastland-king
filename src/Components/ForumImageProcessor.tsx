import React from 'react';
import ResponsiveImage from './RichTextEditor/ResponsiveImage';

interface PostProps {
  content: string;
  className?: string;
}

/**
 * Post component - renders forum post content from HTML string
 * Handles special elements like spoilers, code blocks, blockquotes, and images
 */
const Post: React.FC<PostProps> = ({ content, className }) => {
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
        
        // Handle spoiler blocks - create as div[data-spoiler] instead of SpoilerImage component
        if (element.hasAttribute('data-spoiler')) {
          const title = element.getAttribute('data-title') || 'Spoiler';
          const children = Array.from(element.childNodes).map((child, childIndex) => 
            processNode(child, childIndex)
          );
          
          return (
            <div 
              key={`spoiler-${index}`} 
              data-spoiler="true"
              data-title={title}
              className="spoiler-container"
            >
              {children}
            </div>
          );
        }
        
        // Handle code blocks - preserve all attributes
        if (element.tagName === 'PRE' && element.querySelector('code')) {
          const codeElement = element.querySelector('code');
          const codeContent = codeElement?.textContent || '';
          const language = codeElement?.className?.replace('language-', '') || '';
          
          // Preserve all attributes from the original pre element
          const preProps: any = {};
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (attr.name === 'class') {
              preProps.className = `${attr.value} language-${language}`;
            } else {
              preProps[attr.name] = attr.value;
            }
          }
          
          return (
            <pre key={`code-${index}`} {...preProps}>
              <code className={`language-${language}`}>
                {codeContent}
              </code>
            </pre>
          );
        }
        
        // Handle blockquotes - preserve all attributes
        if (element.tagName === 'BLOCKQUOTE') {
          const children = Array.from(element.childNodes).map((child, childIndex) => 
            processNode(child, childIndex)
          );
          
          // Preserve all attributes from the original blockquote element
          const blockquoteProps: any = {};
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (attr.name === 'class') {
              blockquoteProps.className = `${attr.value} blockquote`;
            } else {
              blockquoteProps[attr.name] = attr.value;
            }
          }
          
          return (
            <blockquote key={`blockquote-${index}`} {...blockquoteProps}>
              {children}
            </blockquote>
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
  
  return (
    <div className={className}>
      {processContent(content)}
    </div>
  );
};

export default Post; 