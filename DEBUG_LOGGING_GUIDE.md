# Debug Logging Guide

## 🔍 What's Logged Now

I've added comprehensive logging to help diagnose schema validation errors. Here's what you'll see in your server console:

## 📊 Log Output Format

### For Each AI Call:

```
=== [Step Name] - Starting ===
Schema: { typeName: 'ZodObject', ... }
Prompt: [First 200 characters of prompt]...

[AI processing happens here]

✅ [Step Name] - Success
Response: { ... actual response object ... }
```

OR if it fails:

```
❌ [Step Name] - Failed
Error: [Error object]
Error message: [Specific error message]
Error stack: [Stack trace]
```

## 🧪 Example Output

### Successful Run:

```bash
=== Footprint Calculation - Starting ===
Schema: { typeName: 'ZodObject', ... }
Prompt: Calculate the carbon footprint for this business:

{
  "businessProfile": {
    "industry": "Restaurant",
    ...
  }
}...

✅ Footprint Calculation - Success
Response: {
  "totalKgCO2eAnnual": 47791,
  "dataSource": "Estimated based on industry benchmarks",
  "breakdown": [
    {
      "category": "Electricity",
      "kgCO2e": 35384,
      "percent": 74.0,
      "status": "estimated"
    },
    ...
  ]
}

Generating dashboard in 4 parallel steps...

=== Executive Summary - Starting ===
Schema: { typeName: 'ZodObject', ... }
Prompt: Generate an encouraging executive summary for this business:...

✅ Executive Summary - Success
Response: {
  "executiveSummary": "Your restaurant generates approximately 47,791 kg CO2e annually..."
}

=== Priority Action - Starting ===
...

✅ Priority Action - Success
...

=== Quick Wins - Starting ===
...

✅ Quick Wins - Success
...

=== Full Action Plan - Starting ===
...

✅ Full Action Plan - Success
...

Dashboard generated successfully!
```

### Failed Run:

```bash
=== Footprint Calculation - Starting ===
Schema: { typeName: 'ZodObject', ... }
Prompt: Calculate the carbon footprint for this business:...

❌ Footprint Calculation - Failed
Error: NoObjectGeneratedError: No object generated: response did not match schema
Error message: No object generated: response did not match schema
Error stack: [Full stack trace]
```

## 🔍 What to Look For

### 1. Which Step Failed?

Look for the `❌` symbol to identify which step failed:
- **Footprint Calculation** - The initial carbon footprint calculation
- **Executive Summary** - The 2-3 sentence overview
- **Priority Action** - The #1 recommended action
- **Quick Wins** - The 3-5 quick actions
- **Full Action Plan** - The comprehensive 8-15 item plan

### 2. What Was the Error?

Common errors:

**"No object generated: response did not match schema"**
- The AI's response didn't match the expected structure
- Usually means the AI returned something unexpected

**"The API deployment for this resource does not exist"**
- Deployment name is wrong
- Already fixed this earlier

**"401 Unauthorized"**
- API key is invalid
- Check your `.env` file

**"429 Too Many Requests"**
- Rate limit exceeded
- Wait a few minutes and try again

### 3. What Was the Response?

If a step succeeds, you'll see the actual response. Check:
- Does it match what you expect?
- Are the values reasonable?
- Is the structure correct?

## 🐛 Debugging Steps

### Step 1: Identify the Failing Step

Run the calculation and note which step shows `❌`.

### Step 2: Check the Schema

The schema is logged at the start of each step. Look for:
- Complex nested structures
- Required fields that might be hard for AI to generate
- Enum values that might be too restrictive

### Step 3: Check the Prompt

The first 200 characters of the prompt are logged. Consider:
- Is the prompt clear?
- Does it include all necessary context?
- Is it too long or too short?

### Step 4: Check the Error Message

The error message often indicates:
- Which field failed validation
- What value was provided vs what was expected
- Whether the response was completely invalid

## 🔧 Common Fixes

### Fix 1: Simplify the Schema

If a step consistently fails, the schema might be too complex:

```typescript
// Before (complex)
z.object({
  items: z.array(z.object({
    nested: z.object({
      deeplyNested: z.string()
    })
  }))
})

// After (simpler)
z.object({
  items: z.array(z.object({
    value: z.string()
  }))
})
```

### Fix 2: Make Fields Optional

If the AI struggles with required fields:

```typescript
// Before (all required)
z.object({
  field1: z.string(),
  field2: z.string(),
  field3: z.string(),
})

// After (some optional)
z.object({
  field1: z.string(),
  field2: z.string().optional(),
  field3: z.string().optional(),
})
```

### Fix 3: Relax Enum Constraints

If enum validation fails:

```typescript
// Before (strict enum)
z.enum(["High", "Medium", "Low"])

// After (union with fallback)
z.union([
  z.enum(["High", "Medium", "Low"]),
  z.string()
]).transform(val => 
  ["High", "Medium", "Low"].includes(val) ? val : "Medium"
)
```

### Fix 4: Improve the Prompt

Add more explicit instructions:

```typescript
// Before
"Generate a summary"

// After
"Generate a summary. Format: A single paragraph, 2-3 sentences, specific numbers."
```

## 📋 Checklist for Debugging

When you see a schema validation error:

- [ ] Note which step failed (look for ❌)
- [ ] Copy the error message
- [ ] Check if the schema is too complex
- [ ] Check if the prompt is clear
- [ ] Try simplifying the schema
- [ ] Try making some fields optional
- [ ] Try improving the prompt
- [ ] Test again

## 💡 Pro Tips

### Tip 1: Test Steps Individually

Comment out the parallel execution and test one step at a time:

```typescript
// Test just one step
const summaryResult = await generateWithLogging(
  "Executive Summary",
  executiveSummarySchema,
  "..."
);
console.log("Summary works!");

// Then test the next step
const priorityResult = await generateWithLogging(
  "Priority Action",
  priorityActionSchema,
  "..."
);
console.log("Priority works!");
```

### Tip 2: Use Smaller Test Data

Create a minimal test case:

```typescript
const minimalContext = {
  businessProfile: {
    industry: "Test",
    country: "US",
    postalCode: "12345",
    employeeCount: 5,
    locationSize: 1000,
    locationUnit: "sqft",
    ownsOrRents: "rent",
  },
  footprint: {
    total_kgCO2e_annual: 10000,
    data_source: "Test",
    breakdown: [
      { category: "Electricity", kgCO2e: 10000, percent: 100 }
    ],
  },
};
```

### Tip 3: Check Azure OpenAI Logs

If the error persists:
1. Go to Azure Portal
2. Navigate to your Azure OpenAI resource
3. Check "Metrics" and "Logs"
4. Look for failed requests

### Tip 4: Try Different API Versions

Some API versions handle schemas differently:

```env
# Try these in order:
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
AZURE_OPENAI_API_VERSION="2024-06-01"
AZURE_OPENAI_API_VERSION="2024-02-01"
```

## 🎯 Next Steps

1. **Run the calculation** and watch the server console
2. **Copy the logs** from the failing step
3. **Share them** so I can help diagnose the exact issue
4. **Try the fixes** suggested above

The detailed logging will help us pinpoint exactly what's going wrong! 🔍

