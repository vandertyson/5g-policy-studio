import React, { useState } from "react";
import { useNavigate } from "react-router";

export function meta() {
	return [{ title: "Create Deployment - 5G Policy Studio" }];
}

export default function CreateDeployment() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [type, setType] = useState("");

	function onCreate(e: React.FormEvent) {
		e.preventDefault();
		// TODO: call API to create
		navigate("/deployment");
	}

	return (
		<div className="p-6">
			<header className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create Deployment</h2>
			</header>

			<form onSubmit={onCreate} className="space-y-4 max-w-lg">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
					<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Type</label>
					<input value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
				</div>

				<div className="pt-4">
					<button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
				</div>
			</form>
		</div>
	);
}
