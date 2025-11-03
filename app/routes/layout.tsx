import { NavLink, Outlet } from "react-router";
import React from "react";

export default function AppLayout() {
	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
			<aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
				<div className="p-6">
					{/* Prominent single-line sidebar title */}
					<h2
						style={{ fontSize: "clamp(1rem, 3.2vw, 1.25rem)" }}
						className="font-extrabold leading-tight whitespace-nowrap truncate text-gray-900 dark:text-gray-100"
						title="5G Studio Policy"
					>
						5G Studio Policy
					</h2>
				</div>
				<nav className="px-4">
					<ul className="space-y-1">
						<li>
							<NavLink to="/" end className={({ isActive }) =>
								isActive
									? "block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md"
									: "block px-3 py-2"
							}>
								Dashboard
							</NavLink>
						</li>
						<li>
							<NavLink to="/deployment" className={({ isActive }) =>
								isActive
									? "block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md"
									: "block px-3 py-2"
							}>
								Deployment
							</NavLink>
						</li>
						<li>
							<NavLink to="/designer" className={({ isActive }) =>
								isActive
									? "block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md"
									: "block px-3 py-2"
							}>
								Designer
							</NavLink>
						</li>						
						<li>
							<NavLink to="/explorer" className={({ isActive }) =>
								isActive
									? "block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md"
									: "block px-3 py-2"
							}>
								Explorer
							</NavLink>
						</li>
						<li>
							<NavLink to="/management" className={({ isActive }) =>
								isActive
									? "block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md"
									: "block px-3 py-2"
							}>
								Management
							</NavLink>
						</li>
					</ul>
				</nav>
			</aside>

			{/* content area where child routes render */}
			<div className="flex-1">
				<Outlet />
			</div>
		</div>
	);
}
