import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getGPT4oModel } from "@/lib/azure-openai";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

interface ChatRequest {
	messages: ChatMessage[];
	userId?: string;
	businessContext?: {
		industry?: string;
		employeeCount?: number;
		totalEmissions?: number;
		breakdown?: Array<{
			category: string;
			kgCO2e: number;
			percent: number;
		}>;
		topEmissionSource?: string;
		recommendations?: string[];
	};
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as ChatRequest;
		const { messages, businessContext } = body;

		if (!messages || messages.length === 0) {
			return NextResponse.json(
				{ error: "Messages are required" },
				{ status: 400 },
			);
		}

		// Build context-aware system prompt
		const systemPrompt = buildSystemPrompt(businessContext);

		// Generate response using Azure OpenAI
		const result = await generateText({
			model: getGPT4oModel(),
			system: systemPrompt,
			messages: messages.map((m) => ({
				role: m.role,
				content: m.content,
			})),
			temperature: 0.7,
			maxTokens: 500,
		});

		return NextResponse.json({
			message: result.text,
		});
	} catch (error) {
		console.error("Chat API error:", error);
		return NextResponse.json(
			{
				error: "Failed to generate response",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

function buildSystemPrompt(businessContext?: {
	industry?: string;
	employeeCount?: number;
	totalEmissions?: number;
	breakdown?: Array<{
		category: string;
		kgCO2e: number;
		percent: number;
	}>;
	topEmissionSource?: string;
	recommendations?: string[];
}): string {
	const basePrompt = `You are EcoPilot, a friendly and knowledgeable sustainability assistant specializing in helping businesses reduce their carbon footprint.

**YOUR PERSONALITY:**
- Warm, encouraging, and supportive
- Expert in sustainability and environmental science
- Practical and action-oriented
- Use emojis occasionally to be friendly (🌱, 🌍, ♻️, 💚, ⚡, 🚗, 🏢)
- Keep responses concise but informative (2-4 sentences typically)

**YOUR EXPERTISE:**
- Carbon footprint calculation and reduction strategies
- Energy efficiency and renewable energy
- Sustainable transportation and commuting
- Waste reduction and circular economy
- Green procurement and supply chain
- Employee engagement in sustainability
- Industry-specific best practices
- Cost-benefit analysis of sustainability initiatives

**YOUR APPROACH:**
- Answer questions clearly and accurately
- Provide specific, actionable advice
- Reference real data and benchmarks when relevant
- Acknowledge uncertainty when appropriate
- Encourage progress over perfection
- Celebrate small wins and improvements
- Connect environmental benefits to business benefits (cost savings, employee satisfaction, brand value)

**IMPORTANT RULES:**
- Stay focused on sustainability and environmental topics
- If asked about non-environmental topics, politely redirect to sustainability
- Be honest about trade-offs and challenges
- Don't make up statistics - use general knowledge or acknowledge when you don't have specific data
- Keep responses conversational and easy to understand
- Avoid jargon unless necessary, and explain technical terms`;

	if (businessContext) {
		const contextInfo: string[] = [];

		if (businessContext.industry) {
			contextInfo.push(`Industry: ${businessContext.industry}`);
		}
		if (businessContext.employeeCount) {
			contextInfo.push(`Employee count: ${businessContext.employeeCount}`);
		}
		if (businessContext.totalEmissions) {
			contextInfo.push(
				`Current annual emissions: ${businessContext.totalEmissions.toLocaleString()} kg CO2e`,
			);
		}

		// Add detailed emissions breakdown
		if (businessContext.breakdown && businessContext.breakdown.length > 0) {
			contextInfo.push("\n**EMISSIONS BREAKDOWN:**");
			for (const item of businessContext.breakdown) {
				contextInfo.push(
					`- ${item.category}: ${item.kgCO2e.toLocaleString()} kg CO2e (${item.percent.toFixed(1)}%)`,
				);
			}
		}

		// Add top emission source
		if (businessContext.topEmissionSource) {
			contextInfo.push(
				`\n**LARGEST EMISSION SOURCE:** ${businessContext.topEmissionSource}`,
			);
		}

		// Add existing recommendations
		if (businessContext.recommendations && businessContext.recommendations.length > 0) {
			contextInfo.push("\n**EXISTING RECOMMENDATIONS:**");
			for (const rec of businessContext.recommendations) {
				contextInfo.push(`- ${rec}`);
			}
		}

		if (contextInfo.length > 0) {
			return `${basePrompt}

**BUSINESS CONTEXT:**
${contextInfo.join("\n")}

**IMPORTANT:** You have access to this business's complete carbon footprint data. When users ask questions:
- Reference specific numbers from their emissions breakdown
- Provide advice tailored to their largest emission sources
- Compare their emissions to industry benchmarks when relevant
- Suggest specific actions based on their actual data
- Help them understand what the numbers mean in practical terms

Use this context to provide highly relevant and personalized advice. Always reference their specific situation when appropriate.`;
		}
	}

	return basePrompt;
}
