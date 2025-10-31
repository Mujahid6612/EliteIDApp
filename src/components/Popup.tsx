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
  functionpassed?: (params?: any) => void;
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
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    // Cleanup event listener on component unmount
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

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
            <h2>{popTitle}</h2>
            <ThemedText themeText={popUpText} classPassed="centertext" />
            <div className={`${secondButtonText && "d-flex-cen fl-gap"}`}>
              <ButtonsComponent
                buttonWidth="110px"
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
      )}
    </>
  );
};

export default Popup;
