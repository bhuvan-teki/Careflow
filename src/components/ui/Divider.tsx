import React from "react";
import { cn } from "../../lib/utils";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, text, ...props }, ref) => {
    return (
      <div className={cn("relative my-6", className)} ref={ref} {...props}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        {text && (
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-text-secondary">
              {text}
            </span>
          </div>
        )}
      </div>
    );
  }
);
Divider.displayName = "Divider";
