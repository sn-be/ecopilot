import { z } from "zod";

/**
 * Schema for the carbon footprint calculation result
 */
export const carbonFootprintSchema = z.object({
	totalKgCO2eAnnual: z
		.number()
		.describe("Total annual carbon footprint in kg CO2 equivalent"),
	dataSource: z
		.string()
		.describe(
			"Description of how the footprint was calculated (e.g., 'Based on actual utility bills' or 'Estimated from industry benchmarks')",
		),
	breakdown: z
		.array(
			z.object({
				category: z
					.string()
					.describe(
						"Category name (e.g., 'Electricity', 'Natural Gas', 'Commutes', 'Waste', 'Business Travel')",
					),
				kgCO2e: z.number().describe("Annual kg CO2e for this category"),
				percent: z.number().describe("Percentage of total footprint"),
				status: z
					.enum(["calculated", "estimated", "not_calculated"])
					.optional()
					.describe("Status of this calculation"),
				notes: z
					.string()
					.optional()
					.describe("Additional notes about this category"),
			}),
		)
		.describe("Breakdown of emissions by category"),
	calculationNotes: z
		.string()
		.optional()
		.describe(
			"Any important notes about the calculation methodology or data quality",
		),
	recommendations: z
		.array(z.string())
		.optional()
		.describe("Initial high-level recommendations based on the footprint"),
});

export type CarbonFootprint = z.infer<typeof carbonFootprintSchema>;

/**
 * Schema for the EcoPilot dashboard generation
 */
export const ecoPilotDashboardSchema = z.object({
	executiveSummary: z
		.string()
		.describe(
			"A brief (2-3 sentences), encouraging summary of the business's current carbon footprint and potential for improvement. Be specific with numbers and realistic about opportunities.",
		),
	prioritizedNextStep: z
		.object({
			title: z
				.string()
				.describe("Clear, actionable title for the #1 recommended action"),
			description: z
				.string()
				.describe(
					"Detailed explanation of what to do, why it matters, and how to get started (3-4 sentences)",
				),
			impact: z
				.enum(["High", "Medium", "Low"])
				.describe(
					"Expected carbon reduction impact (High = >20% reduction, Medium = 5-20%, Low = <5%)",
				),
			cost: z
				.enum(["$", "$$", "$$$"])
				.describe("Implementation cost ($ = <$1k, $$ = $1k-$10k, $$$ = >$10k)"),
			paybackPeriod: z
				.string()
				.describe(
					"Estimated time to recover investment through savings (e.g., 'Approx. 1.5 years', 'Immediate', 'N/A - regulatory requirement')",
				),
		})
		.describe(
			"The single most impactful action this business should take next, based on their largest emission source and constraints",
		),
	quickWins: z
		.array(
			z.object({
				title: z.string().describe("Short, actionable title"),
				description: z
					.string()
					.describe(
						"Brief explanation of the action and its benefit (1-2 sentences)",
					),
			}),
		)
		.min(3)
		.max(5)
		.describe(
			"Low-cost, high-impact actions that can be implemented quickly (within 1-3 months)",
		),
	fullActionPlan: z
		.array(
			z.object({
				category: z
					.enum(["Energy", "Transport", "Waste", "Supply Chain", "Team"])
					.describe("The category this action addresses"),
				title: z.string().describe("Clear, actionable title"),
				description: z
					.string()
					.describe(
						"Detailed explanation including specific steps and expected outcomes (2-3 sentences)",
					),
				impact: z
					.enum(["High", "Medium", "Low"])
					.describe("Expected carbon reduction impact"),
				cost: z.enum(["$", "$$", "$$$"]).describe("Implementation cost range"),
			}),
		)
		.min(8)
		.max(15)
		.describe(
			"Comprehensive, prioritized action plan covering all relevant categories. Should be ordered by impact/feasibility ratio.",
		),
});

export type EcoPilotDashboard = z.infer<typeof ecoPilotDashboardSchema>;

/**
 * Smaller, focused schemas for multi-step generation
 */

// Step 1: Executive Summary
export const executiveSummarySchema = z.object({
	executiveSummary: z
		.string()
		.describe(
			"A brief (2-3 sentences), encouraging summary of the business's current carbon footprint and potential for improvement. Be specific with numbers and realistic about opportunities.",
		),
});

// Step 2: Priority Action (simplified - no nested object)
export const priorityActionSchema = z.object({
	title: z
		.string()
		.describe("Clear, actionable title for the #1 recommended action"),
	description: z.string().describe("Detailed explanation (2-3 sentences)"),
	impact: z
		.enum(["High", "Medium", "Low"])
		.describe("Expected carbon reduction impact"),
	cost: z.enum(["$", "$$", "$$$"]).describe("Implementation cost"),
	paybackPeriod: z
		.string()
		.describe("Estimated payback period (e.g., '1.5 years', 'Immediate')"),
});

// Step 3: Quick Wins
export const quickWinsSchema = z.object({
	quickWins: z
		.array(
			z.object({
				title: z.string().describe("Short, actionable title"),
				description: z
					.string()
					.describe(
						"Brief explanation of the action and its benefit (1-2 sentences)",
					),
			}),
		)
		.min(3)
		.max(5)
		.describe(
			"Low-cost, high-impact actions that can be implemented quickly (within 1-3 months)",
		),
});

// Step 4a: Energy Actions (simplified)
export const energyActionsSchema = z.object({
	actions: z
		.array(
			z.object({
				title: z.string(),
				description: z.string(),
				impact: z.enum(["High", "Medium", "Low"]),
				cost: z.enum(["$", "$$", "$$$"]),
			}),
		)
		.min(2)
		.max(4),
});

// Step 4b: Transport Actions (simplified)
export const transportActionsSchema = z.object({
	actions: z
		.array(
			z.object({
				title: z.string(),
				description: z.string(),
				impact: z.enum(["High", "Medium", "Low"]),
				cost: z.enum(["$", "$$", "$$$"]),
			}),
		)
		.min(1)
		.max(3),
});

// Step 4c: Other Actions (simplified)
export const otherActionsSchema = z.object({
	actions: z
		.array(
			z.object({
				title: z.string(),
				description: z.string(),
				impact: z.enum(["High", "Medium", "Low"]),
				cost: z.enum(["$", "$$", "$$$"]),
			}),
		)
		.min(1)
		.max(3),
});

/**
 * Input schema for business data used in footprint calculation and dashboard generation
 */
export const businessDataInputSchema = z.object({
	businessProfile: z.object({
		industry: z.string(),
		country: z.string(),
		postalCode: z.string(),
		employeeCount: z.number(),
		locationSize: z.number(),
		locationUnit: z.enum(["sqft", "sqm"]),
		ownsOrRents: z.enum(["own", "rent"]),
	}),
	energyData: z.object({
		hasActualData: z.boolean(),
		monthlyElectricityKwh: z.number().optional(),
		monthlyElectricityAmount: z.number().optional(),
		electricityCurrency: z.string().optional(),
		heatingFuel: z.string().optional(),
		monthlyHeatingAmount: z.number().optional(),
		heatingUnit: z.string().optional(),
	}),
	operationsData: z.object({
		hasVehicles: z.boolean(),
		numberOfVehicles: z.number().optional(),
		employeeCommutePattern: z.string(),
		businessFlightsPerYear: z.number(),
		weeklyTrashBags: z.number(),
	}),
});

export type BusinessDataInput = z.infer<typeof businessDataInputSchema>;
