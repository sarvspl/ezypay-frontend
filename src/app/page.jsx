import Link from 'next/link';
import LandingNav from '@/components/LandingNav';
import { LogoMark } from '@/components/Logo';

export const metadata = {
  title: 'PayVerify — Instant SMS wallet payment verification for ecommerce',
  description:
    'Stop losing money to fake TxnIDs. PayVerify confirms any wallet, bank, or UPI payment in under 2 seconds by matching the customer\'s transaction ID against the actual SMS on your bound Android device.',
};

export default function HomePage() {
  return (
    <main className="bg-white text-slate-900">
      <LandingNav />
      <Hero />
      <Stats />
      <Problem />
      <HowItWorks />
      <Features />
      <Comparison />
      <UseCases />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

/* ───────────────────────────────────────────────────────── HERO */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
      <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-60 -z-10" />
      <div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live verification in under 2 seconds
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Stop losing money to{' '}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              fake TxnIDs.
            </span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 max-w-2xl">
            PayVerify confirms any wallet, bank or UPI payment by matching the
            customer&apos;s transaction ID against the <em>actual SMS</em> on
            your bound Android phone. No payment gateway. No KYC. No
            per-transaction fees. Just verification that works — anywhere in
            the world.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary !px-5 !py-3 text-base shadow-md shadow-brand-500/20">
              Start free — get your API Key
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a href="#how" className="btn-secondary !px-5 !py-3 text-base">
              See how it works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Check /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check /> 2-minute setup</span>
            <span className="flex items-center gap-1.5"><Check /> Self-hosted SMS reader</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto max-w-md">
      {/* Checkout window */}
      <div className="card p-5 shadow-xl shadow-slate-900/10 border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs text-slate-500 font-mono">fashionhub.com/checkout</span>
        </div>
        <div className="mt-4 text-sm">
          <div className="text-slate-500">Order #ORD1001</div>
          <div className="mt-1 text-2xl font-semibold">৳ 4,900.00</div>
          <div className="mt-3 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
            Send <strong>৳4,900</strong> to wallet <strong>+880 1··· 8888</strong>
          </div>
          <label className="mt-4 block label">Transaction ID</label>
          <input readOnly value="TXN92H1" className="input font-mono" />
          <button className="btn-primary w-full mt-3">Confirm payment</button>
        </div>
      </div>

      {/* Verification popup */}
      <div className="absolute -bottom-6 -right-4 sm:-right-10 w-64 card p-4 shadow-2xl shadow-emerald-500/20 border-emerald-200 bg-white rotate-2 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-700">Payment verified</div>
            <div className="text-xs text-slate-500">TxnID matched · 1.4s</div>
          </div>
        </div>
        <div className="mt-3 text-[11px] font-mono bg-slate-50 text-slate-600 rounded p-2 border border-slate-200">
          &quot;Payment of ৳4,900.00 received.<br />TxnID: TXN92H1&quot;
        </div>
      </div>

      {/* Phone tag */}
      <div className="absolute -top-4 -left-4 sm:-left-8 w-44 card p-3 shadow-xl rotate-[-4deg] hover:rotate-0 transition-transform">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
            <PhoneIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">Bound device</div>
            <div className="text-[10px] text-slate-500">PV-8HJ2K9</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── STATS */
function Stats() {
  const items = [
    { value: '<2s', label: 'Average verification time' },
    { value: '99.7%', label: 'TxnID match accuracy' },
    { value: '0', label: 'Per-transaction fees' },
    { value: '∞', label: 'Verifications / month' },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              {s.value}
            </div>
            <div className="mt-2 text-sm text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── PROBLEM */
function Problem() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs uppercase tracking-widest text-rose-400 font-semibold">The problem</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">
            Every fake TxnID is a free order. <br className="hidden sm:block" />
            <span className="text-rose-400">And your team can&apos;t check them fast enough.</span>
          </h2>
          <p className="mt-5 text-slate-300 max-w-xl">
            Customers screenshot old transactions. They type random TxnIDs.
            They send less money than the order total. By the time you check the
            SMS manually, the order is already packed and shipped.
          </p>
          <ul className="mt-6 space-y-3 text-slate-300">
            <li className="flex gap-3"><X /> Manual SMS checking takes 5–10 minutes per order</li>
            <li className="flex gap-3"><X /> Fraudulent orders slip through after-hours</li>
            <li className="flex gap-3"><X /> Customer waits → cart abandoned → revenue lost</li>
            <li className="flex gap-3"><X /> Payment gateways charge 2–3% per transaction</li>
          </ul>
        </div>

        <div className="lg:pl-10">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 p-6 lg:p-8">
            <span className="inline-block text-xs uppercase tracking-widest text-emerald-400 font-semibold">The fix</span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold">PayVerify, in one sentence:</h3>
            <p className="mt-3 text-lg text-slate-100">
              Your customer submits a TxnID. We check the actual SMS on the phone
              <em> you </em>own. The order confirms — or doesn&apos;t — in under 2 seconds.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> No payment gateway</span>
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> No KYC paperwork</span>
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> No transaction fees</span>
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> Real-time match</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── HOW IT WORKS */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Register & get keys', body: 'Create your merchant account. We instantly generate your API Key and Device Auth Key.', icon: <UserPlusIcon /> },
    { n: '02', title: 'Install the APK',     body: 'Download the PayVerify APK to your shop\'s phone. Paste the Device Auth Key — done.', icon: <PhoneIcon /> },
    { n: '03', title: 'Integrate the API',   body: 'Add a single API call to your checkout. We support PHP, Node, Python, anything that can POST.', icon: <CodeIcon /> },
    { n: '04', title: 'Verify automatically',body: 'Customer submits TxnID. APK reads the SMS. Order confirms in seconds. You ship.', icon: <CheckCircle /> },
  ];
  return (
    <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <SectionHeader
        eyebrow="How it works"
        title="From signup to verified order in 2 minutes"
        subtitle="No complex onboarding. No PCI compliance. No waiting weeks for gateway approval."
      />
      <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <li key={s.n} className="relative card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                {s.icon}
              </div>
              <span className="text-xs font-mono text-slate-400">{s.n}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── FEATURES */
function Features() {
  const items = [
    { icon: <BoltIcon />,   title: 'Sub-2-second verification', body: 'FCM push + Socket.IO realtime. The customer barely sees a loading spinner.' },
    { icon: <ShieldIcon />, title: 'Tamper-proof matching',     body: 'We match TxnID, amount, and customer phone. Fake screenshots don\'t pass.' },
    { icon: <CodeIcon />,   title: 'One API call',              body: 'POST /verify-payment. That\'s the entire integration. Works with any backend.' },
    { icon: <DashboardIcon />, title: 'Live dashboard',         body: 'Every verification, every match, every miss — in real time. Filter and export.' },
    { icon: <GlobeIcon />,  title: 'Works with any wallet, anywhere', body: 'Mobile wallets, bank transfers, UPI, neobank apps — anything that sends a transaction SMS, in any country.' },
    { icon: <LockIcon />,   title: 'Your phone, your data',     body: 'SMS never leaves your device unless it matches. We don\'t store your inbox.' },
  ];
  return (
    <section id="features" className="bg-slate-50/70 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
        <SectionHeader
          eyebrow="Why PayVerify"
          title="Built for merchants who can't wait"
          subtitle="Everything you need to stop manual verification — and nothing you don't."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((f) => (
            <div key={f.title} className="card p-6 hover:border-brand-200 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 text-white flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── COMPARISON */
function Comparison() {
  const rows = [
    ['Setup time',              '2 minutes',              '2–6 weeks'],
    ['KYC / paperwork',         'None',                   'Extensive'],
    ['Per-transaction fee',     '৳0',                     '2–3%'],
    ['Monthly minimum',         'None',                   'Often required'],
    ['Works with any wallet',   true,                     false],
    ['No payout delays',        true,                     false],
    ['Self-hosted SMS reader',  true,                     false],
  ];
  return (
    <section id="compare" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <SectionHeader
        eyebrow="Side-by-side"
        title="PayVerify vs. traditional payment gateways"
        subtitle="You don't need a payment processor. You need verification."
      />
      <div className="mt-12 card overflow-hidden">
        <div className="grid grid-cols-3 bg-slate-900 text-white text-sm font-semibold">
          <div className="p-4"></div>
          <div className="p-4 text-center bg-gradient-to-br from-brand-600 to-indigo-600">PayVerify</div>
          <div className="p-4 text-center text-slate-300">Payment gateway</div>
        </div>
        {rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 ? 'bg-slate-50/60' : 'bg-white'}`}>
            <div className="p-4 font-medium text-slate-700">{row[0]}</div>
            <div className="p-4 text-center text-slate-900 font-semibold">
              {typeof row[1] === 'boolean' ? (row[1] ? <CheckBadge ok /> : <CheckBadge />) : row[1]}
            </div>
            <div className="p-4 text-center text-slate-500">
              {typeof row[2] === 'boolean' ? (row[2] ? <CheckBadge ok /> : <CheckBadge />) : row[2]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── USE CASES */
function UseCases() {
  const cases = [
    { tag: 'Fashion & retail',  title: 'Confirm orders before they leave the warehouse', body: 'Pack only what\'s actually paid. Cut reverse-logistics from fake orders to near zero.' },
    { tag: 'Digital services',  title: 'Unlock instantly after payment',                  body: 'Course access, game top-ups, subscription credits — auto-fulfill the second SMS lands.' },
    { tag: 'Food delivery',     title: 'Driver dispatched only when verified',            body: 'Stop sending bikes for orders that haven\'t actually been paid for.' },
  ];
  return (
    <section className="bg-slate-50/70 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
        <SectionHeader
          eyebrow="Use cases"
          title="Wherever you accept wallet payments"
          subtitle="If you handwrite SMS checks in WhatsApp groups — this is built for you."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {cases.map((c) => (
            <div key={c.tag} className="card p-6 hover:shadow-lg transition">
              <span className="inline-block text-xs uppercase tracking-widest text-brand-600 font-semibold">{c.tag}</span>
              <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── FAQ */
function FAQ() {
  const items = [
    {
      q: 'Does PayVerify hold or process my customers\' money?',
      a: 'No. We are pure verification. The customer pays you directly via their wallet. We only confirm the payment happened by reading the SMS on your phone.',
    },
    {
      q: 'What phone do I need?',
      a: 'Any Android device (Android 7+) that receives the wallet SMS. It needs to stay online — Wi-Fi or mobile data, your choice.',
    },
    {
      q: 'What if my phone is offline?',
      a: 'Verifications queue up. As soon as your device reconnects, pending checks run. For high-volume merchants we recommend a backup device.',
    },
    {
      q: 'Can someone send a fake screenshot to fool you?',
      a: 'No. We don\'t look at screenshots. We match the customer-submitted TxnID against the real SMS the wallet provider sent to your phone.',
    },
    {
      q: 'How do I integrate it into my website?',
      a: 'One API call: POST /verify-payment with the TxnID, amount, customer phone, and your order ID. Works with PHP, Node, Python, Laravel, WooCommerce — anything.',
    },
    {
      q: 'Do you charge per verification?',
      a: 'No per-transaction fees in our early-access plan. Subscription pricing will be introduced later — locked-in for early signups.',
    },
  ];
  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <SectionHeader
        eyebrow="Frequently asked"
        title="Answers, fast"
        subtitle="Still curious? Reach out — we&apos;ll respond within a few hours."
      />
      <div className="mt-10 divide-y divide-slate-200 card">
        {items.map((it, i) => (
          <details key={i} className="group p-5 open:bg-slate-50/60">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="font-medium text-slate-900">{it.q}</span>
              <span className="ml-4 text-slate-400 group-open:rotate-45 transition-transform">
                <PlusIcon />
              </span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── FINAL CTA */
function FinalCTA() {
  return (
    <section className="px-4 sm:px-6 pb-20">
      <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-700 text-white px-6 sm:px-10 py-14 sm:py-16 relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div aria-hidden className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="relative text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Stop paying for fraud you can prevent.</h2>
          <p className="mt-3 text-brand-50/90 max-w-2xl mx-auto">
            Spin up a merchant account in 60 seconds. Your API Key and Device Auth Key
            are waiting on the next screen.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="bg-white text-brand-700 hover:bg-slate-100 transition rounded-md font-semibold px-6 py-3 inline-flex items-center">
              Create my merchant account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 transition rounded-md font-semibold px-6 py-3 border border-white/20">
              I already have one
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── FOOTER */
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-brand-600"><LogoMark className="w-7 h-7" /></span>
            <span className="text-lg font-bold tracking-tight">
              Pay<span className="text-brand-600">Verify</span>
            </span>
          </div>
          <p className="mt-3 text-slate-600 max-w-sm">
            SMS-based wallet payment verification for ecommerce.
            Stop fake TxnIDs. Confirm real orders in seconds.
          </p>
        </div>
        <div>
          <div className="font-semibold text-slate-900">Product</div>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><a href="#how"        className="hover:text-brand-600">How it works</a></li>
            <li><a href="#features"   className="hover:text-brand-600">Features</a></li>
            <li><a href="#compare"    className="hover:text-brand-600">Why us</a></li>
            <li><a href="#faq"        className="hover:text-brand-600">FAQ</a></li>
            <li><Link href="/docs"    className="hover:text-brand-600">Developer Docs</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-slate-900">Account</div>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><Link href="/register"    className="hover:text-brand-600">Register</Link></li>
            <li><Link href="/login"       className="hover:text-brand-600">Merchant login</Link></li>
            <li><Link href="/console/login" className="hover:text-brand-600">Console</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} PayVerify. All rights reserved.</span>
          <span>Made for merchants who hate fake TxnIDs.</span>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────────────────────────────────────── SHARED */
function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-block text-xs uppercase tracking-widest text-brand-600 font-semibold">{eyebrow}</span>
      <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
    </div>
  );
}

/* ───────────────────────────────────────────────────────── ICONS */
function ArrowRight({ className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
}
function Check({ className = 'w-4 h-4 text-emerald-500' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function X({ className = 'w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function PlusIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function CheckBadge({ ok }) {
  if (ok) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></span>;
  return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-500"><X className="w-4 h-4" /></span>;
}
function PhoneIcon()    { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>; }
function CodeIcon()     { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }
function CheckCircle()  { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function UserPlusIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>; }
function BoltIcon()     { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.09 12.97a.5.5 0 0 0 .39.83H10l-1.5 8.2a.5.5 0 0 0 .88.4L20 11.06a.5.5 0 0 0-.39-.83H14l1.5-8a.5.5 0 0 0-.88-.4Z"/></svg>; }
function ShieldIcon()   { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function DashboardIcon(){ return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>; }
function GlobeIcon()    { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12 15.3 15.3 0 0 1 12 2z"/></svg>; }
function LockIcon()     { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
