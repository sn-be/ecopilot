// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `ecopilot_${name}`);

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
		name: d.text({ length: 256 }),
		createdAt: d
			.integer({ mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.notNull(),
		updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
	}),
	(t) => [index("name_idx").on(t.name)],
);

export const onboardingData = createTable(
	"onboarding_data",
	(d) => ({
		id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
		userId: d.text({ length: 256 }).notNull().unique(),
		// Step 1: Business Information
		businessName: d.text({ length: 256 }),
		industry: d.text({ length: 256 }),
		country: d.text({ length: 256 }),
		postalCode: d.text({ length: 50 }),
		// Step 2: Team & Space
		numberOfEmployees: d.integer(),
		locationSize: d.real(), // in sq. ft.
		locationUnit: d.text({ length: 10 }), // 'sqft' or 'sqm'
		ownOrRent: d.text({ length: 10 }), // 'own' or 'rent'
		// Step 3: Energy Use
		monthlyElectricityKwh: d.real(),
		monthlyElectricityAmount: d.real(), // $ fallback
		electricityCurrency: d.text({ length: 10 }),
		heatingFuel: d.text({ length: 50 }),
		monthlyHeatingAmount: d.real(),
		heatingUnit: d.text({ length: 20 }), // 'therms', 'gallons', etc.
		energyDataSkipped: d.integer({ mode: "boolean" }).default(false),
		// Step 4: Operations
		hasVehicles: d.integer({ mode: "boolean" }),
		numberOfVehicles: d.integer(),
		employeeCommutePattern: d.text({ length: 50 }),
		businessFlightsPerYear: d.integer(),
		weeklyTrashBags: d.integer(),
		// Tracking
		currentStep: d.integer().default(1).notNull(),
		completedAt: d.integer({ mode: "timestamp" }),
		createdAt: d
			.integer({ mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.notNull(),
		updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
	}),
	(t) => [index("userId_idx").on(t.userId)],
);

export const carbonFootprints = createTable(
	"carbon_footprint",
	(d) => ({
		id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
		userId: d.text({ length: 256 }).notNull(),
		totalKgCO2eAnnual: d.real().notNull(),
		dataSource: d.text(),
		breakdown: d.text({ mode: "json" }).notNull(), // JSON array
		calculationNotes: d.text(),
		recommendations: d.text({ mode: "json" }), // JSON array
		createdAt: d
			.integer({ mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.notNull(),
	}),
	(t) => [index("footprint_userId_idx").on(t.userId)],
);

export const dashboards = createTable(
	"dashboard",
	(d) => ({
		id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
		userId: d.text({ length: 256 }).notNull(),
		footprintId: d.integer().notNull(),
		executiveSummary: d.text().notNull(),
		prioritizedNextStep: d.text({ mode: "json" }).notNull(), // JSON object
		quickWins: d.text({ mode: "json" }).notNull(), // JSON array
		fullActionPlan: d.text({ mode: "json" }).notNull(), // JSON array
		createdAt: d
			.integer({ mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.notNull(),
	}),
	(t) => [index("dashboard_userId_idx").on(t.userId)],
);
