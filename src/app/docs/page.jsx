'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LandingNav from '@/components/LandingNav';

export default function DocsPage() {
  return (
    <main className="bg-white text-slate-900">
      <LandingNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[220px_1fr_220px] gap-8">
        <SidebarNav />
        <ContentArea />
        <OnThisPage />
      </div>
    </main>
  );
}

/* ────────────────────────────────────────── Sidebar TOC (left) */
const SECTIONS = [
  { id: 'overview',     label: 'Overview',         group: 'Get Started' },
  { id: 'quickstart',   label: 'Quick Start',      group: 'Get Started' },
  { id: 'how',          label: 'How It Works',     group: 'Get Started' },
  { id: 'auth',         label: 'Authentication',   group: 'Concepts' },
  { id: 'gateways',     label: 'Gateways',         group: 'Concepts' },
  { id: 'apk',          label: 'The APK',          group: 'Concepts' },
  { id: 'step-register',  label: '1. Register',           group: 'Integration' },
  { id: 'step-configure', label: '2. Configure Gateway',  group: 'Integration' },
  { id: 'step-bind',      label: '3. Bind the APK',       group: 'Integration' },
  { id: 'step-checkout',  label: '4. Hosted Checkout',    group: 'Integration' },
  { id: 'step-verify',    label: '5. Verify on Return',   group: 'Integration' },
  { id: 'api-sessions',   label: 'Payment Sessions',      group: 'API Reference' },
  { id: 'api-verify',     label: 'Manual Verify',         group: 'API Reference' },
  { id: 'api-devices',    label: 'Devices (APK)',         group: 'API Reference' },
  { id: 'errors',         label: 'Errors & Status Codes', group: 'API Reference' },
  { id: 'troubleshoot',   label: 'Troubleshooting',       group: 'API Reference' },
  { id: 'best',           label: 'Best Practices',        group: 'Production' },
  { id: 'webhooks',       label: 'Webhooks',              group: 'Production' },
  { id: 'support',        label: 'Support',               group: 'Production' },
];

function SidebarNav() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);

    const onScroll = () => {
      const y = window.scrollY + 120;
      let current = ids[0];
      for (const el of elements) {
        if (el.offsetTop <= y) current = el.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const groups = Array.from(new Set(SECTIONS.map((s) => s.group)));

  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 space-y-5 text-sm">
        {groups.map((g) => (
          <div key={g}>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{g}</div>
            <ul className="space-y-0.5">
              {SECTIONS.filter((s) => s.group === g).map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`block py-1.5 px-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors ${
                      active === s.id ? 'bg-brand-50 text-brand-700 font-semibold' : ''
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* ────────────────────────────────────────── Right "On this page" rail (just spacer for now) */
function OnThisPage() {
  return <aside className="hidden xl:block" />;
}

/* ────────────────────────────────────────── Main content */
function ContentArea() {
  return (
    <article className="min-w-0 prose-docs">
      <Hero />

      <Section id="overview" eyebrow="Get Started" title="Overview">
        <p>
          <strong>PayVerify</strong> verifies wallet, bank, and UPI payments by matching the
          customer&apos;s transaction ID against the actual SMS your bound Android device receives.
          We don&apos;t process payments — we only confirm them.
        </p>
        <p className="mt-3">
          This guide walks you through the full integration: from creating your merchant account
          to having verified transactions land in your dashboard.
        </p>
        <Callout tone="brand" title="Three things make a payment work">
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>A configured <strong>gateway</strong> — your wallet/bank account where money lands</li>
            <li>A bound <strong>APK</strong> on the phone that receives the SMS</li>
            <li>An <strong>API call</strong> from your backend (or a customer-typed TxnID)</li>
          </ol>
        </Callout>
      </Section>

      <Section id="quickstart" eyebrow="Get Started" title="Quick Start (5 minutes)">
        <ol className="space-y-3 text-slate-700">
          <li><span className="font-semibold text-slate-900">1.</span> Sign up at <Link href="/register" className="text-brand-600 hover:underline">/register</Link> — pick your country (currency auto-set)</li>
          <li><span className="font-semibold text-slate-900">2.</span> Note your <code className="text-xs">API Key</code> (Brands page) and <code className="text-xs">Device Auth Key</code> (Devices page)</li>
          <li><span className="font-semibold text-slate-900">3.</span> Add a Gateway — your wallet/bank account number (or last 4 of bank acct)</li>
          <li><span className="font-semibold text-slate-900">4.</span> Install the APK on your shop&apos;s phone, paste the Device Auth Key</li>
          <li><span className="font-semibold text-slate-900">5.</span> Test with a checkout session (see below)</li>
        </ol>

        <CodeBlock language="bash" caption="Test the API now — replace pk_live_... with your key">{`curl -X POST https://checkout.ezypay.it.com/api/payment/sessions \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500,
    "order_id": "TEST-001",
    "redirect_url": "https://example.com/done"
  }'`}</CodeBlock>
        <p className="text-sm text-slate-600 mt-2">
          The response gives you a <code className="text-xs">checkout_url</code> — open it in a
          browser, pick a gateway, paste a TxnID, click Verify. That&apos;s the whole flow.
        </p>
      </Section>

      <Section id="how" eyebrow="Get Started" title="How It Works">
        <p>
          PayVerify sits between the merchant&apos;s e-commerce backend, the customer&apos;s browser,
          and the bound Android phone receiving wallet SMS.
        </p>

        <Diagram />

        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li><span className="text-brand-600 font-semibold">1.</span> Customer hits your checkout — your backend calls <code className="text-xs">POST /api/payment/sessions</code></li>
          <li><span className="text-brand-600 font-semibold">2.</span> We return a hosted <code className="text-xs">checkout_url</code> — you redirect the customer</li>
          <li><span className="text-brand-600 font-semibold">3.</span> Customer pays from their wallet app, then pastes the TxnID on the checkout and clicks Verify</li>
          <li><span className="text-brand-600 font-semibold">4.</span> Your bound APK forwards the incoming wallet SMS to our backend (pure staging — nothing is auto-created from random SMS)</li>
          <li><span className="text-brand-600 font-semibold">5.</span> The customer&apos;s TxnID is matched against the staged SMS — match found, transaction marked <strong>Done</strong>, customer redirected back to you</li>
        </ul>
      </Section>

      <Section id="auth" eyebrow="Concepts" title="Authentication">
        <p>PayVerify uses three credentials, each for a different actor:</p>
        <CredentialTable />
        <Callout tone="amber" title="Keep keys server-side">
          Never expose <code className="text-xs">api_key</code> or <code className="text-xs">device_auth_key</code> to the
          browser. They belong on your backend (api_key) or inside the bound APK
          (device_auth_key) — never in client-side JavaScript.
        </Callout>
      </Section>

      <Section id="gateways" eyebrow="Concepts" title="Gateways">
        <p>
          A <strong>gateway</strong> is one wallet/bank account where you receive customer payments —
          e.g. <em>bKash Personal · 01711111111</em>, or <em>UPI · last-4-of-bank XX6788</em>.
          Each gateway has an <code className="text-xs">account_number</code> that gets matched against incoming SMS.
        </p>
        <Callout tone="brand" title="Multiple identifiers per gateway">
          You can comma-separate identifiers in a single gateway. For UPI, store both your{' '}
          <strong>mobile number</strong> (what customers know) and your <strong>bank account suffix</strong>
          (what your bank SMS shows). Example: <code className="text-xs">8389834331, XX6788</code> — we match if any one appears in the SMS body.
        </Callout>
      </Section>

      <Section id="apk" eyebrow="Concepts" title="The APK">
        <p>
          The PayVerify Android app runs on the phone you use to receive wallet SMS. It does one job:{' '}
          <strong>read incoming wallet SMS and forward them to our backend</strong> as data staging.
          The SMS only becomes a verification when a customer submits a matching TxnID through your
          checkout — random unrelated SMS sit unused and never become orphan transactions.
        </p>
        <p className="mt-3">
          The APK also receives <strong>verify requests</strong> for any pending row a customer
          submits that hasn&apos;t auto-matched yet, so the merchant can Approve / Reject from the phone
          (mirror of the dashboard&apos;s Mark Paid / Mark Failed).
        </p>
        <p className="mt-3">
          Install the APK on the SIM-receiving device, open it on first launch, paste your{' '}
          <strong>Device Auth Key</strong> from the dashboard (<code className="text-xs">PV-XXXXXX</code>) — done.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          For Android developers building/extending the APK, see the full contract at{' '}
          <code className="text-xs">docs/APK_API.md</code> in the repo.
        </p>
      </Section>

      <Section id="step-register" eyebrow="Integration" title="Step 1 — Register">
        <p>
          Visit <Link href="/register" className="text-brand-600 hover:underline">/register</Link>.
          Fill in your business details. Your country choice determines your default currency
          (India → INR, Bangladesh → BDT, US → USD, etc.) — you can override per-session later.
        </p>
        <p className="mt-3">
          On successful registration, four things are generated for you:
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li><code className="text-xs">api_key</code> (pk_live_...) — for your backend</li>
          <li><code className="text-xs">secret_key</code> (sk_live_...) — for webhook signatures (future)</li>
          <li><code className="text-xs">device_auth_key</code> (PV-XXXXXX) — for binding your phone</li>
          <li>A default <strong>brand</strong> matching your domain</li>
        </ul>
      </Section>

      <Section id="step-configure" eyebrow="Integration" title="Step 2 — Configure a Gateway">
        <p>
          Go to <code className="text-xs">/dashboard/gateways</code> → <strong>Add Gateway</strong> → pick your
          provider (bKash / Nagad / Rocket / Upay, or whatever admin has configured).
        </p>
        <p className="mt-3 text-sm text-slate-700">
          The <strong>Account Number</strong> field must contain what the wallet&apos;s SMS will mention —
          for UPI/bank deposits, that&apos;s your <strong>bank account suffix</strong> (e.g. <code className="text-xs">XX6788</code>),
          not your GPay phone (the bank SMS doesn&apos;t echo your GPay number).
        </p>
      </Section>

      <Section id="step-bind" eyebrow="Integration" title="Step 3 — Bind the APK">
        <p>
          Install PayVerify on the Android phone that receives your wallet SMS. On first launch, paste
          your <code className="text-xs">device_auth_key</code> (PV-XXXXXX). The phone shows up in <code className="text-xs">/dashboard/devices</code> as
          Online.
        </p>
        <p className="mt-3 text-sm text-slate-700">
          From this moment, every wallet SMS that arrives on the phone gets forwarded to PayVerify
          automatically.
        </p>
      </Section>

      <Section id="step-checkout" eyebrow="Integration" title="Step 4 — Hosted Checkout">
        <p>
          When a customer reaches your checkout, your backend creates a payment session and redirects
          them to the PayVerify checkout URL.
        </p>

        <TabGroup tabs={['Node.js', 'PHP', 'Python', 'cURL']}>
          <CodeBlock language="js">{`// Node.js (Express)
app.post('/checkout', async (req, res) => {
  const r = await fetch('https://checkout.ezypay.it.com/api/payment/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key':     process.env.PAYVERIFY_API_KEY,
    },
    body: JSON.stringify({
      amount:        req.body.amount,
      order_id:      req.body.order_id,
      redirect_url:  'https://yourstore.com/payment/result',
      customer_phone: req.body.customer_phone,
    }),
  });
  const { checkout_url } = await r.json();
  res.redirect(checkout_url);
});`}</CodeBlock>

          <CodeBlock language="php">{`<?php
// PHP
$ch = curl_init('https://checkout.ezypay.it.com/api/payment/sessions');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST           => true,
  CURLOPT_HTTPHEADER     => [
    'Content-Type: application/json',
    'X-API-Key: ' . getenv('PAYVERIFY_API_KEY'),
  ],
  CURLOPT_POSTFIELDS     => json_encode([
    'amount'       => $_POST['amount'],
    'order_id'     => $_POST['order_id'],
    'redirect_url' => 'https://yourstore.com/payment/result',
  ]),
]);
$body = json_decode(curl_exec($ch), true);
header('Location: ' . $body['checkout_url']);`}</CodeBlock>

          <CodeBlock language="python">{`# Python (Flask / Django)
import os, requests

r = requests.post(
    'https://checkout.ezypay.it.com/api/payment/sessions',
    headers={'X-API-Key': os.environ['PAYVERIFY_API_KEY']},
    json={
        'amount':       request.form['amount'],
        'order_id':     request.form['order_id'],
        'redirect_url': 'https://yourstore.com/payment/result',
    },
    timeout=10,
)
return redirect(r.json()['checkout_url'])`}</CodeBlock>

          <CodeBlock language="bash">{`curl -X POST https://checkout.ezypay.it.com/api/payment/sessions \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":        500,
    "order_id":      "ORD-1001",
    "redirect_url":  "https://yourstore.com/payment/result",
    "customer_phone": "+8801712345678"
  }'`}</CodeBlock>
        </TabGroup>

        <Callout tone="slate" title="Session lifecycle">
          Sessions expire <strong>30 minutes</strong> after creation. Once a customer submits a TxnID
          and we verify it, the session flips to <code className="text-xs">success</code>. If they
          cancel, it flips to <code className="text-xs">cancelled</code>. Beyond 30 min, it auto-expires.
        </Callout>
      </Section>

      <Section id="step-verify" eyebrow="Integration" title="Step 5 — Verify on Return">
        <p>
          After payment, the customer is redirected back to your <code className="text-xs">redirect_url</code> with query params:
        </p>
        <CodeBlock language="text">{`https://yourstore.com/payment/result?session_id=eNOuUpsg2IGX4ko4HbFL&status=success`}</CodeBlock>

        <Callout tone="rose" title="Don't trust query params">
          A bad actor could craft <code className="text-xs">?status=success</code> directly without paying.
          Always verify server-side by calling <code className="text-xs">GET /api/payment/sessions/:id</code>.
        </Callout>

        <TabGroup tabs={['Node.js', 'PHP', 'cURL']}>
          <CodeBlock language="js">{`app.get('/payment/result', async (req, res) => {
  const r = await fetch(
    \`https://checkout.ezypay.it.com/api/payment/sessions/\${req.query.session_id}\`,
    { headers: { 'X-API-Key': process.env.PAYVERIFY_API_KEY } }
  );
  const { session } = await r.json();
  if (session.status === 'success') {
    await markOrderPaid(session.order_id);
    res.render('order-confirmed', { session });
  } else {
    res.render('payment-failed', { reason: session.status });
  }
});`}</CodeBlock>

          <CodeBlock language="php">{`<?php
$id = $_GET['session_id'];
$ch = curl_init("https://checkout.ezypay.it.com/api/payment/sessions/$id");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => ['X-API-Key: ' . getenv('PAYVERIFY_API_KEY')],
]);
$body = json_decode(curl_exec($ch), true);
if ($body['session']['status'] === 'success') {
  mark_order_paid($body['session']['order_id']);
}`}</CodeBlock>

          <CodeBlock language="bash">{`curl https://checkout.ezypay.it.com/api/payment/sessions/eNOuUpsg2IGX4ko4HbFL \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxx"`}</CodeBlock>
        </TabGroup>
      </Section>

      <Section id="api-sessions" eyebrow="API Reference" title="Payment Sessions">
        <ApiEndpoint
          method="POST"
          path="/api/payment/sessions"
          auth="X-API-Key"
          description="Create a new checkout session for a customer. order_id is enforced unique-per-merchant (see status codes below)."
          request={`{
  "amount":         500.00,
  "order_id":       "ORD-1001",
  "redirect_url":   "https://yourstore.com/done",
  "currency":       "USD",
  "customer_phone": "+8801712345678",
  "customer_name":  "Rahim Khan",
  "metadata":       { "cart_id": "cart-42" }
}`}
          response={`// 201 Created — fresh session
{
  "session_id":   "eNOuUpsg2IGX4ko4HbFL",
  "checkout_url": "https://ezypay.it.com/pay/eNOuUpsg2IGX4ko4HbFL",
  "expires_at":   "2026-05-12T12:00:00Z",
  "status":       "pending"
}

// 200 OK — idempotent: same order_id while a prior session is still alive
{
  "session_id":   "eNOuUpsg2IGX4ko4HbFL",
  "checkout_url": "https://ezypay.it.com/pay/eNOuUpsg2IGX4ko4HbFL",
  "expires_at":   "2026-05-12T12:00:00Z",
  "status":       "pending",
  "existed":      true
}

// 409 Conflict — order already paid (any prior session is success)
{ "error": "This order has already been paid.", "existing_session_id": "..." }

// 402 Payment Required — merchant wallet too low to cover verification fee
{ "error": "Merchant wallet has insufficient balance. Top up to resume.",
  "insufficient_balance": true, "balance": 0, "fee": 2, "threshold": 10 }`}
        />

        <Callout tone="slate" title="Handling the response">
          Always use <code className="text-xs">data.checkout_url</code> regardless of whether you get 201 or 200 —
          the URL is the same when <code className="text-xs">existed: true</code>. Treat <strong>409</strong> as
          "this order is done — show the customer the paid state, don&apos;t retry." Treat <strong>402</strong>{' '}
          as "merchant configuration issue — surface a friendly retry-later message."
        </Callout>

        <ApiEndpoint
          method="GET"
          path="/api/payment/sessions/:id"
          auth="X-API-Key"
          description="Fetch the current status of a session. Use this after the customer returns."
          response={`{
  "session": {
    "id":          "eNOuUpsg2IGX4ko4HbFL",
    "order_id":    "ORD-1001",
    "amount":      "500.00",
    "currency":    "USD",
    "status":      "success",
    "expires_at":  "2026-05-12T12:00:00Z",
    "created_at":  "2026-05-12T11:30:00Z",
    "successful_transaction": {
      "txnid_submitted": "BKX92H1",
      "verified_at":     "2026-05-12T11:34:10Z",
      "result_source":   "apk"
    }
  }
}`}
        />
      </Section>

      <Section id="api-verify" eyebrow="API Reference" title="Manual Verify">
        <ApiEndpoint
          method="POST"
          path="/api/merchant/verify"
          auth="Bearer JWT (merchant login)"
          description="Manually verify a TxnID given to you out-of-band. Used by the dashboard's Verify page. Looks up SMS, extracts amount + gateway, creates a transaction if it all matches."
          request={`{
  "txnid": "613384596583"
}`}
          response={`{
  "matched": true,
  "already_existed": false,
  "transaction": {
    "txnid_submitted": "613384596583",
    "amount":          1.00,
    "provider":        "bkash",
    "variant":         "personal",
    "account_number":  "XX6788"
  },
  "sms": { "sender": "AD-AXISBK-S", "body": "INR 1.00 credited ...", "received_at": "..." }
}`}
        />
      </Section>

      <Section id="api-devices" eyebrow="API Reference" title="Devices (APK)">
        <p className="mb-4 text-slate-700">
          These endpoints are called by your <strong>Android APK</strong>, authenticated by{' '}
          <code className="text-xs">device_auth_key</code> in the body. Never call from a server or browser.
        </p>

        <Callout tone="amber" title="Wallet-empty (402) handling">
          Every APK endpoint EXCEPT <code className="text-xs">/bind</code> and <code className="text-xs">/unbind</code> returns{' '}
          <strong>402</strong> with <code className="text-xs">{'{ insufficient_balance: true, balance, fee, threshold }'}</code>{' '}
          when the merchant&apos;s wallet doesn&apos;t have enough to cover the per-verification fee. The APK
          should switch to a <em>"Wallet empty — please top up"</em> screen and keep heartbeating; when{' '}
          <code className="text-xs">/heartbeat</code> returns 200 again, auto-recover.
        </Callout>

        <ApiEndpoint method="POST" path="/api/device/bind"
          auth="device_auth_key"
          description="Register a phone with the merchant account. Idempotent — re-binding the same device_id refreshes the row."
          request={`{
  "auth_key":     "PV-XXXXXX",
  "device_id":    "android-stable-id",
  "model":        "CPH1937",
  "manufacturer": "OPPO",
  "os_version":   "11"
}`} />

        <ApiEndpoint method="POST" path="/api/device/unbind"
          auth="device_auth_key"
          description='User taps "Disconnect" in the app. Soft-delete — the row stays in history.'
          request={`{ "auth_key": "PV-XXXXXX", "device_id": "android-stable-id" }`}
        />

        <ApiEndpoint method="POST" path="/api/device/sms"
          auth="device_auth_key"
          description="Forward incoming wallet SMS. Backend stores the SMS as staging data only — it becomes a verification when a customer submits a matching TxnID through the checkout. Unmatched SMS never become orphan transactions."
          request={`{
  "auth_key":  "PV-XXXXXX",
  "device_id": "android-stable-id",
  "messages": [{
    "sender":      "bKash",
    "body":        "Cash In Tk 500.00 successful. TrxID: BKX92H1 from 01712345678",
    "received_at": "2026-05-12T11:25:30Z"
  }]
}`} />

        <ApiEndpoint method="POST" path="/api/device/poll"
          auth="device_auth_key"
          description="Fetch pending verifications waiting for a decision. Call on a timer (every 10–30s). Each returned row has the data needed to render an Approve/Reject prompt offline."
          request={`{ "auth_key": "PV-XXXXXX", "device_id": "android-stable-id" }`}
          response={`{
  "verifications": [{
    "verification_id": 421,
    "txnid_submitted": "BKX92H1",
    "amount":          500.00,
    "currency":        "BDT",
    "customer_phone":  "01712345678",
    "customer_name":   "Customer Name",
    "order_id":        "ORD-9911",
    "provider":        "bkash",
    "variant":         "personal",
    "account_number":  "01799999999",
    "created_at":      "2026-05-12T11:25:30Z"
  }]
}`} />

        <ApiEndpoint method="POST" path="/api/device/report"
          auth="device_auth_key"
          description={`Resolve a pending verification from the APK ("Approve" / "Reject" buttons). Mirrors the web dashboard's Mark Paid / Mark Failed.`}
          request={`{
  "auth_key":        "PV-XXXXXX",
  "device_id":       "android-stable-id",
  "verification_id": 421,
  "result":          "success",
  "matched_sms":     "Cash In Tk 500.00 successful. TrxID: BKX92H1...",
  "failure_reason":  null
}`}
          response={`{
  "ok":              true,
  "verification_id": 421,
  "status":          "success",
  "session_id":      "Y_giE7l9...",
  "transaction": {
    "id":            421,
    "status":        "success",
    "result_source": "apk"
  }
}`} />

        <ApiEndpoint method="POST" path="/api/device/transactions"
          auth="device_auth_key"
          description="List recent transactions (pending + history) for the merchant on the APK. Filter by status, search by TxnID or order_id."
          request={`{
  "auth_key":  "PV-XXXXXX",
  "device_id": "android-stable-id",
  "status":    "pending",
  "q":         "BKX92",
  "limit":     50
}`}
          response={`{
  "transactions": [{
    "id":              421,
    "txnid_submitted": "BKX92H1",
    "amount":          500.00,
    "status":          "pending",
    "result_source":   null,
    "verified_at":     null,
    "failure_reason":  null,
    "provider":        "bkash",
    "account_number":  "01799999999",
    "order_id":        "ORD-9911",
    "customer_name":   "Customer Name",
    "created_at":      "2026-05-12T11:25:30Z"
  }]
}`} />

        <ApiEndpoint method="POST" path="/api/device/verify"
          auth="device_auth_key"
          description="Paste a TxnID into the APK. Backend searches received SMS, validates against a configured gateway, creates a successful transaction if everything aligns. Mirrors the web Verify page."
          request={`{
  "auth_key":  "PV-XXXXXX",
  "device_id": "android-stable-id",
  "txnid":     "BKX92H1"
}`}
          response={`{
  "matched": true,
  "already_existed": false,
  "transaction": {
    "id": 422, "txnid_submitted": "BKX92H1", "amount": 500.00,
    "status": "success", "result_source": "manual_verify",
    "provider": "bkash", "account_number": "01799999999"
  },
  "sms": { "id": 7711, "sender": "bKash", "body": "...", "received_at": "..." }
}`} />

        <Callout tone="slate" title="Manual verification flow inside the APK">
          The APK has the same verification powers as the web dashboard:
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>List view:</strong> call <code className="text-xs">/api/device/transactions</code> for full history, or <code className="text-xs">/api/device/poll</code> for pending-only.</li>
            <li><strong>Approve / Reject:</strong> call <code className="text-xs">/api/device/report</code> with <code className="text-xs">result: &quot;success&quot;</code> or <code className="text-xs">&quot;failed&quot;</code>.</li>
            <li><strong>Type-a-TxnID verify:</strong> call <code className="text-xs">/api/device/verify</code> — searches SMS, auto-resolves.</li>
          </ul>
          All of these flip the same <code className="text-xs">transactions</code> row that the web dashboard reads, so a decision from the phone shows up on the dashboard immediately.
        </Callout>

        <p className="mt-4 text-sm text-slate-600">
          Full APK contract (poll/report patterns, SMS matching rules, permissions) lives in{' '}
          <code className="text-xs">docs/APK_API.md</code>.
        </p>
      </Section>

      <Section id="errors" eyebrow="API Reference" title="Errors & Status Codes">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-3 border border-slate-200">Code</th>
              <th className="text-left p-3 border border-slate-200">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['200', 'OK (existing resource fetched)'],
              ['201', 'Created (new session / new resource)'],
              ['202', 'Accepted (TxnID submitted, verification pending)'],
              ['400', 'Bad request — check error message; usually a missing/invalid field'],
              ['401', 'Invalid or missing API key (X-API-Key or JWT)'],
              ['402', 'Merchant wallet has insufficient balance — top up to resume'],
              ['403', 'Forbidden — usually merchant suspended'],
              ['404', 'Resource not found (wrong id, or not yours)'],
              ['409', 'Conflict — duplicate (TxnID reused, order already paid, session in wrong state)'],
              ['5xx', 'Server error — retry with exponential backoff'],
            ].map(([c, m]) => (
              <tr key={c}>
                <td className="p-3 border border-slate-200 font-mono">{c}</td>
                <td className="p-3 border border-slate-200">{m}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section id="troubleshoot" eyebrow="API Reference" title="Troubleshooting">
        <p className="text-slate-600">
          Issues integrators hit most often, with the fix.
        </p>

        <h3 className="mt-6 font-semibold text-slate-900">
          PHP cURL: <code className="text-xs">SSL routines:ssl3_read_bytes:tlsv1 unrecognized name</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          TLS handshake error. The client didn&apos;t send a Server Name Indication (SNI) the cert
          recognizes, and old OpenSSL (≤ 1.0.x, common in PHP 5.x / 7.0–7.3) treats it as fatal
          instead of a warning. Three checks, in order:
        </p>
        <ol className="mt-3 space-y-2 text-sm text-slate-700 list-decimal pl-5">
          <li>
            <strong>Hostname must be exact.</strong> Use{' '}
            <code className="text-xs">https://checkout.ezypay.it.com</code> — not an IP, not{' '}
            <code className="text-xs">www.</code>, not a CDN alias. Calling by IP doesn&apos;t send SNI at all.
          </li>
          <li>
            <strong>Don&apos;t bypass DNS.</strong> Do NOT set <code className="text-xs">CURLOPT_RESOLVE</code> or pass{' '}
            <code className="text-xs">--resolve</code> on the CLI — both can send the wrong SNI name.
          </li>
          <li>
            <strong>Force TLS 1.2 and keep verification on.</strong> Don&apos;t disable{' '}
            <code className="text-xs">CURLOPT_SSL_VERIFYPEER</code> or{' '}
            <code className="text-xs">CURLOPT_SSL_VERIFYHOST</code> — that often makes the problem
            worse, not better.
          </li>
        </ol>

        <p className="mt-4 text-sm font-semibold text-slate-900">Working PHP example:</p>
        <CodeBlock language="php">{`<?php
$ch = curl_init('https://checkout.ezypay.it.com/api/payment/sessions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'X-API-Key: pk_live_...',
    ],
    CURLOPT_POSTFIELDS     => json_encode([
        'amount'         => 1.00,
        'order_id'       => 'ORD-1',
        'redirect_url'   => 'https://yoursite.com/payment/result',
        'customer_phone' => '7557012345',
        'customer_name'  => 'Customer Name',
    ]),
    CURLOPT_SSLVERSION     => CURL_SSLVERSION_TLSv1_2,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
]);
$response = curl_exec($ch);
if (curl_errno($ch)) {
    error_log('PayVerify cURL error: ' . curl_error($ch));
}
curl_close($ch);
$body = json_decode($response, true);
header('Location: ' . $body['checkout_url']);`}</CodeBlock>

        <p className="mt-4 text-sm text-slate-700">
          Still failing? Test from the shell first:
        </p>
        <CodeBlock language="bash">{`curl -v https://checkout.ezypay.it.com/api/providers`}</CodeBlock>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li><code className="text-xs">curl</code> works, PHP fails → upgrade PHP/OpenSSL (PHP ≥ 7.4 with OpenSSL ≥ 1.1.1 fixes it permanently).</li>
          <li>Both fail with the same SNI error → you&apos;re on the wrong hostname, or behind a corporate proxy mangling SNI.</li>
          <li>Both succeed but your code still errors → it&apos;s your request body, not TLS. Check the response status &amp; body.</li>
        </ul>

        <h3 className="mt-8 font-semibold text-slate-900">
          404 from <code className="text-xs">/api/payment/sessions</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          You&apos;re hitting the wrong host. PayVerify has two services — the dashboard UI and the
          API — on different domains. The API base URL is{' '}
          <code className="text-xs">https://checkout.ezypay.it.com</code>. Pointing your backend
          at the dashboard URL returns 404 because the dashboard doesn&apos;t serve the API.
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Sanity check: <code className="text-xs">curl https://checkout.ezypay.it.com/api/providers</code>{' '}
          should return JSON with the provider list (no auth needed). If it does, the URL is correct;
          if it doesn&apos;t, fix the base URL first.
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">
          401 <code className="text-xs">Invalid or expired token</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          You sent the wrong header for the wrong endpoint:
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>
            Backend-to-PayVerify (<code className="text-xs">/api/payment/...</code>): use{' '}
            <code className="text-xs">X-API-Key: pk_live_...</code>
          </li>
          <li>
            Merchant dashboard / your own JWT calls (<code className="text-xs">/api/merchant/...</code>):{' '}
            use <code className="text-xs">Authorization: Bearer &lt;jwt&gt;</code>
          </li>
          <li>
            APK calls (<code className="text-xs">/api/device/...</code>): use the{' '}
            <code className="text-xs">auth_key</code> field in the JSON body.
          </li>
        </ul>

        <h3 className="mt-8 font-semibold text-slate-900">
          Trailing-slash double-slash <code className="text-xs">//api/...</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          If your config stores the base URL with a trailing slash and your code appends{' '}
          <code className="text-xs">/api/payment/...</code>, you&apos;ll request{' '}
          <code className="text-xs">https://checkout.ezypay.it.com//api/payment/sessions</code>.
          Some nginx setups normalize this; others 404. Strip the trailing slash from your base URL.
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">
          402 <code className="text-xs">insufficient_balance</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          PayVerify charges merchants a small per-verification fee, debited from the merchant&apos;s wallet on
          every successful verification. When the wallet drops below that fee, the merchant&apos;s operations
          are paused:
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>New <code className="text-xs">POST /api/payment/sessions</code> calls return 402 — xyz.com can&apos;t create new checkouts.</li>
          <li>APK endpoints (poll/sms/report/verify/heartbeat) return 402 — the phone shows a "Wallet empty" screen.</li>
          <li><code className="text-xs">/bind</code> and <code className="text-xs">/unbind</code> stay available so the phone can disconnect/reconnect.</li>
        </ul>
        <p className="mt-2 text-sm text-slate-700">
          <strong>Fix:</strong> log into the merchant dashboard → <strong>Wallet</strong> → <strong>Add Balance</strong>{' '}
          → pay via wallet. Operations resume on the next request after the recharge confirms.
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">
          409 <code className="text-xs">"This order has already been paid"</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          You called <code className="text-xs">POST /sessions</code> with an <code className="text-xs">order_id</code>{' '}
          that already has a successful session. Don&apos;t retry — fetch the existing session via{' '}
          <code className="text-xs">existing_session_id</code> in the error body and treat the order as fulfilled.
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">Transactions stuck on Pending</h3>
        <p className="mt-2 text-sm text-slate-700">
          The customer submitted a TxnID but no matching SMS has reached the backend. Two common
          causes:
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>
            <strong>No bound device.</strong> Check Dashboard → Devices. An &quot;Online&quot;
            row means the APK is heartbeating; it does NOT guarantee SMS is being forwarded. If the
            SMS log (Dashboard → SMS) is empty, the APK isn&apos;t uploading.
          </li>
          <li>
            <strong>Gateway identifier mismatch.</strong> The number you set on the gateway must
            appear in the SMS body. For SMS that show only a masked bank suffix (e.g.{' '}
            <code className="text-xs">XX6788</code>), store multiple identifiers comma-separated.
          </li>
        </ul>
        <p className="mt-2 text-sm text-slate-700">
          As a fallback, the merchant can resolve any pending row from Dashboard → Transactions
          (Mark Paid / Mark Failed). The customer&apos;s checkout polls and reflects the decision
          within a few seconds.
        </p>
      </Section>

      <Section id="best" eyebrow="Production" title="Best Practices">
        <ul className="space-y-3 text-slate-700">
          <li><strong>1. Always verify server-side.</strong> Don&apos;t trust query params on return — call <code className="text-xs">GET /sessions/:id</code> from your backend before fulfilling.</li>
          <li><strong>2. Keep keys out of git + browser.</strong> Store <code className="text-xs">api_key</code> in env vars; never log it.</li>
          <li><strong>3. Set <code className="text-xs">customer_phone</code> on the session.</strong> Tightens SMS matching, reduces false positives dramatically.</li>
          <li><strong>4. Use HTTPS for <code className="text-xs">redirect_url</code>.</strong> No exceptions in production.</li>
          <li><strong>5. Configure multiple identifiers per gateway.</strong> Mobile + bank suffix (comma-separated) means new banks rolling out won&apos;t silently stop working.</li>
          <li><strong>6. Monitor <code className="text-xs">/dashboard/devices</code>.</strong> If the bound phone goes offline, verifications queue but don&apos;t complete. Set a backup phone if you can.</li>
          <li><strong>7. Keep your wallet topped up.</strong> Each successful verification debits a small fee from your wallet balance. Below the per-verification fee, all your endpoints return 402 and your APK is paused. The dashboard shows an amber warning before you hit empty — top up then. <Link href="/dashboard/wallet" className="text-brand-600 hover:underline">Wallet →</Link></li>
          <li><strong>8. Handle the order_id idempotency response.</strong> POST /sessions can return 200 (with <code className="text-xs">existed:true</code>) when the same order_id has a live pending session — use the URL it returns, don&apos;t create a parallel checkout.</li>
        </ul>
      </Section>

      <Section id="webhooks" eyebrow="Production" title="Webhooks (Coming Soon)">
        <p>
          Today, you confirm payments by polling <code className="text-xs">GET /sessions/:id</code> after the customer returns.
        </p>
        <p className="mt-3">
          Webhooks are on the roadmap. When live, PayVerify will <code className="text-xs">POST</code> to a URL on
          your domain whenever a session resolves, signed with HMAC-SHA256 of the body using your
          brand&apos;s <code className="text-xs">secret_key</code>:
        </p>
        <CodeBlock language="http">{`POST https://yourstore.com/payverify/webhook
X-PayVerify-Signature: t=1683900000,v1=<hmac-sha256-hex>

{ "event": "session.success", "session": { ... } }`}</CodeBlock>
        <p className="mt-3 text-sm text-slate-600">Until then, polling on customer return is the recommended pattern.</p>
      </Section>

      <Section id="support" eyebrow="Production" title="Support">
        <p>
          Questions? Run into something the docs don&apos;t cover?
        </p>
        <ul className="mt-3 space-y-1 text-slate-700">
          <li>📧 Email: <a href="mailto:support@payverify.com" className="text-brand-600 hover:underline">support@payverify.com</a></li>
          <li>🐛 Bugs / API issues: open a ticket from your dashboard</li>
          <li>📖 APK developer reference: <code className="text-xs">docs/APK_API.md</code></li>
          <li>📖 Integration deep-dive: <code className="text-xs">docs/INTEGRATION.md</code></li>
        </ul>
      </Section>

      <div className="mt-16 mb-8 text-center text-sm text-slate-500">
        That&apos;s everything. Time to ship → <Link href="/register" className="text-brand-600 font-semibold hover:underline">Create your merchant account</Link>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────── Building blocks */
function Hero() {
  return (
    <div className="mb-12 pb-8 border-b border-slate-200">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-600">Developer Documentation</div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
        PayVerify <span className="text-slate-500 font-normal">Integration Guide</span>
      </h1>
      <p className="mt-3 text-slate-600 max-w-2xl">
        Everything you need to integrate SMS-based wallet payment verification into your ecommerce
        flow. Step-by-step, with copy-pasteable code in Node, PHP, Python and cURL.
      </p>
    </div>
  );
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 mb-14">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</div>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4 text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Callout({ tone = 'brand', title, children }) {
  const tones = {
    brand:  'bg-brand-50 border-brand-200 text-brand-900',
    amber:  'bg-amber-50 border-amber-200 text-amber-900',
    rose:   'bg-rose-50 border-rose-200 text-rose-900',
    slate:  'bg-slate-50 border-slate-200 text-slate-900',
  };
  return (
    <div className={`my-5 rounded-lg border px-4 py-3 ${tones[tone]}`}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

function CodeBlock({ children, language, caption }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <div className="my-4">
      {caption && <div className="text-xs text-slate-500 mb-1">{caption}</div>}
      <div className="relative group rounded-lg overflow-hidden bg-slate-900">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">{language || 'code'}</span>
          <button
            onClick={onCopy}
            className={`text-xs px-2 py-1 rounded transition-colors ${copied ? 'text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="px-4 py-3 overflow-x-auto text-sm text-slate-100 font-mono leading-relaxed"><code>{children}</code></pre>
      </div>
    </div>
  );
}

function TabGroup({ tabs, children }) {
  const [idx, setIdx] = useState(0);
  const panels = Array.isArray(children) ? children : [children];
  return (
    <div className="my-4">
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setIdx(i)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
              i === idx ? 'text-brand-700 border-b-2 border-brand-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div>{panels[idx]}</div>
    </div>
  );
}

function ApiEndpoint({ method, path, auth, description, request, response }) {
  const methodColor = {
    GET:    'bg-emerald-100 text-emerald-700',
    POST:   'bg-blue-100   text-blue-700',
    PATCH:  'bg-amber-100  text-amber-700',
    DELETE: 'bg-rose-100   text-rose-700',
  }[method] || 'bg-slate-100 text-slate-700';

  return (
    <div className="mb-8 rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-bold rounded px-2 py-1 ${methodColor}`}>{method}</span>
        <code className="text-sm font-mono text-slate-900">{path}</code>
        {auth && <span className="ml-auto text-xs text-slate-500 font-mono">auth: {auth}</span>}
      </div>
      <div className="p-4 space-y-3">
        {description && <p className="text-sm text-slate-700">{description}</p>}
        {request  && <div><div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Request body</div><CodeBlock language="json">{request}</CodeBlock></div>}
        {response && <div><div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Response (200)</div><CodeBlock language="json">{response}</CodeBlock></div>}
      </div>
    </div>
  );
}

function CredentialTable() {
  const rows = [
    ['api_key (pk_live_...)',   'Per brand',    "Merchant's server",        'Create checkout sessions, query session status'],
    ['secret_key (sk_live_...)', 'Per brand',    "Merchant's server",        'Sign webhook payloads (future)'],
    ['device_auth_key (PV-…)',  'Per merchant', 'The APK on your phone',   'Bind device, upload SMS, poll for pending verifications'],
    ['JWT (Bearer)',            'Per session',  'Merchant dashboard',       'Logged-in merchant access to /api/merchant/*'],
  ];
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left p-3 border border-slate-200">Credential</th>
            <th className="text-left p-3 border border-slate-200">Scope</th>
            <th className="text-left p-3 border border-slate-200">Used by</th>
            <th className="text-left p-3 border border-slate-200">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([c, s, u, p]) => (
            <tr key={c}>
              <td className="p-3 border border-slate-200 font-mono text-xs">{c}</td>
              <td className="p-3 border border-slate-200">{s}</td>
              <td className="p-3 border border-slate-200">{u}</td>
              <td className="p-3 border border-slate-200">{p}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Diagram() {
  return (
    <div className="my-6 rounded-lg border border-slate-200 bg-slate-50/50 p-5 overflow-x-auto">
      <pre className="text-xs sm:text-sm font-mono leading-relaxed text-slate-700 whitespace-pre">{`┌─────────────────────┐                                  ┌─────────────────────┐
│  Customer's browser │                                  │   Your bound phone  │
│  on yourstore.com   │                                  │   (PayVerify APK)   │
└──────────┬──────────┘                                  └─────────────────────┘
           │   1) POST /api/payment/sessions                       │
           │   ◄──────── checkout_url ────────                      │
           ▼                                                       │
┌─────────────────────┐  2) redirect to checkout_url               │
│  PayVerify hosted   │ ◄─────────────────────────────────         │
│  /pay/<sessionId>   │                                            │
└──────────┬──────────┘                                            │
           │   3) customer pays, pastes TxnID                      │
           ▼                                                       ▼
       transaction.status = pending          ◄────── wallet SMS arrives
           │                                          │
           └──────── 4) match SMS vs TxnID ◄──────────┘
           │
           ▼
       transaction.status = success
           │   5) redirect customer back to merchant
           ▼
┌─────────────────────┐
│ yourstore.com/done  │
│ ?status=success     │
└─────────────────────┘`}</pre>
    </div>
  );
}
