import React from "react";

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
  disabled?: boolean;
}

const TextField = ({
  placeHolderTextInput,
  onChange,
  onBlur,
  value,
  label,
  error,
  required = false,
  type = "text",
  disabled = false,
}: TextFieldProps) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const fieldId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;
  const hasValue = !!(value && value.trim());
  
  const inputClassName = error 
    ? `primary-text-field error-field ${disabled ? "disabled-field" : ""}` 
    : `primary-text-field ${disabled ? "disabled-field" : ""}`;
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlurInternal = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };
  
  const inputField = (
    <input
      autoComplete="off"
      className={inputClassName}
      value={value || ""}
      type={type}
      placeholder={hasValue ? placeHolderTextInput : ""}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlurInternal}
      id={fieldId}
      required={required}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${fieldId}-error` : undefined}
    />
  );

  if (label) {
    return (
      <div className={`text-field-container outlined-field ${hasValue || isFocused ? "has-value" : ""} ${error ? "has-error" : ""} ${isFocused ? "is-focused" : ""} ${disabled ? "is-disabled" : ""}`}>
        {inputField}
        <label className="outlined-label" htmlFor={fieldId}>
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
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
