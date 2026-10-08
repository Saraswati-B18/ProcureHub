import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  className = ""
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;