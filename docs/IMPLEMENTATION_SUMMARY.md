# Implementation Summary: Carbon Footprint Calculation

## What Was Implemented

A complete AI-powered carbon footprint calculation and dashboard generation system using Azure OpenAI (GPT-4o) via the Vercel AI SDK.

## Files Created

### 1. `.env.example`
Environment variable template with Azure OpenAI configuration:
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT_NAME`
- `AZURE_OPENAI_API_VERSION`

### 2. `src/env.js` (Updated)
Added validation for Azure OpenAI environment variables using `@t3-oss/env-nextjs`.

### 3. `src/lib/ai-schemas.ts`
Comprehensive Zod schemas for:
- **`carbonFootprintSchema`**: Defines the structure for footprint calculation results
- **`ecoPilotDashboardSchema`**: Defines the structure for personalized action plans
- **`businessDataInputSchema`**: Input validation for business data

### 4. `src/lib/azure-openai.ts`
Azure OpenAI provider configuration:
- `azure`: Configured Azure OpenAI instance
- `getGPT4oModel()`: Helper function to get the GPT-4o model

### 5. `src/server/api/routers/footprint.ts`
Three tRPC procedures:

#### a. `calculateFootprint`
- **Input**: `{ userId: string }`
- **Output**: `CarbonFootprint` object
- **Function**: Calculates annual carbon footprint using AI analysis of business data
- **Features**:
  - Fetches onboarding data from database
  - Applies industry-standard emission factors
  - Provides detailed breakdown by category
  - Includes calculation methodology notes

#### b. `generateDashboard`
- **Input**: `{ userId: string, footprint: CarbonFootprint }`
- **Output**: `EcoPilotDashboard` object
- **Function**: Generates personalized sustainability action plan
- **Features**:
  - Executive summary with specific numbers
  - Prioritized next step (highest impact action)
  - 3-5 quick wins (low-cost, high-impact)
  - 8-15 item comprehensive action plan
  - Respects constraints (rent vs. own)

#### c. `calculateAndGenerate` (Convenience Method)
- **Input**: `{ userId: string }`
- **Output**: `{ footprint: CarbonFootprint, dashboard: EcoPilotDashboard }`
- **Function**: Combines both calculations in one call

### 6. `src/server/api/root.ts` (Updated)
Added `footprintRouter` to the main tRPC router.

### 7. `docs/FOOTPRINT_CALCULATION.md`
Comprehensive documentation including:
- Setup instructions
- API usage examples
- Data schemas
- Error handling
- Best practices
- Cost estimation
- Troubleshooting guide

## How to Use

### 1. Set Up Environment Variables

Create a `.env` file (or update existing one) with your Azure OpenAI credentials:

```env
AZURE_OPENAI_API_KEY="your-key-here"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

### 2. Use in Your Components

#### Option A: Calculate and Generate Together (Recommended)

```typescript
import { api } from "@/trpc/react";

export function MyComponent({ userId }: { userId: string }) {
  const calculateMutation = api.footprint.calculateAndGenerate.useMutation();

  const handleCalculate = async () => {
    const result = await calculateMutation.mutateAsync({ userId });
    console.log("Footprint:", result.footprint);
    console.log("Dashboard:", result.dashboard);
  };

  return (
    <button onClick={handleCalculate}>
      Calculate Footprint
    </button>
  );
}
```

#### Option B: Separate Calls

```typescript
// First, calculate the footprint
const footprint = await api.footprint.calculateFootprint.mutate({ userId });

// Then, generate the dashboard
const dashboard = await api.footprint.generateDashboard.mutate({
  userId,
  footprint
});
```

### 3. Display Results

The returned data is fully typed and ready to display:

```typescript
// Footprint breakdown
footprint.breakdown.map(item => (
  <div key={item.category}>
    <h3>{item.category}</h3>
    <p>{item.kgCO2e.toLocaleString()} kg CO2e ({item.percent}%)</p>
  </div>
))

// Dashboard action plan
dashboard.fullActionPlan.map(action => (
  <div key={action.title}>
    <h4>{action.title}</h4>
    <p>{action.description}</p>
    <span>Impact: {action.impact} | Cost: {action.cost}</span>
  </div>
))
```

## Technical Details

### AI Prompting Strategy

The implementation uses carefully crafted system prompts that:

1. **For Footprint Calculation**:
   - Provide detailed emission factor guidance
   - Explain calculation methodology for each category
   - Handle missing data with industry benchmarks
   - Consider regional factors (grid mix, climate)

2. **For Dashboard Generation**:
   - Focus on largest emission sources
   - Respect business constraints (rent vs. own)
   - Prioritize by ROI (carbon impact vs. cost)
   - Provide specific, actionable steps

### Data Flow

```
User Onboarding Data (DB)
    ↓
Business Data Transformation
    ↓
AI Prompt Construction
    ↓
Azure OpenAI (GPT-4o)
    ↓
Structured Output (Zod Validation)
    ↓
Type-Safe Response
```

### Error Handling

All procedures include:
- Database query error handling
- AI generation error handling
- Detailed error messages for debugging
- Type-safe error responses

## Key Features

✅ **Type Safety**: Full TypeScript support with Zod schemas
✅ **Structured Output**: Uses AI SDK's `generateObject` for guaranteed schema compliance
✅ **Comprehensive Prompts**: Expert-level system prompts for accurate calculations
✅ **Constraint Awareness**: Respects business limitations (rent vs. own, industry-specific)
✅ **Detailed Breakdowns**: Category-by-category emission analysis
✅ **Actionable Plans**: Specific, prioritized recommendations with cost/impact estimates
✅ **Error Resilience**: Graceful handling of missing data and API failures

## Performance Considerations

- **Response Time**: 3-10 seconds per AI call
- **Token Usage**: ~5,000-8,000 tokens per combined call
- **Cost**: ~$0.05-0.13 per calculation (GPT-4o pricing)
- **Caching**: Consider storing results in database to avoid redundant calls

## Next Steps for Integration

1. **Add Database Persistence**:
   - Create `carbonFootprints` table to store calculation results
   - Add `actionPlans` table to track user progress

2. **Create UI Components**:
   - Footprint visualization (charts, breakdowns)
   - Action plan cards with progress tracking
   - Quick wins checklist

3. **Implement Progress Tracking**:
   - Mark actions as "in progress" or "completed"
   - Recalculate footprint after actions are completed
   - Show year-over-year improvements

4. **Add Comparison Features**:
   - Industry benchmarks
   - Similar business comparisons
   - Progress over time

## Dependencies Installed

```json
{
  "ai": "^5.0.89",
  "@ai-sdk/openai": "^2.0.64"
}
```

## Testing

To test the implementation:

1. Ensure a user has completed onboarding
2. Call `api.footprint.calculateAndGenerate.mutate({ userId })`
3. Verify the response structure matches the schemas
4. Check that recommendations respect business constraints

## Support

For issues or questions:
- Review `docs/FOOTPRINT_CALCULATION.md` for detailed usage
- Check Azure OpenAI deployment status in Azure Portal
- Verify environment variables are set correctly
- Review tRPC error messages for specific issues

