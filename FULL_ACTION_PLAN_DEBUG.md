# Full Action Plan Debug Guide

## 🎯 The Issue

The **Full Action Plan** step is failing with a schema validation error. This is the most complex of the 4 steps, so it's the most likely to have issues.

## 📊 Enhanced Logging Added

I've added detailed error logging that will show you:

1. **Cause** - The underlying validation error
2. **Text** - The AI's raw response (what it actually returned)
3. **Response metadata** - Request ID, timestamps, model info
4. **Token usage** - How many tokens were used
5. **Finish reason** - Why the AI stopped generating (e.g., "stop", "length", "content_filter")

## 🧪 What to Look For

When you run the calculation now, you'll see output like this:

```bash
=== Full Action Plan - Starting ===
Schema: { typeName: 'ZodObject', ... }
Prompt: Generate a comprehensive action plan (8-15 items) for this business:...

❌ Full Action Plan - Failed
=== NoObjectGeneratedError Details ===
Cause: [Validation error details]
Text (AI's raw response): {
  "fullActionPlan": [
    {
      "category": "Energy",
      "title": "LED Lighting Retrofit",
      "description": "Replace all traditional bulbs...",
      "impact": "High",
      "cost": "$"
    },
    ...
  ]
}
Response metadata: {
  "id": "chatcmpl-...",
  "timestamp": "2024-01-01T00:00:00Z",
  "modelId": "gpt-4o"
}
Token usage: {
  "promptTokens": 1234,
  "completionTokens": 567,
  "totalTokens": 1801
}
Finish reason: stop
=====================================
```

## 🔍 Common Issues with Full Action Plan

### Issue 1: Not Enough Items

**Schema requires:** 8-15 items
**AI might return:** 5-7 items

**Fix:** Adjust the schema to be more lenient:

```typescript
// In src/lib/ai-schemas.ts
export const actionPlanSchema = z.object({
  fullActionPlan: z
    .array(...)
    .min(5)  // Changed from 8
    .max(20) // Changed from 15
});
```

### Issue 2: Invalid Category

**Schema requires:** `"Energy" | "Transport" | "Waste" | "Supply Chain" | "Team"`
**AI might return:** `"Transportation"` or `"Logistics"` or `"Operations"`

**Fix:** Make category more flexible:

```typescript
category: z
  .enum(["Energy", "Transport", "Waste", "Supply Chain", "Team", "Operations", "Other"])
  .or(z.string())
  .transform(val => {
    // Map common variations
    if (val === "Transportation") return "Transport";
    if (val === "Logistics") return "Supply Chain";
    if (["Energy", "Transport", "Waste", "Supply Chain", "Team"].includes(val)) {
      return val;
    }
    return "Other";
  })
```

### Issue 3: Invalid Impact/Cost Values

**Schema requires:** `"High" | "Medium" | "Low"` and `"$" | "$$" | "$$$"`
**AI might return:** `"high"` (lowercase) or `"Very High"` or `"$$$$"`

**Fix:** Make enums case-insensitive and more flexible:

```typescript
impact: z
  .string()
  .transform(val => {
    const lower = val.toLowerCase();
    if (lower.includes("high")) return "High";
    if (lower.includes("medium") || lower.includes("moderate")) return "Medium";
    if (lower.includes("low")) return "Low";
    return "Medium"; // Default
  })
```

### Issue 4: Description Too Long

**Schema expects:** 2-3 sentences
**AI might return:** 5+ sentences or very long paragraphs

**Fix:** Add length validation:

```typescript
description: z
  .string()
  .max(500) // Limit to 500 characters
  .describe("Detailed explanation (2-3 sentences, max 500 characters)")
```

## 🛠️ Quick Fixes to Try

### Fix 1: Simplify the Schema (Recommended)

```typescript
// In src/lib/ai-schemas.ts
export const actionPlanSchema = z.object({
  fullActionPlan: z
    .array(
      z.object({
        category: z.string(), // Accept any string instead of enum
        title: z.string(),
        description: z.string(),
        impact: z.string(), // Accept any string instead of enum
        cost: z.string(), // Accept any string instead of enum
      }),
    )
    .min(5) // Lower minimum
    .max(20), // Higher maximum
});
```

### Fix 2: Make Fields Optional

```typescript
export const actionPlanSchema = z.object({
  fullActionPlan: z
    .array(
      z.object({
        category: z.string().optional().default("Other"),
        title: z.string(),
        description: z.string(),
        impact: z.string().optional().default("Medium"),
        cost: z.string().optional().default("$$"),
      }),
    )
    .min(5)
    .max(20),
});
```

### Fix 3: Improve the Prompt

```typescript
// In src/server/api/routers/footprint.ts
generateWithLogging(
  "Full Action Plan",
  actionPlanSchema,
  `Generate a comprehensive action plan for this business.

IMPORTANT FORMAT REQUIREMENTS:
- Generate EXACTLY 8-15 action items (no more, no less)
- Each item MUST have these fields:
  * category: MUST be one of: "Energy", "Transport", "Waste", "Supply Chain", "Team"
  * title: Short title (max 10 words)
  * description: 2-3 sentences only (max 300 characters)
  * impact: MUST be exactly "High", "Medium", or "Low" (case-sensitive)
  * cost: MUST be exactly "$", "$$", or "$$$" (no other symbols)

Business context:
${JSON.stringify(businessContext, null, 2)}

Order by impact/feasibility ratio.
Respect constraints: owns or rents = ${userData.ownOrRent}.`
);
```

## 📋 Debugging Steps

### Step 1: Run the Calculation

Click "Calculate Footprint" and watch the server console.

### Step 2: Find the Error Details

Look for:
```
❌ Full Action Plan - Failed
=== NoObjectGeneratedError Details ===
```

### Step 3: Check the Raw Response

Look at the `Text (AI's raw response)` field. This shows what the AI actually returned.

### Step 4: Compare with Schema

Compare the AI's response with the schema requirements:
- Are there enough items? (8-15)
- Are the categories valid?
- Are the impact/cost values valid?
- Are all required fields present?

### Step 5: Apply the Fix

Based on what you find, apply one of the fixes above.

## 🎯 Most Likely Fix

Based on common issues, I recommend **Fix 1: Simplify the Schema**. Change the Full Action Plan schema to:

```typescript
// In src/lib/ai-schemas.ts, update actionPlanSchema:
export const actionPlanSchema = z.object({
  fullActionPlan: z
    .array(
      z.object({
        category: z.string(), // More flexible
        title: z.string(),
        description: z.string(),
        impact: z.string(), // More flexible
        cost: z.string(), // More flexible
      }),
    )
    .min(5) // More lenient
    .max(20), // More lenient
});
```

This removes the strict enum validation that's most likely causing the issue.

## 🚀 Test Again

After applying a fix:

1. **Restart your dev server**
2. **Click "Calculate Footprint"**
3. **Check the console** - you should see more detailed error info
4. **Share the "Text (AI's raw response)"** if it still fails

The enhanced logging will show us exactly what the AI is returning and why it's failing validation! 🔍

