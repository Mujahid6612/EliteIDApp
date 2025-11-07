import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import "./SwipeButton.css";

interface SwipeButtonProps {
  onSwipeComplete: () => void;
  text?: string;
  disabled?: boolean;
  className?: string;
  type?: "default" | "danger";
  loading?: boolean;
}

const SwipeButton = ({
  onSwipeComplete,
  text = "Swipe to continue",
  disabled = false,
  className = "",
  type = "default",
  loading = false,
}: SwipeButtonProps) => {
  // Ensure text includes "Swipe" if not already present
  const displayText = text.toLowerCase().includes("swipe") 
    ? text 
    : `SWIPE TO ${text}`;
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (disabled || loading || hasCompleted) return;

      // Only allow right swipe
      if (eventData.dir === "Right") {
        setIsSwiping(true);
        // Get button width from event target
        const target = eventData.event.target as HTMLElement;
        const buttonElement = target.closest('.swipe-button') as HTMLElement;
        const buttonWidth = buttonElement?.offsetWidth || 400;
        const progress = Math.min(
          (eventData.deltaX / buttonWidth) * 100,
          100
        );
        setSwipeProgress(progress);
      }
    },
    onSwiped: (eventData) => {
      if (disabled || loading || hasCompleted) return;

      // Calculate progress from eventData to avoid stale closure
      if (eventData.dir === "Right") {
        const target = eventData.event.target as HTMLElement;
        const buttonElement = target.closest('.swipe-button') as HTMLElement;
        const buttonWidth = buttonElement?.offsetWidth || 400;
        const progress = Math.min(
          (eventData.deltaX / buttonWidth) * 100,
          100
        );

        if (progress >= 60 && !hasCompleted) {
          setHasCompleted(true);
          onSwipeComplete();
        } else {
          // Reset progress if swipe didn't complete (user released before 50%)
          setSwipeProgress(0);
          setHasCompleted(false);
        }
      } else {
        // Reset progress for non-right swipes
        setSwipeProgress(0);
        setHasCompleted(false);
      }

      // Reset swiping state
      setIsSwiping(false);
    },
    trackMouse: true, // Enable mouse dragging
    trackTouch: true, // Enable touch swiping
    preventScrollOnSwipe: true,
    delta: 10, // Minimum distance to trigger swipe (improves sensitivity)
  });

  const isIdle = !disabled && !loading && !isSwiping && swipeProgress === 0;


  useEffect(() => {
    if (hasCompleted && !loading && !isSwiping) {
      setHasCompleted(false);
      setSwipeProgress(0);
      setIsSwiping(false);
    }
  }, [hasCompleted, loading]);

  return (
    <div className={`swipe-button-container ${className}`}>
      <div
        {...handlers}
        className={`swipe-button swipe-button-${type} ${
          disabled || loading ? "swipe-button-disabled" : ""
        } ${loading ? "swipe-button-loading" : ""} ${
          isIdle ? "swipe-button-idle" : ""
        }`}
      >
        <div
          className="swipe-button-track"
          style={{
            width: `${swipeProgress}%`,
            transition: isSwiping ? "none" : "width 0.3s ease-out",
          }}
        />
        {isIdle && <div className="swipe-button-shimmer"></div>}
        <div className="swipe-button-content">
          {loading ? (
            <>
              <span className="swipe-button-text">Loading...</span>
              <div className="swipe-button-spinner"></div>
            </>
          ) : (
            <>
              <span className="swipe-button-text">{displayText}</span>
              <span className="swipe-button-arrow">→</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeButton;
