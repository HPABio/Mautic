/**
 * Email Campaign Example - Biotech Event Outreach
 *
 * This example demonstrates how to:
 * 1. Create a segment for biotech researchers
 * 2. Add contacts to the segment
 * 3. Send a targeted email campaign
 */

import MauticSDK from '../index';
import { loadConfig } from '../config/env';

interface ResearcherContact {
  firstname: string;
  lastname: string;
  email: string;
  company: string;
  position: string;
  researchArea?: string;
  institution?: string;
}

async function runBiotechEventCampaign() {
  const config = loadConfig();
  const mautic = new MauticSDK(config);

  console.log('🧬 Starting Biotech Event Outreach Campaign\n');

  try {
    // Step 1: Create or get a segment for biotech researchers
    console.log('📊 Creating segment for biotech researchers...');
    const segment = await mautic.segments.create({
      name: 'Biotech Event 2025 - Target Audience',
      alias: 'biotech-event-2025',
      description: 'Researchers and professionals in biotechnology for upcoming event',
      isPublished: true,
      filters: [
        {
          glue: 'and',
          field: 'tags',
          object: 'lead',
          type: 'tags',
          operator: 'in',
          properties: {},
          filter: 'biotech,researcher',
        },
      ],
    });
    console.log(`✅ Segment created with ID: ${segment.id}\n`);

    // Step 2: Sample researcher contacts
    const researchers: ResearcherContact[] = [
      {
        firstname: 'Dr. Sarah',
        lastname: 'Chen',
        email: 'sarah.chen@biotech-uni.edu',
        company: 'BioTech University',
        position: 'Principal Investigator',
        researchArea: 'Synthetic Biology',
        institution: 'BioTech University',
      },
      {
        firstname: 'Prof. Michael',
        lastname: 'Rodriguez',
        email: 'm.rodriguez@genomed-inst.org',
        company: 'GenMed Institute',
        position: 'Research Director',
        researchArea: 'Gene Therapy',
        institution: 'GenMed Institute',
      },
    ];

    // Step 3: Add contacts and assign to segment
    console.log('👥 Adding researcher contacts...');
    const contactIds: number[] = [];

    for (const researcher of researchers) {
      const contact = await mautic.contacts.create({
        firstname: researcher.firstname,
        lastname: researcher.lastname,
        email: researcher.email,
        company: researcher.company,
        position: researcher.position,
        tags: ['biotech', 'researcher', 'event-invite'],
      });

      if (contact.id) {
        contactIds.push(contact.id);
        console.log(`  ✓ Added ${researcher.firstname} ${researcher.lastname} (ID: ${contact.id})`);

        // Add to segment
        if (segment.id) {
          await mautic.segments.addContact(segment.id, contact.id);
        }
      }
    }
    console.log(`✅ Added ${contactIds.length} contacts to segment\n`);

    // Step 4: Create email template
    console.log('📧 Creating email template...');
    const email = await mautic.emails.create({
      name: 'Biotech Innovation Summit 2025 - Invitation',
      subject: 'You\'re Invited: Biotech Innovation Summit 2025',
      emailType: 'list',
      customHtml: `
        <html>
        <body>
          <h1>Dear {contactfield=firstname},</h1>

          <p>We are excited to invite you to the <strong>Biotech Innovation Summit 2025</strong>!</p>

          <p>As a leader in {contactfield=company}, we believe you would find great value in connecting with fellow researchers and industry pioneers.</p>

          <h2>Event Details:</h2>
          <ul>
            <li><strong>Date:</strong> March 15-17, 2025</li>
            <li><strong>Location:</strong> San Francisco Convention Center</li>
            <li><strong>Focus Areas:</strong> Synthetic Biology, Gene Therapy, CRISPR Applications</li>
          </ul>

          <p>
            <a href="https://biotech-summit.example.com/register?email={contactfield=email}"
               style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Register Now
            </a>
          </p>

          <p>We look forward to seeing you there!</p>

          <p>Best regards,<br>
          The Biotech Summit Team</p>
        </body>
        </html>
      `,
      fromAddress: 'events@biotech-summit.example.com',
      fromName: 'Biotech Summit Team',
      replyToAddress: 'info@biotech-summit.example.com',
    });
    console.log(`✅ Email template created with ID: ${email.id}\n`);

    // Step 5: Send email to segment
    if (email.id && segment.id) {
      console.log('📤 Sending emails to segment...');
      const sendResult = await mautic.emails.sendToSegment(email.id, segment.id);
      console.log('✅ Campaign sent!');
      console.log('Result:', sendResult);
    }

    console.log('\n🎉 Biotech Event Campaign completed successfully!');
    console.log(`\n📊 Campaign Summary:`);
    console.log(`   Segment ID: ${segment.id}`);
    console.log(`   Email Template ID: ${email.id}`);
    console.log(`   Contacts Added: ${contactIds.length}`);

  } catch (error) {
    console.error('❌ Campaign Error:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  runBiotechEventCampaign().catch(console.error);
}

export { runBiotechEventCampaign };
