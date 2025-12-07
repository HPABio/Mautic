/**
 * Mautic Email Campaign Integration Example
 * Demonstrates using Email Composer with Mautic API
 */

import MauticSDK from '../index';
import { EmailComposer } from '../email-composer/email-composer';
import { loadConfig } from '../config/env';
import type { ContactData } from '../types/email-composer';
import type { MauticContact } from '../types/mautic';

async function main() {
  console.log('🧬 Mautic Email Campaign with Modular Composer\n');

  // Initialize Mautic SDK
  const mauticConfig = loadConfig();
  const mautic = new MauticSDK(mauticConfig);

  // Initialize Email Composer
  const emailComposer = new EmailComposer();
  await emailComposer.initialize();

  console.log('✅ Mautic SDK and Email Composer initialized\n');

  try {
    // Step 1: Create a segment for biotech VCs
    console.log('📊 Creating segment for VCs...');
    const vcSegment = await mautic.segments.create({
      name: 'Biotech VCs - Summit Outreach 2024',
      alias: 'biotech-vcs-summit-2024',
      description: 'Venture capitalists interested in biotech for summit outreach',
      isPublished: true,
      filters: [
        {
          glue: 'and',
          field: 'tags',
          object: 'lead',
          type: 'tags',
          operator: 'in',
          properties: {},
          filter: 'vc,investor,biotech',
        },
      ],
    });
    console.log(`✅ Segment created with ID: ${vcSegment.id}\n`);

    // Step 2: Sample contacts for the campaign
    const campaignContacts: Array<{
      mautic: any;
      composer: ContactData;
    }> = [
      {
        mautic: {
          firstname: 'Andreas',
          lastname: 'Mueller',
          email: 'a.mueller@biotech-ventures.de',
          company: 'BioTech Ventures GmbH',
          tags: ['vc', 'investor', 'biotech'],
        },
        composer: {
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
        },
      },
      {
        mautic: {
          firstname: 'Sophie',
          lastname: 'Dubois',
          email: 's.dubois@bioinvest-partners.fr',
          company: 'BioInvest Partners',
          tags: ['vc', 'investor', 'biotech'],
        },
        composer: {
          audience_type: 'vcs',
          first_name: 'Sophie',
          last_name: 'Dubois',
          email: 's.dubois@bioinvest-partners.fr',
          organization_name: 'BioInvest Partners',
          sector: 'biotech',
          sender_name: 'Thomas Weber',
          sender_title: 'Event Coordinator',
          sender_email: 'thomas@synbioreactor.org',
          sender_organization: 'SynBio Reactor',
        },
      },
    ];

    // Step 3: Create contacts in Mautic and add to segment
    console.log('👥 Creating contacts in Mautic...');
    const mauticContactIds: number[] = [];

    for (const contact of campaignContacts) {
      const mauticContact = await mautic.contacts.create(contact.mautic);
      if (mauticContact.id) {
        mauticContactIds.push(mauticContact.id);
        console.log(`  ✓ Created contact: ${contact.mautic.firstname} ${contact.mautic.lastname} (ID: ${mauticContact.id})`);

        // Add to segment
        if (vcSegment.id) {
          await mautic.segments.addContact(vcSegment.id, mauticContact.id);
        }
      }
    }
    console.log(`✅ Created ${mauticContactIds.length} contacts in Mautic\n`);

    // Step 4: Generate personalized emails using Email Composer
    console.log('📧 Generating personalized emails...');
    const composerContacts = campaignContacts.map(c => c.composer);
    const emailResults = await emailComposer.composeBatch(composerContacts);

    console.log(`✅ Generated ${emailResults.length} personalized emails\n`);

    // Step 5: Create email template in Mautic
    console.log('📝 Creating email template in Mautic...');

    // Use the first generated email as template (for demo purposes)
    const firstEmail = emailResults[0].email;

    const mauticEmail = await mautic.emails.create({
      name: 'VC Outreach - SynBio Reactor Summit 2024',
      subject: firstEmail.subject,
      emailType: 'list',
      customHtml: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            ${firstEmail.body.split('\n\n').map(para => `<p>${para}</p>`).join('\n')}
          </div>
        </body>
        </html>
      `,
      plainText: firstEmail.body,
      fromAddress: 'thomas@synbioreactor.org',
      fromName: 'Thomas Weber - SynBio Reactor',
      replyToAddress: 'hello@synbioreactor.org',
    });

    console.log(`✅ Email template created with ID: ${mauticEmail.id}\n`);

    // Step 6: Option A - Send individual personalized emails
    console.log('📤 Sending personalized emails to contacts...');

    for (let i = 0; i < mauticContactIds.length; i++) {
      const contactId = mauticContactIds[i];
      const emailResult = emailResults[i];

      if (mauticEmail.id && !emailResult.error) {
        // In a real scenario, you'd create individual email templates or use tokens
        // For this example, we're showing the concept
        console.log(`  ✓ Would send to contact ${contactId}: "${emailResult.email.subject}"`);
        // await mautic.emails.sendToContact(mauticEmail.id, contactId);
      }
    }

    console.log('✅ Personalized emails queued for sending\n');

    // Step 7: Option B - Send to entire segment
    if (mauticEmail.id && vcSegment.id) {
      console.log('📤 Alternative: Send email template to entire segment...');
      // await mautic.emails.sendToSegment(mauticEmail.id, vcSegment.id);
      console.log('✅ Segment email would be sent to all contacts\n');
    }

    // Step 8: Display campaign summary
    console.log('📊 Campaign Summary:');
    console.log(`   Segment: ${vcSegment.name} (ID: ${vcSegment.id})`);
    console.log(`   Email Template: ${mauticEmail.name} (ID: ${mauticEmail.id})`);
    console.log(`   Contacts: ${mauticContactIds.length}`);
    console.log(`   Personalized Variants: ${emailResults.length}`);

    console.log('\n🎉 Campaign setup complete!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Review generated email content');
    console.log('   2. Test send to yourself');
    console.log('   3. Schedule or send campaign');
    console.log('   4. Monitor engagement in Mautic dashboard');

  } catch (error) {
    console.error('❌ Campaign Error:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { main };
