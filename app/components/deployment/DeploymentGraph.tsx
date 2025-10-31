import React from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	Position,
	Handle
} from "reactflow";
import type { Edge, Node } from "reactflow";
import 'reactflow/dist/style.css';

// lightweight box label
function BoxLabel({
	title,
	subtitle,
	kpis,
	tone = "default",
	fixedHeight,
}: {
	title: string;
	subtitle?: string;
	kpis?: { label: string; value: string }[];
	tone?: "default" | "warn" | "error" | "inactive";
	fixedHeight?: number;
}) {
	// CHANGED: add gray scheme for inactive
	const bg =
		tone === "error" ? "#FEF2F2" :
		tone === "warn" ? "#FFFBEB" :
		tone === "inactive" ? "#F3F4F6" : // gray-100
		"#F0FDF4"; // default green
	const border =
		tone === "error" ? "#FCA5A5" :
		tone === "warn" ? "#FCD34D" :
		tone === "inactive" ? "#D1D5DB" : // gray-300
		"#86EFAC";
	return (
		<div
			style={{
				border: `1px solid ${border}`,
				background: bg,
				borderRadius: 6,
				padding: 8,
				height: fixedHeight ?? "auto",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				justifyContent: "flex-start",
			}}
		>
			<div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
			{subtitle ? <div style={{ fontSize: 11, color: "#6b7280" }}>{subtitle}</div> : null}
			{(kpis?.length ?? 0) > 0 ? (
				<div style={{ marginTop: 4 }}>
					{kpis!.map((k) => (
						<div key={k.label} style={{ fontSize: 11, lineHeight: "16px" }}>
							<span style={{ color: "#6b7280" }}>{k.label}: </span>
							<span style={{ fontWeight: 600 }}>{k.value}</span>
						</div>
					))}
				</div>
			) : null}
		</div>
	);
}

// group node label
function GroupLabel({ title }: { title: string }) {
	return (
		<div style={{ border: "1px solid #c7d2fe", background: "#eff6ff", padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3 }}>
			{title}
		</div>
	);
}

// Custom ReactFlow nodes that render no handles visually, but provide invisible handles for edges
function BoxNode({ data, id }: { data: { label: React.ReactNode }, id: string }) {
	return (
		<div style={{ position: "relative" }}>
			{/* invisible handles for edge anchoring */}
			<Handle id="top" type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			<Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			{data.label}
		</div>
	);
}
function GroupNode({ data, id }: { data: { label: React.ReactNode }, id: string }) {
	return (
		<div style={{ position: "relative" }}>
			{/* invisible handles for edge anchoring */}
			<Handle id="top" type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			<Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			{data.label}
		</div>
	);
}

type DeploymentGraphSummary = {
	endpoint?: string;
	namespace?: string;
	instances?: number;
};

export default function DeploymentGraph() {
	// layout helpers
	// Increase base sizes and gaps a bit
	const CELL_W = 200;
	const CELL_H = 76;
	const GAP_X = 26;
	const GAP_Y = 36;

	// helper to place items in a single horizontal row
	function placeRow(ids: string[], rowIndex: number) {
		return ids.map((id, i) => ({
			id,
			x: i * (CELL_W + GAP_X),
			y: rowIndex * (CELL_H + GAP_Y),
		}));
	}

	// shared style for child nodes
	const NODE_CHILD_STYLE: React.CSSProperties = {
		width: CELL_W,
		height: CELL_H,
		background: "#ffffff",
		borderRadius: 8,
		padding: 0,
	};

	// group headers
	const GROUP_HEADER_H = 36;
	const ENGINE_HEADER_H = 36;
	// uniform inner content padding and top gap
	const CONTENT_PADDING = 12;
	const CONTENT_GAP_Y = 12;
	// gap between bottom group containers
	const BOTTOM_GROUP_GAP_X = 24;

	// helper to estimate a tile height: title + optional subtitle + N info lines
	function estimateTileHeight(hasSubtitle: boolean, infoLines: number) {
		const pad = 16, titleH = 18, subtitleH = hasSubtitle ? 16 : 0;
		const extra = infoLines > 0 ? 4 + 16 * infoLines : 0;
		return pad + titleH + subtitleH + extra;
	}

	// Top: NFs (7) — mark 1–2 inactive (no instances on NFs)
	const nfs = [
		{ id: "nrf", name: "NRF", ip: "10.20.30.31:8100", active: true },
		{ id: "amf", name: "AMF", ip: "10.20.30.31:8101", active: true },
		{ id: "smf", name: "SMF", ip: "10.20.30.31:8102", active: true },
		{ id: "nef", name: "NEF", ip: "10.20.30.31:8103", active: true },
		{ id: "ims", name: "IMS", ip: "10.20.30.31:8104", active: false },  // inactive example
		{ id: "nwdaf", name: "NWDAF", ip: "10.20.30.31:8105", active: true },
		{ id: "chf", name: "CHF", ip: "10.20.30.31:8105", active: false },  // inactive example
	];
	const nfRows = placeRow(nfs.map((x) => x.id), 0);
	const nfContentWidth = nfRows.length * CELL_W + (nfRows.length - 1) * GAP_X;

	// Gateway group — add active flag and show/hide IP+Instances
	const gatewayId = "grp-gateway";
	const gatewayApis = [
		{ id: "api-sm", title: "npcf-sm-policycontrol", ip: "10.20.30.41:8080", instances: 3, active: true },
		{ id: "api-am", title: "npcf-am-policycontrol", ip: "10.20.30.42:8080", instances: 2, active: true },
		{ id: "api-ue", title: "npcf-ue-policycontrol", ip: "10.20.30.43:8080", instances: 4, active: true },
		{ id: "api-authz", title: "npcf-policy-authorization", ip: "10.20.30.44:8080", instances: 2, active: true },
		{ id: "api-event", title: "npcf-event-exposure", ip: "10.20.30.45:8080", instances: 1, active: true },
		{ id: "api-pdtq", title: "npcf-pdtq-policycontrol", ip: "10.20.30.46:8080", instances: 1, active: false }, // inactive example
		{ id: "api-bdt", title: "npcf-bdt-policycontrol", ip: "10.20.30.47:8080", instances: 1, active: true },
		{ id: "api-mbs", title: "npcf-mbs-policycontrol", ip: "10.20.30.48:8080", instances: 1, active: false }, // inactive example
		{ id: "api-sl", title: "nchf-spending-limit", ip: "10.20.30.49:8080", instances: 2, active: true },
		{ id: "api-analytics", title: "nwdaf-analytics-info", ip: "10.20.30.50:8080", instances: 2, active: true },
	];
	// Position gateway container under NFs with extra spacing
	const gatewayTopLeft = { x: 0, y: CELL_H + GAP_Y + 24 };

	// Arrange APIs in a single horizontal row
	const gatewayCols = gatewayApis.length;
	const gatewayRows: { id: string; x: number; y: number }[] = [];
	for (let i = 0; i < gatewayApis.length; i++) {
		const col = i % gatewayCols;
		const row = Math.floor(i / gatewayCols);
		gatewayRows.push({
			id: gatewayApis[i].id,
			x: CONTENT_PADDING + col * (CELL_W + GAP_X),
			y: GROUP_HEADER_H + CONTENT_GAP_Y + row * (CELL_H + GAP_Y),
		});
	}
	const gatewayContentWidth = gatewayCols * CELL_W + (gatewayCols - 1) * GAP_X;
	const maxGatewayTileH = Math.max(
		CELL_H,
		...gatewayApis.map(a => estimateTileHeight(a.active ? !!a.ip : false, a.active && a.instances ? 1 : 0))
	);
	const gatewaySize = {
		w: CONTENT_PADDING * 2 + gatewayContentWidth,
		h: GROUP_HEADER_H + CONTENT_GAP_Y + maxGatewayTileH + CONTENT_PADDING,
	};

	// Policy Control Engine — add active and Instances
	const engineId = "grp-engine";
	const engineTopLeft = { x: 0, y: gatewayTopLeft.y + gatewaySize.h + GAP_Y };
	const controllers = [
		{ id: "ctl-rating", title: "Rating Controller", instances: 2, active: true },
		{ id: "ctl-session", title: "Session Policy Controller", instances: 2, active: false }, // inactive example
		{ id: "ctl-ue", title: "UE Policy Controller", instances: 2, active: true },
		{ id: "ctl-config", title: "Configuration Controller", instances: 1, active: true },
		{ id: "ctl-etc", title: "…", instances: 1, active: true },
	];
	const engineCoreId = "engine-core";
	const engineRow = [
		{ id: engineCoreId, title: "Engine Core", isCore: true as const, instances: 3, active: true },
		...controllers.map(c => ({ id: c.id, title: c.title, isCore: false as const, instances: c.instances, active: c.active })),
	];
	const engineRowPositions = engineRow.map((item, i) => ({
		id: item.id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: ENGINE_HEADER_H + CONTENT_GAP_Y,
	}));
	const engineContentWidth = engineRow.length * CELL_W + (engineRow.length - 1) * GAP_X;
	// dynamic height based on one info line (Instances)
	const engineMaxTileH = Math.max(
		CELL_H,
		...engineRow.map(m => estimateTileHeight(false, m.active && m.instances ? 1 : 0))
	);
	const engineSize = {
		w: CONTENT_PADDING * 2 + engineContentWidth,
		h: ENGINE_HEADER_H + CONTENT_GAP_Y + engineMaxTileH + CONTENT_PADDING,
	};

	// Bottom groups — add active flag, subtitle + Instances per item
	const registryItems = [
		{ id: "reg-cache", title: "AWS ElasticCache", subtitle: "cache.cluster.local:6379", instances: 2, active: true },
		{ id: "reg-codec", title: "vOCS Product Catalog", subtitle: "codec.svc.local:9092", instances: 1, active: false }, // was: "Codec"
		{ id: "reg-storage", title: "Amazon Aurora", subtitle: "s3.eu-central-1.amazonaws.com", instances: 3, active: true }, // was: "Storage"
	];
	const subsItems = [
		{ id: "sub-abm", title: "vOCS ABM", subtitle: "10.52.3.59", instances: 2, active: true },
		{ id: "sub-udr", title: "UDR", subtitle: "udr.core.local:8080", instances: 1, active: true },
		{ id: "sub-custom", title: "Custom", subtitle: "custom.svc.local:8080", instances: 1, active: false }, // inactive example
	];
	const intelItems = [
		{ id: "intel-mcp", title: "MCP Server", subtitle: "mcp.ai.local:7000", instances: 1, active: true },
		{ id: "intel-agent", title: "AI Agent", subtitle: "agent.ai.local:7001", instances: 2, active: false }, // inactive example
	];

	const registryRows = registryItems.map((_, i) => ({
		id: registryItems[i].id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: GROUP_HEADER_H + CONTENT_GAP_Y,
	}));
	const subsRows = subsItems.map((_, i) => ({
		id: subsItems[i].id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: GROUP_HEADER_H + CONTENT_GAP_Y,
	}));
	const intelRows = intelItems.map((_, i) => ({
		id: intelItems[i].id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: GROUP_HEADER_H + CONTENT_GAP_Y,
	}));

	// dynamic sizes from content (inactive items contribute only title)
	const registryMaxH = Math.max(CELL_H, ...registryItems.map(it => estimateTileHeight(it.active && !!it.subtitle, it.active && it.instances ? 1 : 0)));
	const subsMaxH = Math.max(CELL_H, ...subsItems.map(it => estimateTileHeight(it.active && !!it.subtitle, it.active && it.instances ? 1 : 0)));
	const intelMaxH = Math.max(CELL_H, ...intelItems.map(it => estimateTileHeight(it.active && !!it.subtitle, it.active && it.instances ? 1 : 0)));
	const registrySize = { w: CONTENT_PADDING * 2 + (registryItems.length * CELL_W + (registryItems.length - 1) * GAP_X), h: GROUP_HEADER_H + CONTENT_GAP_Y + registryMaxH + CONTENT_PADDING };
	const subsSize = { w: CONTENT_PADDING * 2 + (subsItems.length * CELL_W + (subsItems.length - 1) * GAP_X), h: GROUP_HEADER_H + CONTENT_GAP_Y + subsMaxH + CONTENT_PADDING };
	const intelSize = { w: CONTENT_PADDING * 2 + (intelItems.length * CELL_W + (intelItems.length - 1) * GAP_X), h: GROUP_HEADER_H + CONTENT_GAP_Y + intelMaxH + CONTENT_PADDING };

	// canvas width picks widest of top rows
	const totalWidth = Math.max(nfContentWidth, gatewaySize.w, engineSize.w);
	const X_OFFSET = 20;
	const nfBaseX = X_OFFSET + Math.max(0, (totalWidth - nfContentWidth) / 2);
	const gatewayX = X_OFFSET + Math.max(0, (totalWidth - gatewaySize.w) / 2);
	const engineX = X_OFFSET + Math.max(0, (totalWidth - engineSize.w) / 2);

	// bottom positions (unchanged)
	const bottomY = engineTopLeft.y + engineSize.h + GAP_Y;
	const groupsTotalWidth = registrySize.w + subsSize.w + intelSize.w + 2 * BOTTOM_GROUP_GAP_X;
	const bottomBaseX = X_OFFSET + Math.max(0, (totalWidth - groupsTotalWidth) / 2);

	const registryPos = { x: bottomBaseX, y: bottomY };
	const subsPos = { x: bottomBaseX + registrySize.w + BOTTOM_GROUP_GAP_X, y: bottomY };
	const intelPos = { x: bottomBaseX + registrySize.w + BOTTOM_GROUP_GAP_X + subsSize.w + BOTTOM_GROUP_GAP_X, y: bottomY };

	const nodes: Node[] = [
		// Top NFs — show only title+IP when active, gray title-only when inactive
		...nfRows.map((pos, i) => ({
			id: nfs[i].id,
			type: "box",
			position: { x: nfBaseX + pos.x, y: pos.y },
			data: {
				label: (
					<BoxLabel
						title={nfs[i].name}
						subtitle={nfs[i].active ? nfs[i].ip : undefined}
						tone={nfs[i].active ? "default" : "inactive"}
					/>
				),
			},
			draggable: false,
			selectable: false,
			connectable: false,
			style: NODE_CHILD_STYLE,
		})),

		// Gateway container
		{
			id: gatewayId,
			type: "group",
			position: { x: gatewayX, y: gatewayTopLeft.y },
			data: { label: <GroupLabel title="Gateway" /> },
			style: { width: gatewaySize.w, height: gatewaySize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		// Gateway API tiles — active: green + IP+Instances; inactive: gray title-only
		...gatewayRows.map((pos, i) => ({
			id: gatewayApis[i].id,
			type: "box",
			parentNode: gatewayId,
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: {
				label: (
					<BoxLabel
						title={gatewayApis[i].title}
						subtitle={gatewayApis[i].active ? gatewayApis[i].ip : undefined}
						kpis={gatewayApis[i].active && gatewayApis[i].instances ? [{ label: "Instances", value: String(gatewayApis[i].instances) }] : undefined}
						tone={gatewayApis[i].active ? "default" : "inactive"}
						fixedHeight={maxGatewayTileH}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),

		// Policy Control Engine — tiles with active/inactive
		{
			id: engineId,
			type: "group",
			position: { x: engineX, y: engineTopLeft.y },
			data: { label: <GroupLabel title="Policy Control Engine" /> },
			style: { width: engineSize.w, height: engineSize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		...engineRowPositions.map((pos, idx) => ({
			id: engineRow[idx].id,
			type: "box",
			parentNode: engineId,
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: {
				label: (
					<BoxLabel
						title={engineRow[idx].title}
						kpis={engineRow[idx].active && engineRow[idx].instances ? [{ label: "Instances", value: String(engineRow[idx].instances) }] : undefined}
						tone={engineRow[idx].active ? "default" : "inactive"}
						fixedHeight={engineMaxTileH}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),

		// Bottom groups — items with active/inactive
		{
			id: "grp-registry",
			type: "group",
			position: registryPos,
			data: { label: <GroupLabel title="Policy Registry" /> },
			style: { width: registrySize.w, height: registrySize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		{
			id: "grp-subs",
			type: "group",
			position: subsPos,
			data: { label: <GroupLabel title="Subscription Manager" /> },
			style: { width: subsSize.w, height: subsSize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		{
			id: "grp-intel",
			type: "group",
			position: intelPos,
			data: { label: <GroupLabel title="Intelligence & Analytics" /> },
			style: { width: intelSize.w, height: intelSize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},

		...registryRows.map((pos, i) => ({
			id: registryItems[i].id,
			type: "box",
			parentNode: "grp-registry",
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: {
				label: (
					<BoxLabel
						title={registryItems[i].title}
						subtitle={registryItems[i].active ? registryItems[i].subtitle : undefined}
						kpis={registryItems[i].active && registryItems[i].instances ? [{ label: "Instances", value: String(registryItems[i].instances) }] : undefined}
						tone={registryItems[i].active ? "default" : "inactive"}
						fixedHeight={registryMaxH}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
		...subsRows.map((pos, i) => ({
			id: subsItems[i].id,
			type: "box",
			parentNode: "grp-subs",
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: {
				label: (
					<BoxLabel
						title={subsItems[i].title}
						subtitle={subsItems[i].active ? subsItems[i].subtitle : undefined}
						kpis={subsItems[i].active && subsItems[i].instances ? [{ label: "Instances", value: String(subsItems[i].instances) }] : undefined}
						tone={subsItems[i].active ? "default" : "inactive"}
						fixedHeight={subsMaxH}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
		...intelRows.map((pos, i) => ({
			id: intelItems[i].id,
			type: "box",
			parentNode: "grp-intel",
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: {
				label: (
					<BoxLabel
						title={intelItems[i].title}
						subtitle={intelItems[i].active ? intelItems[i].subtitle : undefined}
						kpis={intelItems[i].active && intelItems[i].instances ? [{ label: "Instances", value: String(intelItems[i].instances) }] : undefined}
						tone={intelItems[i].active ? "default" : "inactive"}
						fixedHeight={intelMaxH}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
	];

	// No edges for now
	const edges: Edge[] = [];

	// Register node types
	const nodeTypes = { box: BoxNode, group: GroupNode };

	return (
		<div style={{ width: "100%", height: "100%", position: "relative" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				fitView
				fitViewOptions={{ padding: 0.25 }}
				proOptions={{ hideAttribution: true }}
				nodeTypes={nodeTypes}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				panOnScroll
				panOnDrag
				zoomOnScroll
			>
				<Background gap={24} size={1} color="#e5e7eb" />
				<MiniMap pannable />
				<Controls />
			</ReactFlow>
		</div>
	);
}
