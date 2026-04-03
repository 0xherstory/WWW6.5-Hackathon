import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText = "Processing...",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // 极简几何华丽风格按钮
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 focus:outline-none";

    const variants = {
      primary: 
        "border border-accent bg-transparent text-text " +
        "hover:bg-accent hover:text-light " +
        "focus:ring-1 focus:ring-accent/50",
      secondary: 
        "border border-secondary-dark/50 bg-transparent text-text " +
        "hover:bg-secondary hover:border-secondary-dark " +
        "focus:ring-1 focus:ring-secondary-dark/50",
      outline:
        "border border-text/20 bg-transparent text-text " +
        "hover:border-accent hover:text-accent " +
        "focus:ring-1 focus:ring-accent/30",
      ghost: 
        "border-0 bg-transparent text-muted " +
        "hover:text-accent " +
        "focus:ring-1 focus:ring-accent/30",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs tracking-widest uppercase",
      md: "px-6 py-3 text-sm tracking-wide",
      lg: "px-8 py-4 text-base tracking-wide",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${
          disabled || isLoading ? "opacity-40 cursor-not-allowed" : ""
        }`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
