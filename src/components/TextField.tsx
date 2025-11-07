interface TextFieldProps {
  placeHolderTextInput: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  valueTrue: boolean;
  value?: string;
  label?: string;
  error?: string;
  required?: boolean;
  type?: string;
}

const TextField = ({
  placeHolderTextInput,
  onChange,
  onBlur,
  valueTrue,
  value,
  label,
  error,
  required = false,
  type = "text",
}: TextFieldProps) => {
  const fieldId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;
  const inputClassName = error ? "primary-text-field error-field" : "primary-text-field";
  
  const inputField = valueTrue && value ? (
    <input
      className={inputClassName}
      value={value}
      type={type}
      placeholder={placeHolderTextInput}
      onChange={onChange}
      onBlur={onBlur}
      id={fieldId}
      required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${fieldId}-error` : undefined}
    />
  ) : (
    <input
      className={inputClassName}
      type={type}
      placeholder={placeHolderTextInput}
      onChange={onChange}
      onBlur={onBlur}
      value={value || ""}
      id={fieldId}
      required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${fieldId}-error` : undefined}
    />
  );

  if (label) {
    return (
      <div className="text-field-container">
        <label className="text-field-label" htmlFor={fieldId}>
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
        {inputField}
        {error && (
          <span className="error-message" id={`${fieldId}-error`} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {inputField}
      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
    </>
  );
};

export default TextField;
