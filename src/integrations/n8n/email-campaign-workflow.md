# n8n Email Campaign Workflow Integration

This guide shows how to integrate the Email Composer with n8n for automated biotech outreach campaigns.

## Overview

The Email Composer can be used in n8n workflows to:
- Generate personalized emails at scale
- Integrate with TwentyCRM for contact management
- Send via Mautic, SendGrid, or other email providers
- Track campaign performance

## Workflow Architecture

```
n8n Workflow:
├── Trigger: Webhook, Schedule, or Manual
├── Node 1: Fetch Contacts (TwentyCRM/Database/CSV)
├── Node 2: JavaScript - Email Composer
├── Node 3: Mautic API - Create/Update Contacts
├── Node 4: Mautic API - Send Emails
└── Node 5: Log Results (Database/Webhook)
```

## Example Workflows

### Workflow 1: VC Outreach Campaign

**Nodes:**

1. **Schedule Trigger** - Run every Monday at 9 AM
2. **HTTP Request** - Fetch VCs from TwentyCRM
   ```javascript
   // Endpoint: GET /api/contacts?filter=audience_type:vcs
   ```

3. **JavaScript Code** - Generate Emails
   ```javascript
   const { EmailComposer } = require('/path/to/email-composer');

   async function generateEmails() {
     const composer = new EmailComposer();
     await composer.initialize();

     const contacts = $input.all().map(item => ({
       audience_type: 'vcs',
       first_name: item.json.first_name,
       last_name: item.json.last_name,
       email: item.json.email,
       organization_name: item.json.company,
       title: item.json.title,
       sender_name: 'Thomas Weber',
       sender_email: 'thomas@synbioreactor.org',
     }));

     const emails = await composer.composeBatch(contacts);
     return emails.map(result => ({
       json: {
         contact: result.contact,
         subject: result.email.subject,
         body: result.email.body,
         metadata: result.email.metadata,
       }
     }));
   }

   return await generateEmails();
   ```

4. **Mautic** - Create Contact
   - Resource: Contact
   - Operation: Create or Update
   - Map fields from previous node

5. **Mautic** - Send Email
   - Resource: Email
   - Operation: Send to Contact
   - Subject: `{{ $json.subject }}`
   - Body: `{{ $json.body }}`

6. **PostgreSQL** - Log Campaign
   ```sql
   INSERT INTO campaign_sends (contact_id, email, subject, sent_at)
   VALUES ($1, $2, $3, NOW())
   ```

### Workflow 2: Multi-Audience Event Campaign

**Nodes:**

1. **Manual Trigger**

2. **Function** - Define Audience Segments
   ```javascript
   return [
     { audienceType: 'vcs', segment: 'investors' },
     { audienceType: 'startups-pitch', segment: 'startups' },
     { audienceType: 'nonprofits', segment: 'partners' },
     { audienceType: 'journalists', segment: 'media' },
   ].map(item => ({ json: item }));
   ```

3. **Loop** - For each audience type

4. **HTTP Request** - Fetch contacts by segment
   ```
   GET /api/contacts?audience_type={{ $json.audienceType }}
   ```

5. **JavaScript Code** - Generate Personalized Emails
   ```javascript
   const { EmailComposer } = require('/path/to/email-composer');

   async function generateForAudience() {
     const composer = new EmailComposer();
     await composer.initialize();

     const audienceType = $('Loop').item.json.audienceType;
     const contacts = $input.all().map(item => ({
       ...item.json,
       audience_type: audienceType,
     }));

     return await composer.composeBatch(contacts);
   }

   return await generateForAudience();
   ```

6. **Split In Batches** - Send in groups of 50

7. **Mautic** - Send Emails

8. **Wait** - 5 minutes between batches (rate limiting)

### Workflow 3: Follow-up Sequence

**Nodes:**

1. **Webhook Trigger** - Contact registered for event

2. **Wait** - 1 day

3. **JavaScript** - Generate Thank You Email
   ```javascript
   const composer = new EmailComposer();
   await composer.initialize();

   const contact = {
     audience_type: $json.original_audience_type,
     email: $json.email,
     first_name: $json.first_name,
     // ... other fields
   };

   // Override to use a different intention
   const email = await composer.composeEmail(contact, {
     blockOverrides: {
       intention: 'thank-you',
       cta: 'prepare-for-event',
     }
   });

   return [{ json: email }];
   ```

4. **Mautic** - Send Follow-up

5. **Wait** - 3 days

6. **JavaScript** - Generate Reminder Email

7. **Mautic** - Send Reminder

## Code Examples

### Email Composer Module (n8n JavaScript Node)

```javascript
// Import the Email Composer
const { EmailComposer } = require('/home/user/Mautic/src/email-composer/email-composer');

// Initialize
const composer = new EmailComposer(
  '/home/user/Mautic/src/email-composer/config',
  '/home/user/Mautic/src/email-composer/blocks'
);
await composer.initialize();

// Process contacts from previous n8n node
const inputContacts = $input.all();
const contacts = inputContacts.map(item => item.json);

// Generate emails
const results = await composer.composeBatch(contacts);

// Return formatted for n8n
return results.map(result => ({
  json: {
    email: result.contact.email,
    subject: result.email.subject,
    body: result.email.body,
    html: result.email.body.split('\n\n').map(p => `<p>${p}</p>`).join('\n'),
    metadata: result.email.metadata,
  }
}));
```

### Contact Mapping (Transform Node)

```javascript
// Map TwentyCRM contact to Email Composer format
return {
  audience_type: $json.tags.includes('investor') ? 'vcs' :
                 $json.tags.includes('startup') ? 'startups-pitch' :
                 $json.tags.includes('press') ? 'journalists' : 'nonprofits',

  first_name: $json.person.first_name,
  last_name: $json.person.last_name,
  title: $json.person.title,
  email: $json.person.email,
  organization_name: $json.company?.name,
  sector: $json.custom_fields?.sector || 'biotech',

  sender_name: 'Thomas Weber',
  sender_title: 'Event Coordinator',
  sender_email: 'thomas@synbioreactor.org',
  sender_organization: 'SynBio Reactor',
};
```

### Error Handling

```javascript
const { EmailComposer } = require('/path/to/email-composer');

async function safeCompose() {
  const composer = new EmailComposer();
  await composer.initialize();

  const results = [];
  for (const contact of $input.all()) {
    try {
      const email = await composer.composeEmail(contact.json);
      results.push({
        json: {
          success: true,
          contact: contact.json.email,
          email,
        }
      });
    } catch (error) {
      results.push({
        json: {
          success: false,
          contact: contact.json.email,
          error: error.message,
        }
      });
    }
  }
  return results;
}

return await safeCompose();
```

## Integration with Mautic

### Create Segment-Specific Campaigns

```javascript
// n8n Node: Create Mautic Segment and Send Campaign

const segmentConfig = {
  'vcs': { name: 'Biotech VCs', filters: ['investor', 'biotech'] },
  'startups-pitch': { name: 'Pitch Applicants', filters: ['startup', 'applicant'] },
  'journalists': { name: 'Media Contacts', filters: ['press', 'media'] },
};

const audienceType = $json.audience_type;
const config = segmentConfig[audienceType];

// Create Mautic segment via API
// Then compose and send emails to segment
```

### Track Email Engagement

```javascript
// n8n Node: Process Mautic webhook for email opens/clicks

const event = $json;

if (event.type === 'email.open') {
  // Log engagement to database
  // Trigger follow-up workflow
}

if (event.type === 'email.click') {
  // Track which CTA was clicked
  // Update contact score
}
```

## Best Practices

### 1. Rate Limiting

Use **Wait** nodes between batches to avoid overwhelming email servers:
```
Split In Batches (50 emails)
  → Send Batch
  → Wait (2 minutes)
  → Next Batch
```

### 2. Personalization Variables

Always provide complete contact data to maximize personalization:
```javascript
{
  audience_type: 'vcs',
  first_name: 'Andreas',
  last_name: 'Mueller',
  title: 'Dr.',
  email: 'a.mueller@example.com',
  organization_name: 'BioTech Ventures',
  sector: 'biotech',
  // Add custom variables for specific campaigns
  deadline: '2024-06-15',
  event_highlight: 'pitch contest'
}
```

### 3. A/B Testing

Use variant preferences to test different email versions:
```javascript
const variantA = await composer.composeEmail(contact, {
  variantPreferences: {
    'intention-invite-attend': 'formal-investment-focus'
  }
});

const variantB = await composer.composeEmail(contact, {
  variantPreferences: {
    'intention-invite-attend': 'casual-networking-focus'
  }
});

// Send variant A to 50%, B to 50%
```

### 4. Error Logging

Log all errors to a database for debugging:
```javascript
if (result.error) {
  await logError({
    contact_email: result.contact.email,
    error_message: result.error.message,
    timestamp: new Date(),
    workflow_id: $workflow.id,
  });
}
```

## Environment Variables

Configure these in your n8n instance or .env file:

```bash
# Email Composer Paths
EMAIL_COMPOSER_CONFIG_DIR=/home/user/Mautic/src/email-composer/config
EMAIL_COMPOSER_BLOCKS_DIR=/home/user/Mautic/src/email-composer/blocks

# Mautic Integration
MAUTIC_BASE_URL=https://mautic.synbioreactor.de
MAUTIC_CLIENT_ID=your_client_id
MAUTIC_CLIENT_SECRET=your_client_secret

# Sender Defaults
DEFAULT_SENDER_NAME=Thomas Weber
DEFAULT_SENDER_EMAIL=thomas@synbioreactor.org
DEFAULT_SENDER_ORGANIZATION=SynBio Reactor
```

## Workflow Templates

Ready-to-import n8n workflow templates are available in:
- `src/integrations/n8n/workflows/vc-outreach.json`
- `src/integrations/n8n/workflows/startup-pitch.json`
- `src/integrations/n8n/workflows/multi-audience-campaign.json`

## Further Reading

- [n8n JavaScript Node Documentation](https://docs.n8n.io/code-examples/javascript-functions/)
- [Mautic API Integration](https://devdocs.mautic.org/)
- [Email Composer API Reference](../email-composer/README.md)
