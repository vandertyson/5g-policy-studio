import React from "react";
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	Position,
	Handle,
	useReactFlow
} from "reactflow";
import type { Edge, Node } from "reactflow";
import 'reactflow/dist/style.css';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';

// Small gold star icon
function StarIcon({ size = 12 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
				fill="#F59E0B"
				stroke="#D97706"
				strokeWidth="0.5"
			/>
		</svg>
	);
}

// NEW: small green check icon for doc items
function CheckIcon({ size = 14 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="10" fill="#10B981" />
			<path d="M8.5 12.5l2.5 2.5 4.5-5.5" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

// lightweight box label
function BoxLabel({
	title,
	subtitle,
	kpis,
	tone = "default",
	fixedHeight,
	titleSuffix,
}: {
	title: string;
	subtitle?: string;
	kpis?: { label: string; value: string }[];
	tone?: "default" | "warn" | "error" | "inactive" | "blue";
	fixedHeight?: number;
	titleSuffix?: React.ReactNode;
}) {
	// CHANGED: tinted surfaces so modules stand out against white group containers
	const accents: Record<string, { accent: string; border: string; surface: string }> = {
		// emerald (active/default)
		default: { accent: "#10B981", border: "#A7F3D0", surface: "#ECFDF5" },  // green-200 border, green-50 surface
		// amber (warnings)
		warn:    { accent: "#F59E0B", border: "#FDE68A", surface: "#FFFBEB" },  // amber-300 border, amber-50 surface
		// red (errors)
		error:   { accent: "#EF4444", border: "#FECACA", surface: "#FEF2F2" },  // red-200 border, red-50 surface
		// gray (inactive)
		inactive:{ accent: "#9CA3AF", border: "#E5E7EB", surface: "#F3F4F6" },  // gray-200 border, gray-100 surface
		// blue (active NF)
		blue:    { accent: "#3B82F6", border: "#BFDBFE", surface: "#EFF6FF" }, // NEW
	};
	const c = accents[tone] ?? accents.default;

	return (
		<div
			style={{
				position: "relative",
				// ...existing style...
				border: `1px solid ${c.border}`,
				background: c.surface,
				borderRadius: 10,
				padding: "12px 14px 20px 16px",
				height: fixedHeight ?? "auto",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				justifyContent: "flex-start",
				boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
			}}
		>
			{/* accent bar */}
			<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, background: c.accent }} />
			{/* CHANGED: title row supports a suffix icon */}
			<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{title}</div>
				{titleSuffix ? <span style={{ lineHeight: 0 }}>{titleSuffix}</span> : null}
			</div>
			{/* CHANGED: unified vertical stack for consistent gaps */}
			<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
				{subtitle ? <div style={{ fontSize: 12, color: "#64748B" }}>{subtitle}</div> : null}
				{(kpis?.length ?? 0) > 0 ? (
					<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{kpis!.map((k) => (
							<div key={k.label} style={{ fontSize: 12, lineHeight: "18px" }}>
								<span style={{ color: "#64748B" }}>{k.label}: </span>
								<span style={{ fontWeight: 600, color: "#0F172A" }}>{k.value}</span>
							</div>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
}

// group node label
function GroupLabel({ title, suffix }: { title: string; suffix?: React.ReactNode }) {
	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 8,
				border: "1px solid #E5E7EB",
				background: "#FFFFFF",
				padding: "6px 12px",
				borderRadius: 999,
				fontSize: 11,
				fontWeight: 800,
				textTransform: "uppercase",
				letterSpacing: 0.4,
				color: "#0F172A",
				boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
			}}
		>
			<span
				style={{
					display: "inline-block",
					width: 6,
					height: 6,
					borderRadius: 999,
					background: "#6366F1",
				}}
			/>
			{title}
			{suffix ? <span style={{ display: "inline-flex", marginLeft: 6 }}>{suffix}</span> : null}
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
	const [isFullscreen, setIsFullscreen] = React.useState(false);
	
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

	// NEW: refine child node base style (keeps the card doing the visuals)
	const NODE_CHILD_STYLE: React.CSSProperties = {
		width: CELL_W,
		border: "none",
		background: "transparent",
		boxShadow: "none",
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

	// Top: External NFs — keep active/inactive + subtitle(IP), no instances
	const nfs = [
		{ id: "nrf", name: "NRF", ip: "10.20.30.31:8100", active: true },
		{ id: "amf", name: "AMF", ip: "10.20.30.31:8101", active: true },
		{ id: "smf", name: "SMF", ip: "10.20.30.31:8102", active: true },
		{ id: "nef", name: "NEF", ip: "10.20.30.31:8103", active: true },
		{ id: "ims", name: "IMS", ip: "10.20.30.31:8104", active: false },
		{ id: "nwdaf", name: "NWDAF", ip: "10.20.30.31:8105", active: true },
		{ id: "chf", name: "CHF", ip: "10.20.30.31:8105", active: false },
		{ id: "udr", name: "UDR", ip: "10.20.30.31:8220", active: false },
	];

	// External NFs container and tile positions (single row)
	const nfsGroupId = "grp-nfs";
	const nfsRows = nfs.map((_, i) => ({
		id: nfs[i].id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: GROUP_HEADER_H + CONTENT_GAP_Y,
	}));
	const nfContentWidth = nfs.length * CELL_W + (nfs.length - 1) * GAP_X;
	const nfsMaxTileH = Math.max(CELL_H, ...nfs.map(n => estimateTileHeight(n.active && !!n.ip, 0)));
	const nfsGroupSize = {
		w: CONTENT_PADDING * 2 + nfContentWidth,
		h: GROUP_HEADER_H + CONTENT_GAP_Y + nfsMaxTileH + CONTENT_PADDING,
	};

	// Gateway group (single row), tight container sizing
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
	// Position gateway container is computed later based on centered layout

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
	// Gateway sizing — ignore instances (no extra info lines)
	const gatewayContentWidth = gatewayCols * CELL_W + (gatewayCols - 1) * GAP_X;
	const maxGatewayTileH = Math.max(
		CELL_H,
		...gatewayApis.map(a => estimateTileHeight(a.active ? !!a.ip : false, 0))
	);
	const gatewaySize = {
		w: CONTENT_PADDING * 2 + gatewayContentWidth,
		h: GROUP_HEADER_H + CONTENT_GAP_Y + maxGatewayTileH + CONTENT_PADDING,
	};

	// Policy Control Engine — add active and Instances
	// Policy Control Engine — add active and Instances
	const engineId = "grp-engine";
	// Engine position is computed later based on centered layout
	const controllers = [
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
	// Engine sizing — ignore instances (no extra info lines, no subtitles)
	const engineContentWidth = engineRow.length * CELL_W + (engineRow.length - 1) * GAP_X;
	const engineMaxTileH = Math.max(
		CELL_H,
		...engineRow.map(() => estimateTileHeight(false, 0))
	);
	const engineSize = {
		w: CONTENT_PADDING * 2 + engineContentWidth,
		h: ENGINE_HEADER_H + CONTENT_GAP_Y + engineMaxTileH + CONTENT_PADDING,
	};

	// Bottom groups — add active flag, subtitle + Instances per item
	const registryItems = [
		{ id: "reg-cache", title: "AWS ElasticCache", subtitle: "cache.cluster.local:6379", instances: 2, active: true },
		{ id: "reg-codec", title: "vOCS Product Catalog", subtitle: "codec.svc.local:9092", instances: 1, active: false }, // was: "Codec"
		{ id: "reg-storage", title: "Amazon Aurora", subtitle: "s3.eu-central-1.aws.com", instances: 3, active: true }, // was: "Storage"
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

	// Bottom groups sizing — ignore instances, only consider subtitle for active items
	const registryMaxH = Math.max(CELL_H, ...registryItems.map(it => estimateTileHeight(it.active && !!it.subtitle, 0)));
	const subsMaxH = Math.max(CELL_H, ...subsItems.map(it => estimateTileHeight(it.active && !!it.subtitle, 0)));
	const intelMaxH = Math.max(CELL_H, ...intelItems.map(it => estimateTileHeight(it.active && !!it.subtitle, 0)));

	const registrySize = { w: CONTENT_PADDING * 2 + (registryItems.length * CELL_W + (registryItems.length - 1) * GAP_X), h: GROUP_HEADER_H + CONTENT_GAP_Y + registryMaxH + CONTENT_PADDING };
	const subsSize = { w: CONTENT_PADDING * 2 + (subsItems.length * CELL_W + (subsItems.length - 1) * GAP_X), h: GROUP_HEADER_H + CONTENT_GAP_Y + subsMaxH + CONTENT_PADDING };
	const intelSize = { w: CONTENT_PADDING * 2 + (intelItems.length * CELL_W + (intelItems.length - 1) * GAP_X), h: GROUP_HEADER_H + CONTENT_GAP_Y + intelMaxH + CONTENT_PADDING };

	// canvas width picks widest of top rows (now uses NF group width)
	const totalWidth = Math.max(nfsGroupSize.w, gatewaySize.w, engineSize.w);
	const X_OFFSET = 20;

	// baseX offsets to center each block horizontally
	const nfsX = X_OFFSET + Math.max(0, (totalWidth - nfsGroupSize.w) / 2);
	const gatewayX = X_OFFSET + Math.max(0, (totalWidth - gatewaySize.w) / 2);
	const engineX = X_OFFSET + Math.max(0, (totalWidth - engineSize.w) / 2);

	// vertical stacking
	const nfsTopLeft = { x: nfsX, y: 0 };
	const gatewayTopLeft = { x: gatewayX, y: nfsTopLeft.y + nfsGroupSize.h + GAP_Y };
	const engineTopLeft = { x: engineX, y: gatewayTopLeft.y + gatewaySize.h + GAP_Y };

	// horizontally center 3 bottom groups with even gaps
	// horizontally center 3 bottom groups with even gaps
	const bottomY = engineTopLeft.y + engineSize.h + GAP_Y;
	const groupsTotalWidth = registrySize.w + subsSize.w + intelSize.w + 2 * BOTTOM_GROUP_GAP_X;
	const bottomBaseX = X_OFFSET + Math.max(0, (totalWidth - groupsTotalWidth) / 2);
	const registryPos = { x: bottomBaseX, y: bottomY };
	const subsPos = { x: bottomBaseX + registrySize.w + BOTTOM_GROUP_GAP_X, y: bottomY };
	const intelPos = { x: bottomBaseX + registrySize.w + BOTTOM_GROUP_GAP_X + subsSize.w + BOTTOM_GROUP_GAP_X, y: bottomY };

	const nodes: Node[] = [
		// External NFs container — CHANGED: make white like other containers
		{
			id: nfsGroupId,
			type: "group",
			position: nfsTopLeft,
			data: { label: <GroupLabel title="External NFs" /> },
			style: {
				width: nfsGroupSize.w,
				height: nfsGroupSize.h,
				border: "1px solid #E5E7EB", // was blue border
				background: "#FFFFFF",        // was blue-50
				borderRadius: 12,
				padding: 0,
				boxShadow: "0 2px 6px rgba(2,6,23,0.04)",
			},
			selectable: false,
			connectable: false,
		},
		// External NFs tiles inside the container — CHANGED: active => blue, inactive => gray
		...nfsRows.map((pos, i) => ({
			id: nfs[i].id,
			type: "box",
			parentNode: nfsGroupId,
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: {
				label: (
					<BoxLabel
						title={nfs[i].name}
						subtitle={nfs[i].active ? nfs[i].ip : undefined}
						tone={nfs[i].active ? "blue" : "inactive"} // was "default" or "inactive"
						fixedHeight={nfsMaxTileH}
						// NEW: star for NWDAF
						titleSuffix={nfs[i].id === "nwdaf" ? <StarIcon size={12} /> : undefined}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),

		// Gateway container — centered using gatewayX
		{
			id: gatewayId,
			type: "group",
			position: { x: gatewayX, y: gatewayTopLeft.y },
			targetPosition: Position.Top,
			data: { label: <GroupLabel title="Gateway" /> },
			style: {
				width: gatewaySize.w,
				height: gatewaySize.h,
				border: "1px solid #E5E7EB",
				background: "#FFFFFF",
				borderRadius: 12,
				padding: 0,
				boxShadow: "0 2px 6px rgba(2,6,23,0.04)",
			},
			selectable: false,
			connectable: false,
		},
		// Gateway API tiles — add star for nwdaf-analytics-info and npcf-ue-policycontrol
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
						tone={gatewayApis[i].active ? "default" : "inactive"}
						fixedHeight={maxGatewayTileH}
						titleSuffix={
							(gatewayApis[i].id === "api-analytics" || gatewayApis[i].id === "api-ue")
								? <StarIcon size={12} />
								: undefined
						}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),

		// Policy Control Engine — centered using engineX
		{
			id: engineId,
			type: "group",
			position: { x: engineX, y: engineTopLeft.y },
			data: { label: <GroupLabel title="Policy Control Engine" /> },
			style: {
				width: engineSize.w,
				height: engineSize.h,
				border: "1px solid #E5E7EB",
				background: "#FFFFFF",
				borderRadius: 12,
				padding: 0,
				boxShadow: "0 2px 6px rgba(2,6,23,0.04)",
			},
			selectable: false,
			connectable: false,
		},
		// Engine row: Engine Core + controllers — add star for UE Policy Controller
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
						tone={engineRow[idx].active ? "default" : "inactive"}
						fixedHeight={engineMaxTileH}
						titleSuffix={engineRow[idx].id === "ctl-ue" ? <StarIcon size={12} /> : undefined}
					/>
				),
			},
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),

		// Bottom groups — containers and items (unchanged)
		{
			id: "grp-registry",
			type: "group",
			position: registryPos,
			data: { label: <GroupLabel title="Policy Registry" /> },
			style: {
				width: registrySize.w,
				height: registrySize.h,
				border: "1px solid #E5E7EB",
				background: "#FFFFFF",
				borderRadius: 12,
				padding: 0,
				boxShadow: "0 2px 6px rgba(2,6,23,0.04)",
			},
			selectable: false,
			connectable: false,
		},
		{
			id: "grp-subs",
			type: "group",
			position: subsPos,
			data: { label: <GroupLabel title="Subscription Manager" /> },
			style: {
				width: subsSize.w,
				height: subsSize.h,
				border: "1px solid #E5E7EB",
				background: "#FFFFFF",
				borderRadius: 12,
				padding: 0,
				boxShadow: "0 2px 6px rgba(2,6,23,0.04)",
			},
			selectable: false,
			connectable: false,
		},
		{
			id: "grp-intel",
			type: "group",
			position: intelPos,
			// CHANGED: remove star from group label
			data: { label: <GroupLabel title="Intelligence & Analytics" /> },
			style: { width: intelSize.w, height: intelSize.h, border: "1px solid #E5E7EB", background: "#FFFFFF", borderRadius: 12, padding: 0, boxShadow: "0 2px 6px rgba(2,6,23,0.04)" },
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
						tone={registryItems[i].active ? "default" : "inactive"}
						fixedHeight={registryMaxH}
						// NEW: gold star for vOCS Product Catalog
						titleSuffix={registryItems[i].id === "reg-codec" ? <StarIcon size={12} /> : undefined}
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
						tone={intelItems[i].active ? "default" : "inactive"}
						fixedHeight={intelMaxH}
						// NEW: add star to AI Agent tile
						titleSuffix={intelItems[i].id === "intel-agent" ? <StarIcon size={12} /> : undefined}
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

	// NEW: context menu state shaped for popup_info design
	const [ctx, setCtx] = React.useState<{
		x: number;
		y: number;
		title: string;
		group: string;
		release: string;
		featured?: boolean;
		seeMore?: { label: string; href?: string }[];
		docs?: { label: string; href?: string }[];
	} | null>(null);

	const closeMenu = React.useCallback(() => setCtx(null), []);
	React.useEffect(() => {
		if (!ctx) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
		const onDown = (e: MouseEvent) => {
			// Don't close if clicking on the menu itself
			const target = e.target as HTMLElement;
			if (target.closest('[data-context-menu]')) {
				return;
			}
			closeMenu();
		};
		document.addEventListener("keydown", onKey);
		document.addEventListener("mousedown", onDown, true);
		return () => {
			document.removeEventListener("keydown", onKey);
			document.removeEventListener("mousedown", onDown, true);
		};
	}, [ctx, closeMenu]);

	// helpers to derive popup content
	const groupTitleMap: Record<string, string> = {
		"grp-nfs": "External NFs",
		"grp-gateway": "Gateway",
		"grp-engine": "Policy Control Engine",
		"grp-registry": "Policy Registry",
		"grp-subs": "Subscription Manager",
		"grp-intel": "Intelligence & Analytics",
	};

	function buildMenu(node: any) {
		const labelEl = node?.data?.label;
		const props: any = React.isValidElement(labelEl) ? (labelEl as any).props : {};
		const title: string = props.title ?? node?.id ?? "Module";
		const parent: string = node?.parentNode ?? "";
		const group = groupTitleMap[parent] ?? "Module";
		const featured = !!props.titleSuffix;
		// simple per-id demo content (adjust or extend as needed)
		const isCatalog = node?.id === "reg-codec";
		const isAnalytics = node?.id === "api-analytics";
		const release = "4.5.2";
		const seeMore = [
			{ label: "See More", href: "#" },
			{ label: "See More", href: "#" },
		];
		const docs = isCatalog
			? [
					{ label: "vOCS Product Catalog Technical Specification", href: "#" },
					{ label: "vOCS Product Catalog Configuration Guide", href: "#" },
					{ label: "Blog: 5 steps for product offer creation", href: "#" },
			  ]
			: isAnalytics
			? [
					{ label: "NWDAF Analytics Overview", href: "#" },
					{ label: "NWDAF API Reference", href: "#" },
					{ label: "Best practices for analytics", href: "#" },
			  ]
			: [
					{ label: `${title} Overview`, href: "#" },
					{ label: `${title} Configuration Guide`, href: "#" },
					{ label: "Operational runbook", href: "#" },
			  ];
		return { title, group, featured, release, seeMore, docs };
	}

	// Right-click handler: open menu
	const onNodeContextMenu = React.useCallback((e: React.MouseEvent, node: any) => {
		e.preventDefault();
		e.stopPropagation();
		const m = buildMenu(node);
		setCtx({ x: e.clientX, y: e.clientY, ...m });
	}, []);

	// Toggle fullscreen
	const toggleFullscreen = React.useCallback(() => {
		setIsFullscreen(prev => !prev);
	}, []);

	return (
		<div 
			style={{ 
				width: "100%", 
				height: "100%", 
				position: isFullscreen ? "fixed" : "relative",
				top: isFullscreen ? 0 : undefined,
				left: isFullscreen ? 0 : undefined,
				right: isFullscreen ? 0 : undefined,
				bottom: isFullscreen ? 0 : undefined,
				zIndex: isFullscreen ? 50000 : undefined,
				background: isFullscreen ? "#FFFFFF" : "transparent"
			}}
		>
			{/* Fullscreen toggle button */}
			<button
				onClick={toggleFullscreen}
				onMouseDown={(e) => e.stopPropagation()}
				style={{
					position: "absolute",
					top: 10,
					right: 10,
					zIndex: 10,
					width: 32,
					height: 32,
					borderRadius: 6,
					border: "1px solid #E5E7EB",
					background: "#FFFFFF",
					color: "#475569",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
					transition: "all 0.2s"
				}}
				title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
				onMouseEnter={(e) => {
					e.currentTarget.style.background = "#F3F4F6";
					e.currentTarget.style.borderColor = "#D1D5DB";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = "#FFFFFF";
					e.currentTarget.style.borderColor = "#E5E7EB";
				}}
			>
				{isFullscreen ? <FullscreenExitOutlined style={{ fontSize: 16 }} /> : <FullscreenOutlined style={{ fontSize: 16 }} />}
			</button>
			
			<ReactFlow
				nodes={nodes}
				edges={edges}
				fitView
				fitViewOptions={{ padding: 0.25 }}
				proOptions={{ hideAttribution: true }}
				nodeTypes={nodeTypes}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={true}
				panOnScroll
				panOnDrag
				zoomOnScroll
				onNodeContextMenu={onNodeContextMenu}
				onPaneClick={closeMenu}
				onPaneContextMenu={(e) => e.preventDefault()}
			>
				<Background variant={BackgroundVariant.Dots} gap={26} size={1} color="#E2E8F0" />
				<MiniMap nodeColor={() => "#CBD5E1"} nodeStrokeColor="#94A3B8" maskColor="rgba(15, 23, 42, 0.04)" pannable />
				<Controls />
			</ReactFlow>

			{/* NEW: popup_info styled context menu */}
			{ctx ? (
				<div
					data-context-menu
					style={{
						position: "fixed",
						left: ctx.x,
						top: ctx.y,
						transform: "translate(8px, 8px)",
						zIndex: 60000,
						background: "#FFFFFF",
						color: "#0F172A",
						border: "1px solid #E5E7EB",
						borderRadius: 12,
						boxShadow: "0 12px 28px rgba(2,6,23,0.18), 0 4px 10px rgba(2,6,23,0.08)",
						width: 540,
						maxWidth: "90vw",
						padding: 16,
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{/* star at top-right when featured */}
					{ctx.featured ? (
						<div style={{ position: "absolute", right: 16, top: 12 }}>
							<StarIcon size={22} />
						</div>
					) : null}

					{/* header chips */}
					<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								padding: "6px 10px",
								borderRadius: 999,
								background: "#10B981",
								color: "#fff",
								fontSize: 12,
								fontWeight: 800,
								letterSpacing: 0.3,
							}}
						>
							{ctx.group}
						</span>
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								padding: "6px 10px",
								borderRadius: 999,
								background: "#6B7280",
								color: "#fff",
								fontSize: 12,
								fontWeight: 700,
							}}
						>
							Release {ctx.release}
						</span>
					</div>

					{/* title */}
					<div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{ctx.title}</div>

					{/* two teaser rows with See More on the right */}
					<div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8, marginBottom: 8 }}>
						<div style={{ color: "#475569", fontSize: 13 }}>Overview and quick highlights of the module.</div>
						<a href={ctx.seeMore?.[0]?.href ?? "#"} style={{ color: "#2563EB", fontWeight: 700, fontSize: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "4px 8px", textDecoration: "none" }}>
							{ctx.seeMore?.[0]?.label ?? "See More"}
						</a>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8, marginBottom: 14 }}>
						<div style={{ color: "#475569", fontSize: 13 }}>Configuration and integration details.</div>
						<a href={ctx.seeMore?.[1]?.href ?? "#"} style={{ color: "#2563EB", fontWeight: 700, fontSize: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "4px 8px", textDecoration: "none" }}>
							{ctx.seeMore?.[1]?.label ?? "See More"}
						</a>
					</div>

					{/* docs list */}
					<div style={{ display: "grid", gap: 10, marginTop: 6 }}>
						{(ctx.docs ?? []).map((d) => (
							<a key={d.label} href={d.href ?? "#"} style={{ display: "flex", alignItems: "center", gap: 10, color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>
								<CheckIcon />
								<span>{d.label}</span>
							</a>
						))}
					</div>

					{/* footer */}
					<div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
						<button
							type="button"
							onClick={closeMenu}
							style={{
								minWidth: 110,
								height: 36,
								borderRadius: 8,
								border: "1px solid #CBD5E1",
								background: "#E5E7EB",
								color: "#111827",
								fontWeight: 600,
								fontSize: 14,
								cursor: "pointer",
							}}
						>
							Close
						</button>
						<button
							type="button"
							onClick={closeMenu}
							style={{
								minWidth: 120,
								height: 36,
								borderRadius: 8,
								border: "1px solid #3B82F6",
								background: "#3B82F6",
								color: "#FFFFFF",
								fontWeight: 700,
								fontSize: 14,
								cursor: "pointer",
							}}
						>
							Configure
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}
