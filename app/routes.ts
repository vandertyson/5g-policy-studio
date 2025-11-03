import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	{
		file: "routes/layout.tsx",
		children: [
			{ file: "routes/home.tsx", index: true },
			{ file: "routes/deployment.tsx", path: "deployment" },
			{ file: "routes/deployment/create.tsx", path: "deployment/create" },
			{ file: "routes/deployment/$id.tsx", path: "deployment/:id" },
			{ file: "routes/designer.tsx", path: "designer" },			
			{ file: "routes/explorer.tsx", path: "explorer" },
			{ file: "routes/management.tsx", path: "management" },
		],
	},
] as const satisfies RouteConfig;
