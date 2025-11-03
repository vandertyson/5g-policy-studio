import React from "react";
import { useNavigate } from "react-router";

export default function ExplorerIndex() {
	const navigate = useNavigate();
	React.useEffect(() => {
		// default to the first module in Gateway
		navigate("/explorer/npcf-sm-policycontrol", { replace: true });
	}, [navigate]);
	return null;
}
