import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Breadcrumb, Button, Card, Input, Menu, Space, Tag, Select } from "antd";
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

// NEW: derive sample API specs per module (demo only)
type ApiSpec = { method: "GET" | "POST" | "PUT" | "DELETE"; path: string; summary?: string };
function apiSpecsFor(modKey: string): ApiSpec[] {
	if (modKey === "nwdaf-analytics-info")
		return [
			{ method: "GET", path: "/analytics/v1/info", summary: "List analytics info" },
			{ method: "GET", path: "/analytics/v1/info/{id}", summary: "Get analytics by id" },
			{ method: "POST", path: "/analytics/v1/query", summary: "Query analytics" },
		];
	if (modKey === "npcf-sm-policycontrol")
		return [
			{ method: "GET", path: "/pcf-sm/v1/policies", summary: "List SM policies" },
			{ method: "POST", path: "/pcf-sm/v1/policies", summary: "Create SM policy" },
			{ method: "GET", path: "/pcf-sm/v1/policies/{id}", summary: "Get SM policy" },
		];
	if (modKey.startsWith("npcf-am"))
		return [
			{ method: "GET", path: "/pcf-am/v1/policies", summary: "List AM policies" },
			{ method: "POST", path: "/pcf-am/v1/policies", summary: "Create AM policy" },
		];
	// default generic endpoints
	return [
		{ method: "GET", path: `/${modKey}/v1/resources`, summary: "List resources" },
		{ method: "POST", path: `/${modKey}/v1/resources`, summary: "Create resource" },
		{ method: "GET", path: `/${modKey}/v1/resources/{id}`, summary: "Get resource" },
	];
}

// NEW: small method tag for API list
function MethodTag({ method }: { method: ApiSpec["method"] }) {
	const color =
		method === "GET" ? "#10B981" :
		method === "POST" ? "#3B82F6" :
		method === "PUT" ? "#F59E0B" :
		"#EF4444";
	return (
		<span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 46, height: 22, borderRadius: 6, fontSize: 12, fontWeight: 800, color: "#fff", background: color }}>
			{method}
		</span>
	);
}

// NEW: extract {param} names from path
function parsePathParams(path: string): string[] {
	const m = path.matchAll(/{([\w-]+)}/g);
	return Array.from(m, (x) => x[1]);
}

// NEW: build final URL from base, path, params, query
function buildUrl(base: string, path: string, params: Record<string, string>, query: string) {
	let p = path.replace(/{([\w-]+)}/g, (_, key) => encodeURIComponent(params[key] ?? `{${key}}`));
	if (query && query.trim().length > 0) {
		const q = query.startsWith("?") ? query.slice(1) : query;
		p = `${p}?${q}`;
	}
	return `${base}${p}`;
}

export default function Explorer() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const selected = params.get("module") || undefined;

	const [q, setQ] = React.useState("");
	const menuItems = React.useMemo(() => toMenuItems(HIERARCHY, q), [q]);

	// default selection = Introduction/Overview
	const defaultModule = "intro-overview";
	const effectiveSelected = selected ?? defaultModule;

	// keep parent open
	const [openKeys, setOpenKeys] = React.useState<string[]>([]);
	React.useEffect(() => {
		for (const g of HIERARCHY) {
			if (g.children.some((m) => m.key === effectiveSelected)) {
				setOpenKeys((prev) => (prev.includes(g.key) ? prev : [...prev, g.key]));
				break;
			}
		}
	}, [effectiveSelected]);

	// current doc
	const doc = React.useMemo(() => moduleDoc(effectiveSelected), [effectiveSelected]);

	// CHANGED: only version selector remains in header actions
	const [version, setVersion] = React.useState<string>("v2.1");
	const versionOptions = React.useMemo(() => ["v2.1", "v2.0", "v1.9"].map(v => ({ label: v, value: v })), []);

	return (
		<div className="p-6">
			<div style={{ display: "flex", height: "100%", minHeight: "calc(100vh - 80px)" }}>
				{/* Left nav (styled) */}
				<aside
					style={{
						width: 300,
						borderRight: "1px solid #E5E7EB",
						background: "#FFFFFF",
						padding: 12,
						borderRadius: 12,
						boxShadow: "0 4px 14px rgba(2,6,23,0.06)",
						display: "flex",
						flexDirection: "column",
						gap: 10,
					}}
				>
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
							inlineIndent={18}
							style={{ borderRight: 0, background: "transparent" }}
						/>
					</div>
				</aside>

				{/* Main content — Documentation only */}
				<main style={{ flex: 1, padding: 20, background: "#F8FAFC" }}>
					<div style={{ margin: "0 auto" }}>
						{/* Header: breadcrumb + version select (only) */}
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
							<Breadcrumb items={[{ title: "Explorer" }, { title: doc.group }, { title: doc.title }]} />
							<Space>
								<Select value={version} onChange={setVersion} options={versionOptions} style={{ width: 120 }} size="middle" />
							</Space>
						</div>

						<Card>
							<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
								<h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#0F172A" }}>{doc.title}</h1>
								<Tag color="blue">Docs</Tag>
							</div>
							<div style={{ color: "#475569", marginBottom: 16 }}>{doc.intro}</div>

							<img
								alt="diagram"
								src="https://dummyimage.com/960x220/e5e7eb/111827.png&text=Architecture+Overview"
								style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
							/>

							<SectionHeader>Key topics</SectionHeader>
							<ul style={{ paddingLeft: 18, color: "#334155" }}>
								{doc.bullets.map((b) => (
									<li key={b} style={{ lineHeight: "22px" }}>{b}</li>
								))}
							</ul>

							<SectionHeader>Resources</SectionHeader>
							<Space wrap>
								<Button type="link" href="#" target="_blank">Overview</Button>
								<Button type="link" href="#" target="_blank">Configuration Guide</Button>
								<Button type="link" href="#" target="_blank">Operational Runbook</Button>
							</Space>
						</Card>
					</div>
				</main>
			</div>
		</div>
	);
}
