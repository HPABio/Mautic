# Mautic API Integration

A TypeScript SDK for integrating with the Mautic marketing automation platform, optimized for biotech event outreach and email campaigns.

## Features

- 🔐 **OAuth2 Authentication** - Automatic token management and refresh
- 📧 **Email Campaigns** - Send targeted emails to contacts and segments
- 👥 **Contact Management** - Create, update, and organize contacts
- 🎯 **Segment Management** - Create dynamic contact segments
- 📊 **Campaign Tracking** - Monitor campaign performance
- 🚀 **TypeScript First** - Full type safety and IntelliSense
- ⚡ **Built with Bun** - Fast runtime and package management

## Prerequisites

- [Bun](https://bun.sh) - JavaScript runtime and package manager
- [fnm](https://github.com/Schniz/fnm) - Node version manager (optional)
- [uv](https://github.com/astral-sh/uv) - Python package manager (optional)
- Mautic instance with API access enabled

## Quick Start

### 1. Installation

```bash
# Install dependencies
bun install
```

### 2. Mautic API Setup

Before using this SDK, you need to enable the API in your Mautic instance and create OAuth2 credentials:

1. **Enable API in Mautic:**
   - Go to Mautic Settings (⚙️ icon)
   - Navigate to Configuration → API Settings
   - Set "API enabled" to "Yes"
   - Choose "OAuth 2" as the authorization protocol
   - Save the configuration

2. **Create API Credentials:**
   - Go to Settings → API Credentials
   - Click "New"
   - Enter a name for your application
   - Set the callback/redirect URI (e.g., `http://localhost:3000/callback`)
   - Click "Apply"
   - Copy the **Client ID** and **Client Secret**

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials
```

Required environment variables:
```env
MAUTIC_BASE_URL=https://mautic.synbioreactor.de
MAUTIC_CLIENT_ID=your_client_id_here
MAUTIC_CLIENT_SECRET=your_client_secret_here
MAUTIC_CALLBACK_URL=http://localhost:3000/callback
```

### 4. Usage

```typescript
import MauticSDK from './src/index';
import { loadConfig } from './src/config/env';

// Initialize the SDK
const config = loadConfig();
const mautic = new MauticSDK(config);

// Create a contact
const contact = await mautic.contacts.create({
  firstname: 'Jane',
  lastname: 'Doe',
  email: 'jane@biotech.example.com',
  company: 'BioTech Research Inc.',
  tags: ['biotech', 'researcher']
});

// List emails
const emails = await mautic.emails.list({ limit: 10 });

// Send email to contact
await mautic.emails.sendToContact(emailId, contact.id!);
```

## Examples

### Basic Usage

```bash
bun run src/examples/basic-usage.ts
```

### Biotech Event Campaign

```bash
bun run src/examples/email-campaign.ts
```

This example demonstrates:
- Creating a segment for biotech researchers
- Adding contacts to the segment
- Creating an email template
- Sending a targeted campaign

## API Reference

### Contacts

```typescript
// Create contact
await mautic.contacts.create({
  firstname: 'John',
  lastname: 'Smith',
  email: 'john@example.com'
});

// Get contact
const contact = await mautic.contacts.get(contactId);

// List contacts
const { total, contacts } = await mautic.contacts.list({
  limit: 50,
  start: 0,
  search: 'biotech'
});

// Update contact
await mautic.contacts.update(contactId, {
  company: 'New Company'
});

// Add to segment
await mautic.contacts.addToSegment(contactId, segmentId);
```

### Emails

```typescript
// Create email
const email = await mautic.emails.create({
  name: 'Welcome Email',
  subject: 'Welcome!',
  customHtml: '<html>...</html>'
});

// Send to contact
await mautic.emails.sendToContact(emailId, contactId);

// Send to segment
await mautic.emails.sendToSegment(emailId, segmentId);

// Get statistics
const stats = await mautic.emails.getStats(emailId);
```

### Segments

```typescript
// Create segment
const segment = await mautic.segments.create({
  name: 'Active Researchers',
  description: 'Biotech researchers who opened emails',
  filters: [...]
});

// List segments
const { segments } = await mautic.segments.list();

// Add contact
await mautic.segments.addContact(segmentId, contactId);
```

### Campaigns

```typescript
// Create campaign
const campaign = await mautic.campaigns.create({
  name: 'Product Launch',
  description: 'New product announcement'
});

// Add contact
await mautic.campaigns.addContact(campaignId, contactId);
```

## Development

### Available Commands

```bash
# Start development server
bun run dev

# Run tests
bun test

# Type checking
bun run type-check

# Linting
bun run lint

# Format code
bun run format
```

### Claude Code Integration

This repository is set up for optimal use with Claude Code:

- `/dev` - Start development server
- `/test` - Run tests
- `/lint` - Check code quality
- `/setup-mautic` - Get help with Mautic API setup

### Project Structure

```
Mautic/
├── .claude/              # Claude Code configuration
│   ├── commands/         # Custom slash commands
│   ├── hooks/           # Session hooks
│   └── settings.json    # Claude settings
├── src/
│   ├── api/             # API modules
│   │   ├── auth.ts      # OAuth2 authentication
│   │   ├── client.ts    # Base API client
│   │   ├── contacts.ts  # Contact management
│   │   ├── emails.ts    # Email operations
│   │   ├── segments.ts  # Segment management
│   │   └── campaigns.ts # Campaign operations
│   ├── config/          # Configuration
│   ├── types/           # TypeScript types
│   ├── examples/        # Usage examples
│   └── index.ts         # Main SDK export
├── tests/               # Test files
└── docs/               # Documentation
```

## Authentication Flow

This SDK supports three OAuth2 grant types:

1. **Authorization Code** (User authentication)
   - User logs into Mautic
   - Authorization code exchanged for tokens
   - Suitable for web applications

2. **Refresh Token** (Automatic renewal)
   - Automatically refreshes expired access tokens
   - 14-day refresh token validity
   - Tokens are managed transparently

3. **Client Credentials** (Server-to-server)
   - Direct application authentication
   - No user interaction required
   - Used as fallback

The SDK automatically handles token refresh and will use client credentials if no user tokens are available.

## Security Considerations

### Credential Management

**NEVER commit credentials to version control:**
- The `.env` file is already in `.gitignore`
- Use environment variables for all secrets
- Use `.env.example` as a template

### Safe Credential Sharing

If you need to provide credentials for Mautic, Coolify, or server access:

1. **Environment Variables**: Share via secure channels (encrypted messages, password managers)
2. **Coolify Access**: Use temporary tokens or invite collaborators with limited permissions
3. **Server Access**: Use SSH keys instead of passwords, rotate keys regularly
4. **Mautic API**: Create separate API credentials for different applications/environments

### Recommended Tools

- **1Password** / **Bitwarden**: Share credentials via secure vaults
- **Doppler** / **Infisical**: Environment variable management for teams
- **SSH Keys**: For secure server access
- **Coolify API Tokens**: Time-limited access tokens

## Mautic API Documentation

- [Official Mautic Developer Docs](https://devdocs.mautic.org/)
- [API Documentation](https://devdocs.mautic.org/en/5.x/components/api.html)
- [OAuth2 Guide](https://github.com/mautic/developer-documentation/blob/main/source/includes/_api_authorization_oauth2.md)

## Resources

- [Mautic API Library (PHP)](https://github.com/mautic/api-library)
- [Mautic Developer Documentation](https://developer.mautic.org/)
- [How to Use the Mautic REST API](https://www.mautic.org/blog/developer/how-to-use-the-mautic-rest-api)

## Contributing

This project is set up with development best practices:
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Bun test for testing

## License

MIT

## Support

For issues or questions:
1. Check the [Mautic Developer Forums](https://forum.mautic.org/)
2. Review the [API documentation](https://devdocs.mautic.org/)
3. Open an issue in this repository

---

Built with ❤️ for biotech research outreach