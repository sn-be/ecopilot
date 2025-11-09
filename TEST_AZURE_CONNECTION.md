# Test Azure OpenAI Connection

## 🧪 Quick Diagnostic Test

I've created a test endpoint to help diagnose the deployment name issue.

### How to Use

1. **Make sure your dev server is running:**
   ```bash
   pnpm dev
   ```

2. **Visit this URL in your browser:**
   ```
   http://localhost:3000/api/test-azure
   ```

3. **You'll see a JSON response with:**
   - Your current configuration
   - List of ALL available deployments in your Azure resource
   - Test call result to your specified deployment

## 📊 What to Look For

### Example Response:

```json
{
  "config": {
    "endpoint": "https://sabih-me5nfd22-eastus2.openai.azure.com",
    "deploymentName": "gpt-4o",
    "apiVersion": "2024-08-01-preview",
    "hasApiKey": true
  },
  "listDeploymentsStatus": 200,
  "availableDeployments": {
    "data": [
      {
        "id": "gpt-4o",
        "model": "gpt-4o",
        "status": "succeeded"
      },
      {
        "id": "my-actual-deployment-name",
        "model": "gpt-4o", 
        "status": "succeeded"
      }
    ]
  },
  "testCallStatus": 200,
  "testCallResult": {
    "choices": [...]
  }
}
```

### ✅ What Success Looks Like:

- `listDeploymentsStatus`: **200**
- `availableDeployments`: Shows your deployments
- `testCallStatus`: **200**
- `testCallResult`: Contains actual AI response

### ❌ What Failure Looks Like:

- `testCallStatus`: **404**
- `testCallResult`: 
  ```json
  {
    "error": {
      "code": "DeploymentNotFound",
      "message": "The API deployment for this resource does not exist..."
    }
  }
  ```

## 🔍 Debugging Steps

### Step 1: Check Available Deployments

Look at the `availableDeployments.data` array. You'll see something like:

```json
{
  "data": [
    {
      "id": "my-gpt4o",           // ← This is your deployment name!
      "model": "gpt-4o",           // ← This is the model
      "status": "succeeded"
    }
  ]
}
```

**The `id` field is what you need for `AZURE_OPENAI_DEPLOYMENT_NAME`!**

### Step 2: Compare Names

Compare what's in `config.deploymentName` vs what's in `availableDeployments.data[].id`

**If they don't match exactly (case-sensitive!):**

1. Copy the exact `id` from `availableDeployments`
2. Update your `.env`:
   ```env
   AZURE_OPENAI_DEPLOYMENT_NAME="exact-id-from-response"
   ```
3. Restart your dev server
4. Test again

### Step 3: Verify Test Call Works

Once you update the deployment name, refresh the test endpoint. You should see:

- `testCallStatus`: **200** ✅
- `testCallResult.choices[0].message.content`: Contains AI response ✅

## 🎯 Common Scenarios

### Scenario 1: Deployment Name Mismatch

**You see:**
```json
{
  "config": {
    "deploymentName": "gpt-4o"
  },
  "availableDeployments": {
    "data": [
      { "id": "gpt4o" }  // ← No hyphen!
    ]
  }
}
```

**Fix:**
```env
AZURE_OPENAI_DEPLOYMENT_NAME="gpt4o"  # Remove hyphen
```

### Scenario 2: Multiple Deployments

**You see:**
```json
{
  "availableDeployments": {
    "data": [
      { "id": "gpt-35-turbo", "model": "gpt-35-turbo" },
      { "id": "my-gpt4o", "model": "gpt-4o" }
    ]
  }
}
```

**Fix:** Use the one with `"model": "gpt-4o"`:
```env
AZURE_OPENAI_DEPLOYMENT_NAME="my-gpt4o"
```

### Scenario 3: No Deployments

**You see:**
```json
{
  "availableDeployments": {
    "data": []
  }
}
```

**Fix:** You need to create a deployment in Azure Portal:
1. Go to Azure OpenAI Studio
2. Click "Deployments" → "Create new deployment"
3. Select "gpt-4o" model
4. Name it (e.g., "gpt4o")
5. Update `.env` with that name

## 🚀 Once It Works

When you see `testCallStatus: 200`, you're ready!

1. **Go back to your dashboard**
2. **Click "Calculate Footprint"**
3. **It should work now!** 🎉

## 💡 Pro Tips

### Tip 1: Keep the Test Endpoint

You can keep this test endpoint for future debugging. Just add it to your `.gitignore` if you don't want to commit it.

### Tip 2: Check Deployment Status

The `status` field in deployments should be `"succeeded"`. If it's `"creating"` or `"failed"`, wait or recreate the deployment.

### Tip 3: API Version Compatibility

If you still get errors, try different API versions:

```env
# Try these in order:
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
AZURE_OPENAI_API_VERSION="2024-06-01"
AZURE_OPENAI_API_VERSION="2024-02-01"
```

Refresh the test endpoint after each change.

## 📸 Share Results

If you're still stuck, you can:

1. Visit `http://localhost:3000/api/test-azure`
2. Copy the JSON response
3. Share it (remove your API key if visible)
4. I can help identify the exact issue!

---

**Ready to test?** Visit: http://localhost:3000/api/test-azure

