import { NextRequest, NextResponse } from 'next/server';

/**
 * Reddit OAuth2 Callback Handler
 *
 * This endpoint handles the OAuth2 callback from Reddit and exchanges
 * the authorization code for an access token and refresh token.
 *
 * Usage:
 * 1. Visit the authorization URL in your browser
 * 2. Authorize the app
 * 3. Reddit redirects here with a code
 * 4. This endpoint exchanges the code for tokens
 * 5. Copy the refresh token and add it to Vercel env vars
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle authorization errors
  if (error) {
    return NextResponse.json(
      {
        error: 'Authorization failed',
        details: error,
        description: searchParams.get('error_description')
      },
      { status: 400 }
    );
  }

  // Check if code is present
  if (!code) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reddit OAuth Setup</title>
          <style>
            body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
            .box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
            .button { display: inline-block; background: #0066cc; color: white; padding: 12px 24px;
                     text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .button:hover { background: #0052a3; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 30px; }
          </style>
        </head>
        <body>
          <h1>🔴 Reddit Ads OAuth Setup</h1>

          <div class="box">
            <h2>Step 1: Click the button below to authorize</h2>
            <a href="https://ads.reddit.com/oauth2/authorize?client_id=7BTY-2OJl013Gbd2_bKkYA&response_type=code&state=random_${Date.now()}&redirect_uri=https://store.labessentials.com/api/auth/reddit/callback&duration=permanent&scope=ads.reporting" class="button">
              Authorize Reddit Ads Access
            </a>
          </div>

          <div class="box">
            <h2>What happens next:</h2>
            <ol>
              <li>You'll be redirected to Reddit to authorize the app</li>
              <li>After authorizing, Reddit will redirect you back here</li>
              <li>This page will display your <strong>refresh token</strong></li>
              <li>Copy the refresh token and add it to Vercel environment variables</li>
            </ol>
          </div>

          <div class="box">
            <h2>Your credentials:</h2>
            <ul>
              <li><strong>Client ID:</strong> <code>7BTY-2OJl013Gbd2_bKkYA</code></li>
              <li><strong>Client Secret:</strong> <code>zxz8qTnL8suczQ5o_psaDLx4p_AWmg</code></li>
              <li><strong>Redirect URI:</strong> <code>https://store.labessentials.com/api/auth/reddit/callback</code></li>
            </ul>
          </div>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // Exchange authorization code for tokens
  const clientId = '7BTY-2OJl013Gbd2_bKkYA';
  const clientSecret = 'zxz8qTnL8suczQ5o_psaDLx4p_AWmg';
  const redirectUri = 'https://store.labessentials.com/api/auth/reddit/callback';

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://ads-api.reddit.com/api/v2.0/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LabEssentials/1.0',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Token exchange failed',
          status: response.status,
          details: errorText
        },
        { status: 500 }
      );
    }

    const tokens = await response.json();

    // Return success page with tokens
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reddit OAuth Success</title>
          <style>
            body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
            .success { background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; }
            .token-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .token { background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 4px;
                    font-family: monospace; font-size: 13px; word-break: break-all; margin: 10px 0; }
            .copy-btn { background: #0066cc; color: white; border: none; padding: 10px 20px;
                       border-radius: 4px; cursor: pointer; margin: 5px 0; }
            .copy-btn:hover { background: #0052a3; }
            h1 { color: #2e7d32; }
            h2 { color: #333; margin-top: 30px; }
            .instructions { background: #fff3cd; padding: 15px; border-radius: 8px;
                           border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Authorization Successful!</h1>
            <p>Your Reddit Ads API tokens have been generated successfully.</p>
          </div>

          <div class="token-box">
            <h2>🔑 Your Refresh Token</h2>
            <p>Copy this refresh token and add it to your Vercel environment variables:</p>
            <div class="token" id="refreshToken">${tokens.refresh_token}</div>
            <button class="copy-btn" onclick="copyRefreshToken()">📋 Copy Refresh Token</button>
          </div>

          <div class="instructions">
            <h2>📝 Next Steps:</h2>
            <ol>
              <li>Go to <a href="https://vercel.com/henzelabs/lab-ess-headless/settings/environment-variables" target="_blank">Vercel Environment Variables</a></li>
              <li>Add the following environment variables:
                <ul style="margin-top: 10px;">
                  <li><code>REDDIT_CLIENT_ID</code> = <code>7BTY-2OJl013Gbd2_bKkYA</code></li>
                  <li><code>REDDIT_CLIENT_SECRET</code> = <code>zxz8qTnL8suczQ5o_psaDLx4p_AWmg</code></li>
                  <li><code>REDDIT_REFRESH_TOKEN</code> = <code>${tokens.refresh_token}</code></li>
                  <li><code>REDDIT_ACCOUNT_ID</code> = (Get from <a href="https://ads.reddit.com" target="_blank">Reddit Ads dashboard URL</a>)</li>
                </ul>
              </li>
              <li>Redeploy your application or wait for automatic deployment</li>
              <li>Your Reddit Ads metrics will now appear in the analytics dashboard!</li>
            </ol>
          </div>

          <div class="token-box">
            <h2>📊 Token Details (for reference)</h2>
            <ul>
              <li><strong>Access Token:</strong> <code>${tokens.access_token?.substring(0, 20)}...</code> (expires in ${tokens.expires_in} seconds)</li>
              <li><strong>Refresh Token:</strong> <code>${tokens.refresh_token?.substring(0, 20)}...</code> (permanent)</li>
              <li><strong>Token Type:</strong> <code>${tokens.token_type}</code></li>
              <li><strong>Scope:</strong> <code>${tokens.scope}</code></li>
            </ul>
          </div>

          <script>
            function copyRefreshToken() {
              const token = document.getElementById('refreshToken').textContent;
              navigator.clipboard.writeText(token).then(() => {
                alert('Refresh token copied to clipboard!');
              });
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Token exchange failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
