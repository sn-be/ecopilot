import { createAzure } from "@ai-sdk/azure";
import { env } from "@/env";

/**
 * Azure OpenAI provider instance configured with environment variables
 */
export const azure = createAzure({
	apiKey: env.AZURE_OPENAI_API_KEY,
	resourceName: env.AZURE_OPENAI_ENDPOINT,
	apiVersion: env.AZURE_OPENAI_API_VERSION,
});

/**
 * Get the configured GPT-4o model
 */
export function getGPT4oModel() {
	return azure(env.AZURE_OPENAI_DEPLOYMENT_NAME);
}
