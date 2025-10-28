import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "default" | "primary" | "ghost" | "danger";
};

export function Button({ variant = "default", className = "", children, ...rest }: ButtonProps) {
	const base =
		"inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
	const variants: Record<string, string> = {
		default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50",
		primary: "bg-blue-600 text-white hover:bg-blue-700",
		ghost: "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
		danger: "bg-red-600 text-white hover:bg-red-700",
	};
	return (
		<button className={`${base} ${variants[variant]} ${className}`} {...rest}>
			{children}
		</button>
	);
}
