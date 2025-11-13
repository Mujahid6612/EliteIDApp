
interface Props {
  buttonText: string,
  buttonVariant?: string,
  functionpassed?: (params?: any) => void,
  popVariantButton?: string,
  buttonWidth?: string,
  popupButtonRedClass?: string;
  disabled?: boolean;
}
const ButtonsComponent = ({buttonText,buttonVariant, functionpassed, popVariantButton, buttonWidth = "70%", popupButtonRedClass, disabled = false}: Props) => {
  return (
    <div style={{textAlign: "center"}}>
    <button 
      style={{ width: buttonWidth ? buttonWidth : "70%" }}  
      className={`${popupButtonRedClass} button ${buttonVariant} ${popVariantButton} ${disabled ? "disabled" : ""}`} 
      onClick={functionpassed}
      disabled={disabled}
    >
      {buttonText}
    </button>
    </div>
  )
}

export default ButtonsComponent