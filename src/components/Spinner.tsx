import React, { useEffect } from "react";

interface SpinnerProps {
  size?: string;
  color?: string;
  functionPassed?: (...args: any[]) => void;
  retryInterval?: number; 
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "50px",
  color = "#000",
  functionPassed,
  retryInterval = 3000, 
}) => {
  useEffect(() => {
    if (!functionPassed) return;
    const interval = setInterval(() => {
      functionPassed();
    }, retryInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [functionPassed, retryInterval]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
          borderRadius: "50%",
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
        }}
      ></div>
    </div>
  );
};

export default Spinner;
