const Button = ({ type = "primary", children, onClick, className = "" }) => {
  let typeClass = `button-${type}`;
  return <button onClick={onClick} className={`button ${typeClass} ${className}`}>{children}</button>;
};
export default Button;
