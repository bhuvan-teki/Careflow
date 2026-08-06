import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

// Convert HTML button props to motion props safely
type MotionButtonProps = HTMLMotionProps<"button"> & Omit<ButtonProps, keyof HTMLMotionProps<"button">>;

export const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-white text-black hover:bg-gray-200",
      secondary: "bg-surface text-white hover:bg-card border border-border",
      outline: "border border-border text-white hover:bg-surface",
      ghost: "text-text-secondary hover:text-white hover:bg-surface",
    };

    const sizes = {
      sm: "h-9 px-3",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-8 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
