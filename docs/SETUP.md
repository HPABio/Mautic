# Mautic API Setup Guide

This guide will walk you through setting up API access to your Mautic instance and configuring this SDK.

## Step 1: Enable Mautic API

1. Log into your Mautic instance at https://mautic.synbioreactor.de/
2. Click the Settings icon (⚙️) in the top right corner
3. Go to **Configuration**
4. Navigate to the **API Settings** tab
5. Set **"API enabled?"** to **"Yes"**
6. Under **"Authorization Protocol"**, select **"OAuth 2"**
7. Click **"Save & Close"**

## Step 2: Create OAuth2 Credentials

### In Mautic

1. Go to **Settings** (⚙️ icon) → **API Credentials**
2. Click **"New"** in the top right
3. Fill in the form:
   - **Name**: `Biotech Outreach Integration` (or any descriptive name)
   - **Redirect URI**:
     - For local development: `http://localhost:3000/callback`
     - For production: `https://your-domain.com/callback`
   - **Is Published**: Set to "Yes"
4. Click **"Apply"**
5. You'll see your credentials:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value

⚠️ **Important**: Store these credentials securely. You won't be able to see the Client Secret again!

## Step 3: Configure the SDK

### Create Environment File

```bash
# In the project root
cp .env.example .env
```

### Edit .env File

Open `.env` in your text editor and fill in the values:

```env
# Your Mautic instance URL (no trailing slash)
MAUTIC_BASE_URL=https://mautic.synbioreactor.de

# OAuth2 credentials from Step 2
MAUTIC_CLIENT_ID=abc123xyz789
MAUTIC_CLIENT_SECRET=def456uvw012

# Callback URL (must match what you set in Mautic)
MAUTIC_CALLBACK_URL=http://localhost:3000/callback

# These will be auto-populated after first authentication
MAUTIC_ACCESS_TOKEN=
MAUTIC_REFRESH_TOKEN=
MAUTIC_TOKEN_EXPIRES_AT=
```

## Step 4: Test the Connection

### Run the Basic Usage Example

```bash
bun install
bun run src/examples/basic-usage.ts
```

If everything is configured correctly, you should see:
```
🚀 Mautic SDK initialized
📋 Fetching contacts...
Found X contacts
...
✅ All examples completed successfully!
```

### If You Get Authentication Errors

The SDK uses **Client Credentials** grant type by default, which doesn't require user interaction. However, if you see authentication errors:

1. **Check your credentials**: Make sure the Client ID and Secret are correct
2. **Verify API is enabled**: Go back to Mautic Settings → Configuration → API Settings
3. **Check the base URL**: Ensure it doesn't have a trailing slash
4. **Review Mautic logs**: In Mautic, go to Settings → System Info → Log to see API errors

## Authentication Flow Options

### Option 1: Client Credentials (Recommended for server-to-server)

This is the default and requires no user interaction. The SDK automatically uses this method.

**Pros:**
- No user login required
- Simpler setup
- Good for automated tasks

**Cons:**
- Uses application permissions (not user-specific)

### Option 2: Authorization Code (For user-specific actions)

If you need user-specific authentication:

1. **Get the authorization URL:**
   ```typescript
   import { MauticAuth } from './src/api/auth';
   import { loadConfig } from './src/config/env';

   const config = loadConfig();
   const auth = new MauticAuth(config);

   const authUrl = auth.getAuthorizationUrl('random-state-string');
   console.log('Visit this URL:', authUrl);
   ```

2. **User authorizes**: Send the user to this URL in a browser
3. **Handle callback**: User is redirected to your callback URL with a `code` parameter
4. **Exchange code for tokens**:
   ```typescript
   const code = 'code-from-callback';
   const tokens = await auth.getAccessToken(code);

   // Save these to your .env file
   console.log('MAUTIC_ACCESS_TOKEN=' + tokens.access_token);
   console.log('MAUTIC_REFRESH_TOKEN=' + tokens.refresh_token);
   ```

## Step 5: Run the Email Campaign Example

Once authentication works, try the biotech event campaign example:

```bash
bun run src/examples/email-campaign.ts
```

This will:
- Create a segment for biotech researchers
- Add sample contacts
- Create an email template
- Send a campaign

## Troubleshooting

### Error: "Invalid client credentials"

**Solution**: Double-check your Client ID and Client Secret in `.env`

### Error: "The redirect URI provided is missing or does not match"

**Solution**: Ensure `MAUTIC_CALLBACK_URL` in `.env` exactly matches the Redirect URI in Mautic API Credentials

### Error: "API is disabled"

**Solution**: Go to Mautic Settings → Configuration → API Settings and enable the API

### Error: "401 Unauthorized"

**Solution**: Your access token may have expired. The SDK should auto-refresh, but if not:
1. Delete the token values from `.env`
2. Restart your application
3. The SDK will get new client credentials automatically

### Can't find API Credentials in Mautic

**Solution**: You need admin access to create API credentials. Contact your Mautic administrator.

## Security Best Practices

### Local Development
- Use `http://localhost:3000/callback` for the redirect URI
- Never commit `.env` to version control (already in `.gitignore`)

### Production
- Use HTTPS for all URLs
- Store credentials in environment variables or a secrets manager
- Use separate API credentials for each environment (dev, staging, prod)
- Rotate credentials regularly

### Sharing Credentials Safely

If you need to share credentials with team members:

1. **Use a Password Manager**: 1Password, Bitwarden, LastPass
2. **Use Environment Variable Management**: Doppler, Infisical
3. **Never send credentials via**:
   - Email
   - Slack/Discord (unless encrypted)
   - Git commits
   - Screenshots

## What You Need to Provide

If you need my help with setup and want to grant access, here's what I would need:

### Option 1: Mautic API Credentials (Recommended)
- Mautic instance URL
- API Client ID
- API Client Secret

**How to share**: Use a secure, encrypted channel or password manager

### Option 2: Coolify Access (If needed for deployment)
- Coolify dashboard URL
- Temporary access token or invited user access

### Option 3: Server Access (Only if necessary)
- SSH access with public key authentication
- Limited sudo permissions for specific tasks

**Note**: I can work with just the API credentials. Server/Coolify access is only needed if you want me to deploy or configure the server directly.

## Next Steps

Once setup is complete:

1. Review the [API Reference](../README.md#api-reference) for available methods
2. Check out the [Examples](../src/examples/) for common use cases
3. Build your biotech outreach campaigns!

## Need Help?

- Mautic Documentation: https://devdocs.mautic.org/
- Mautic Forums: https://forum.mautic.org/
- OAuth2 Spec: https://oauth.net/2/
