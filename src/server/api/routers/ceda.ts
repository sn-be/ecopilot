import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { cedaSpendingEntries, onboardingData } from "@/server/db/schema";

export const cedaRouter = createTRPCRouter({
	/**
	 * Add a new CEDA spending entry
	 */
	addEntry: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				category: z.string(),
				spendAmount: z.number().positive(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get user's country from onboarding data
			const userData = await ctx.db.query.onboardingData.findFirst({
				where: eq(onboardingData.userId, input.userId),
			});

			if (!userData?.country) {
				throw new Error(
					"No country found in onboarding data. Please complete onboarding first.",
				);
			}

			// Call the CEDA API to calculate emissions
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ceda`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						category: input.category,
						country: userData.country,
						spend_amount: input.spendAmount,
					}),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					error.error ?? "Failed to calculate emissions from CEDA API",
				);
			}

			const result = (await response.json()) as {
				country: string;
				category: string;
				spend_amount_usd: number;
				emission_factor_kg_co2e_per_usd: number;
				total_emissions_kg_co2e: number;
			};

			// Save the entry to database
			const [entry] = await ctx.db
				.insert(cedaSpendingEntries)
				.values({
					userId: input.userId,
					category: result.category,
					spendAmount: result.spend_amount_usd,
					emissionFactor: result.emission_factor_kg_co2e_per_usd,
					totalEmissions: result.total_emissions_kg_co2e,
					country: result.country,
					description: input.description ?? null,
				})
				.returning();

			return entry;
		}),

	/**
	 * Get all CEDA spending entries for a user
	 */
	getEntries: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const entries = await ctx.db.query.cedaSpendingEntries.findMany({
				where: eq(cedaSpendingEntries.userId, input.userId),
				orderBy: (cedaSpendingEntries, { desc }) => [
					desc(cedaSpendingEntries.createdAt),
				],
			});

			return entries;
		}),

	/**
	 * Get total emissions from all CEDA entries for a user
	 */
	getTotalEmissions: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const entries = await ctx.db.query.cedaSpendingEntries.findMany({
				where: eq(cedaSpendingEntries.userId, input.userId),
			});

			const totalEmissions = entries.reduce(
				(sum, entry) => sum + entry.totalEmissions,
				0,
			);
			const totalSpend = entries.reduce(
				(sum, entry) => sum + entry.spendAmount,
				0,
			);

			return {
				totalEmissions,
				totalSpend,
				entryCount: entries.length,
			};
		}),

	/**
	 * Delete a CEDA spending entry
	 */
	deleteEntry: publicProcedure
		.input(
			z.object({
				id: z.number(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify the entry belongs to the user
			const entry = await ctx.db.query.cedaSpendingEntries.findFirst({
				where: eq(cedaSpendingEntries.id, input.id),
			});

			if (!entry) {
				throw new Error("Entry not found");
			}

			if (entry.userId !== input.userId) {
				throw new Error("Unauthorized");
			}

			await ctx.db
				.delete(cedaSpendingEntries)
				.where(eq(cedaSpendingEntries.id, input.id));

			return { success: true };
		}),
});

