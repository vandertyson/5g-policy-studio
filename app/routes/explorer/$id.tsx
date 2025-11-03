import React from "react";
import { useParams, useNavigate } from "react-router";
import { Breadcrumb, Button, Card, Input, Menu, Space, Tag } from "antd";

type Mod = { key: string; label: string };
type Group = { key: string; title: string; children: Mod[] };

const HIERARCHY: Group[] = [
	{
		key: "gateway",
		title: "Gateway",
		children: [
			{ key: "npcf-sm-policycontrol", label: "npcf-sm-policycontrol" },
			{ key: "npcf-am-policycontrol", label: "npcf-am-policycontrol" },
			{ key: "npcf-ue-policycontrol", label: "npcf-ue-policycontrol" },
			{ key: "npcf-policy-authorization", label: "npcf-policy-authorization" },
			{ key: "npcf-event-exposure", label: "npcf-event-exposure" },
			{ key: "npcf-pdtq-policycontrol", label: "npcf-pdtq-policycontrol" },
			{ key: "npcf-bdt-policycontrol", label: "npcf-bdt-policycontrol" },
			{ key: "npcf-mbs-policycontrol", label: "npcf-mbs-policycontrol" },
			{ key: "nchf-spending-limit", label: "nchf-spending-limit" },
			{ key: "nwdaf-analytics-info", label: "nwdaf-analytics-info" },
		],
	},
	{
		key: "engine",
		title: "Policy Control Engine",
		children: [
			{ key: "engine-core", label: "Engine Core" },
			{ key: "ctl-session", label: "Session Policy Controller" },
			{ key: "ctl-ue", label: "UE Policy Controller" },
			{ key: "ctl-config", label: "Configuration Controller" },
			{ key: "ctl-etc", label: "…" },
		],
	},
	{
		key: "registry",
		title: "Policy Registry",
		children: [
			{ key: "reg-cache", label: "AWS ElasticCache" },
			{ key: "reg-codec", label: "vOCS Product Catalog" },
			{ key: "reg-storage", label: "Amazon Aurora" },
		],
	},
	{
		key: "subs",
		title: "Subscription Management",
		children: [
			{ key: "sub-abm", label: "vOCS ABM" },
			{ key: "sub-udr", label: "UDR" },
			{ key: "sub-custom", label: "Custom" },
		],
	},
	{
		key: "intel",
		title: "Intelligence & Analytics",
		children: [
			{ key: "intel-mcp", label: "MCP Server" },
			{ key: "intel-agent", label: "AI Agent" },
		],
	},
];

function findGroupByMod(id?: string) {
	for (const g of HIERARCHY) if (g.children.some((m) => m.key === id)) return g;
	return null;
}

function toMenuItems(groups: Group[], q: string) {
	const ql = q.trim().toLowerCase();
	return groups
		.map((g) => {
			const children = g.children
				.filter((m) => (!ql ? true : m.label.toLowerCase().includes(ql)))
				.map((m) => ({ key: m.key, label: m.label }));
			if (!ql || children.length > 0) return { key: g.key, label: g.title, children, type: "group" as const };
			return null;
		})
		.filter(Boolean) as any[];
}

function useDocContent(id?: string) {
	const group = findGroupByMod(id)?.title ?? "Module";
	const title = HIERARCHY.flatMap((g) => g.children).find((m) => m.key === id)?.label ?? id ?? "Module";
	const intro = "Comprehensive overview, concepts, and integration notes for this module.";
	const bullets =
		id === "nwdaf-analytics-info"
			? ["Analytics info endpoints", "Supported dimensions/metrics", "Rate limiting and caching"]
			: id === "reg-codec"
			? ["Domain model", "Catalog APIs", "Versioning strategy"]
			: ["Capabilities", "APIs", "Deployment notes"];
	return { group, title, intro, bullets };
}

export function meta() {
	return [{ title: "Explorer - 5G Policy Studio" }];
}

export default function ExplorerDoc() {
	const { id } = useParams();
	const nav = useNavigate();
	const grp = findGroupByMod(id || "");
	const [q, setQ] = React.useState("");
	const menuItems = React.useMemo(() => toMenuItems(HIERARCHY, q), [q]);

	const openKeys = React.useMemo(() => (grp ? [grp.key] : []), [grp]);
	const selectedKeys = React.useMemo(() => (id ? [id] : []), [id]);

	const doc = useDocContent(id);

	return (
		<div style={{ display: "flex", height: "100%", minHeight: "calc(100vh - 80px)" }}>
			{/* Left nav */}
			<aside style={{ width: 300, borderRight: "1px solid #E5E7EB", background: "#FFFFFF", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
				<Input.Search placeholder="Search content" allowClear onSearch={(v) => setQ(v)} onChange={(e) => setQ(e.target.value)} />
				<div style={{ overflow: "auto", flex: 1 }}>
					<Menu
						mode="inline"
						items={menuItems}
						openKeys={openKeys}
						selectedKeys={selectedKeys}
						onClick={(info) => {
							// click on leaf opens module
							if (!HIERARCHY.some((g) => g.key === info.key)) nav(`/explorer/${info.key}`);
						}}
						style={{ borderRight: 0 }}
					/>
				</div>
			</aside>

			{/* Main content */}
			<main style={{ flex: 1, padding: 20, background: "#F8FAFC" }}>
				<div style={{ maxWidth: 1000, margin: "0 auto" }}>
					{/* Breadcrumb + actions */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
						<Breadcrumb items={[{ title: "Developer Guides" }, { title: doc.group }, { title: doc.title }]} />
						<Space>
							<Button onClick={() => window.open("#", "_blank")}>API Explorer</Button>
							<Button onClick={() => window.open("#", "_blank")}>Developer tutorials</Button>
						</Space>
					</div>

					<Card>
						<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
							<h1 style={{ margin: 0 }}>{doc.title}</h1>
							<Tag color="blue">Docs</Tag>
						</div>
						<div style={{ color: "#475569", marginBottom: 16 }}>{doc.intro}</div>

						<img
							alt="diagram"
							src="https://dummyimage.com/960x220/e5e7eb/111827.png&text=Architecture+Overview"
							style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
						/>

						<h3>Key topics</h3>
						<ul style={{ paddingLeft: 18, color: "#334155" }}>
							{doc.bullets.map((b) => (
								<li key={b} style={{ lineHeight: "22px" }}>{b}</li>
							))}
						</ul>

						<h3 style={{ marginTop: 20 }}>Resources</h3>
						<Space wrap>
							<Button type="link" href="#" target="_blank">Overview</Button>
							<Button type="link" href="#" target="_blank">Configuration Guide</Button>
							<Button type="link" href="#" target="_blank">Operational Runbook</Button>
						</Space>
					</Card>
				</div>
			</main>
		</div>
	);
}
