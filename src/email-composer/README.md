# Email Composer

A modular email composition system for biotech event outreach, integrated with Mautic marketing automation.

## Features

- **Modular Block Architecture**: Compose emails from reusable text blocks
- **9 Audience Types**: Pre-configured for VCs, startups, nonprofits, journalists, and more
- **33+ Email Blocks**: Greetings, openers, intentions, value propositions, CTAs, closings
- **Variable Substitution**: Safe placeholder replacement with fallback handling
- **Batch Processing**: Generate hundreds of personalized emails efficiently
- **Biotech-Specific**: Optimized for synthetic biology and biotech ecosystem outreach
- **TypeScript**: Full type safety and IntelliSense support

## Quick Start

```typescript
import { EmailComposer } from './email-composer/email-composer';

// Initialize composer
const composer = new EmailComposer();
await composer.initialize();

// Compose single email
const email = await composer.composeEmail({
  audience_type: 'vcs',
  first_name: 'Andreas',
  last_name: 'Mueller',
  email: 'a.mueller@biotech-ventures.de',
  organization_name: 'BioTech Ventures GmbH',
  sender_name: 'Thomas Weber',
  sender_email: 'thomas@synbioreactor.org',
});

console.log(email.subject); // "Invitation: SynBio Reactor Summit - Biotech Startup Showcase"
console.log(email.body);    // Fully composed, personalized email
```

## Architecture

### Block System

Emails are composed from 7 categories of blocks:

1. **Greetings** - Formal, casual, or personal salutations
2. **Openers** - Context-setting introductions
3. **Intentions** - Core ask (invite, participate, share, mentor, forward)
4. **Event Info** - Brief or detailed event descriptions
5. **Value Propositions** - Audience-specific benefits
6. **CTAs** - Clear calls-to-action
7. **Closings** - Tone-appropriate sign-offs

### Block Structure

```json
{
  "id": "greeting-formal",
  "category": "greeting",
  "tags": ["formal", "professional"],
  "tone": "formal",
  "variants": [
    {
      "id": "formal-title-lastname",
      "text": "Dear {{title}} {{last_name}},",
      "placeholders": ["title", "last_name"],
      "use_case": "When recipient's title is known"
    }
  ]
}
```

### Audience Configuration

Each audience type has predefined settings:

```json
{
  "vcs": {
    "name": "Venture Capitalists & Investors",
    "tone": "formal",
    "intention": "invite-attend",
    "valueProps": ["deal-flow", "networking"],
    "cta": "buy-ticket",
    "eventInfo": "detailed",
    "subjectTemplate": "Invitation: {{event_name}} - Biotech Startup Showcase"
  }
}
```

## Usage Examples

### Single Email with Custom Variables

```typescript
const email = await composer.composeEmail(
  {
    audience_type: 'startups-pitch',
    first_name: 'Sarah',
    email: 'sarah@biosynthinnovations.com',
    company_name: 'BioSynth Innovations',
    sender_name: 'Thomas Weber',
    sender_email: 'thomas@synbioreactor.org',
  },
  {
    customVariables: {
      deadline: 'March 15, 2024',
      prize_amount: '€10,000',
    },
  }
);
```

### Batch Processing

```typescript
const contacts = [
  { audience_type: 'vcs', email: 'vc1@example.com', ... },
  { audience_type: 'startups-pitch', email: 'startup1@example.com', ... },
  { audience_type: 'journalists', email: 'press1@example.com', ... },
];

const results = await composer.composeBatch(contacts);

for (const result of results) {
  if (!result.error) {
    console.log(`✅ ${result.email.subject}`);
    // Send email via Mautic or other provider
  }
}
```

### Override Blocks

```typescript
const email = await composer.composeEmail(contact, {
  tone: 'personal',  // Override default tone
  blockOverrides: {
    greeting: 'personal',
    valueProps: ['networking', 'recognition', 'exposure'],
    cta: 'respond-interest',
  },
});
```

### A/B Testing with Variant Selection

```typescript
// Get random variant (default behavior)
const emailA = await composer.composeEmail(contact);

// Select specific variant
const emailB = await composer.composeEmail(contact, {
  variantPreferences: {
    'greeting-casual': 'casual-hi-first',
    'cta-buy-ticket': 'ticket-early-bird',
  },
});
```

## Audience Types

| Type | Tone | Primary Goal | Value Props | CTA |
|------|------|--------------|-------------|-----|
| `nonprofits` | casual | Share event | recognition, community | share-social |
| `vcs` | formal | Buy ticket | deal-flow, networking | buy-ticket |
| `startups-pitch` | casual | Apply contest | exposure, networking | apply-contest |
| `startups-share` | casual | Share event | recognition, community | share-social |
| `gradschools` | formal | Forward internally | community, networking | forward-internal |
| `mentors` | casual | Participate | recognition, networking, community | respond-interest |
| `startup-factories` | formal | Attend | community, networking, recognition | respond-interest |
| `vips` | personal | Attend/speak | networking, recognition | respond-interest |
| `journalists` | casual | Cover event | press-access, media-story | press-rsvp |

## API Reference

### EmailComposer

#### `constructor(configDir?, blocksDir?)`

Create a new email composer instance.

```typescript
const composer = new EmailComposer(
  '/path/to/config',  // Optional: defaults to src/email-composer/config
  '/path/to/blocks'   // Optional: defaults to src/email-composer/blocks
);
```

#### `async initialize(): Promise<void>`

Load configurations and blocks.

```typescript
await composer.initialize();
```

#### `async composeEmail(contact, options?): Promise<ComposedEmail>`

Compose a single email.

**Parameters:**
- `contact: ContactData` - Contact information and audience type
- `options?: EmailCompositionOptions` - Optional overrides

**Returns:** `ComposedEmail` with subject, body, and metadata

#### `async composeBatch(contacts, globalOptions?, perContactOptions?): Promise<BatchEmailResult[]>`

Compose multiple emails.

**Parameters:**
- `contacts: ContactData[]` - Array of contacts
- `globalOptions?: EmailCompositionOptions` - Options for all contacts
- `perContactOptions?: Map<string, EmailCompositionOptions>` - Per-contact overrides (keyed by email)

**Returns:** Array of `BatchEmailResult` objects

#### `getAudienceTypes(): string[]`

Get list of available audience types.

#### `getAudienceConfig(audienceType): AudienceConfig`

Get configuration for a specific audience type.

### ContactData

Required and optional fields for email composition:

```typescript
interface ContactData {
  // Required
  audience_type: string;  // e.g., 'vcs', 'startups-pitch'
  email: string;

  // Identity (highly recommended)
  first_name?: string;
  last_name?: string;
  title?: string;  // e.g., 'Dr.', 'Prof.'

  // Organizational
  organization_name?: string;
  company_name?: string;
  sector?: string;  // defaults to 'biotech'

  // Sender (can be global or per-contact)
  sender_name?: string;
  sender_title?: string;
  sender_email?: string;
  sender_organization?: string;

  // Custom fields
  [key: string]: any;
}
```

### EmailCompositionOptions

Options for customizing email generation:

```typescript
interface EmailCompositionOptions {
  tone?: 'formal' | 'casual' | 'personal';
  customVariables?: Record<string, string>;
  blockOverrides?: {
    greeting?: string;
    opener?: string;
    intention?: string;
    eventInfo?: string;
    valueProps?: string[];
    cta?: string;
    closing?: string;
  };
  variantPreferences?: {
    [blockId: string]: string;  // variantId
  };
  strict?: boolean;  // Throw error on missing variables
  keepPlaceholders?: boolean;  // Keep {{var}} if not found
}
```

## Integration with Mautic

See [examples/mautic-email-campaign.ts](../examples/mautic-email-campaign.ts) for full integration example.

```typescript
import MauticSDK from '../index';
import { EmailComposer } from '../email-composer/email-composer';

const mautic = new MauticSDK(mauticConfig);
const composer = new EmailComposer();
await composer.initialize();

// Generate personalized email
const email = await composer.composeEmail(contact);

// Create email in Mautic
const mauticEmail = await mautic.emails.create({
  name: 'VC Outreach Campaign',
  subject: email.subject,
  customHtml: convertToHtml(email.body),
  plainText: email.body,
});

// Send to contact
await mautic.emails.sendToContact(mauticEmail.id, contactId);
```

## Integration with n8n

See [integrations/n8n/email-campaign-workflow.md](../integrations/n8n/email-campaign-workflow.md) for detailed workflow examples.

```javascript
// n8n JavaScript Node
const { EmailComposer } = require('/path/to/email-composer');

const composer = new EmailComposer();
await composer.initialize();

const contacts = $input.all().map(item => item.json);
const results = await composer.composeBatch(contacts);

return results.map(r => ({ json: r.email }));
```

## Extending the System

### Adding New Blocks

Create a new JSON file in the appropriate category directory:

```json
{
  "id": "my-custom-block",
  "category": "value-proposition",
  "tags": ["custom", "specific-benefit"],
  "variants": [
    {
      "id": "variant-1",
      "text": "Your custom text with {{placeholders}}",
      "placeholders": ["placeholder_name"],
      "use_case": "When to use this variant"
    }
  ]
}
```

### Adding New Audience Types

Edit `config/audiences.json`:

```json
{
  "my-custom-audience": {
    "name": "Display Name",
    "tone": "formal|casual|personal",
    "intention": "intention-block-tag",
    "valueProps": ["prop1", "prop2"],
    "cta": "cta-block-type",
    "eventInfo": "brief|detailed",
    "tags": ["tag1", "tag2"],
    "subjectTemplate": "Custom Subject: {{event_name}}"
  }
}
```

## Best Practices

### 1. Provide Complete Contact Data

More fields = more personalization options:

```typescript
{
  audience_type: 'vcs',
  title: 'Dr.',  // Enables formal greetings
  first_name: 'Andreas',
  last_name: 'Mueller',
  email: 'a.mueller@example.com',
  organization_name: 'BioTech Ventures',  // Enables organization mentions
  sector: 'synthetic-biology',  // Enables sector-specific messaging
}
```

### 2. Use Custom Variables for Campaign-Specific Info

```typescript
{
  customVariables: {
    deadline: 'March 15, 2024',
    prize_amount: '€10,000',
    event_highlight: 'pitch contest with top-tier judges',
  }
}
```

### 3. Test Before Batch Sending

```typescript
// Generate one email first
const testEmail = await composer.composeEmail(testContact);
console.log(testEmail.body);

// Review, then batch
const allEmails = await composer.composeBatch(allContacts);
```

### 4. Handle Errors Gracefully

```typescript
const results = await composer.composeBatch(contacts);

const successful = results.filter(r => !r.error);
const failed = results.filter(r => r.error);

console.log(`✅ Success: ${successful.length}`);
console.log(`❌ Failed: ${failed.length}`);

// Log errors
for (const result of failed) {
  console.error(`Error for ${result.contact.email}:`, result.error);
}
```

## File Structure

```
email-composer/
├── blocks/                    # 33 email blocks
│   ├── greeting/             # 3 tone variants
│   ├── opener/               # 4 context types
│   ├── intention/            # 5 core asks
│   ├── event-info/           # 2 detail levels
│   ├── value-proposition/    # 7 benefit types
│   ├── cta/                  # 6 action types
│   └── closing/              # 3 tone variants
├── config/
│   ├── audiences.json        # 9 audience definitions
│   └── event-details.json    # Event configuration
├── email-composer.ts         # Main composer
├── block-selector.ts         # Block resolution
├── variable-substitution.ts  # Placeholder replacement
└── README.md                 # This file
```

## License

MIT

## Credits

Based on the modular email system architecture from work_stack repository, adapted for TypeScript and Mautic integration.
