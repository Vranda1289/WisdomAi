import { useState, useEffect, useRef } from 'react';

export const useTypingEffect = (fullText, isAnimated = false, speed = 20, onComplete) => {
  const [displayText, setDisplayText] = useState(isAnimated ? '' : fullText);
  const [isCompleted, setIsCompleted] = useState(!isAnimated);
  
  const textRef = useRef(fullText);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep references updated
  useEffect(() => {
    textRef.current = fullText;
    onCompleteRef.current = onComplete;
  }, [fullText, onComplete]);

  useEffect(() => {
    if (!isAnimated) {
      setDisplayText(fullText);
      setIsCompleted(true);
      return;
    }

    setDisplayText('');
    setIsCompleted(false);
    indexRef.current = 0;

    let intervalId;

    const tick = () => {
      if (indexRef.current < textRef.current.length) {
        indexRef.current += 1;
        setDisplayText(textRef.current.substring(0, indexRef.current));
      } else {
        setIsCompleted(true);
        clearInterval(intervalId);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    intervalId = setInterval(tick, speed);

    return () => {
      clearInterval(intervalId);
    };
  }, [fullText, isAnimated, speed]);

  return { displayText, isCompleted };
};
