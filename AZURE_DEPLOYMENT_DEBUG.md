# Azure OpenAI Deployment Name Debug Guide

## 🔍 The Issue

Error: "The API deployment for this resource does not exist"

This means the deployment name in your `.env` doesn't match what Azure expects.

## 📝 How to Find Your EXACT Deployment Name

### Option 1: Azure Portal (Web Interface)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource
3. Click on **"Model deployments"** in the left sidebar
4. OR click **"Go to Azure OpenAI Studio"** button
5. In Azure OpenAI Studio, click **"Deployments"** tab
6. Look at the **"Deployment name"** column
7. Copy the EXACT name (case-sensitive!)

### Option 2: Azure CLI

```bash
# List all deployments
az cognitiveservices account deployment list \
  --name YOUR-RESOURCE-NAME \
  --resource-group YOUR-RESOURCE-GROUP
```

### Option 3: REST API Test

Test the deployment directly:

```bash
curl "https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT-NAME/chat/completions?api-version=2024-08-01-preview" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR-API-KEY" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

If this works, your deployment name is correct!

## ⚠️ Common Issues

### Issue 1: Deployment Name vs Model Name

**Wrong:**
```env
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"  # This is the MODEL name
```

**Correct:**
```env
AZURE_OPENAI_DEPLOYMENT_NAME="my-gpt4o-deployment"  # This is YOUR deployment name
```

**Explanation:** 
- `gpt-4o` = Model name (what Microsoft calls it)
- `my-gpt4o-deployment` = Deployment name (what YOU named it)

### Issue 2: Case Sensitivity

Deployment names are case-sensitive!

```env
# If your deployment is named "GPT-4o"
AZURE_OPENAI_DEPLOYMENT_NAME="GPT-4o"  # ✅ Correct

# This will NOT work:
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"  # ❌ Wrong case
```

### Issue 3: Hyphens vs Underscores

```env
# If your deployment is "gpt-4o-deployment"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o-deployment"  # ✅ Correct

# This will NOT work:
AZURE_OPENAI_DEPLOYMENT_NAME="gpt_4o_deployment"  # ❌ Wrong separator
```

## 🧪 Test Your Configuration

### Step 1: Check What's Being Sent

After restarting your dev server, click "Calculate Footprint" and check the server console. You should see:

```
Azure OpenAI Config: {
  resourceName: 'sabih-me5nfd22-eastus2',
  deploymentName: 'gpt-4o',  // ← Check this matches Azure Portal!
  apiVersion: '2024-08-01-preview'
}
```

### Step 2: Verify the Full URL

The SDK constructs this URL:
```
https://{resourceName}.openai.azure.com/openai/deployments/{deploymentName}/chat/completions?api-version={apiVersion}
```

For you, it should be:
```
https://sabih-me5nfd22-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview
```

### Step 3: Test with cURL

Copy your exact values and test:

```bash
curl "https://sabih-me5nfd22-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR-ACTUAL-API-KEY" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

**If this works:** Your deployment name is correct, and there's an SDK issue.
**If this fails:** Your deployment name is wrong.

## 🔧 Solutions

### Solution 1: Check Azure Portal for Exact Name

The deployment name might be different from what you think:

Common patterns:
- `gpt-4o` (simple)
- `gpt4o` (no hyphen)
- `gpt-4o-deployment` (with suffix)
- `my-gpt-4o` (with prefix)
- `GPT-4o` (capitalized)

### Solution 2: Create a New Deployment with Simple Name

If you can't find the exact name:

1. Go to Azure OpenAI Studio
2. Click "Deployments" → "Create new deployment"
3. Select "gpt-4o" model
4. Name it something simple: `gpt4o` (no special characters)
5. Update your `.env`:
   ```env
   AZURE_OPENAI_DEPLOYMENT_NAME="gpt4o"
   ```

### Solution 3: Use Different API Version

Some API versions have different deployment name formats:

Try these in order:
```env
AZURE_OPENAI_API_VERSION="2024-08-01-preview"  # Try this first
AZURE_OPENAI_API_VERSION="2024-06-01"
AZURE_OPENAI_API_VERSION="2024-02-01"
AZURE_OPENAI_API_VERSION="2023-12-01-preview"
```

## 📋 Checklist

Go through this checklist:

- [ ] Opened Azure Portal
- [ ] Navigated to Azure OpenAI resource
- [ ] Clicked "Model deployments" or "Azure OpenAI Studio"
- [ ] Found the "Deployments" section
- [ ] Copied the EXACT deployment name (case-sensitive)
- [ ] Updated `.env` with exact name
- [ ] Restarted dev server (`pnpm dev`)
- [ ] Checked server console for debug output
- [ ] Tried the cURL test command

## 🎯 Quick Fix

If you're still stuck, try this:

1. **Take a screenshot** of your Azure Portal deployments page
2. **Share the deployment name** you see (blur any sensitive info)
3. I can help verify the exact format needed

OR

1. **Create a new deployment** with a super simple name: `test`
2. **Update `.env`:**
   ```env
   AZURE_OPENAI_DEPLOYMENT_NAME="test"
   ```
3. **Test again**

## 💡 Pro Tip: List All Deployments via API

Add this temporary endpoint to test:

```typescript
// In src/app/api/test-azure/route.ts
import { env } from "@/env";

export async function GET() {
  const response = await fetch(
    `${env.AZURE_OPENAI_ENDPOINT}/openai/deployments?api-version=${env.AZURE_OPENAI_API_VERSION}`,
    {
      headers: {
        "api-key": env.AZURE_OPENAI_API_KEY,
      },
    }
  );
  
  const data = await response.json();
  return Response.json(data);
}
```

Visit `http://localhost:3000/api/test-azure` to see all your deployments!

## 🆘 Still Not Working?

After checking the debug output in your server console, let me know:

1. What deployment name is shown in the console log?
2. What deployment name do you see in Azure Portal?
3. Does the cURL command work?

I'll help you figure out the exact issue!

