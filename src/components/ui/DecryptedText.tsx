import React, { useState, useEffect } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
}

const GLYPHS = "01$@#%&*+=?_[]{}/\\";

export const DecryptedText: React.FC<DecryptedTextProps> = ({ text, speed = 25 }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let active = true;
    let iteration = 0;
    const targetLength = text.length;
    
    // Start with fully randomized characters
    let initialText = text
      .split('')
      .map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])
      .join('');
    setDisplayText(initialText);

    const interval = setInterval(() => {
      if (!active) return;

      const updated = text
        .split('')
        .map((char, index) => {
          if (index < iteration) {
            return text[index];
          }
          if (char === ' ') {
            return ' ';
          }
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');

      setDisplayText(updated);

      if (iteration >= targetLength) {
        setDisplayText(text);
        clearInterval(interval);
      }

      iteration += 1 / 2; // decodes semi-slowly for style
    }, speed);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [text, speed]);

  return <span className="font-mono">{displayText}</span>;
};
