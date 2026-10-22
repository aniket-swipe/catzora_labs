import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cx } from "../../lib/cx.js";

const VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent/90 shadow-card",
  secondary: "bg-surface text-ink border border-line shadow-card hover:bg-sunken",
  ghost: "text-muted hover:text-ink hover:bg-sunken",
  subtle: "bg-accent-soft text-accent hover:bg-accent/15",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-[15px] gap-2",
  icon: "h-9 w-9 justify-center",
};

export const Button = forwardRef(function Button(
  { variant = "secondary", size = "md", icon: Icon, loading, disabled, className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden />
      ) : null}
      {children}
    </button>
  );
});
