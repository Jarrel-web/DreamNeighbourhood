import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

const Chip: React.FC<Props> = ({ active, className, children, ...rest }) => {
  return (
    <button
        aria-pressed={active}
        className={clsx(
        "inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm transition",
        active
            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
        )}
        {...rest}
    >
      {children}
    </button>
  );
};

export default Chip;
