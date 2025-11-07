import { useState } from "react";
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
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (disabled || loading) return;

      // Only allow right swipe
      if (eventData.dir === "Right") {
        setIsSwiping(true);
        const progress = Math.min(
          (eventData.deltaX /
            (eventData.event.target as HTMLElement).offsetWidth) *
            100,
          100
        );
        setSwipeProgress(progress);
      }
    },
    onSwiped: (eventData) => {
      if (disabled || loading) return;

      // Calculate progress from eventData to avoid stale closure
      if (eventData.dir === "Right") {
        const element = eventData.event.target as HTMLElement;
        const progress = Math.min(
          (eventData.deltaX / element.offsetWidth) * 100,
          100
        );

        // Complete if swiped right with sufficient distance (90% threshold)
        if (progress >= 70) {
          onSwipeComplete();
        } else {
          // Reset progress if swipe didn't complete (user released before 90%)
          setSwipeProgress(0);
        }
      } else {
        // Reset progress for non-right swipes
        setSwipeProgress(0);
      }

      // Reset swiping state
      setIsSwiping(false);
    },
    trackMouse: true, // Enable mouse dragging
    trackTouch: true, // Enable touch swiping
    preventScrollOnSwipe: true,
  });

  const isIdle = !disabled && !loading && !isSwiping && swipeProgress === 0;

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
              <span className="swipe-button-text">SWIPE TO {text}</span>
              <span className={`swipe-button-arrow ${isIdle ? "swipe-arrow-pulse" : ""}`}>→</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeButton;
