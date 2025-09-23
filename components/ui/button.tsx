import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
    destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
    outline: "border border-gray-300 bg-white shadow-sm hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
    ghost: "hover:bg-gray-100",
    link: "text-blue-600 underline-offset-4 hover:underline",
  },
  size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3 py-1.5 text-sm",
    lg: "h-10 px-6 py-2.5",
    icon: "h-9 w-9",
  },
};

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  asChild?: boolean;
}

// ✅ Wrap in React.forwardRef and pass ref down
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const variantClasses = buttonVariants.variant[variant];
    const sizeClasses = buttonVariants.size[size];

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          variantClasses,
          sizeClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
