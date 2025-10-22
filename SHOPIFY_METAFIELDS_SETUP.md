# Shopify Metafields Setup Guide

## Step 1: Create a Custom App in Shopify

1. Go to **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **"Develop apps"** (top right)
3. Click **"Create an app"**
4. Name it: `Metafield Management`
5. Click **"Create app"**

## Step 2: Configure API Scopes

1. Click **"Configure Admin API scopes"**
2. Enable these scopes:
   - ✅ `read_products`
   - ✅ `write_products`
   - ✅ `read_metaobjects`
   - ✅ `write_metaobjects`
3. Click **"Save"**

## Step 3: Install the App

1. Click **"Install app"** (top right)
2. Confirm installation

## Step 4: Get Your Admin API Access Token

1. Click **"API credentials"** tab
2. Under **"Admin API access token"**, click **"Reveal token once"**
3. **COPY THE TOKEN** (you won't see it again!)
4. Save it somewhere safe (password manager)

## Step 5: Set Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist):

```bash
# Add these lines to .env.local
SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Replace:**
- `your-store-name` with your actual store name
- `shpat_xxxxx` with the token you copied

## Step 6: Use the Metafield Management Script

### List existing metafield definitions:
```bash
node scripts/shopify-metafields.js list
```

### Create new metafield definitions:
```bash
node scripts/shopify-metafields.js create
```

This will create:
- ✅ Key Features (list)
- ✅ Applications (list)
- ✅ User Manual PDF (file)
- ✅ Quick Start Guide PDF (file)
- ✅ Technical Specs PDF (file)
- ✅ Equipment Category (text)

### Delete a specific metafield definition:
```bash
node scripts/shopify-metafields.js delete features
node scripts/shopify-metafields.js delete applications
```

## Metafield Structure Reference

After creation, you'll have these metafields available on all products:

| Metafield Name | Namespace | Key | Type | Use For |
|---|---|---|---|---|
| Key Features | `custom` | `features` | List of text | Product bullet points |
| Applications | `custom` | `applications` | List of text | Use cases |
| User Manual PDF | `custom` | `manual_pdf` | File | Manual upload |
| Quick Start Guide PDF | `custom` | `quick_start_pdf` | File | Quick start guide |
| Technical Specs PDF | `custom` | `specs_pdf` | File | Spec sheet |
| Equipment Category | `custom` | `equipment_category` | Text | microscope, centrifuge, etc. |

## Next Steps: Create Metaobject for Specifications

Unfortunately, metaobjects must be created via Shopify Admin UI (GraphQL API doesn't support it well yet).

### Manual Steps:

1. Go to **Settings** → **Custom data** → **Metaobjects**
2. Click **"Add definition"**
3. **Name:** `Lab Equipment Specs`
4. **Type:** `lab_equipment_specs`
5. Add these fields:

| Field Name | Key | Type |
|---|---|---|
| Power Input | `power_input` | Single line text |
| Dimensions | `dimensions` | Single line text |
| Weight | `weight` | Single line text |
| Certifications | `certifications` | Single line text |
| Primary Spec Label | `primary_spec_label` | Single line text |
| Primary Spec Value | `primary_spec_value` | Single line text |
| Secondary Spec Label | `secondary_spec_label` | Single line text |
| Secondary Spec Value | `secondary_spec_value` | Single line text |
| Tertiary Spec Label | `tertiary_spec_label` | Single line text |
| Tertiary Spec Value | `tertiary_spec_value` | Single line text |
| Noise Level | `noise_level` | Single line text (optional) |
| Operating Temperature | `operating_temp` | Single line text (optional) |

6. Click **"Save"**

### Then add it as a product metafield:

1. Go to **Settings** → **Custom data** → **Products**
2. Click **"Add definition"**
3. **Name:** `Specifications`
4. **Namespace:** `custom`
5. **Key:** `specifications`
6. **Type:** Metaobject reference → Select `lab_equipment_specs`
7. Click **"Save"**

## Troubleshooting

### "401 Unauthorized"
- Check that your `SHOPIFY_ADMIN_API_TOKEN` is correct
- Make sure you revealed the token after installing the app

### "Access denied"
- Verify you enabled the correct API scopes (read/write products and metaobjects)
- Reinstall the app after changing scopes

### Script errors
- Make sure `.env.local` is in the project root
- Verify `SHOPIFY_STORE_DOMAIN` includes `.myshopify.com`
- Don't include `https://` in the store domain

## Security Note

⚠️ **Never commit `.env.local` to git!** Your `.gitignore` should already exclude it.

The Admin API token has full access to your store's products and metafields.
