import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Breadcrumb, Button, Card, Input, Menu, Space, Tag, Row, Col } from "antd";

type Mod = { key: string; label: string };
type Group = { key: string; title: string; children: Mod[] };

export function meta() {
	return [{ title: "Explorer - 5G Policy Studio" }];
}

// Same hierarchy as Application Configuration + NEW top-level sections
const HIERARCHY: Group[] = [
	// NEW: additional top-level sections
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
			{ key: "concept-architecture", label: "Architecture" },
			{ key: "concept-domain-model", label: "Domain Model" },
		],
	},
	{
		key: "platform",
		title: "Platform",
		children: [
			{ key: "platform-kubernetes", label: "Kubernetes" },
			{ key: "platform-aws", label: "AWS" },
			{ key: "platform-mano", label: "MANO" },
		],
	},
	{
		key: "designer",
		title: "Designer",
		children: [
			{ key: "designer-ui", label: "UI Guide" },
			{ key: "designer-dsl", label: "DSL Reference" },
		],
	},
	// Existing sections
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

function toMenuItems(groups: Group[], q: string) {
	const ql = q.trim().toLowerCase();
	return groups
		.map((g) => {
			const children = g.children
				.filter((m) => (!ql ? true : m.label.toLowerCase().includes(ql)))
				.map((m) => ({ key: m.key, label: m.label }));
			// CHANGED: return submenu (collapsible) instead of group
			if (!ql || children.length > 0) {
				return { key: g.key, label: g.title, children };
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

export default function Explorer() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const selected = params.get("module") || undefined;

	const [q, setQ] = React.useState("");
	const menuItems = React.useMemo(() => toMenuItems(HIERARCHY, q), [q]);

	// CHANGED: manage collapsible state
	const [openKeys, setOpenKeys] = React.useState<string[]>([]);
	React.useEffect(() => {
		if (!selected) return;
		for (const g of HIERARCHY) {
			if (g.children.some((m) => m.key === selected)) {
				setOpenKeys((prev) => (prev.includes(g.key) ? prev : [...prev, g.key]));
				break;
			}
		}
	}, [selected]);

	// NEW: derive selected module doc
	const doc = React.useMemo(() => (selected ? moduleDoc(selected) : null), [selected]);

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
						onOpenChange={(keys) => setOpenKeys(keys as string[])}
						selectedKeys={selected ? [selected] : []}
						onClick={(info) => {
							// leaf keys are module ids — keep user on /explorer with query (no 404)
							if (!HIERARCHY.some((g) => g.key === info.key)) {
								const sp = new URLSearchParams(location.search);
								sp.set("module", info.key);
								navigate(`/explorer?${sp.toString()}`);
							}
						}}
						style={{ borderRight: 0 }}
					/>
				</div>
			</aside>

			{/* Main content — conditional: module detail vs homepage */}
			<main style={{ flex: 1, padding: 20, background: "#F8FAFC" }}>
				<div style={{ maxWidth: 1100, margin: "0 auto" }}>
					{doc ? (
						// Module detail view (when a submenu is selected)
						<>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
								<Breadcrumb items={[{ title: "Developer Guides" }, { title: doc.group }, { title: doc.title }]} />
								<Space>
									<Button onClick={() => window.open("#", "_blank")}>API Explorer</Button>
									<Button onClick={() => window.open("#", "_blank")}>Developer tutorials</Button>
									<Button
										onClick={() => {
											const sp = new URLSearchParams(location.search);
											sp.delete("module");
											navigate(`/explorer?${sp.toString()}`);
										}}
									>
										Back to Home
									</Button>
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
						</>
					) : (
						// Homepage (default when no module is selected)
						<>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
								<Breadcrumb items={[{ title: "Developer Guides" }, { title: "Documentation Home" }]} />
								<Space>
									<Button onClick={() => window.open("#", "_blank")}>API Explorer</Button>
									<Button onClick={() => window.open("#", "_blank")}>Developer tutorials</Button>
								</Space>
							</div>

							<Card style={{ marginBottom: 16 }}>
								<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
									<h1 style={{ margin: 0 }}>Documentation</h1>
									<Tag color="blue">Home</Tag>
								</div>
								<div style={{ color: "#475569", marginBottom: 12 }}>
									Browse architecture, APIs, configuration, and integration guides for the 5G Policy Platform.
								</div>
								<Input.Search placeholder="Search documentation" enterButton="Search" onSearch={(v) => setQ(v)} />
							</Card>

							<h3 style={{ marginTop: 8, marginBottom: 8 }}>Get started</h3>
							<Row gutter={[16, 16]}>
								{HIERARCHY.map((g) => {
									const first = g.children[0]?.key;
									return (
										<Col key={g.key} xs={24} sm={12} md={8}>
											<Card
												hoverable
												onClick={() => {
													if (first) {
														const sp = new URLSearchParams(location.search);
														sp.set("module", first);
														navigate(`/explorer?${sp.toString()}`);
													}
												}}
												style={{ cursor: first ? "pointer" : "default" }}
											>
												<div style={{ fontWeight: 800, marginBottom: 6 }}>{g.title}</div>
												<div style={{ color: "#64748B", minHeight: 38 }}>
													{g.children.slice(0, 3).map((m) => m.label).join(" · ")}
													{g.children.length > 3 ? " · …" : ""}
												</div>
												<div style={{ marginTop: 10 }}>
													<Button type="link" onClick={(e) => { e.stopPropagation(); if (first) { const sp = new URLSearchParams(location.search); sp.set("module", first); navigate(`/explorer?${sp.toString()}`); } }}>
														Open {first ? first : "module"}
													</Button>
												</div>
											</Card>
										</Col>
									);
								})}
							</Row>

							<h3 style={{ marginTop: 20, marginBottom: 8 }}>Featured resources</h3>
							<Row gutter={[16, 16]}>
								<Col xs={24} md={12}>
									<Card>
										<div style={{ fontWeight: 700, marginBottom: 6 }}>Platform overview</div>
										<div style={{ color: "#64748B", marginBottom: 8 }}>High-level architecture and components.</div>
										<Space>
											<Button type="link" href="#" target="_blank">Read</Button>
											<Button type="link" href="#" target="_blank">Architecture diagram</Button>
										</Space>
									</Card>
								</Col>
								<Col xs={24} md={12}>
									<Card>
										<div style={{ fontWeight: 700, marginBottom: 6 }}>Security & IAM</div>
										<div style={{ color: "#64748B", marginBottom: 8 }}>TLS/mTLS, OAuth2 and best practices.</div>
										<Space>
											<Button type="link" href="#" target="_blank">TLS guide</Button>
											<Button type="link" href="#" target="_blank">OAuth2 patterns</Button>
										</Space>
									</Card>
								</Col>
							</Row>

							<h3 style={{ marginTop: 20, marginBottom: 8 }}>Recently updated</h3>
							<Row gutter={[16, 16]}>
								{[
									{ key: "nwdaf-analytics-info", label: "nwdaf-analytics-info" },
									{ key: "reg-codec", label: "vOCS Product Catalog" },
									{ key: "ctl-ue", label: "UE Policy Controller" },
								].map((m) => (
									<Col key={m.key} xs={24} md={8}>
										<Card
											hoverable
											onClick={() => {
												const sp = new URLSearchParams(location.search);
												sp.set("module", m.key);
												navigate(`/explorer?${sp.toString()}`);
											}}
										>
											<div style={{ fontWeight: 700 }}>{m.label}</div>
											<div style={{ color: "#64748B" }}>Updated 2 days ago</div>
										</Card>
									</Col>
								))}
							</Row>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
