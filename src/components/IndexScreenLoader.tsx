import React from "react";

interface IndexScreenLoaderProps {
  message?: string;
}

const IndexScreenLoader: React.FC<IndexScreenLoaderProps> = ({
  message = "Please wait… we are processing your request. Do not close this window.",
}) => {
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
          width: "50px",
          height: "50px",
          border: "4px solid #000",
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

export default IndexScreenLoader;

