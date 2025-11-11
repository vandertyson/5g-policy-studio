import { NavLink, Outlet } from "react-router";
import React, { useState } from "react";
import { 
	HomeOutlined, 
	RocketOutlined, 
	FormatPainterOutlined, 
	CompassOutlined, 
	SettingOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined
} from '@ant-design/icons';

export default function AppLayout() {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const menuItems = [
		{ to: "/", label: "Dashboard", icon: <HomeOutlined />, end: true },
		{ to: "/deployment", label: "Deployment", icon: <RocketOutlined /> },
		{ to: "/designer", label: "Designer", icon: <FormatPainterOutlined /> },
		{ to: "/explorer", label: "Explorer", icon: <CompassOutlined /> },
		{ to: "/management", label: "Management", icon: <SettingOutlined /> },
	];

	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
			<aside 
				className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-screen sticky top-0`}
				style={{
					background: 'linear-gradient(to bottom, #f3f4f6, #d1d5db)',
				}}
			>
				<div className="p-6">
					{/* Prominent single-line sidebar title */}
					<h2
						style={{ fontSize: "clamp(1rem, 3.2vw, 1.25rem)" }}
						className={`font-extrabold leading-tight text-gray-900 dark:text-gray-100 transition-all duration-300 ${
							isCollapsed ? 'text-center' : ''
						}`}
						title="5G Policy Studio"
					>
						{isCollapsed ? '5G' : '5G Policy Studio'}
					</h2>
				</div>
				<nav className="px-4 flex-1 overflow-y-auto">
					<ul className="space-y-1">
						{menuItems.map((item) => (
							<li key={item.to}>
								<NavLink 
									to={item.to}
									end={item.end}
									className={({ isActive }) =>
										`block px-3 py-2 rounded-md transition-colors ${
											isActive
												? "bg-white shadow-sm"
												: "hover:bg-white/70"
										} ${isCollapsed ? 'flex justify-center' : 'flex items-center gap-3'}`
									}
									title={isCollapsed ? item.label : ""}
								>
									<span className="text-lg">{item.icon}</span>
									{!isCollapsed && <span>{item.label}</span>}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
				
				{/* Collapse button anchored to bottom */}
				<div className="p-4 border-t border-gray-300">
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="w-full px-3 py-2 hover:bg-white/70 rounded-md transition-colors flex items-center justify-center gap-2 text-gray-700 bg-white/30"
						aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						title={isCollapsed ? 'Expand' : 'Collapse'}
					>
						<span className="text-lg">
							{isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						</span>
						{!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
					</button>
				</div>
			</aside>

			{/* content area where child routes render */}
			<div className="flex-1">
				<Outlet />
			</div>
		</div>
	);
}
