import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { onboardingData } from "@/server/db/schema";

export const onboardingRouter = createTRPCRouter({
	// Get current onboarding data for a user
	get: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.onboardingData.findFirst({
				where: eq(onboardingData.userId, input.userId),
			});

			return data ?? null;
		}),

	// Save Step 1: Business Information
	saveStep1: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				businessName: z.string().min(1, "Business name is required"),
				industry: z.string().min(1, "Industry is required"),
				country: z.string().min(1, "Country is required"),
				postalCode: z.string().min(1, "Postal code is required"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.onboardingData.findFirst({
				where: eq(onboardingData.userId, input.userId),
			});

			if (existing) {
				// Update existing record
				await ctx.db
					.update(onboardingData)
					.set({
						businessName: input.businessName,
						industry: input.industry,
						country: input.country,
						postalCode: input.postalCode,
						currentStep: 2, // Move to next step
					})
					.where(eq(onboardingData.userId, input.userId));
			} else {
				// Create new record
				await ctx.db.insert(onboardingData).values({
					userId: input.userId,
					businessName: input.businessName,
					industry: input.industry,
					country: input.country,
					postalCode: input.postalCode,
					currentStep: 2,
				});
			}

			return { success: true };
		}),

	// Save Step 2: Team & Space
	saveStep2: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				numberOfEmployees: z.number().min(1, "Number of employees is required"),
				locationSize: z.number().min(1, "Location size is required"),
				locationUnit: z.enum(["sqft", "sqm"]),
				ownOrRent: z.enum(["own", "rent"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(onboardingData)
				.set({
					numberOfEmployees: input.numberOfEmployees,
					locationSize: input.locationSize,
					locationUnit: input.locationUnit,
					ownOrRent: input.ownOrRent,
					currentStep: 3,
				})
				.where(eq(onboardingData.userId, input.userId));

			return { success: true };
		}),

	// Save Step 3: Energy Use
	saveStep3: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				monthlyElectricityKwh: z.number().optional(),
				monthlyElectricityAmount: z.number().optional(),
				electricityCurrency: z.string().optional(),
				heatingFuel: z.string().optional(),
				monthlyHeatingAmount: z.number().optional(),
				heatingUnit: z.string().optional(),
				energyDataSkipped: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(onboardingData)
				.set({
					monthlyElectricityKwh: input.monthlyElectricityKwh,
					monthlyElectricityAmount: input.monthlyElectricityAmount,
					electricityCurrency: input.electricityCurrency,
					heatingFuel: input.heatingFuel,
					monthlyHeatingAmount: input.monthlyHeatingAmount,
					heatingUnit: input.heatingUnit,
					energyDataSkipped: input.energyDataSkipped,
					currentStep: 4,
				})
				.where(eq(onboardingData.userId, input.userId));

			return { success: true };
		}),

	// Save Step 4: Operations & Complete
	saveStep4: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				hasVehicles: z.boolean(),
				numberOfVehicles: z.number().optional(),
				employeeCommutePattern: z.string(),
				businessFlightsPerYear: z.number(),
				weeklyTrashBags: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(onboardingData)
				.set({
					hasVehicles: input.hasVehicles,
					numberOfVehicles: input.numberOfVehicles,
					employeeCommutePattern: input.employeeCommutePattern,
					businessFlightsPerYear: input.businessFlightsPerYear,
					weeklyTrashBags: input.weeklyTrashBags,
					currentStep: 5,
					completedAt: new Date(),
				})
				.where(eq(onboardingData.userId, input.userId));

			return { success: true };
		}),
});
