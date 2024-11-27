
interface Props {
  buttonText: string,
  buttonVariant?: string,
  functionpassed?: (params?: any) => void,
  popVariantButton?: string,
  buttonWidth?: string,
  popupButtonRedClass?: string;
}
const ButtonsComponent = ({buttonText,buttonVariant, functionpassed, popVariantButton, buttonWidth = "70%", popupButtonRedClass}: Props) => {
  return (
    <div style={{textAlign: "center"}}>
    <button style={{ width: buttonWidth ? buttonWidth : "70%" }}  className={`${popupButtonRedClass} button ${buttonVariant} ${popVariantButton}`} onClick={functionpassed}>{buttonText}</button>
    </div>
  )
}

export default ButtonsComponent