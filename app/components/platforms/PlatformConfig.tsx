import React from "react";
import { Form, Input, Select, Button, Descriptions } from "antd";

type Platform = "kubernetes" | "aws" | "mano" | "custom";
export function PlatformConfig({
	platform,
	initial,
	mode = "view",
	onChange,
	onSave,
	onCancel,
}: {
	platform: Platform;
	initial?: Record<string, string>;
	mode?: "view" | "edit";
	onChange?: (cfg: Record<string, string>) => void;
	onSave?: (cfg: Record<string, string>) => void;
	onCancel?: () => void;
}) {
	const [form] = Form.useForm();
	React.useEffect(() => {
		form.setFieldsValue(initial ?? {});
	}, [initial, form]);

	// helpers
	const Field = ({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder?: string; type?: "text" | "password" }) => (
		<Form.Item name={name} label={label}>
			{type === "password" ? <Input.Password placeholder={placeholder} /> : <Input placeholder={placeholder} />}
		</Form.Item>
	);

	if (mode === "view") {
		// Read-only display
		return (
			<Descriptions column={1} bordered>
				{platform === "mano" && (
					<>
						<Descriptions.Item label="MANO Server URL">{initial?.serverUrl ?? "-"}</Descriptions.Item>
						<Descriptions.Item label="MANO API Key">{initial?.apiKey ? "••••••••" : "-"}</Descriptions.Item>
						<Descriptions.Item label="Tenant / Project">{initial?.tenant ?? "-"}</Descriptions.Item>
					</>
				)}
				{platform === "aws" && (
					<>
						<Descriptions.Item label="AWS Access Key ID">{initial?.accessKey ? initial?.accessKey : "-"}</Descriptions.Item>
						<Descriptions.Item label="AWS Secret Access Key">{initial?.secretKey ? "••••••••" : "-"}</Descriptions.Item>
						<Descriptions.Item label="Region">{initial?.region ?? "-"}</Descriptions.Item>
					</>
				)}
				{platform === "kubernetes" && (
					<>
						<Descriptions.Item label="Kube API Server">{initial?.kubeApi ?? "-"}</Descriptions.Item>
						<Descriptions.Item label="Namespace">{initial?.namespace ?? "-"}</Descriptions.Item>
						<Descriptions.Item label="Service Account Token">{initial?.token ? "••••••••" : "-"}</Descriptions.Item>
					</>
				)}
				{platform === "custom" && (
					<>
						<Descriptions.Item label="Endpoint">{initial?.endpoint ?? "-"}</Descriptions.Item>
						<Descriptions.Item label="API Key / Secret">{initial?.key ? "••••••••" : "-"}</Descriptions.Item>
						<Descriptions.Item label="Notes">{initial?.notes ?? "-"}</Descriptions.Item>
					</>
				)}
			</Descriptions>
		);
	}

	// edit mode: show form with Save/Cancel
	return (
		<Form
			form={form}
			layout="vertical"
			initialValues={initial ?? {}}
			onValuesChange={(_, all) => onChange?.(all)}
			onFinish={(vals) => onSave?.(vals)}
		>
			{platform === "mano" && (
				<>
					<Field name="serverUrl" label="MANO Server URL" placeholder="https://mano.example.org" />
					<Field name="apiKey" label="MANO API Key" type="password" />
					<Field name="tenant" label="Tenant / Project" />
				</>
			)}
			{platform === "aws" && (
				<>
					<Field name="accessKey" label="AWS Access Key ID" />
					<Field name="secretKey" label="AWS Secret Access Key" type="password" />
					<Form.Item name="region" label="Region">
						<Select>
							<Select.Option value="us-east-1">us-east-1</Select.Option>
							<Select.Option value="eu-central-1">eu-central-1</Select.Option>
							<Select.Option value="ap-southeast-1">ap-southeast-1</Select.Option>
						</Select>
					</Form.Item>
				</>
			)}
			{platform === "kubernetes" && (
				<>
					<Field name="kubeApi" label="Kube API Server" placeholder="https://kube.example.com" />
					<Field name="namespace" label="Namespace" />
					<Field name="token" label="Service Account Token" type="password" />
				</>
			)}
			{platform === "custom" && (
				<>
					<Field name="endpoint" label="Endpoint" />
					<Field name="key" label="API Key / Secret" type="password" />
					<Form.Item name="notes" label="Notes">
						<Input.TextArea rows={3} />
					</Form.Item>
				</>
			)}

			<Form.Item>
				<div style={{ display: "flex", gap: 8 }}>
					<Button type="primary" htmlType="submit">
						Save
					</Button>
					<Button onClick={() => onCancel?.()}>Cancel</Button>
				</div>
			</Form.Item>
		</Form>
	);
}
