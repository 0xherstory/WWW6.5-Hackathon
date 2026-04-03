const VARIANTS = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  outline: "border border-emerald-600 text-emerald-600 hover:bg-emerald-50",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "text-gray-600 hover:bg-gray-100",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
