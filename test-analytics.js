#!/usr/bin/env node

// Analytics Testing Script
// Tests GA4, GTM, Meta Pixel, and Taboola implementations

const GA4_MEASUREMENT_ID = 'G-7NR2JG1EDP';
const GA4_API_SECRET = 'Y-eokJURRGCDdOpXsNm2dw';
const META_PIXEL_ID = '940971967399612';
const TABOOLA_ID = '1759164';

async function testGA4() {
  console.log('\n🔍 Testing GA4 Measurement Protocol...');

  const testEvents = [
    {
      name: 'page_view',
      params: {
        page_title: 'Test Analytics Page',
        page_location: 'https://labessentials.com/test',
        engagement_time_msec: 100,
      },
    },
    {
      name: 'view_item',
      params: {
        currency: 'USD',
        value: 299.99,
        items: [
          {
            item_id: 'MICROSCOPE_001',
            item_name: 'Professional Microscope',
            category: 'lab-equipment',
            quantity: 1,
            price: 299.99,
          },
        ],
      },
    },
    {
      name: 'add_to_cart',
      params: {
        currency: 'USD',
        value: 299.99,
        items: [
          {
            item_id: 'MICROSCOPE_001',
            item_name: 'Professional Microscope',
            category: 'lab-equipment',
            quantity: 1,
            price: 299.99,
          },
        ],
      },
    },
  ];

  for (const event of testEvents) {
    try {
      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: `test_${Date.now()}`,
            events: [event],
          }),
        },
      );

      console.log(
        `✅ GA4 ${event.name} event sent successfully (${response.status})`,
      );
    } catch (error) {
      console.log(`❌ GA4 ${event.name} event failed:`, error.message);
    }
  }
}

async function validateGA4Events() {
  console.log('\n🔍 Validating GA4 event structure...');

  const testEvent = {
    name: 'purchase',
    params: {
      transaction_id: 'T_' + Date.now(),
      currency: 'USD',
      value: 599.98,
      items: [
        {
          item_id: 'MICROSCOPE_001',
          item_name: 'Professional Microscope',
          category: 'lab-equipment',
          quantity: 2,
          price: 299.99,
        },
      ],
    },
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/debug/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'validation_test',
          events: [testEvent],
        }),
      },
    );

    const result = await response.json();

    if (result.validationMessages && result.validationMessages.length === 0) {
      console.log('✅ GA4 event validation passed - no errors found');
    } else {
      console.log('⚠️ GA4 validation issues:', result.validationMessages);
    }
  } catch (error) {
    console.log('❌ GA4 validation failed:', error.message);
  }
}

async function testMetaPixel() {
  console.log(
    '\n🔍 Testing Meta Pixel (Base test - access token needed for Conversions API)...',
  );

  // Note: Without access token, we can only validate the pixel ID format
  console.log(
    `📋 Meta Pixel ID: ${META_PIXEL_ID} ${
      /^\d{15}$/.test(META_PIXEL_ID) ? '✅ Valid format' : '❌ Invalid format'
    }`,
  );
  console.log(
    'ℹ️ Meta Pixel will fire via client-side script. For Conversions API testing, provide access token.',
  );
}

async function testTaboola() {
  console.log('\n🔍 Testing Taboola...');

  // Taboola events are sent via their pixel, we can verify the format
  console.log(
    `📋 Taboola Account ID: ${TABOOLA_ID} ${
      /^\d+$/.test(TABOOLA_ID) ? '✅ Valid format' : '❌ Invalid format'
    }`,
  );
  console.log('ℹ️ Taboola events will fire via client-side script.');
}

async function main() {
  console.log('🚀 Lab Essentials Analytics Testing');
  console.log('===================================');

  await testGA4();
  await validateGA4Events();
  await testMetaPixel();
  await testTaboola();

  console.log('\n📊 Test Summary:');
  console.log('• GA4: Ready for testing (check DebugView in GA4)');
  console.log('• GTM: Container GTM-WNG6Z9ZD should receive events');
  console.log('• Meta Pixel: Client-side implementation added');
  console.log('• Taboola: Client-side implementation ready');
  console.log('\n💡 Next steps:');
  console.log('1. Check GA4 DebugView for test events');
  console.log('2. Provide Meta access token for Conversions API testing');
  console.log('3. Verify GTM is firing tags correctly');
  console.log('4. Test the site tracking manually');
}

main().catch(console.error);
