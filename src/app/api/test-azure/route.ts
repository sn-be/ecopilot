import { NextResponse } from "next/server";
import { env } from "@/env";

export async function GET() {
	try {
		// Test 1: List all deployments
		const listResponse = await fetch(
			`${env.AZURE_OPENAI_ENDPOINT}/openai/deployments?api-version=${env.AZURE_OPENAI_API_VERSION}`,
			{
				headers: {
					"api-key": env.AZURE_OPENAI_API_KEY,
				},
			},
		);

		const deployments = await listResponse.json();

		// Test 2: Try to call your specific deployment
		const testResponse = await fetch(
			`${env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${env.AZURE_OPENAI_API_VERSION}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"api-key": env.AZURE_OPENAI_API_KEY,
				},
				body: JSON.stringify({
					messages: [{ role: "user", content: "Hello" }],
					max_tokens: 10,
				}),
			},
		);

		const testResult = await testResponse.json();

		return NextResponse.json({
			config: {
				endpoint: env.AZURE_OPENAI_ENDPOINT,
				deploymentName: env.AZURE_OPENAI_DEPLOYMENT_NAME,
				apiVersion: env.AZURE_OPENAI_API_VERSION,
				hasApiKey: !!env.AZURE_OPENAI_API_KEY,
			},
			listDeploymentsStatus: listResponse.status,
			availableDeployments: deployments,
			testCallStatus: testResponse.status,
			testCallResult: testResult,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
			},
			{ status: 500 },
		);
	}
}
