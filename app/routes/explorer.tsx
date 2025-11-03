import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Breadcrumb, Button, Card, Input, Menu, Space, Tag, Row, Col } from "antd";
import {
	BookOutlined,
	ProjectOutlined,
	AppstoreOutlined,
	BranchesOutlined,
	ApiOutlined,
	SettingOutlined,
	DatabaseOutlined,
	TeamOutlined,
	BulbOutlined,
} from "@ant-design/icons";

type Mod = { key: string; label: string };
type Group = { key: string; title: string; children: Mod[] };

export function meta() {
	return [{ title: "Explorer - 5G Policy Studio" }];
}

// Same hierarchy as Application Configuration + NEW top-level sections
const HIERARCHY: Group[] = [
	{
		key: "introduction",
		title: "Introduction",
		children: [
			{ key: "intro-overview", label: "Overview" },
			{ key: "intro-quickstart", label: "Quick Start" },
		],
	},
	{
		key: "core-concept",
		title: "Core Concept",
		children: [
			{ key: "concept-overview", label: "Overview" },
			{ key: "concept-architecture", label: "Architecture" },
			{ key: "concept-domain-model", label: "Domain Model" },
		],
	},
	{
		key: "platform",
		title: "Platform",
		children: [
			{ key: "platform-overview", label: "Overview" },
			{ key: "platform-kubernetes", label: "Kubernetes" },
			{ key: "platform-aws", label: "AWS" },
			{ key: "platform-mano", label: "MANO" },
		],
	},
	{
		key: "designer",
		title: "Designer",
		children: [
			{ key: "designer-overview", label: "Overview" },
			{ key: "designer-ui", label: "UI Guide" },
			{ key: "designer-dsl", label: "DSL Reference" },
		],
	},
	{
		key: "gateway",
		title: "Gateway",
		children: [
			{ key: "gateway-overview", label: "Overview" },
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
			{ key: "engine-overview", label: "Overview" },
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
			{ key: "registry-overview", label: "Overview" },
			{ key: "reg-cache", label: "AWS ElasticCache" },
			{ key: "reg-codec", label: "vOCS Product Catalog" },
			{ key: "reg-storage", label: "Amazon Aurora" },
		],
	},
	{
		key: "subs",
		title: "Subscription Management",
		children: [
			{ key: "subs-overview", label: "Overview" },
			{ key: "sub-abm", label: "vOCS ABM" },
			{ key: "sub-udr", label: "UDR" },
			{ key: "sub-custom", label: "Custom" },
		],
	},
	{
		key: "intel",
		title: "Intelligence & Analytics",
		children: [
			{ key: "intel-overview", label: "Overview" },
			{ key: "intel-mcp", label: "MCP Server" },
			{ key: "intel-agent", label: "AI Agent" },
		],
	},
];

// NEW: icon map for group labels
const GROUP_ICONS: Record<string, React.ReactNode> = {
	"introduction": <BookOutlined />,
	"core-concept": <BulbOutlined />,
	"platform": <AppstoreOutlined />,
	"designer": <ProjectOutlined />,
	"gateway": <ApiOutlined />,
	"engine": <SettingOutlined />,
	"registry": <DatabaseOutlined />,
	"subs": <TeamOutlined />,
	"intel": <BranchesOutlined />,
};

// NEW: styled group label for Menu SubMenu title
function NavGroupLabel({ title, icon }: { title: string; icon?: React.ReactNode }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<div
				style={{
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					width: 22,
					height: 22,
					borderRadius: 6,
					background: "#EEF2FF",
					border: "1px solid #E5E7EB",
					color: "#3730A3",
				}}
			>
				{icon ?? <BookOutlined />}
			</div>
			<span style={{ fontWeight: 700, color: "#0F172A" }}>{title}</span>
		</div>
	);
}

// NEW: styled child label
function NavItemLabel({ text }: { text: string }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<span style={{ width: 6, height: 6, borderRadius: 999, background: "#CBD5E1", display: "inline-block" }} />
			<span style={{ color: "#334155" }}>{text}</span>
		</div>
	);
}

function toMenuItems(groups: Group[], q: string) {
	const ql = q.trim().toLowerCase();
	return groups
		.map((g) => {
			const children = g.children
				.filter((m) => (!ql ? true : m.label.toLowerCase().includes(ql)))
				.map((m) => ({
					key: m.key,
					label: <NavItemLabel text={m.label} />,
				}));
			// CHANGED: use styled group label with icon
			if (!ql || children.length > 0) {
				return { key: g.key, label: <NavGroupLabel title={g.title} icon={GROUP_ICONS[g.key]} />, children };
			}
			return null;
		})
		.filter(Boolean) as any[];
}

// NEW: helpers to derive module metadata/content
function findGroupByMod(id?: string) {
	for (const g of HIERARCHY) if (g.children.some((m) => m.key === id)) return g;
	return null;
}
function moduleTitle(id?: string) {
	return HIERARCHY.flatMap((g) => g.children).find((m) => m.key === id)?.label ?? id ?? "Module";
}
function moduleDoc(id?: string) {
	const group = findGroupByMod(id)?.title ?? "Module";
	const title = moduleTitle(id);
	const intro = "Comprehensive overview, concepts, and integration notes for this module.";
	const bullets =
		id === "nwdaf-analytics-info"
			? ["Analytics info endpoints", "Supported dimensions/metrics", "Rate limiting and caching"]
			: id === "reg-codec"
			? ["Domain model", "Catalog APIs", "Versioning strategy"]
			: ["Capabilities", "APIs", "Deployment notes"];
	return { group, title, intro, bullets };
}

// NEW: bold, highlighted section header component
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
	<div
		style={{
			display: "inline-flex",
			alignItems: "center",
			gap: 8,
			padding: "6px 10px",
			background: "#F1F5F9",
			border: "1px solid #E2E8F0",
			borderRadius: 8,
			fontWeight: 800,
			color: "#0F172A",
			letterSpacing: 0.3,
			margin: "10px 0 8px",
		}}
	>
		<span style={{ width: 6, height: 6, borderRadius: 999, background: "#3B82F6", display: "inline-block" }} />
		<span style={{ textTransform: "uppercase", fontSize: 12 }}>{children}</span>
	</div>
);

export default function Explorer() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const selected = params.get("module") || undefined;

	const [q, setQ] = React.useState("");
	const menuItems = React.useMemo(() => toMenuItems(HIERARCHY, q), [q]);

	// NEW: default selection = Introduction/Overview
	const defaultModule = "intro-overview";
	const effectiveSelected = selected ?? defaultModule;

	// manage collapsible state (open parent of effective selection)
	const [openKeys, setOpenKeys] = React.useState<string[]>([]);
	React.useEffect(() => {
		for (const g of HIERARCHY) {
			if (g.children.some((m) => m.key === effectiveSelected)) {
				setOpenKeys((prev) => (prev.includes(g.key) ? prev : [...prev, g.key]));
				break;
			}
		}
	}, [effectiveSelected]);

	// derive selected module doc (always defined via effectiveSelected)
	const doc = React.useMemo(() => moduleDoc(effectiveSelected), [effectiveSelected]);

	return (
		<div className="p-6">
			<div style={{ display: "flex", height: "100%", minHeight: "calc(100vh - 80px)" }}>
				{/* Left nav */}
				<aside
					style={{
						width: 300,
						borderRight: "1px solid #E5E7EB",
						background: "#FFFFFF",
						padding: 12,
						borderRadius: 12,              // CHANGED: rounded
						boxShadow: "0 4px 14px rgba(2,6,23,0.06)", // CHANGED: soft shadow
						display: "flex",
						flexDirection: "column",
						gap: 10,
					}}
				>
					{/* CHANGED: small "Contents" chip */}
					<div
						style={{
							alignSelf: "flex-start",
							padding: "4px 10px",
							borderRadius: 999,
							background: "#F1F5F9",
							border: "1px solid #E2E8F0",
							color: "#0F172A",
							fontWeight: 800,
							fontSize: 11,
							letterSpacing: 0.4,
							textTransform: "uppercase",
						}}
					>
						Contents
					</div>
					<Input.Search placeholder="Search content" allowClear onSearch={(v) => setQ(v)} onChange={(e) => setQ(e.target.value)} />
					<div style={{ overflow: "auto", flex: 1 }}>
						<Menu
							mode="inline"
							items={menuItems}
							openKeys={openKeys}
							onOpenChange={(keys) => setOpenKeys(keys as string[])}
							selectedKeys={[effectiveSelected]}
							onClick={(info) => {
								if (!HIERARCHY.some((g) => g.key === info.key)) {
									const sp = new URLSearchParams(location.search);
									sp.set("module", info.key);
									navigate(`/explorer?${sp.toString()}`);
								}
							}}
							// CHANGED: tighter indent and cleaner background
							inlineIndent={18}
							style={{ borderRight: 0, background: "transparent" }}
						/>
					</div>
				</aside>

				{/* Main content — always show module detail (default: Introduction/Overview) */}
				<main style={{ flex: 1, padding: 20, background: "#F8FAFC" }}>
					<div style={{ maxWidth: 1100, margin: "0 auto" }}>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
							{/* CHANGED: breadcrumb root = Explorer */}
							<Breadcrumb items={[{ title: "Explorer" }, { title: doc.group }, { title: doc.title }]} />
							<Space>
								<Button onClick={() => window.open("#", "_blank")}>API Explorer</Button>
								<Button onClick={() => window.open("#", "_blank")}>Developer tutorials</Button>
								<Button
									onClick={() => {
										// go back to default (Introduction/Overview)
										const sp = new URLSearchParams(location.search);
										sp.delete("module");
										navigate(`/explorer?${sp.toString()}`);
									}}
								>
									Back to Introduction
								</Button>
							</Space>
						</div>

						<Card>
							<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
								{/* CHANGED: make main title more prominent */}
								<h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#0F172A" }}>{doc.title}</h1>
								<Tag color="blue">Docs</Tag>
							</div>
							<div style={{ color: "#475569", marginBottom: 16 }}>{doc.intro}</div>

							<img
								alt="diagram"
								src="https://dummyimage.com/960x220/e5e7eb/111827.png&text=Architecture+Overview"
								style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
							/>

							{/* CHANGED: highlighted section header */}
							<SectionHeader>Key topics</SectionHeader>
							<ul style={{ paddingLeft: 18, color: "#334155" }}>
								{doc.bullets.map((b) => (
									<li key={b} style={{ lineHeight: "22px" }}>{b}</li>
								))}
							</ul>

							{/* CHANGED: highlighted section header */}
							<SectionHeader>Resources</SectionHeader>
							<Space wrap>
								<Button type="link" href="#" target="_blank">Overview</Button>
								<Button type="link" href="#" target="_blank">Configuration Guide</Button>
								<Button type="link" href="#" target="_blank">Operational Runbook</Button>
							</Space>
						</Card>

						{/* Optional: keep Get started/Featured/Recent below if desired (omitted for brevity) */}
						{/* ...existing code... */}
					</div>
				</main>
			</div>
		</div>
	);
}
