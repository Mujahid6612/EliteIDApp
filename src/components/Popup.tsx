import React, { useState, useRef, useEffect } from "react";
import ThemedText from "./ThemedText";
import ButtonsComponent from "./ButtonsComponent";

interface PopupProps {
  triggerOnLoad?: boolean;
  popTitle: string;
  popUpText: string;
  PopUpButtonText: string;
  PopUpButtonOpenText?: string;
  popVariantButton?: string;
  secondButtonText?: string;
  popupButtonRedClass?: string;
  functionpassed?: () => void;
  variant?: "info" | "success" | "warning" | "error";
  disableOutsideClose?: boolean;
}

const Popup: React.FC<PopupProps> = ({
  triggerOnLoad = false,
  popTitle,
  popUpText,
  PopUpButtonText,
  PopUpButtonOpenText = "Open Popup",
  popVariantButton,
  secondButtonText,
  popupButtonRedClass,
  functionpassed,
  variant = "info",
  disableOutsideClose = false,
}) => {
  const [isOpen, setIsOpen] = useState(triggerOnLoad);
  const popupRef = useRef<HTMLDivElement>(null);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Close the popup if clicked outside of it
  const handleOutsideClick = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen || disableOutsideClose) {
      return;
    }

    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup event listener on component unmount
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, disableOutsideClose]);

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return {
          container: "popup-card popup-card-success",
          icon: "popup-icon popup-icon-success",
        };
      case "warning":
        return {
          container: "popup-card popup-card-warning",
          icon: "popup-icon popup-icon-warning",
        };
      case "error":
        return {
          container: "popup-card popup-card-error",
          icon: "popup-icon popup-icon-error",
        };
      default:
        return {
          container: "popup-card popup-card-info",
          icon: "popup-icon popup-icon-info",
        };
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case "success":
        return "✓";
      case "warning":
        return "!";
      case "error":
        return "!";
      default:
        return "i";
    }
  };

  const { container, icon } = getVariantClasses();

  return (
    <>
      {/* Button to trigger the popup only if it's not triggered on load */}
      {!triggerOnLoad && (
        <div style={{ textAlign: "center" }}>
          <button
            className={`button ${popVariantButton}`}
            onClick={togglePopup}
          >
            {PopUpButtonOpenText}
          </button>
        </div>
      )}

      {/* Popup Modal */}
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content" ref={popupRef}>
            <div className={container}>
              <div className="popup-header">
                <div className={icon}>{getVariantIcon()}</div>
                <div className="popup-title-group">
                  <h2 className="popup-title">{popTitle}</h2>
                </div>
              </div>
              <div className="popup-body">
                <ThemedText themeText={popUpText} classPassed="lefttext" />
              </div>
              <div
                className={`popup-actions ${
                  secondButtonText ? "popup-actions-dual" : ""
                }`}
              >
                <ButtonsComponent
                  buttonWidth="100%"
                  popupButtonRedClass={popupButtonRedClass}
                  popVariantButton={popVariantButton}
                  buttonText={PopUpButtonText}
                  functionpassed={functionpassed || togglePopup}
                />
                {secondButtonText && (
                  <ButtonsComponent
                    buttonWidth="110px"
                    buttonText={secondButtonText}
                    functionpassed={togglePopup}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
