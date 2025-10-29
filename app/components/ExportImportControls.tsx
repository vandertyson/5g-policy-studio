import React, { useRef } from "react";
import { Button, Space } from "antd";

export default function ExportImportControls<T extends object>({
	data,
	onImport,
	filenamePrefix = "export",
	className,
}: {
	data: T;
	onImport?: (d: T) => void;
	filenamePrefix?: string;
	className?: string;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	function exportData() {
		try {
			const blob = new Blob([JSON.stringify(data ?? {}, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${filenamePrefix}.json`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {
			alert("Export failed");
		}
	}

	function triggerImport() {
		inputRef.current?.click();
	}

	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		if (!f) return;
		try {
			const txt = await f.text();
			const parsed = JSON.parse(txt);
			onImport?.(parsed as T);
			alert("Imported (demo)");
		} catch {
			alert("Invalid JSON");
		} finally {
			e.target.value = "";
		}
	}

	return (
		<div className={className}>
			<input ref={inputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleFile} />
			<Space>
				<Button onClick={exportData}>Export</Button>
				<Button onClick={triggerImport}>Import</Button>
			</Space>
		</div>
	);
}
