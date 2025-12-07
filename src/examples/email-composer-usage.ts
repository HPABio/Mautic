/**
 * Email Composer Usage Example
 * Demonstrates modular email generation with Mautic integration
 */

import { EmailComposer } from '../email-composer/email-composer';
import type { ContactData } from '../types/email-composer';

async function main() {
  console.log('📧 Email Composer Usage Example\n');

  // Initialize the composer
  const composer = new EmailComposer();
  await composer.initialize();

  console.log('✅ Email composer initialized\n');

  // Example 1: VC Outreach
  console.log('=== Example 1: Venture Capitalist Outreach ===\n');
  const vcContact: ContactData = {
    audience_type: 'vcs',
    title: 'Dr.',
    first_name: 'Andreas',
    last_name: 'Mueller',
    email: 'a.mueller@biotech-ventures.de',
    organization_name: 'BioTech Ventures GmbH',
    sector: 'biotech',
    sender_name: 'Thomas Weber',
    sender_title: 'Event Coordinator',
    sender_email: 'thomas@synbioreactor.org',
    sender_organization: 'SynBio Reactor',
  };

  const vcEmail = await composer.composeEmail(vcContact);
  console.log('Subject:', vcEmail.subject);
  console.log('\nBody:\n', vcEmail.body);
  console.log('\nMetadata:', JSON.stringify(vcEmail.metadata, null, 2));
  console.log('\n' + '='.repeat(70) + '\n');

  // Example 2: Startup Pitch Contest
  console.log('=== Example 2: Startup Pitch Contest Invitation ===\n');
  const startupContact: ContactData = {
    audience_type: 'startups-pitch',
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah@biosynthinnovations.com',
    company_name: 'BioSynth Innovations',
    sector: 'synthetic-biology',
    sender_name: 'Thomas Weber',
    sender_title: 'Event Coordinator',
    sender_email: 'thomas@synbioreactor.org',
    sender_organization: 'SynBio Reactor',
  };

  const startupEmail = await composer.composeEmail(startupContact, {
    customVariables: {
      deadline: 'March 15, 2024',
      prize_amount: '€10,000',
    },
  });

  console.log('Subject:', startupEmail.subject);
  console.log('\nBody:\n', startupEmail.body);
  console.log('\n' + '='.repeat(70) + '\n');

  // Example 3: Nonprofit Partnership
  console.log('=== Example 3: Nonprofit Partnership Request ===\n');
  const nonprofitContact: ContactData = {
    audience_type: 'nonprofits',
    first_name: 'Maria',
    last_name: 'Schmidt',
    email: 'maria@european-biotech-assoc.org',
    organization_name: 'European BioTech Association',
    sector: 'biotech',
    sender_name: 'Thomas Weber',
    sender_title: 'Event Coordinator',
    sender_email: 'thomas@synbioreactor.org',
    sender_organization: 'SynBio Reactor',
  };

  const nonprofitEmail = await composer.composeEmail(nonprofitContact);
  console.log('Subject:', nonprofitEmail.subject);
  console.log('\nBody:\n', nonprofitEmail.body);
  console.log('\n' + '='.repeat(70) + '\n');

  // Example 4: Journalist Press Invitation
  console.log('=== Example 4: Journalist Press Invitation ===\n');
  const journalistContact: ContactData = {
    audience_type: 'journalists',
    first_name: 'Emma',
    last_name: 'Thompson',
    email: 'emma@european-biotech-news.com',
    organization_name: 'European Biotech News',
    sector: 'biotech',
    sender_name: 'Thomas Weber',
    sender_title: 'Event Coordinator',
    sender_email: 'thomas@synbioreactor.org',
    sender_organization: 'SynBio Reactor',
  };

  const journalistEmail = await composer.composeEmail(journalistContact, {
    customVariables: {
      publication_name: 'European Biotech News',
      beat_topic: 'synthetic biology and bio-based innovation',
      rsvp_deadline: 'June 1, 2024',
    },
  });

  console.log('Subject:', journalistEmail.subject);
  console.log('\nBody:\n', journalistEmail.body);
  console.log('\n' + '='.repeat(70) + '\n');

  // Example 5: Batch Processing
  console.log('=== Example 5: Batch Email Generation ===\n');
  const batchContacts: ContactData[] = [
    {
      audience_type: 'mentors',
      first_name: 'Prof. David',
      last_name: 'Anderson',
      email: 'david@biotech-university.edu',
      organization_name: 'BioTech University',
      sender_name: 'Thomas Weber',
      sender_email: 'thomas@synbioreactor.org',
    },
    {
      audience_type: 'gradschools',
      first_name: 'Dr. Lisa',
      last_name: 'Williams',
      email: 'l.williams@research-institute.org',
      organization_name: 'BioMedical Research Institute',
      sender_name: 'Thomas Weber',
      sender_email: 'thomas@synbioreactor.org',
    },
    {
      audience_type: 'vips',
      first_name: 'Klaus',
      last_name: 'Becker',
      email: 'klaus.becker@biotech-leader.com',
      organization_name: 'BioTech Leaders Forum',
      sender_name: 'Thomas Weber',
      sender_email: 'thomas@synbioreactor.org',
    },
  ];

  const batchResults = await composer.composeBatch(batchContacts);

  console.log(`Generated ${batchResults.length} emails:\n`);
  for (const result of batchResults) {
    if (result.error) {
      console.log(`❌ Error for ${result.contact.email}: ${result.error.message}`);
    } else {
      console.log(`✅ ${result.contact.audience_type}: ${result.email.subject}`);
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');
  console.log('🎉 All examples completed successfully!');
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { main };
