import React, { useEffect, useState } from "react";

interface SpinnerProps {
  size?: string;
  color?: string;
  functionPassed?: () => void;
  retryInterval?: number;
  onMaxRetries?: () => void;
  disableErrorThrow?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "50px",
  color = "#000",
  functionPassed,
  retryInterval = 3000,
  onMaxRetries,
  disableErrorThrow = false,
}) => {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttempts((prevAttempts) => {
        const newAttempts = prevAttempts + 1;

        if (functionPassed) {
          functionPassed(); 
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

  // Throw error after 3 attempts (unless disabled so the parent can handle UI)
  if (attempts >= 3 && !disableErrorThrow) {
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
