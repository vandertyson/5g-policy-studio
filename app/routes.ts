export default [
	{
		file: "routes/layout.tsx",
		children: [
			{ file: "routes/home.tsx", index: true },
			{ file: "routes/deployment.tsx", path: "deployment" },
			{ file: "routes/designer.tsx", path: "designer" },
			{ file: "routes/management.tsx", path: "management" },
			{ file: "routes/explorer.tsx", path: "explorer" },
		],
	},
] as const;
