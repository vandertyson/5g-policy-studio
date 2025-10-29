import React from "react";

export function Welcome() {
	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
			<main className="flex-1 p-6">
				<header className="mb-6">
					{/* Prominent single-line title */}
					<div className="w-full overflow-hidden">
						<h1
							// responsive size: min 1.5rem, scales with viewport, max 3rem
							style={{ fontSize: "clamp(1.5rem, 6vw, 3rem)" }}
							className="font-extrabold leading-tight whitespace-nowrap truncate text-gray-900 dark:text-gray-100"
							title="5G Policy Studio"
						>
							5G Policy Studio
						</h1>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Dashboard</p>
					</div>
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
