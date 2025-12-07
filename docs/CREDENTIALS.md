# Credential Management Guide

## Overview

This document explains how to safely manage and share credentials for Mautic, Coolify, and server access.

## What Credentials Are Needed?

### 1. Mautic API Credentials (Required)

These are needed for the SDK to communicate with your Mautic instance:

- **MAUTIC_BASE_URL**: Your Mautic instance URL (e.g., `https://mautic.synbioreactor.de`)
- **MAUTIC_CLIENT_ID**: OAuth2 Client ID
- **MAUTIC_CLIENT_SECRET**: OAuth2 Client Secret
- **MAUTIC_CALLBACK_URL**: OAuth2 redirect URI

**How to get them**: See [SETUP.md](./SETUP.md)

### 2. Coolify Access (Optional)

Only needed if deploying this application via Coolify:

- **Coolify Dashboard URL**: Your Coolify instance
- **API Token** or **User Invitation**: For programmatic access

**When needed**: For automated deployments or infrastructure management

### 3. Server Access (Optional)

Only needed for direct server configuration:

- **SSH Access**: Public key authentication
- **User Permissions**: Limited sudo access for specific tasks

**When needed**: For manual server setup or debugging

## How to Safely Share Credentials

### ✅ Recommended Methods

#### 1. Password Managers (Best for Teams)

**1Password**
```bash
# Share via 1Password vault
1. Create a new vault or use existing team vault
2. Add a "Login" or "API Credential" item
3. Fill in the fields
4. Share vault with specific team members
```

**Bitwarden**
```bash
# Share via Bitwarden organization
1. Create an organization
2. Add credentials to a collection
3. Invite team members with appropriate access
```

#### 2. Environment Variable Management

**Doppler** (Recommended for production)
```bash
# Install Doppler CLI
curl -Ls https://cli.doppler.com/install.sh | sh

# Login and setup
doppler login
doppler setup

# Set secrets
doppler secrets set MAUTIC_CLIENT_ID="your-client-id"
doppler secrets set MAUTIC_CLIENT_SECRET="your-secret"

# Invite team members
doppler projects teams add --project mautic --team developers
```

**Infisical**
```bash
# Similar to Doppler but open-source
# Share secrets via web interface or CLI
```

#### 3. Encrypted Files

Using **GPG encryption**:
```bash
# Encrypt .env file
gpg --encrypt --recipient user@email.com .env

# Send the .env.gpg file
# Recipient decrypts:
gpg --decrypt .env.gpg > .env
```

#### 4. Secure Messaging

- **Signal**: End-to-end encrypted, supports disappearing messages
- **Wire**: Team-focused encrypted messaging
- **Keybase**: Encrypted chat with file sharing

### ❌ NEVER Share Credentials Via

- ✗ Email (unencrypted)
- ✗ Slack/Discord (unless in encrypted DM)
- ✗ Text messages
- ✗ Screenshots shared publicly
- ✗ Git commits
- ✗ Shared documents (Google Docs, etc.)
- ✗ Pasting in plain text anywhere public

## Temporary Access Options

### For Coolify

Instead of sharing credentials, you can:

1. **Create a Temporary API Token**
   - Login to Coolify
   - Go to Settings → API Tokens
   - Create a token with limited scope
   - Set expiration (e.g., 7 days)
   - Share the token via secure channel

2. **Invite as Team Member**
   - Add user to Coolify with limited permissions
   - Revoke access when task is complete

### For Server Access

Instead of sharing passwords:

1. **Use SSH Keys**
   ```bash
   # Generate a new key pair
   ssh-keygen -t ed25519 -C "temp-access"

   # Add public key to server
   # Share private key securely
   # Remove from authorized_keys when done
   ```

2. **Create Temporary User**
   ```bash
   # On server
   sudo useradd -m -s /bin/bash tempuser
   sudo usermod -aG sudo tempuser

   # Add SSH key
   sudo -u tempuser mkdir /home/tempuser/.ssh
   sudo -u tempuser vi /home/tempuser/.ssh/authorized_keys

   # Remove user when done
   sudo userdel -r tempuser
   ```

### For Mautic

1. **Create Separate API Credentials**
   - Don't share your primary credentials
   - Create new OAuth2 credentials for each integration
   - Easier to revoke if needed

2. **Use Limited Permissions**
   - Create a dedicated Mautic user with minimal permissions
   - Only grant access to necessary features

## Credential Rotation

Regular rotation improves security:

### Mautic API Credentials

```bash
# Every 90 days:
1. Create new OAuth2 credentials in Mautic
2. Update .env with new credentials
3. Test the connection
4. Delete old credentials from Mautic
```

### SSH Keys

```bash
# Every 180 days:
1. Generate new SSH key pair
2. Add new public key to server
3. Test connection with new key
4. Remove old public key from server
```

### Access Tokens

```bash
# Set expiration when creating tokens
# Coolify: 7-30 days depending on use case
# Mautic: Automatic refresh every 14 days
```

## Storing Credentials Locally

### Development Environment

Use `.env` file (already gitignored):
```bash
# .env
MAUTIC_BASE_URL=https://mautic.synbioreactor.de
MAUTIC_CLIENT_ID=abc123
MAUTIC_CLIENT_SECRET=secret123
```

### Production Environment

**Option 1: Environment Variables**
```bash
# Set system environment variables
export MAUTIC_CLIENT_ID="abc123"

# Or use systemd service
[Service]
Environment="MAUTIC_CLIENT_ID=abc123"
```

**Option 2: Secret Management Service**
- AWS Secrets Manager
- HashiCorp Vault
- Google Cloud Secret Manager
- Azure Key Vault

**Option 3: Docker Secrets** (if using Docker)
```bash
# Create secret
echo "abc123" | docker secret create mautic_client_id -

# Use in docker-compose.yml
secrets:
  mautic_client_id:
    external: true
```

## What I Need Access To

To help you set up the Mautic API integration, I need:

### Minimum Required (Recommended)
✅ **Mautic API Credentials only**
- Client ID
- Client Secret
- Instance URL

This is sufficient for:
- Setting up the SDK
- Testing API connections
- Building integration features
- Debugging API issues

### Optional (Only if needed)

🔧 **Coolify Access** (for deployment setup)
- Temporary API token
- Or invited team member access

🖥️ **Server Access** (for infrastructure work)
- SSH access with public key
- Limited sudo permissions

## How to Provide Credentials to Me

### Recommended Approach

1. **Create Separate Credentials**
   - Don't use your primary Mautic credentials
   - Create new OAuth2 app credentials specifically for this integration
   - Easier to revoke when project is complete

2. **Share Via Secure Channel**
   - Encrypted email (PGP)
   - Password manager shared vault
   - Secure messaging app (Signal)
   - Encrypted file (GPG)

3. **Time-Limited Access**
   - Set expiration dates where possible
   - Remove access when work is complete

### Example: Sharing via Encrypted Message

```
Subject: Mautic API Credentials - Biotech Outreach Project

MAUTIC_BASE_URL=https://mautic.synbioreactor.de
MAUTIC_CLIENT_ID=[your-client-id]
MAUTIC_CLIENT_SECRET=[your-client-secret]
MAUTIC_CALLBACK_URL=http://localhost:3000/callback

Notes:
- These credentials are for development only
- Please delete after setup is complete
- Expires: [date]
```

## Security Checklist

Before sharing any credentials:

- [ ] Using a secure, encrypted channel
- [ ] Credentials are for dedicated integration (not personal account)
- [ ] Set expiration/time limit if possible
- [ ] Verified recipient identity
- [ ] Documented what was shared and when
- [ ] Plan to rotate/revoke after use
- [ ] Not committing credentials to version control
- [ ] Not sharing via public channels

## After Project Completion

Clean up access:

1. **Revoke Temporary Access**
   - Remove team member from Coolify
   - Delete temporary SSH keys
   - Disable temporary API tokens

2. **Rotate Long-Term Credentials**
   - Create new Mautic OAuth2 credentials
   - Update production environment
   - Delete old credentials

3. **Document What Was Shared**
   - Keep record of access granted
   - Update security audit log

## Questions?

If you're unsure about:
- Which credentials to share
- How to share them securely
- What access level is needed

Just ask! Security is important, and I'm happy to work with whatever access level you're comfortable providing.

## Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Doppler Documentation](https://docs.doppler.com/)
- [1Password for Teams](https://1password.com/teams/)
- [SSH Key Best Practices](https://infosec.mozilla.org/guidelines/openssh)
