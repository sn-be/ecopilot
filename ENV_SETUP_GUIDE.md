# Azure OpenAI Environment Setup Guide

## ✅ Fixed Issue

The connection error was caused by incorrect URL parsing. The fix:

**Before (❌ Broken):**
```typescript
resourceName: env.AZURE_OPENAI_ENDPOINT.replace("https://", "").replace(".openai.azure.com", "")
```

**After (✅ Fixed):**
```typescript
baseURL: `${env.AZURE_OPENAI_ENDPOINT}/openai/deployments`,
apiVersion: env.AZURE_OPENAI_API_VERSION,
```

## 🔑 Correct .env Configuration

Your `.env` file should look like this:

```env
# Database
DATABASE_URL="file:./db.sqlite"

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-actual-api-key-here"
AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"

# Environment
NODE_ENV="development"
```

### ⚠️ Important Notes:

1. **AZURE_OPENAI_ENDPOINT**:
   - ✅ Include `https://`
   - ✅ Include `.openai.azure.com`
   - ❌ NO trailing slash
   - Example: `https://sabih-me5nfd22-eastus2.openai.azure.com`

2. **AZURE_OPENAI_API_KEY**:
   - Get from Azure Portal → Your Resource → "Keys and Endpoint"
   - Use either Key 1 or Key 2

3. **AZURE_OPENAI_DEPLOYMENT_NAME**:
   - This is the name YOU gave your deployment in Azure
   - Common names: `gpt-4o`, `gpt-4`, `gpt-35-turbo`
   - Must match EXACTLY what's in Azure Portal

4. **AZURE_OPENAI_API_VERSION**:
   - Use: `2024-08-01-preview` (recommended)
   - Or check [Azure OpenAI API versions](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)

## 🧪 Test Your Configuration

### Quick Test

Create a test file `test-azure.ts`:

```typescript
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";

const azure = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments`,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
});

const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT_NAME!);

async function test() {
  const result = await generateText({
    model,
    prompt: "Say hello!",
  });
  console.log(result.text);
}

test();
```

Run: `tsx test-azure.ts`

### Expected Output

```
Hello! How can I assist you today?
```

## 🔍 Troubleshooting

### Error: "getaddrinfo ENOTFOUND"

**Cause:** Incorrect endpoint URL format

**Fix:**
```env
# ❌ Wrong
AZURE_OPENAI_ENDPOINT="sabih-me5nfd22-eastus2"

# ✅ Correct
AZURE_OPENAI_ENDPOINT="https://sabih-me5nfd22-eastus2.openai.azure.com"
```

### Error: "401 Unauthorized"

**Cause:** Invalid API key

**Fix:**
1. Go to Azure Portal
2. Navigate to your Azure OpenAI resource
3. Go to "Keys and Endpoint"
4. Copy a fresh key
5. Update `.env`

### Error: "404 Not Found"

**Cause:** Deployment name doesn't exist or is misspelled

**Fix:**
1. Go to Azure Portal
2. Navigate to your Azure OpenAI resource
3. Go to "Model deployments"
4. Copy the EXACT deployment name
5. Update `AZURE_OPENAI_DEPLOYMENT_NAME` in `.env`

### Error: "429 Too Many Requests"

**Cause:** Rate limit exceeded

**Fix:**
1. Check your Azure OpenAI quota
2. Wait a few minutes
3. Consider upgrading your quota in Azure Portal

### Error: "The API deployment for this resource does not exist"

**Cause:** Model not deployed or wrong deployment name

**Fix:**
1. Go to Azure Portal → Azure OpenAI Studio
2. Deploy a GPT-4o model
3. Note the deployment name
4. Update `.env` with exact name

## 📋 Verification Checklist

Before testing the footprint calculator:

- [ ] `.env` file exists in project root
- [ ] `AZURE_OPENAI_API_KEY` is set (starts with `sk-` or similar)
- [ ] `AZURE_OPENAI_ENDPOINT` includes `https://` and `.openai.azure.com`
- [ ] `AZURE_OPENAI_ENDPOINT` has NO trailing slash
- [ ] `AZURE_OPENAI_DEPLOYMENT_NAME` matches Azure Portal exactly
- [ ] `AZURE_OPENAI_API_VERSION` is set (e.g., `2024-08-01-preview`)
- [ ] Development server restarted after changing `.env`
- [ ] User has completed onboarding

## 🚀 Now Try Again!

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   pnpm dev
   ```

2. **Go to your dashboard**

3. **Click "Calculate Footprint"**

4. **You should see:**
   - Loading spinner for 8-12 seconds
   - Beautiful dashboard with emissions breakdown
   - Personalized action plan

## 📊 Expected Behavior

### What Happens When You Click "Calculate Footprint":

1. **Frontend** → tRPC call to `api.footprint.calculateAndGenerate`
2. **Backend** → Fetches user's onboarding data from SQLite
3. **Backend** → Constructs detailed prompt with business context
4. **Backend** → Calls Azure OpenAI GPT-4o via `generateObject`
5. **Azure OpenAI** → Analyzes data and generates structured response
6. **Backend** → Validates response against Zod schemas
7. **Backend** → Returns type-safe data
8. **Frontend** → Renders beautiful dashboard

### Timeline:
- 0-2s: Fetching data
- 2-10s: AI processing
- 10-12s: Validation and rendering
- **Total: 8-12 seconds**

## 💡 Pro Tips

### 1. Check Environment Variables Are Loaded

Add this temporarily to `src/lib/azure-openai.ts`:

```typescript
console.log("Azure Config:", {
  hasApiKey: !!env.AZURE_OPENAI_API_KEY,
  endpoint: env.AZURE_OPENAI_ENDPOINT,
  deployment: env.AZURE_OPENAI_DEPLOYMENT_NAME,
  apiVersion: env.AZURE_OPENAI_API_VERSION,
});
```

### 2. Test Azure Connection Separately

Before testing the full flow, verify Azure works:

```typescript
// In a test route or component
const testAzure = async () => {
  try {
    const result = await generateText({
      model: getGPT4oModel(),
      prompt: "Say hello!",
    });
    console.log("Azure works!", result.text);
  } catch (error) {
    console.error("Azure failed:", error);
  }
};
```

### 3. Monitor Azure Portal

While testing:
1. Go to Azure Portal
2. Navigate to your Azure OpenAI resource
3. Check "Metrics" to see API calls
4. Check "Quota" to ensure you have capacity

## 🎉 Success!

Once you see the dashboard with emissions data and recommendations, you're all set! The AI is successfully:
- Calculating carbon footprints
- Generating personalized action plans
- Respecting business constraints
- Providing actionable recommendations

---

**Still having issues?** Check the browser console and server logs for detailed error messages.

