import { generateObject } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
	type BusinessDataInput,
	type CarbonFootprint,
	carbonFootprintSchema,
	type EcoPilotDashboard,
	ecoPilotDashboardSchema,
	energyActionsSchema,
	executiveSummarySchema,
	otherActionsSchema,
	priorityActionSchema,
	quickWinsSchema,
	transportActionsSchema,
} from "@/lib/ai-schemas";
import { getGPT4oModel } from "@/lib/azure-openai";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
	carbonFootprints,
	completedActions,
	dashboards,
	onboardingData,
} from "@/server/db/schema";

export const footprintRouter = createTRPCRouter({
	/**
	 * Calculate carbon footprint for a user based on their onboarding data
	 */
	calculateFootprint: publicProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }): Promise<CarbonFootprint> => {
			// Fetch the user's onboarding data
			const userData = await ctx.db.query.onboardingData.findFirst({
				where: eq(onboardingData.userId, input.userId),
			});

			if (!userData) {
				throw new Error("No onboarding data found for user");
			}

			// Prepare business data for AI
			const businessData: BusinessDataInput = {
				businessProfile: {
					industry: userData.industry ?? "Unknown",
					country: userData.country ?? "Unknown",
					postalCode: userData.postalCode ?? "",
					employeeCount: userData.numberOfEmployees ?? 0,
					locationSize: userData.locationSize ?? 0,
					locationUnit: (userData.locationUnit as "sqft" | "sqm") ?? "sqft",
					ownsOrRents: (userData.ownOrRent as "own" | "rent") ?? "rent",
				},
				energyData: {
					hasActualData: !userData.energyDataSkipped,
					monthlyElectricityKwh: userData.monthlyElectricityKwh ?? undefined,
					monthlyElectricityAmount:
						userData.monthlyElectricityAmount ?? undefined,
					electricityCurrency: userData.electricityCurrency ?? undefined,
					heatingFuel: userData.heatingFuel ?? undefined,
					monthlyHeatingAmount: userData.monthlyHeatingAmount ?? undefined,
					heatingUnit: userData.heatingUnit ?? undefined,
				},
				operationsData: {
					hasVehicles: userData.hasVehicles ?? false,
					numberOfVehicles: userData.numberOfVehicles ?? undefined,
					employeeCommutePattern: userData.employeeCommutePattern ?? "unknown",
					businessFlightsPerYear: userData.businessFlightsPerYear ?? 0,
					weeklyTrashBags: userData.weeklyTrashBags ?? 0,
				},
			};

			// Create the system prompt for footprint calculation
			const systemPrompt = `You are an expert carbon footprint analyst specializing in small and medium-sized businesses.

Your task is to calculate an accurate annual carbon footprint (in kg CO2e) based on the business data provided.

**CALCULATION METHODOLOGY:**

1. **Electricity Emissions:**
   - If actual kWh data is provided: Use it directly
   - If only dollar amount is provided: Estimate kWh based on average electricity rates for the country/region
   - If no data: Estimate based on industry benchmarks (e.g., CBECS data for US, similar databases for other countries)
   - Apply appropriate emission factors based on the country's electricity grid mix

2. **Heating/Natural Gas Emissions:**
   - Convert heating fuel amounts to kWh or therms as needed
   - Apply appropriate emission factors (e.g., ~5.3 kg CO2e per therm for natural gas)
   - If no data: Estimate based on building size, climate zone (from postal code), and industry type

3. **Employee Commute Emissions:**
   - Use employee count and commute pattern to estimate
   - Typical patterns: "mostly_drive" (~4,800 kg CO2e/employee/year), "mixed" (~2,400 kg), "mostly_transit" (~800 kg)
   - Adjust for country-specific factors

4. **Business Travel Emissions:**
   - Flights: ~200-300 kg CO2e per domestic flight, ~1,000-2,000 kg per international flight
   - Consider business type and flight frequency

5. **Waste Emissions:**
   - Estimate based on trash bags per week
   - Typical: ~50-100 kg CO2e per bag per year (including methane from landfill)

**IMPORTANT RULES:**
- Be conservative but realistic in estimates
- Always explain your methodology in the dataSource and calculationNotes fields
- Mark each category's status as "calculated" (actual data), "estimated" (modeled), or "not_calculated"
- Provide specific, actionable recommendations based on the largest emission sources
- Consider regional factors (climate, grid mix, transportation infrastructure)

**OUTPUT REQUIREMENTS:**
- Return a complete breakdown with all major categories
- Percentages must sum to 100%
- Include detailed notes about data quality and assumptions`;

			const userPrompt = `Calculate the carbon footprint for this business:

${JSON.stringify(businessData, null, 2)}

Provide a detailed, accurate calculation with clear methodology notes.`;

			try {
				const result = await generateObject({
					model: getGPT4oModel(),
					schema: carbonFootprintSchema,
					system: systemPrompt,
					prompt: userPrompt,
				});

				return result.object;
			} catch (error) {
				throw new Error(
					`Failed to calculate carbon footprint: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}),

	/**
	 * Generate personalized dashboard with action plan
	 */
	generateDashboard: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				footprint: carbonFootprintSchema,
			}),
		)
		.mutation(async ({ ctx, input }): Promise<EcoPilotDashboard> => {
			// Fetch the user's onboarding data
			const userData = await ctx.db.query.onboardingData.findFirst({
				where: eq(onboardingData.userId, input.userId),
			});

			if (!userData) {
				throw new Error("No onboarding data found for user");
			}

			// Prepare complete business context
			const businessContext = {
				businessProfile: {
					industry: userData.industry ?? "Unknown",
					country: userData.country ?? "Unknown",
					postalCode: userData.postalCode ?? "",
					employeeCount: userData.numberOfEmployees ?? 0,
					locationSize: userData.locationSize ?? 0,
					locationUnit: userData.locationUnit ?? "sqft",
					ownsOrRents: userData.ownOrRent ?? "rent",
				},
				footprint: {
					total_kgCO2e_annual: input.footprint.totalKgCO2eAnnual,
					data_source: input.footprint.dataSource,
					breakdown: input.footprint.breakdown,
				},
				userProgress: {
					actionsCompleted: [],
					actionsInProgress: [],
				},
			};

			// Create the system prompt for dashboard generation
			const systemPrompt = `You are "EcoPilot", a world-class sustainability consultant for small and medium-sized businesses. 

You are expert, encouraging, and focused on practical, cost-effective solutions. Your goal is to help businesses reduce their carbon footprint while improving their bottom line.

**ANALYSIS APPROACH:**

1. **Identify Hotspots:** Focus on the largest emission sources from the footprint breakdown
2. **Consider Constraints:**
   - If the business RENTS their space, do NOT recommend building modifications (solar panels, insulation upgrades, HVAC replacement)
   - If they OWN, building improvements are fair game
   - Always consider the business size and industry context
3. **Prioritize by ROI:** Balance carbon impact with cost and implementation difficulty
4. **Be Specific:** Provide actionable steps, not vague suggestions

**RECOMMENDATION QUALITY STANDARDS:**

- **Prioritized Next Step:** Should target the #1 emission source (if feasible given constraints) or the highest ROI opportunity
- **Quick Wins:** Low-cost actions that can be done in 1-3 months (e.g., LED upgrades, programmable thermostats, waste audit)
- **Full Action Plan:** Comprehensive, covering all relevant categories in priority order

**TONE & STYLE:**
- Encouraging but realistic
- Use specific numbers from the footprint data
- Explain WHY each action matters
- Include practical implementation guidance

**CRITICAL RULES:**
- NEVER recommend building modifications if ownsOrRents = "rent"
- Always consider industry context (e.g., restaurants have different needs than offices)
- Be honest about costs and payback periods
- Focus on actions with measurable impact`;

			const userPrompt = `Generate a personalized sustainability action plan for this business:

${JSON.stringify(businessContext, null, 2)}

Create an encouraging, actionable plan that addresses their biggest opportunities for carbon reduction.`;

			try {
				const result = await generateObject({
					model: getGPT4oModel(),
					schema: ecoPilotDashboardSchema,
					system: systemPrompt,
					prompt: userPrompt,
				});

				return result.object;
			} catch (error) {
				throw new Error(
					`Failed to generate dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}),

	/**
	 * Calculate footprint and generate dashboard in one call (convenience method)
	 */
	calculateAndGenerate: publicProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// First calculate the footprint
			const footprint = await ctx.db.query.onboardingData
				.findFirst({
					where: eq(onboardingData.userId, input.userId),
				})
				.then(async (userData) => {
					if (!userData) {
						throw new Error("No onboarding data found for user");
					}

					const businessData: BusinessDataInput = {
						businessProfile: {
							industry: userData.industry ?? "Unknown",
							country: userData.country ?? "Unknown",
							postalCode: userData.postalCode ?? "",
							employeeCount: userData.numberOfEmployees ?? 0,
							locationSize: userData.locationSize ?? 0,
							locationUnit: (userData.locationUnit as "sqft" | "sqm") ?? "sqft",
							ownsOrRents: (userData.ownOrRent as "own" | "rent") ?? "rent",
						},
						energyData: {
							hasActualData: !userData.energyDataSkipped,
							monthlyElectricityKwh:
								userData.monthlyElectricityKwh ?? undefined,
							monthlyElectricityAmount:
								userData.monthlyElectricityAmount ?? undefined,
							electricityCurrency: userData.electricityCurrency ?? undefined,
							heatingFuel: userData.heatingFuel ?? undefined,
							monthlyHeatingAmount: userData.monthlyHeatingAmount ?? undefined,
							heatingUnit: userData.heatingUnit ?? undefined,
						},
						operationsData: {
							hasVehicles: userData.hasVehicles ?? false,
							numberOfVehicles: userData.numberOfVehicles ?? undefined,
							employeeCommutePattern:
								userData.employeeCommutePattern ?? "unknown",
							businessFlightsPerYear: userData.businessFlightsPerYear ?? 0,
							weeklyTrashBags: userData.weeklyTrashBags ?? 0,
						},
					};

					const systemPrompt = `You are an expert carbon footprint analyst specializing in small and medium-sized businesses.

Your task is to calculate an accurate annual carbon footprint (in kg CO2e) based on the business data provided.

**CALCULATION METHODOLOGY:**

1. **Electricity Emissions:**
   - If actual kWh data is provided: Use it directly
   - If only dollar amount is provided: Estimate kWh based on average electricity rates for the country/region
   - If no data: Estimate based on industry benchmarks (e.g., CBECS data for US, similar databases for other countries)
   - Apply appropriate emission factors based on the country's electricity grid mix

2. **Heating/Natural Gas Emissions:**
   - Convert heating fuel amounts to kWh or therms as needed
   - Apply appropriate emission factors (e.g., ~5.3 kg CO2e per therm for natural gas)
   - If no data: Estimate based on building size, climate zone (from postal code), and industry type

3. **Employee Commute Emissions:**
   - Use employee count and commute pattern to estimate
   - Typical patterns: "mostly_drive" (~4,800 kg CO2e/employee/year), "mixed" (~2,400 kg), "mostly_transit" (~800 kg)
   - Adjust for country-specific factors

4. **Business Travel Emissions:**
   - Flights: ~200-300 kg CO2e per domestic flight, ~1,000-2,000 kg per international flight
   - Consider business type and flight frequency

5. **Waste Emissions:**
   - Estimate based on trash bags per week
   - Typical: ~50-100 kg CO2e per bag per year (including methane from landfill)

**IMPORTANT RULES:**
- Be conservative but realistic in estimates
- Always explain your methodology in the dataSource and calculationNotes fields
- Mark each category's status as "calculated" (actual data), "estimated" (modeled), or "not_calculated"
- Provide specific, actionable recommendations based on the largest emission sources
- Consider regional factors (climate, grid mix, transportation infrastructure)

**OUTPUT REQUIREMENTS:**
- Return a complete breakdown with all major categories
- Percentages must sum to 100%
- Include detailed notes about data quality and assumptions`;

					const userPrompt = `Calculate the carbon footprint for this business:

${JSON.stringify(businessData, null, 2)}

Provide a detailed, accurate calculation with clear methodology notes.`;

					const result = await generateObject({
						model: getGPT4oModel(),
						schema: carbonFootprintSchema,
						system: systemPrompt,
						prompt: userPrompt,
					});

					return result.object;
				});

			// Then generate the dashboard in multiple focused steps
			const userData = await ctx.db.query.onboardingData.findFirst({
				where: eq(onboardingData.userId, input.userId),
			});

			if (!userData) {
				throw new Error("No onboarding data found for user");
			}

			const businessContext = {
				businessProfile: {
					industry: userData.industry ?? "Unknown",
					country: userData.country ?? "Unknown",
					postalCode: userData.postalCode ?? "",
					employeeCount: userData.numberOfEmployees ?? 0,
					locationSize: userData.locationSize ?? 0,
					locationUnit: userData.locationUnit ?? "sqft",
					ownsOrRents: userData.ownOrRent ?? "rent",
				},
				footprint: {
					total_kgCO2e_annual: footprint.totalKgCO2eAnnual,
					data_source: footprint.dataSource,
					breakdown: footprint.breakdown,
				},
			};

			const baseSystemPrompt = `You are "EcoPilot", a world-class sustainability consultant for small and medium-sized businesses.

You are expert, encouraging, and focused on practical, cost-effective solutions.

**CRITICAL RULES:**
- If the business RENTS their space, NEVER recommend building modifications (solar panels, insulation upgrades, HVAC replacement)
- If they OWN, building improvements are fair game
- Always consider industry context (e.g., restaurants have different needs than offices)
- Be specific with numbers from the footprint data
- Focus on the largest emission sources from the breakdown

**OUTPUT FORMAT:**
- Return ONLY valid JSON data matching the requested schema
- Do NOT return a JSON Schema definition
- Do NOT include "type", "properties", or schema metadata in your response
- Return the actual data values directly`;

			// Helper function to handle AI calls
			async function generateWithSchema<T>(
				schema: z.ZodType<T>,
				prompt: string,
			) {
				const result = await generateObject({
					model: getGPT4oModel(),
					schema,
					system: baseSystemPrompt,
					prompt,
				});

				return result;
			}

			// Run all 6 AI calls in parallel for better performance
			const [
				summaryResult,
				priorityResult,
				quickWinsResult,
				energyActionsResult,
				transportActionsResult,
				otherActionsResult,
			] = await Promise.all([
				// Step 1: Executive Summary (fast, simple)
				generateWithSchema(
					executiveSummarySchema,
					`Generate an encouraging executive summary for this business:

${JSON.stringify(businessContext, null, 2)}

Be specific with numbers and realistic about opportunities.`,
				),

				// Step 2: Priority Action (focused on #1 recommendation)
				generateWithSchema(
					priorityActionSchema,
					`Identify the single most impactful action for this business:

${JSON.stringify(businessContext, null, 2)}

Target the largest emission source (${footprint.breakdown[0]?.category ?? "unknown"}: ${footprint.breakdown[0]?.percent.toFixed(1)}% of emissions).
Consider their constraints (owns or rents: ${userData.ownOrRent}).
Provide specific, actionable guidance.`,
				),

				// Step 3: Quick Wins (3-5 low-cost actions)
				generateWithSchema(
					quickWinsSchema,
					`Generate 3-5 quick wins for this business:

${JSON.stringify(businessContext, null, 2)}

Focus on:
- Low-cost actions (< $1,000)
- Quick implementation (1-3 months)
- High impact relative to cost
- Specific to their industry (${userData.industry})`,
				),

				// Step 4a: Energy Actions (2-4 items)
				generateWithSchema(
					energyActionsSchema,
					`Generate 2-4 energy-related actions for this business:

Business: ${userData.industry}, ${userData.numberOfEmployees} employees
Largest emission source: ${footprint.breakdown[0]?.category} (${footprint.breakdown[0]?.percent.toFixed(1)}%)
Owns or rents: ${userData.ownOrRent}

Focus on energy efficiency and renewable energy.
${userData.ownOrRent === "rent" ? "IMPORTANT: Do NOT recommend building modifications (solar, insulation, HVAC)." : ""}`,
				),

				// Step 4b: Transport Actions (1-3 items)
				generateWithSchema(
					transportActionsSchema,
					`Generate 1-3 transportation-related actions for this business:

Business: ${userData.industry}, ${userData.numberOfEmployees} employees
Employee commute pattern: ${userData.employeeCommutePattern}
Business flights per year: ${userData.businessFlightsPerYear}

Focus on commuting, business travel, and fleet management.`,
				),

				// Step 4c: Other Actions (1-3 items)
				generateWithSchema(
					otherActionsSchema,
					`Generate 1-3 actions for waste, supply chain, or team engagement:

Business: ${userData.industry}, ${userData.numberOfEmployees} employees
Weekly trash bags: ${userData.weeklyTrashBags}

Focus on waste reduction, sustainable procurement, or employee engagement.`,
				),
			]);

			// Merge all results into final dashboard
			const fullActionPlan = [
				...energyActionsResult.object.actions.map((action) => ({
					...action,
					category: "Energy" as const,
				})),
				...transportActionsResult.object.actions.map((action) => ({
					...action,
					category: "Transport" as const,
				})),
				...otherActionsResult.object.actions.map((action) => ({
					...action,
					category: "Waste" as const, // Default to Waste for simplicity
				})),
			];

			const dashboard: EcoPilotDashboard = {
				executiveSummary: summaryResult.object.executiveSummary,
				prioritizedNextStep: {
					title: priorityResult.object.title,
					description: priorityResult.object.description,
					impact: priorityResult.object.impact,
					cost: priorityResult.object.cost,
					paybackPeriod: priorityResult.object.paybackPeriod,
				},
				quickWins: quickWinsResult.object.quickWins,
				fullActionPlan,
			};

			// Save footprint to database
			const [savedFootprint] = await ctx.db
				.insert(carbonFootprints)
				.values({
					userId: input.userId,
					totalKgCO2eAnnual: footprint.totalKgCO2eAnnual,
					dataSource: footprint.dataSource,
					breakdown: JSON.stringify(footprint.breakdown),
					calculationNotes: footprint.calculationNotes ?? null,
					recommendations: footprint.recommendations
						? JSON.stringify(footprint.recommendations)
						: null,
				})
				.returning();

			// Save dashboard to database
			if (savedFootprint) {
				await ctx.db.insert(dashboards).values({
					userId: input.userId,
					footprintId: savedFootprint.id,
					executiveSummary: dashboard.executiveSummary,
					prioritizedNextStep: JSON.stringify(dashboard.prioritizedNextStep),
					quickWins: JSON.stringify(dashboard.quickWins),
					fullActionPlan: JSON.stringify(dashboard.fullActionPlan),
				});
			}

			return {
				footprint,
				dashboard,
			};
		}),

	/**
	 * Get the latest footprint and dashboard for a user
	 */
	getLatest: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			// Get the latest footprint
			const footprint = await ctx.db.query.carbonFootprints.findFirst({
				where: eq(carbonFootprints.userId, input.userId),
				orderBy: (carbonFootprints, { desc }) => [
					desc(carbonFootprints.createdAt),
				],
			});

			if (!footprint) {
				return null;
			}

			// Get the corresponding dashboard
			const dashboard = await ctx.db.query.dashboards.findFirst({
				where: eq(dashboards.footprintId, footprint.id),
			});

			if (!dashboard) {
				return null;
			}

			// Get onboarding data for business name
			const onboarding = await ctx.db.query.onboardingData.findFirst({
				where: eq(onboardingData.userId, input.userId),
			});

			// Get completed actions for this user
			const completed = await ctx.db.query.completedActions.findMany({
				where: eq(completedActions.userId, input.userId),
			});

			const completedActionIds = new Set(completed.map((a) => a.actionId));

			return {
				footprint: {
					...footprint,
					breakdown: JSON.parse(footprint.breakdown as string),
					recommendations: footprint.recommendations
						? JSON.parse(footprint.recommendations as string)
						: undefined,
				},
				dashboard: {
					...dashboard,
					prioritizedNextStep: JSON.parse(
						dashboard.prioritizedNextStep as string,
					),
					quickWins: JSON.parse(dashboard.quickWins as string),
					fullActionPlan: JSON.parse(dashboard.fullActionPlan as string),
				},
				businessName: onboarding?.businessName ?? null,
				completedActionIds: Array.from(completedActionIds),
			};
		}),

	/**
	 * Toggle action completion status
	 */
	toggleActionCompletion: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				actionId: z.string(),
				actionType: z.enum(["priority", "quickwin", "actionplan"]),
				completed: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.completed) {
				// Mark as completed
				await ctx.db.insert(completedActions).values({
					userId: input.userId,
					actionId: input.actionId,
					actionType: input.actionType,
				});
			} else {
				// Mark as not completed (delete the record)
				await ctx.db
					.delete(completedActions)
					.where(
						and(
							eq(completedActions.userId, input.userId),
							eq(completedActions.actionId, input.actionId),
						),
					);
			}

			return { success: true };
		}),
});
