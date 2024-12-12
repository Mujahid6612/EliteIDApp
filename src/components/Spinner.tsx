import React, { useEffect, useState } from "react";

interface SpinnerProps {
  size?: string;
  color?: string;
  functionPassed?: (...args: any[]) => void;
  retryInterval?: number;
  onMaxRetries?: () => void;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "50px",
  color = "#000",
  functionPassed,
  retryInterval = 3000,
  onMaxRetries,
}) => {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttempts((prevAttempts) => {
        const newAttempts = prevAttempts + 1;

        if (functionPassed) {
          const result = functionPassed();
          
          //@ts-ignore
          if (result?.JHeader?.ActionCode) {
            // Unmount the component and refresh the window
            window.location.reload(); // Refreshes the entire page
          }
        }

        if (newAttempts >= 3) {
          clearInterval(interval);
          if (onMaxRetries) {
            setTimeout(onMaxRetries, 0);
          }
        }

        return newAttempts;
      });
    }, retryInterval);

    return () => clearInterval(interval);
  }, [functionPassed, retryInterval, onMaxRetries]);

  // Throw error after 3 attempts
  if (attempts >= 3) {
    throw new Error("Something went wrong please refresh this window!");
  }

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
