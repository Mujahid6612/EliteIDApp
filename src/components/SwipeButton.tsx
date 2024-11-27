/*import  { useState } from "react";
import { useSwipeable } from "react-swipeable";


const SwipeButton = ({ text = "Swipe to End Ride", onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSwipe = (eventData) => {
    const swipeDistance = Math.min(Math.max(eventData.deltaX, 0), 300); // Clamp swipe distance between 0 and 300px
    setProgress(swipeDistance);

    if (swipeDistance >= 300 && !isCompleted) {
      setIsCompleted(true);
      setTimeout(() => {
        if (onComplete) onComplete(); // Call the completion callback
        setProgress(0); // Reset progress
        setIsCompleted(false); // Allow for reuse
      }, 300);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiping: handleSwipe,
    trackMouse: true, // Enables mouse swiping for desktop
    preventScrollOnSwipe: true,
  });

  return (
    <div className="swipe-container" {...swipeHandlers}>
      <div
        className="swipe-button"
        style={{ transform: `translateX(${progress}px)` }}
      >
        ➡️
      </div>
      <div className={`swipe-background ${isCompleted ? "completed" : ""}`}>
        {text}
      </div>
    </div>
  );
};

export default SwipeButton;
*/


const SwipeButton = () => {
  return (
    <div>SwipeButton</div>
  )
}

export default SwipeButton