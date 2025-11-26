import React, { useEffect, useState } from "react";

interface SpinnerProps {
  size?: string;
  color?: string;
  functionPassed?: (...args: any[]) => void;
  retryInterval?: number;
  onMaxRetries?: () => void;
  /**
   * Optional message to display under the loader.
   * Defaults to a generic, user-friendly text instructing the user not to close the window.
   */
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "50px",
  color = "#000",
  functionPassed,
  retryInterval = 3000,
  onMaxRetries,
  message = "Please wait… we are processing your request. Do not close this window.",
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

  // Throw error after 3 attempts
  if (attempts >= 3) {
    throw new Error("Something went wrong please refresh this window!");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: "0 1.5rem",
        textAlign: "center",
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
          marginBottom: "1rem",
        }}
      ></div>
      <p
        style={{
          maxWidth: "420px",
          fontSize: "0.95rem",
          lineHeight: 1.4,
          color: "#333",
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default Spinner;
