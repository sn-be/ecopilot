# Setup Checklist: Carbon Footprint Calculation

Use this checklist to set up and deploy the carbon footprint calculation feature.

## ✅ Prerequisites

- [ ] Azure OpenAI resource created in Azure Portal
- [ ] GPT-4o model deployed in Azure OpenAI
- [ ] Users can complete onboarding flow
- [ ] Database schema includes onboarding data

## 📝 Environment Setup

### 1. Get Azure OpenAI Credentials

- [ ] Log in to [Azure Portal](https://portal.azure.com)
- [ ] Navigate to your Azure OpenAI resource
- [ ] Go to "Keys and Endpoint" section
- [ ] Copy one of the API keys
- [ ] Copy the endpoint URL
- [ ] Go to "Model deployments" section
- [ ] Note your GPT-4o deployment name

### 2. Update .env File

Create or update your `.env` file with:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-actual-api-key-here"
AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

- [ ] Added `AZURE_OPENAI_API_KEY`
- [ ] Added `AZURE_OPENAI_ENDPOINT`
- [ ] Added `AZURE_OPENAI_DEPLOYMENT_NAME`
- [ ] Added `AZURE_OPENAI_API_VERSION`
- [ ] Verified no trailing slashes in endpoint URL
- [ ] Verified deployment name matches Azure exactly

### 3. Verify Installation

- [ ] Dependencies installed (`ai`, `@ai-sdk/openai`)
- [ ] No TypeScript errors in project
- [ ] No linting errors in new files

## 🧪 Testing

### 1. Basic Functionality

- [ ] Create a test user
- [ ] Complete onboarding for test user
- [ ] Call `api.footprint.calculateFootprint.mutate({ userId })`
- [ ] Verify response includes `totalKgCO2eAnnual`
- [ ] Verify response includes `breakdown` array
- [ ] Verify breakdown percentages sum to 100

### 2. Dashboard Generation

- [ ] Call `api.footprint.generateDashboard.mutate({ userId, footprint })`
- [ ] Verify response includes `executiveSummary`
- [ ] Verify response includes `prioritizedNextStep`
- [ ] Verify response includes `quickWins` (3-5 items)
- [ ] Verify response includes `fullActionPlan` (8-15 items)

### 3. Combined Call

- [ ] Call `api.footprint.calculateAndGenerate.mutate({ userId })`
- [ ] Verify response includes both `footprint` and `dashboard`
- [ ] Verify response time is acceptable (8-12 seconds)

### 4. Error Handling

- [ ] Test with non-existent user (should error gracefully)
- [ ] Test with user who hasn't completed onboarding (should error)
- [ ] Test with invalid Azure credentials (should error)
- [ ] Verify error messages are helpful

### 5. Constraint Validation

Create two test users:

**Renter:**
- [ ] Set `ownOrRent` to "rent"
- [ ] Generate dashboard
- [ ] Verify NO building modification recommendations (solar, insulation, HVAC)

**Owner:**
- [ ] Set `ownOrRent` to "own"
- [ ] Generate dashboard
- [ ] Verify building modifications ARE included if relevant

## 🎨 UI Integration

### 1. Choose Integration Method

- [ ] Decided on integration approach (see `docs/INTEGRATION_EXAMPLE.md`)
- [ ] Updated dashboard component OR created new page
- [ ] Added navigation links if needed

### 2. Component Usage

- [ ] Import `FootprintCalculator` component
- [ ] Pass `userId` prop
- [ ] Test loading states
- [ ] Test error states
- [ ] Test success states

### 3. Styling

- [ ] Component matches app theme
- [ ] Responsive on mobile devices
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Loading indicators are clear

## 📊 Monitoring

### 1. Set Up Logging

- [ ] Log successful calculations
- [ ] Log errors with context
- [ ] Track response times
- [ ] Monitor token usage

Example logging:

```typescript
console.log({
	event: "footprint_calculated",
	userId,
	totalEmissions: result.footprint.totalKgCO2eAnnual,
	responseTime: Date.now() - startTime,
	tokenUsage: result.usage,
});
```

### 2. Set Up Alerts

- [ ] Alert on API errors
- [ ] Alert on slow response times (>15 seconds)
- [ ] Alert on high token usage
- [ ] Alert on Azure quota limits

## 💰 Cost Management

### 1. Estimate Costs

- [ ] Calculate expected monthly API calls
- [ ] Estimate token usage per call (~5,000-8,000 tokens)
- [ ] Calculate monthly cost (GPT-4o pricing)
- [ ] Set budget alerts in Azure

### 2. Implement Caching

- [ ] Store calculation results in database
- [ ] Only recalculate when data changes
- [ ] Set reasonable cache TTL (e.g., 30 days)

Example schema:

```sql
CREATE TABLE cached_footprints (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  footprint_data JSON NOT NULL,
  dashboard_data JSON NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
```

## 🚀 Deployment

### 1. Pre-Deployment

- [ ] All tests passing
- [ ] No linting errors
- [ ] Environment variables set in production
- [ ] Azure OpenAI quota sufficient for expected load
- [ ] Monitoring/logging configured

### 2. Deploy

- [ ] Deploy to staging first
- [ ] Test with real data in staging
- [ ] Verify Azure OpenAI connection works
- [ ] Check response times under load
- [ ] Deploy to production

### 3. Post-Deployment

- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Monitor token usage
- [ ] Gather user feedback
- [ ] Track completion rates

## 📈 Optimization (Optional)

### 1. Performance

- [ ] Implement server-side caching
- [ ] Add database indexes on `userId`
- [ ] Consider streaming responses for better UX
- [ ] Optimize prompt length

### 2. Features

- [ ] Add progress tracking for action items
- [ ] Add year-over-year comparison
- [ ] Add industry benchmarks
- [ ] Add export to PDF functionality

### 3. Analytics

- [ ] Track which recommendations users act on
- [ ] Measure actual carbon reduction over time
- [ ] A/B test different prompt strategies
- [ ] Analyze which industries get best results

## 🆘 Troubleshooting

### Common Issues

**"Failed to calculate carbon footprint"**
- [ ] Check Azure OpenAI credentials
- [ ] Verify deployment is active
- [ ] Check API quota limits
- [ ] Review error logs for details

**Slow response times**
- [ ] Check Azure region latency
- [ ] Verify prompt isn't too long
- [ ] Consider caching results
- [ ] Check network connection

**Incorrect recommendations**
- [ ] Verify onboarding data is complete
- [ ] Check constraint logic (rent vs. own)
- [ ] Review prompt engineering
- [ ] Test with different business types

**High costs**
- [ ] Implement caching
- [ ] Reduce prompt length
- [ ] Batch calculations if possible
- [ ] Set rate limits per user

## 📚 Documentation

- [ ] Team trained on new feature
- [ ] User documentation created
- [ ] API documentation updated
- [ ] Runbook created for on-call

## ✅ Launch Checklist

Final checks before announcing feature:

- [ ] All tests passing
- [ ] Monitoring active
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Costs within budget
- [ ] User documentation ready
- [ ] Support team trained
- [ ] Rollback plan ready

## 🎉 Success Metrics

Track these metrics post-launch:

- [ ] Number of footprint calculations
- [ ] Average response time
- [ ] Error rate
- [ ] User satisfaction
- [ ] Action completion rate
- [ ] Carbon reduction achieved

---

## Quick Start (TL;DR)

If you just want to get started quickly:

1. Add Azure OpenAI credentials to `.env`
2. Test with: `api.footprint.calculateAndGenerate.mutate({ userId })`
3. Add `<FootprintCalculator userId={userId} />` to your dashboard
4. Deploy and monitor!

For detailed instructions, see:
- `docs/FOOTPRINT_CALCULATION.md` - Complete usage guide
- `docs/INTEGRATION_EXAMPLE.md` - Integration examples
- `IMPLEMENTATION_COMPLETE.md` - Technical overview

