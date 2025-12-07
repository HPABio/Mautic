/**
 * Basic Usage Examples for Mautic API Integration
 */

import MauticSDK from '../index';
import { loadConfig } from '../config/env';

async function main() {
  // Load configuration from environment
  const config = loadConfig();

  // Initialize the SDK
  const mautic = new MauticSDK(config);

  console.log('🚀 Mautic SDK initialized');

  try {
    // Example 1: List contacts
    console.log('\n📋 Fetching contacts...');
    const contactsResponse = await mautic.contacts.list({
      limit: 5,
      start: 0,
    });
    console.log(`Found ${contactsResponse.total} contacts`);
    console.log('First 5 contacts:', Object.keys(contactsResponse.contacts));

    // Example 2: Create a new contact
    console.log('\n👤 Creating a new contact...');
    const newContact = await mautic.contacts.create({
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane.doe@biotech.example.com',
      company: 'BioTech Research Inc.',
      position: 'Research Scientist',
      tags: ['biotech', 'researcher', 'event-attendee'],
    });
    console.log(`Created contact with ID: ${newContact.id}`);

    // Example 3: List email templates
    console.log('\n📧 Fetching email templates...');
    const emailsResponse = await mautic.emails.list({
      limit: 5,
    });
    console.log(`Found ${emailsResponse.total} email templates`);

    // Example 4: List segments
    console.log('\n🎯 Fetching segments...');
    const segmentsResponse = await mautic.segments.list({
      limit: 5,
    });
    console.log(`Found ${segmentsResponse.total} segments`);

    // Example 5: Get contact activity
    if (newContact.id) {
      console.log(`\n📊 Fetching activity for contact ${newContact.id}...`);
      const activity = await mautic.contacts.getActivity(newContact.id);
      console.log('Activity events:', activity);
    }

    // Save updated tokens if they changed
    const updatedConfig = mautic.getConfig();
    if (updatedConfig.accessToken !== config.accessToken) {
      console.log('\n🔐 Access token was refreshed');
      console.log('Save these to your .env file:');
      console.log(`MAUTIC_ACCESS_TOKEN=${updatedConfig.accessToken}`);
      console.log(`MAUTIC_REFRESH_TOKEN=${updatedConfig.refreshToken}`);
      console.log(`MAUTIC_TOKEN_EXPIRES_AT=${updatedConfig.tokenExpiresAt}`);
    }

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { main };
