interface TextFieldProps {
  placeHolderTextInput: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  valueTrue: boolean;
  value?: string;
}

const TextField = ({
  placeHolderTextInput,
  onChange,
  valueTrue,
  value,
}: TextFieldProps) => {
  return valueTrue && value ? (
    <input
      className="primary-text-field"
      value={value}
      type="text"
      placeholder={placeHolderTextInput}
      onChange={onChange}
    />
  ) : (
    <input
      className="primary-text-field"
      type="text"
      placeholder={placeHolderTextInput}
      onChange={onChange}
      value={value || ""}
    />
  );
};

export default TextField;
