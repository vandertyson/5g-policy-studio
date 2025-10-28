import React from "react";

export function Welcome() {
	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
			<main className="flex-1 p-6">
				<header className="mb-6">
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
				</header>

				<section>
					<div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-md h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
						Dashboard content (empty)
					</div>
				</section>
			</main>
		</div>
	);
}
