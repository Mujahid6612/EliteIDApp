import React from "react";

interface SwipeArrowProps {
  className?: string;
  style?: React.CSSProperties;
}

const SwipeArrow: React.FC<SwipeArrowProps> = ({ className, style }) => {
  return (
    <svg
      width="1.5rem"
      height="1.5rem"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M3 12H21M21 12L14 5M21 12L14 19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SwipeArrow;

