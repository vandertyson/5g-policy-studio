import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 ${className}`}>{children}</div>;
}
