


interface TextFieldProps {
  placeHolderTextInput: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  valueTrue: boolean;
}

const TextField = ({ placeHolderTextInput, onChange, valueTrue }: TextFieldProps) => {
  return valueTrue ? (
    <input className="primary-text-field" value={valueTrue ? placeHolderTextInput : ""}  type="text" placeholder={placeHolderTextInput} onChange={onChange} />
  ) : (
    <input className="primary-text-field" type="text" placeholder={placeHolderTextInput} onChange={onChange} />
  );
};

export default TextField;
