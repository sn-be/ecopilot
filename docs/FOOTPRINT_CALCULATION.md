# Carbon Footprint Calculation & Dashboard Generation

This document explains how to use the AI-powered carbon footprint calculation and dashboard generation features in EcoPilot.

## Overview

EcoPilot uses Azure OpenAI's GPT-4o model via the Vercel AI SDK to:
1. Calculate accurate carbon footprints based on business data
2. Generate personalized sustainability action plans

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

**How to get these values:**
1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource
3. Under "Keys and Endpoint":
   - Copy one of the API keys → `AZURE_OPENAI_API_KEY`
   - Copy the endpoint URL → `AZURE_OPENAI_ENDPOINT`
4. Under "Model deployments":
   - Note your GPT-4o deployment name → `AZURE_OPENAI_DEPLOYMENT_NAME`
5. Use the latest stable API version (currently `2024-08-01-preview`)

### 2. Dependencies

The following packages are already installed:
- `ai` - Vercel AI SDK core
- `@ai-sdk/openai` - Azure OpenAI provider
- `zod` - Schema validation

## API Usage

### tRPC Procedures

Three procedures are available under `api.footprint`:

#### 1. `calculateFootprint`

Calculates the carbon footprint for a user based on their onboarding data.

```typescript
const footprint = await api.footprint.calculateFootprint.mutate({
  userId: "user_123"
});

// Returns:
// {
//   totalKgCO2eAnnual: 47791,
//   dataSource: "Estimated based on industry benchmarks...",
//   breakdown: [
//     { category: "Electricity", kgCO2e: 35384, percent: 74.0, status: "estimated" },
//     { category: "Natural Gas", kgCO2e: 12407, percent: 26.0, status: "estimated" },
//     ...
//   ],
//   calculationNotes: "...",
//   recommendations: ["Switch to LED lighting", ...]
// }
```

#### 2. `generateDashboard`

Generates a personalized action plan based on a calculated footprint.

```typescript
const dashboard = await api.footprint.generateDashboard.mutate({
  userId: "user_123",
  footprint: footprint // from calculateFootprint
});

// Returns:
// {
//   executiveSummary: "Your business generates approximately 47,791 kg CO2e annually...",
//   prioritizedNextStep: {
//     title: "Switch to LED Lighting",
//     description: "Replace all traditional bulbs with LEDs...",
//     impact: "High",
//     cost: "$",
//     paybackPeriod: "Approx. 1.5 years"
//   },
//   quickWins: [...],
//   fullActionPlan: [...]
// }
```

#### 3. `calculateAndGenerate` (Convenience Method)

Calculates footprint and generates dashboard in one call.

```typescript
const result = await api.footprint.calculateAndGenerate.mutate({
  userId: "user_123"
});

// Returns:
// {
//   footprint: { ... },
//   dashboard: { ... }
// }
```

## How It Works

### Footprint Calculation

The AI analyzes the business data and applies industry-standard emission factors:

1. **Electricity**: Uses grid emission factors based on country/region
2. **Heating**: Converts fuel amounts to CO2e (e.g., ~5.3 kg CO2e per therm of natural gas)
3. **Commutes**: Estimates based on employee count and commute patterns
4. **Business Travel**: ~200-300 kg CO2e per domestic flight, ~1,000-2,000 kg per international
5. **Waste**: ~50-100 kg CO2e per trash bag per year (including landfill methane)

### Dashboard Generation

The AI creates a personalized action plan by:

1. **Identifying hotspots**: Focuses on largest emission sources
2. **Considering constraints**: 
   - Renters: No building modifications recommended
   - Owners: Building improvements included
3. **Prioritizing by ROI**: Balances carbon impact with cost
4. **Being specific**: Provides actionable steps with implementation guidance

## Data Schemas

### CarbonFootprint

```typescript
{
  totalKgCO2eAnnual: number;
  dataSource: string;
  breakdown: Array<{
    category: string;
    kgCO2e: number;
    percent: number;
    status?: "calculated" | "estimated" | "not_calculated";
    notes?: string;
  }>;
  calculationNotes?: string;
  recommendations?: string[];
}
```

### EcoPilotDashboard

```typescript
{
  executiveSummary: string;
  prioritizedNextStep: {
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    cost: "$" | "$$" | "$$$";
    paybackPeriod: string;
  };
  quickWins: Array<{
    title: string;
    description: string;
  }>;
  fullActionPlan: Array<{
    category: "Energy" | "Transport" | "Waste" | "Supply Chain" | "Team";
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    cost: "$" | "$$" | "$$$";
  }>;
}
```

## Example: Complete Flow

```typescript
"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export function FootprintCalculator({ userId }: { userId: string }) {
  const [result, setResult] = useState<any>(null);
  
  const calculateMutation = api.footprint.calculateAndGenerate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      console.log("Footprint:", data.footprint);
      console.log("Dashboard:", data.dashboard);
    },
    onError: (error) => {
      console.error("Error:", error.message);
    }
  });

  const handleCalculate = () => {
    calculateMutation.mutate({ userId });
  };

  return (
    <div>
      <button onClick={handleCalculate} disabled={calculateMutation.isPending}>
        {calculateMutation.isPending ? "Calculating..." : "Calculate Footprint"}
      </button>
      
      {result && (
        <div>
          <h2>Total Emissions: {result.footprint.totalKgCO2eAnnual.toLocaleString()} kg CO2e/year</h2>
          <h3>{result.dashboard.executiveSummary}</h3>
          <h4>Next Step: {result.dashboard.prioritizedNextStep.title}</h4>
          {/* Display full dashboard */}
        </div>
      )}
    </div>
  );
}
```

## Error Handling

All procedures include comprehensive error handling:

```typescript
try {
  const result = await api.footprint.calculateFootprint.mutate({ userId });
} catch (error) {
  if (error.message.includes("No onboarding data found")) {
    // User hasn't completed onboarding
  } else if (error.message.includes("Failed to calculate")) {
    // AI generation error
  }
}
```

## Best Practices

1. **Cache Results**: Store calculated footprints in the database to avoid redundant API calls
2. **Show Loading States**: AI generation takes 3-10 seconds
3. **Handle Errors Gracefully**: Provide fallback UI if calculation fails
4. **Update Periodically**: Recalculate when business data changes significantly
5. **Monitor Costs**: Each calculation uses ~2,000-5,000 tokens

## Cost Estimation

- **Footprint Calculation**: ~2,000-3,000 tokens per call
- **Dashboard Generation**: ~3,000-5,000 tokens per call
- **Combined Call**: ~5,000-8,000 tokens per call

With GPT-4o pricing (~$0.005/1K input tokens, ~$0.015/1K output tokens), expect:
- ~$0.02-0.05 per footprint calculation
- ~$0.03-0.08 per dashboard generation
- ~$0.05-0.13 per combined call

## Troubleshooting

### "No onboarding data found"
- Ensure the user has completed the onboarding flow
- Check that `userId` matches the database record

### "Failed to calculate carbon footprint"
- Verify Azure OpenAI credentials in `.env`
- Check Azure OpenAI deployment is active
- Review API quota limits in Azure Portal

### Slow Response Times
- Normal: 3-10 seconds for AI generation
- If >15 seconds: Check Azure region latency
- Consider implementing streaming for better UX

## Next Steps

1. Add database persistence for calculated footprints
2. Implement progress tracking for action items
3. Create visualization components for breakdown data
4. Add comparison features (industry benchmarks, year-over-year)

