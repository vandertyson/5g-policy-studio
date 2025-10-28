import { NavLink, Outlet } from "react-router";
import React from "react";

export default function AppLayout() {
	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
			<aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
				<div className="p-6">
					<span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
						5G Policy Studio
					</span>
				</div>
				<nav className="px-4">
					<ul className="space-y-1">
						<li>
							<NavLink
								to="/deployment"
								className={({ isActive }) =>
									`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
										isActive
											? "bg-gray-100 dark:bg-gray-700 font-medium"
											: "text-gray-700 dark:text-gray-200"
									}`
								}
							>
								Deployment
							</NavLink>
						</li>
						<li>
							<NavLink
								to="/designer"
								className={({ isActive }) =>
									`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
										isActive
											? "bg-gray-100 dark:bg-gray-700 font-medium"
											: "text-gray-700 dark:text-gray-200"
									}`
								}
							>
								Designer
							</NavLink>
						</li>
						<li>
							<NavLink
								to="/management"
								className={({ isActive }) =>
									`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
										isActive
											? "bg-gray-100 dark:bg-gray-700 font-medium"
											: "text-gray-700 dark:text-gray-200"
									}`
								}
							>
								Management
							</NavLink>
						</li>
						<li>
							<NavLink
								to="/explorer"
								className={({ isActive }) =>
									`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
										isActive
											? "bg-gray-100 dark:bg-gray-700 font-medium"
											: "text-gray-700 dark:text-gray-200"
									}`
								}
							>
								Explorer
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
