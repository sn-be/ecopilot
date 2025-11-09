# Quick Start Guide: Carbon Footprint Calculator

## ✅ What's Ready

Your carbon footprint calculator is **fully implemented and integrated** into your dashboard! Here's what happens when you click "Calculate Footprint":

1. **Fetches user's onboarding data** from the database
2. **Sends data to Azure OpenAI (GPT-4o)** with expert prompts
3. **Calculates carbon footprint** using industry-standard emission factors
4. **Generates personalized action plan** with prioritized recommendations
5. **Displays beautiful dashboard** with breakdown, quick wins, and full action plan

## 🔑 Required: Add Your Azure OpenAI Credentials

**Before testing, you MUST add these to your `.env` file:**

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

### How to Get These Values:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource
3. **Keys and Endpoint** section:
   - Copy one of the keys → `AZURE_OPENAI_API_KEY`
   - Copy the endpoint URL → `AZURE_OPENAI_ENDPOINT`
4. **Model deployments** section:
   - Note your GPT-4o deployment name → `AZURE_OPENAI_DEPLOYMENT_NAME`

## 🚀 How to Test

### 1. Start Your Development Server

```bash
pnpm dev
```

### 2. Complete Onboarding

- Sign in with a test user
- Complete all 4 steps of the onboarding flow
- This populates the database with business data

### 3. Go to Dashboard

- Navigate to your dashboard page
- You should see the "Calculate Your Carbon Footprint" card

### 4. Click "Calculate Footprint"

When you click the button:

**What you'll see:**
- ⏳ Loading spinner: "Calculating..." (8-12 seconds)
- ✅ Success: Beautiful dashboard with:
  - Total emissions (kg CO2e/year)
  - Breakdown by category (electricity, gas, commutes, etc.)
  - Executive summary
  - #1 Priority action
  - Quick wins (3-5 items)
  - Full action plan (8-15 items)

**What's happening behind the scenes:**
1. tRPC call to `api.footprint.calculateAndGenerate`
2. Fetches onboarding data from SQLite
3. Constructs detailed prompt with business context
4. Calls Azure OpenAI GPT-4o
5. AI analyzes data and generates structured response
6. Validates response against Zod schemas
7. Returns type-safe data to frontend
8. React component renders the results

## 📊 What the AI Does

### Footprint Calculation

The AI applies industry-standard emission factors:

- **Electricity**: Uses grid emission factors based on country/region
- **Natural Gas**: ~5.3 kg CO2e per therm
- **Commutes**: Based on employee count and commute patterns
- **Business Travel**: ~200-300 kg per domestic flight, ~1,000-2,000 per international
- **Waste**: ~50-100 kg CO2e per trash bag/year

### Dashboard Generation

The AI creates a personalized plan by:

1. **Identifying hotspots**: Focuses on largest emission sources
2. **Respecting constraints**: 
   - Renters: No building modifications (solar, insulation, HVAC)
   - Owners: Building improvements included
3. **Prioritizing by ROI**: Balances carbon impact with cost
4. **Being specific**: Provides actionable steps with implementation guidance

## 🎯 Expected Results

### Example for a Small Restaurant (1,500 sqft, 12 employees):

**Total Emissions:** ~47,791 kg CO2e/year

**Breakdown:**
- Electricity: 74% (35,384 kg)
- Natural Gas: 26% (12,407 kg)
- Commutes: Not calculated yet
- Waste: Not calculated yet

**#1 Priority:** Switch to LED Lighting
- Impact: High
- Cost: $
- Payback: ~1.5 years

**Quick Wins:**
- Install programmable thermostat
- Conduct energy audit
- Switch to ENERGY STAR appliances
- Implement recycling program

## ⚠️ Troubleshooting

### "Failed to calculate carbon footprint"

**Check:**
1. Azure OpenAI credentials in `.env`
2. Deployment is active in Azure Portal
3. API quota limits not exceeded
4. User has completed onboarding

### "No onboarding data found for user"

**Fix:**
- User must complete all 4 onboarding steps
- Check database has record for `userId`

### Slow Response (>15 seconds)

**Normal:** 8-12 seconds for combined calculation
**If slower:**
- Check Azure region latency
- Verify network connection
- Check Azure service status

### Empty Dashboard

**Check:**
- Browser console for errors
- Network tab for failed requests
- tRPC error messages

## 💰 Cost Estimate

Each calculation uses:
- **Tokens:** ~5,000-8,000 tokens
- **Cost:** ~$0.05-0.13 per calculation (GPT-4o pricing)
- **Time:** 8-12 seconds

For 100 users calculating once:
- **Total cost:** ~$5-13
- **Monthly (if users check weekly):** ~$20-52

## 🎨 Customization

### Change the UI

Edit `src/components/footprint-calculator.tsx`:
- Modify card layouts
- Change colors/styling
- Add charts/visualizations
- Customize text

### Adjust AI Prompts

Edit `src/server/api/routers/footprint.ts`:
- Modify `systemPrompt` for different tone
- Adjust emission factors
- Change recommendation priorities
- Add industry-specific logic

### Add Caching

To avoid redundant calculations:

```typescript
// In your component
const { data, isLoading } = api.footprint.calculateAndGenerate.useQuery(
  { userId },
  {
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  }
);
```

Or store in database:

```sql
CREATE TABLE cached_footprints (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  footprint_data JSON NOT NULL,
  dashboard_data JSON NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📚 Next Steps

### Immediate
1. ✅ Add Azure OpenAI credentials to `.env`
2. ✅ Test with a user who completed onboarding
3. ✅ Verify results look correct

### Short-term
- [ ] Add database caching for results
- [ ] Implement progress tracking for actions
- [ ] Add charts/visualizations
- [ ] Create PDF export functionality

### Long-term
- [ ] Track actual carbon reduction over time
- [ ] Add industry benchmarks
- [ ] Implement year-over-year comparison
- [ ] Build action completion workflow

## 🎉 You're Ready!

Everything is wired up and ready to go. Just:

1. **Add your Azure OpenAI credentials to `.env`**
2. **Complete onboarding with a test user**
3. **Click "Calculate Footprint" on the dashboard**

The AI will analyze the data and generate a beautiful, personalized sustainability action plan! 🌱

---

**Need Help?**
- Review `docs/FOOTPRINT_CALCULATION.md` for detailed API docs
- Check `docs/INTEGRATION_EXAMPLE.md` for alternative integration patterns
- See `SETUP_CHECKLIST.md` for comprehensive deployment guide

