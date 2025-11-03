import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Breadcrumb, Button, Card, Input, Menu, Space, Tag, Select, Tabs } from "antd";
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

// NEW: quick deployment list to pick a base URL (mirrors Deployment screen)
const MY_DEPLOYMENTS: 
	{ id: string; name: string; platform: "kubernetes" | "mano" | "aws"; baseUrl: string }[] = [
	{ id: "1", name: "vOCS-testbed", platform: "kubernetes", baseUrl: "https://kube.example.com" },
	{ id: "2", name: "vOCS-1M", platform: "mano", baseUrl: "https://10.175.124.48:9000/" }, // example from prompt
	{ id: "3", name: "BCTTLL",  platform: "mano", baseUrl: "https://mano.example.org" },
	{ id: "4", name: "Germadept", platform: "aws", baseUrl: "https://ec2-3-85-123-45.compute-1.amazonaws.com:8080" }, // example from prompt
	];

// NEW: small required (*) mark
const RequiredMark = () => <span style={{ color: "#EF4444", marginLeft: 4 }}>*</span>;

// CHANGED: TabChip — add horizontal padding for the label text
function TabChip({ text, active }: { text: string; active?: boolean }) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 0,
				padding: "0 12px", // added horizontal padding
				fontWeight: 900,
				fontSize: 13, // larger
				color: active ? "#0F172A" : "#64748B",
				lineHeight: 1.2,
				textTransform: "uppercase",
				letterSpacing: 0.2,
			}}
		>
			{text}
		</span>
	);
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

	// NEW: API Tool state based on current module
	const specs = React.useMemo(() => apiSpecsFor(effectiveSelected), [effectiveSelected]);
	const groupKey = React.useMemo(() => findGroupByMod(effectiveSelected)?.key ?? "", [effectiveSelected]);
	const hasApi = specs.length > 0 && !effectiveSelected.includes("overview") && !effectiveSelected.startsWith("intro-");
	const hasCLI = ["engine", "registry", "designer"].includes(groupKey);
	const hasMCP = groupKey === "intel";
	const canOpenTool = true;

	// tool open state (existing)
	const [apiOpen, setApiOpen] = React.useState(false);

	// existing API Tool state (baseUrl, method, pathParams, query, headersJson, body, resp, etc.)
	const [selIdx, setSelIdx] = React.useState(0);
	const currentSpec = specs[selIdx] ?? specs[0];
	const [baseUrl, setBaseUrl] = React.useState("https://api.example.com");
	const [method, setMethod] = React.useState<"GET" | "POST" | "PUT" | "DELETE">(currentSpec?.method ?? "GET");
	const [pathParams, setPathParams] = React.useState<Record<string, string>>({});
	const [query, setQuery] = React.useState("");
	const [headersJson, setHeadersJson] = React.useState('{"Content-Type":"application/json"}');
	const [body, setBody] = React.useState('{\n  "example": true\n}');
	const [respStatus, setRespStatus] = React.useState<string>("");
	const [respHeaders, setRespHeaders] = React.useState<string>("");
	const [respBody, setRespBody] = React.useState<string>("");

	// Reset tool when open or module changes
	React.useEffect(() => {
		setSelIdx(0);
		setBaseUrl("https://api.example.com");
		setMethod(currentSpec?.method ?? "GET");
		setPathParams({});
		setQuery("");
		setHeadersJson('{"Content-Type":"application/json"}');
		setBody('{\n  "example": true\n}');
		setRespStatus("");
		setRespHeaders("");
		setRespBody("");
	}, [effectiveSelected, apiOpen]); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		setMethod(currentSpec?.method ?? "GET");
	}, [selIdx]); // keep method in sync with selected spec

	async function sendToolRequest() {
		try {
			setRespStatus("Requesting...");
			setRespHeaders("");
			setRespBody("");
			const finalUrl = buildUrl(baseUrl, currentSpec?.path ?? "/", pathParams, query);
			let headers: Record<string, string> = {};
			try { headers = headersJson ? JSON.parse(headersJson) : {}; } catch {}
			const init: RequestInit = { method, headers };
			if (method !== "GET" && body) init.body = body;
			const res = await fetch(finalUrl, init);
			setRespStatus(`${res.status} ${res.statusText}`);
			const hs: string[] = [];
			res.headers.forEach((v, k) => hs.push(`${k}: ${v}`));
			setRespHeaders(hs.join("\n"));
			const text = await res.text();
			setRespBody(text);
		} catch (e: any) {
			setRespStatus("Request failed");
			setRespHeaders("");
			setRespBody(String(e?.message ?? e));
		}
	}

	// helpers for API Tool actions
	const currentUrl = React.useMemo(
		() => buildUrl(baseUrl, currentSpec?.path ?? "/", pathParams, query),
		[baseUrl, currentSpec?.path, pathParams, query]
	);

	function prettyBody() {
		try {
			const parsed = JSON.parse(body);
			setBody(JSON.stringify(parsed, null, 2));
		} catch {
			// ignore if not JSON
		}
	}

	function addAccessToken() {
		try {
			const h = headersJson ? JSON.parse(headersJson) : {};
			h.Authorization = h.Authorization || "Bearer <token>";
			setHeadersJson(JSON.stringify(h, null, 2));
		} catch {
			setHeadersJson(JSON.stringify({ Authorization: "Bearer <token>" }, null, 2));
		}
	}

	// NEW: add OTP header helper
	function addOtp() {
		try {
			const h = headersJson ? JSON.parse(headersJson) : {};
			h["X-OTP"] = h["X-OTP"] || "<otp>";
			setHeadersJson(JSON.stringify(h, null, 2));
		} catch {
			setHeadersJson(JSON.stringify({ "X-OTP": "<otp>" }, null, 2));
		}
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// ignore
		}
	}

	function toCurl(): string {
		const parts: string[] = [];
		parts.push(`curl -X ${method} ${JSON.stringify(currentUrl)}`);
		try {
			const h = headersJson ? JSON.parse(headersJson) as Record<string, string> : {};
			Object.entries(h).forEach(([k, v]) => parts.push(`-H ${JSON.stringify(`${k}: ${v}`)}`));
		} catch {
			// ignore invalid headers
		}
		if ((specs[selIdx]?.method ?? currentSpec?.method) !== "GET" && body?.trim()) {
			parts.push(`--data-raw ${JSON.stringify(body)}`);
		}
		return parts.join(" ");
	}

	function exportCurl() {
		copyToClipboard(toCurl());
	}

	// NEW: Tool tab state
	type ToolTab = "api" | "cli" | "mcp";
	const [activeToolTab, setActiveToolTab] = React.useState<ToolTab>("api");
	React.useEffect(() => {
		// Default to API tab for all modules
		setActiveToolTab("api");
	}, [effectiveSelected, apiOpen]);

	// CLI tab helpers
	const cliCommand = React.useMemo(() => {
		const mod = effectiveSelected;
		const base = baseUrl || "https://api.example.com";
		return [
			`vocli --base ${JSON.stringify(base)} ${mod} list`,
			`vocli --base ${JSON.stringify(base)} ${mod} get --id <id>`,
			`vocli --base ${JSON.stringify(base)} ${mod} create --file payload.json`,
		].join("\n");
	}, [baseUrl, effectiveSelected]);

	// MCP tab state/helpers
	const [mcpAgentId, setMcpAgentId] = React.useState("agent-001");
	const [mcpBody, setMcpBody] = React.useState('{\n  "task": "analyze",\n  "params": {\n    "sample": true\n  }\n}');
	const [mcpRespStatus, setMcpRespStatus] = React.useState<string>("");
	const [mcpRespHeaders, setMcpRespHeaders] = React.useState<string>("");
	const [mcpRespBody, setMcpRespBody] = React.useState<string>("");
	function prettyMcpBody() {
		try { setMcpBody(JSON.stringify(JSON.parse(mcpBody), null, 2)); } catch {}
	}
	async function sendMcp() {
		try {
			setMcpRespStatus("Requesting...");
			setMcpRespHeaders(""); setMcpRespBody("");
			const url = `${baseUrl.replace(/\/+$/,"")}/mcp/v1/agents/${encodeURIComponent(mcpAgentId)}/invoke`;
			let headers: Record<string, string> = {};
			try { headers = headersJson ? JSON.parse(headersJson) : {}; } catch {}
			headers["Content-Type"] = headers["Content-Type"] || "application/json";
			const res = await fetch(url, { method: "POST", headers, body: mcpBody });
			setMcpRespStatus(`${res.status} ${res.statusText}`);
			const hs: string[] = []; res.headers.forEach((v, k) => hs.push(`${k}: ${v}`)); setMcpRespHeaders(hs.join("\n"));
			setMcpRespBody(await res.text());
		} catch (e: any) {
			setMcpRespStatus("Request failed"); setMcpRespHeaders(""); setMcpRespBody(String(e?.message ?? e));
		}
	}

	return (
		<div className="p-6">
			{/* NEW: dedicated scrollbar styles for the TOC area */}
			<style>{`
				.toc-scroll {
					overflow: auto;
					scrollbar-gutter: stable;
					scrollbar-width: thin;                /* Firefox */
					scrollbar-color: #94A3B8 #F1F5F9;     /* Firefox */
				}
				.toc-scroll::-webkit-scrollbar {
					width: 10px;                          /* Chrome/Edge/Safari */
				}
				.toc-scroll::-webkit-scrollbar-track {
					background: #F1F5F9;
					border-radius: 8px;
				}
				.toc-scroll::-webkit-scrollbar-thumb {
					background: #94A3B8;
					border-radius: 8px;
					border: 2px solid #F1F5F9;
				}
				.toc-scroll:hover::-webkit-scrollbar-thumb {
					background: #64748B;
				}
			`}</style>

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
							fontSize: 18,
							letterSpacing: 0.4,
							textTransform: "uppercase",
						}}
					>
						Contents
					</div>
					<Input.Search placeholder="Search content" allowClear onSearch={(v) => setQ(v)} onChange={(e) => setQ(e.target.value)} />
					{/* CHANGED: add className to get a dedicated scrollbar only for the TOC list */}
					<div className="toc-scroll" style={{ overflow: "auto", flex: 1 }}>
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
				<main style={{ flex: 1, padding: 20, background: "#F8FAFC", position: "relative" }}>
					<div style={{ margin: "0 auto" }}>
						{/* Header: breadcrumb + version select + Developer Tools */}
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
							<Breadcrumb items={[{ title: "Explorer" }, { title: doc.group }, { title: doc.title }]} />
							<Space>
								{/* CHANGED: rename to Developer Tools and always show */}
								<Button type="primary" onClick={() => setApiOpen((v) => !v)}>
									Developer Tools
								</Button>
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
								src="https://www.3gpp.org/images/articleimages/architecture_image01v3b.jpg"
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

					{/* Right sidebar tool with tabs */}
					{apiOpen ? (
						<div
							style={{
								position: "fixed",
								right: 16,
								top: 86,
								bottom: 16,
								width: 480,
								background: "#FFFFFF",
								border: "1px solid #E5E7EB",
								borderRadius: 12,
								boxShadow: "0 10px 30px rgba(2,6,23,0.16)",
								zIndex: 1000,
								display: "flex",
								flexDirection: "column",
								overflow: "hidden",
							}}
						>
							{/* Tool header */}
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #E5E7EB", background: "#F8FAFC" }}>
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<span style={{ fontWeight: 900, fontSize: 18, textTransform: "uppercase", letterSpacing: 0.4 }}>Developer Tools</span>
									<span style={{ color: "#64748B" }}>· {doc.title}</span>
								</div>
								<Button size="small" onClick={() => setApiOpen(false)}>Close</Button>
							</div>

							<div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
								{/* CHANGED: reduce top padding and vertical density */}
								<div>
									<Tabs
										activeKey={activeToolTab}
										onChange={(k) => setActiveToolTab(k as any)}
										type="line"
										size="middle" // was "large"
										tabBarGutter={8}
										tabBarStyle={{
											padding: "0 6px",
											background: "#F8FAFC",
											borderBottom: "1px solid #E5E7EB",
											margin: 0,
										}}
										items={[
											{ key: "cli", label: <TabChip active={activeToolTab === "cli"} text="CLI" /> },
											{ key: "api", label: <TabChip active={activeToolTab === "api"} text="API TOOL" /> },
											{ key: "mcp", label: <TabChip active={activeToolTab === "mcp"} text="MCP TOOL" /> },
										]}
									/>
								</div>

								{/* CHANGED: slightly tighter inner padding */}
								<div style={{ padding: 12, overflow: "auto", display: activeToolTab ? "block" : "none" }}>{/* was 16 */}
									{/* API tab */}
									{activeToolTab === "api" && (
										<div style={{ display: "grid", gap: 12 }}>
											{/* Endpoint select */}
											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ fontWeight: 700 }}>Endpoint</div>
												<Select
													value={selIdx}
													onChange={(v) => setSelIdx(v)}
													optionLabelProp="label"
													style={{ width: "100%" }}
													options={specs.map((s, i) => ({
														value: i,
														label: `${s.method} ${s.path}`,
														// custom render
														title: s.summary ?? "",
													}))}
												/>
												<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
													<MethodTag method={currentSpec?.method ?? "GET"} />
													<div style={{ fontFamily: "monospace", fontSize: 12, color: "#0F172A" }}>{currentSpec?.path}</div>
												</div>
												{currentSpec?.summary ? <div style={{ color: "#64748B", fontSize: 12 }}>{currentSpec.summary}</div> : null}
											</div>

											{/* Deployment */}
											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ fontWeight: 700 }}>Deployment<RequiredMark /></div>
												<Select
													placeholder="Select from my deployment"
													style={{ width: "100%" }}
													optionLabelProp="label"
													options={MY_DEPLOYMENTS.map((d) => ({
														value: d.id,
														label: `${d.name} (${d.platform})`,
														title: d.baseUrl,
														children: (
															<div style={{ display: "flex", flexDirection: "column" }}>
																<span style={{ fontWeight: 600 }}>
																	{d.name} <Tag style={{ marginLeft: 6 }}>{d.platform.toUpperCase()}</Tag>
																</span>
																<span style={{ color: "#64748B", fontSize: 12 }}>{d.baseUrl}</span>
															</div>
														),
													}))}
													onChange={(id: string) => {
														const dep = MY_DEPLOYMENTS.find((x) => x.id === id);
														if (dep) setBaseUrl(dep.baseUrl);
													}}
												/>
											</div>

											{/* URL */}
											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
													<div style={{ fontWeight: 700 }}>URL</div>
													<Button size="small" onClick={() => copyToClipboard(currentUrl)}>Copy</Button>
												</div>
												<pre style={{ margin: 0, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
													{currentUrl}
												</pre>
											</div>

											{/* Path params */}
											{(() => {
												const names = parsePathParams(currentSpec?.path ?? "");
												if (names.length === 0) return null;
												return (
													<div style={{ display: "grid", gap: 6 }}>
														<div style={{ fontWeight: 700 }}>Path Parameters</div>
														{names.map((n) => (
															<div key={n} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, alignItems: "center" }}>
																<label style={{ color: "#475569" }}>
																	{n}
																	<RequiredMark />
																</label>
																<Input
																	value={pathParams[n] ?? ""}
																	onChange={(e) => setPathParams((p) => ({ ...p, [n]: e.target.value }))}
																	placeholder={`Enter ${n}`}
																/>
															</div>
														))}
													</div>
												);
											})()}

											{/* Query */}
											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ fontWeight: 700 }}>Query (key=value&...)</div>
												<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. type=active&limit=10" />
											</div>

											{/* Headers */}
											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
													<div style={{ fontWeight: 700 }}>Headers</div>
													<Space size={8}>
														<Button size="small" onClick={addAccessToken}>Add access token</Button>
														{/* NEW: Add OTP button */}
														<Button size="small" onClick={addOtp}>Add OTP</Button>
													</Space>
												</div>
												<Input.TextArea rows={4} value={headersJson} onChange={(e) => setHeadersJson(e.target.value)} />
											</div>

											{/* Body */}
											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
													<div style={{ fontWeight: 700 }}>Body (JSON)</div>
													<Space size={8}>
														<Button size="small" onClick={prettyBody} disabled={(specs[selIdx]?.method ?? currentSpec?.method) === "GET"}>Pretty</Button>
														<Button size="small" onClick={() => copyToClipboard(body)}>Copy</Button>
													</Space>
												</div>
												<Input.TextArea rows={6} value={body} onChange={(e) => setBody(e.target.value)} disabled={(specs[selIdx]?.method ?? currentSpec?.method) === "GET"} />
											</div>

											{/* Send + Export cURL */}
											<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
												<Button onClick={exportCurl}>Export cURL</Button>
												<Button type="primary" onClick={sendToolRequest}>Send</Button>
											</div>

											{/* Response */}
											<div style={{ display: "grid", gap: 8 }}>
												<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
													<div style={{ fontWeight: 800 }}>Response</div>
													<Tag color={respStatus.startsWith("2") ? "green" : respStatus ? "red" : "default"}>{respStatus || "—"}</Tag>
												</div>
												<div>
													<div style={{ fontWeight: 700, marginBottom: 6 }}>Headers</div>
													<pre style={{ background: "#F8FAFC", border: "1px solid #E7E7EB", borderRadius: 8, padding: 8, minHeight: 90, whiteSpace: "pre-wrap" }}>
														{respHeaders || "—"}
													</pre>
												</div>
												<div>
													<div style={{ fontWeight: 700, marginBottom: 6 }}>Body</div>
													<pre style={{ background: "#F8FAFC", border: "1px solid #E7E7EB", borderRadius: 8, padding: 8, minHeight: 140, whiteSpace: "pre-wrap", overflowX: "auto" }}>
														{respBody || "—"}
													</pre>
												</div>
											</div>
										</div>
									)}

									{activeToolTab === "cli" && (
										<div style={{ display: "grid", gap: 12 }}>
											<div style={{ fontWeight: 700 }}>Deployment<RequiredMark /></div>
											<Select
												placeholder="Select from my deployment"
												style={{ width: "100%" }}
												optionLabelProp="label"
												options={MY_DEPLOYMENTS.map((d) => ({
													value: d.id,
													label: `${d.name} (${d.platform})`,
													title: d.baseUrl,
													children: (
														<div style={{ display: "flex", flexDirection: "column" }}>
															<span style={{ fontWeight: 600 }}>
																{d.name} <Tag style={{ marginLeft: 6 }}>{d.platform.toUpperCase()}</Tag>
															</span>
															<span style={{ color: "#64748B", fontSize: 12 }}>{d.baseUrl}</span>
														</div>
													),
												}))}
												onChange={(id: string) => {
													const dep = MY_DEPLOYMENTS.find((x) => x.id === id);
													if (dep) setBaseUrl(dep.baseUrl);
												}}
											/>

											<div style={{ fontWeight: 700 }}>Commands</div>
											<pre style={{ margin: 0, background: "#0B1023", color: "#E5E7EB", borderRadius: 8, padding: 10, fontFamily: "monospace", fontSize: 12 }}>
												{cliCommand}
											</pre>
											<div style={{ display: "flex", justifyContent: "flex-end" }}>
												<Button onClick={() => copyToClipboard(cliCommand)}>Copy</Button>
											</div>
										</div>
									)}

									{activeToolTab === "mcp" && (
										<div style={{ display: "grid", gap: 12 }}>
											<div style={{ fontWeight: 700 }}>Deployment<RequiredMark /></div>
											<Select
												placeholder="Select from my deployment"
												style={{ width: "100%" }}
												optionLabelProp="label"
												options={MY_DEPLOYMENTS.map((d) => ({
													value: d.id,
													label: `${d.name} (${d.platform})`,
													title: d.baseUrl,
													children: (
														<div style={{ display: "flex", flexDirection: "column" }}>
															<span style={{ fontWeight: 600 }}>
																{d.name} <Tag style={{ marginLeft: 6 }}>{d.platform.toUpperCase()}</Tag>
															</span>
															<span style={{ color: "#64748B", fontSize: 12 }}>{d.baseUrl}</span>
														</div>
													),
												}))}
												onChange={(id: string) => {
													const dep = MY_DEPLOYMENTS.find((x) => x.id === id);
													if (dep) setBaseUrl(dep.baseUrl);
												}}
											/>

											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ fontWeight: 700 }}>Agent ID<RequiredMark /></div>
												<Input value={mcpAgentId} onChange={(e) => setMcpAgentId(e.target.value)} placeholder="e.g. agent-001" />
											</div>

											<div style={{ display: "grid", gap: 6 }}>
												<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
													<div style={{ fontWeight: 700 }}>Payload</div>
													<Space size={8}>
														<Button size="small" onClick={prettyMcpBody}>Pretty</Button>
														<Button size="small" onClick={() => copyToClipboard(mcpBody)}>Copy</Button>
													</Space>
												</div>
												<Input.TextArea rows={8} value={mcpBody} onChange={(e) => setMcpBody(e.target.value)} />
											</div>

											<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
												<Button type="primary" onClick={sendMcp}>Send</Button>
											</div>

											<div style={{ display: "grid", gap: 8 }}>
												<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
													<div style={{ fontWeight: 800 }}>Response</div>
													<Tag color={mcpRespStatus.startsWith("2") ? "green" : mcpRespStatus ? "red" : "default"}>{mcpRespStatus || "—"}</Tag>
												</div>
												<div>
													<div style={{ fontWeight: 700, marginBottom: 6 }}>Headers</div>
													<pre style={{ background: "#F8FAFC", border: "1px solid #E7E7EB", borderRadius: 8, padding: 8, minHeight: 90, whiteSpace: "pre-wrap" }}>
														{mcpRespHeaders || "—"}
													</pre>
												</div>
												<div>
													<div style={{ fontWeight: 700, marginBottom: 6 }}>Body</div>
													<pre style={{ background: "#F8FAFC", border: "1px solid #E7E7EB", borderRadius: 8, padding: 8, minHeight: 140, whiteSpace: "pre-wrap", overflowX: "auto" }}>
														{mcpRespBody || "—"}
													</pre>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					) : null}
				</main>
			</div>
		</div>
	);
}
