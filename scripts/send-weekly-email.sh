#!/bin/bash

###############################################################################
# Weekly Configuration Audit Email Script
# Generates audit report and sends to laurenh@lwscientific.com
#
# Usage:
#   ./scripts/send-weekly-email.sh
#
# Requirements:
#   - SENDGRID_API_KEY environment variable
#   - Node.js installed
#   - npm run report:weekly script available
#
# Schedule with cron:
#   0 9 * * 1 cd /path/to/project && ./scripts/send-weekly-email.sh >> logs/email.log 2>&1
###############################################################################

set -e  # Exit on error

# Configuration
EMAIL_TO="${EMAIL_TO:-laurenh@lwscientific.com}"
EMAIL_FROM="${EMAIL_FROM:-noreply@labessentials.com}"
EMAIL_SUBJECT="Lab Essentials Weekly Configuration Audit - $(date +'%B %d, %Y')"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_PATH="$PROJECT_DIR/reports/WEEKLY_AUDIT_SUMMARY.md"

echo "=========================================="
echo "Weekly Configuration Audit Email"
echo "=========================================="
echo "Date: $(date)"
echo "Project: $PROJECT_DIR"
echo "Report: $REPORT_PATH"
echo "Recipient: $EMAIL_TO"
echo ""

# Check for SendGrid API key
if [ -z "$SENDGRID_API_KEY" ]; then
  echo "❌ ERROR: SENDGRID_API_KEY environment variable not set"
  echo ""
  echo "To set up SendGrid:"
  echo "1. Sign up at https://sendgrid.com/"
  echo "2. Create API key: Settings → API Keys → Create API Key"
  echo "3. Set environment variable: export SENDGRID_API_KEY=SG.xxx..."
  echo ""
  echo "Alternative email providers:"
  echo "- AWS SES: https://aws.amazon.com/ses/"
  echo "- Mailgun: https://www.mailgun.com/"
  echo "- Postmark: https://postmarkapp.com/"
  exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Generate the weekly report
echo "📝 Generating weekly audit report..."
if ! npm run report:weekly; then
  echo "❌ ERROR: Failed to generate report"
  exit 1
fi

# Check if report was created
if [ ! -f "$REPORT_PATH" ]; then
  echo "❌ ERROR: Report file not found at $REPORT_PATH"
  exit 1
fi

echo "✅ Report generated successfully"
echo ""

# Convert Markdown to HTML
echo "🔄 Converting Markdown to HTML..."
REPORT_HTML=$(node -e "
const fs = require('fs');
const path = require('path');

try {
  const md = fs.readFileSync('$REPORT_PATH', 'utf8');

  // Simple but effective Markdown to HTML conversion
  let html = '<html><head>';
  html += '<meta charset=\"utf-8\">';
  html += '<style>';
  html += 'body { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }';
  html += 'h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }';
  html += 'h2 { color: #1e40af; margin-top: 30px; border-bottom: 2px solid #dbeafe; padding-bottom: 8px; }';
  html += 'h3 { color: #3730a3; margin-top: 20px; }';
  html += 'code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: \"SF Mono\", Monaco, Consolas, monospace; font-size: 0.9em; }';
  html += 'pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 5px; overflow-x: auto; }';
  html += 'table { border-collapse: collapse; width: 100%; margin: 20px 0; }';
  html += 'th { background: #3b82f6; color: white; padding: 10px; text-align: left; }';
  html += 'td { border: 1px solid #e5e7eb; padding: 10px; }';
  html += 'tr:nth-child(even) { background: #f9fafb; }';
  html += 'ul { padding-left: 25px; }';
  html += 'li { margin: 8px 0; }';
  html += 'strong { color: #1f2937; }';
  html += 'a { color: #2563eb; text-decoration: none; }';
  html += 'a:hover { text-decoration: underline; }';
  html += '.badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.85em; font-weight: 600; }';
  html += '.badge-success { background: #d1fae5; color: #065f46; }';
  html += '.badge-warning { background: #fef3c7; color: #92400e; }';
  html += '.badge-info { background: #dbeafe; color: #1e40af; }';
  html += '.footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9em; }';
  html += '</style>';
  html += '</head><body>';

  // Convert Markdown to HTML
  html += md
    // Headers
    .replace(/^# (.+)$/gm, '<h1>\$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>\$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>\$1</h3>')
    // Bold and italic
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>\$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>\$1</em>')
    // Code
    .replace(/\`\`\`([\\s\\S]+?)\`\`\`/g, '<pre><code>\$1</code></pre>')
    .replace(/\`([^\`]+?)\`/g, '<code>\$1</code>')
    // Links
    .replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href=\"\$2\">\$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>\$1</li>')
    .replace(/(<li>.*<\\/li>\\n?)+/gs, '<ul>\$&</ul>')
    // Line breaks
    .replace(/\\n\\n/g, '</p><p>')
    // Wrap in paragraph
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>');

  html += '<div class=\"footer\">';
  html += '<p><strong>Lab Essentials Configuration Management</strong></p>';
  html += '<p>Phase 2: Admin Dashboard & Analytics Integration</p>';
  html += '<p>📊 <a href=\"https://labessentials.com/admin/config\">View Dashboard</a> | ';
  html += '📈 <a href=\"https://labessentials.com/admin/metrics\">View Metrics</a></p>';
  html += '<p style=\"font-size: 0.8em; margin-top: 15px;\">This is an automated report. Do not reply to this email.</p>';
  html += '</div>';
  html += '</body></html>';

  console.log(html);
} catch (error) {
  console.error('Error converting Markdown to HTML:', error);
  process.exit(1);
}
")

if [ -z "$REPORT_HTML" ]; then
  echo "❌ ERROR: Failed to convert Markdown to HTML"
  exit 1
fi

echo "✅ HTML generated successfully"
echo ""

# Escape JSON for curl
REPORT_HTML_ESCAPED=$(echo "$REPORT_HTML" | node -e "
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

let content = '';
rl.on('line', line => content += line);
rl.on('close', () => console.log(JSON.stringify(content)));
")

# Send email via SendGrid
echo "📧 Sending email to $EMAIL_TO..."

HTTP_RESPONSE=$(curl --silent --write-out "\nHTTP_CODE:%{http_code}" \
  --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data "{
    \"personalizations\": [
      {
        \"to\": [{\"email\": \"$EMAIL_TO\"}]
      }
    ],
    \"from\": {\"email\": \"$EMAIL_FROM\"},
    \"subject\": \"$EMAIL_SUBJECT\",
    \"content\": [
      {
        \"type\": \"text/html\",
        \"value\": $REPORT_HTML_ESCAPED
      }
    ]
  }")

# Extract HTTP status code
HTTP_CODE=$(echo "$HTTP_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "202" ]; then
  echo "✅ Email sent successfully!"
  echo ""
  echo "=========================================="
  echo "Summary:"
  echo "- Report generated: $(wc -l < "$REPORT_PATH") lines"
  echo "- Email sent to: $EMAIL_TO"
  echo "- Status: Delivered (HTTP 202)"
  echo "- Timestamp: $(date)"
  echo "=========================================="
  exit 0
else
  echo "❌ ERROR: Failed to send email (HTTP $HTTP_CODE)"
  echo ""
  echo "Response:"
  echo "$HTTP_RESPONSE" | grep -v "HTTP_CODE:"
  echo ""
  echo "Troubleshooting:"
  echo "1. Verify SENDGRID_API_KEY is valid"
  echo "2. Check SendGrid dashboard for API errors"
  echo "3. Ensure sender email ($EMAIL_FROM) is verified"
  echo "4. Check recipient email ($EMAIL_TO) is valid"
  exit 1
fi
