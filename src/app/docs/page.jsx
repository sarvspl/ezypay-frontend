'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

const LS_KEY = 'pv_lang';

export default function DocsPage() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === 'en' || saved === 'bn') setLang(saved);
    } catch { }
  }, []);

  const changeLang = (next) => {
    setLang(next);
    try { localStorage.setItem(LS_KEY, next); } catch { }
  };

  const t = (en, bn) => (lang === 'bn' ? bn : en);

  return (
    <main className={`bg-white text-slate-900 ${lang === 'bn' ? 'font-bn' : ''}`}>
      <Header lang={lang} onLangChange={changeLang} t={t} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[220px_1fr_220px] gap-8">
        <SidebarNav t={t} />
        <ContentArea t={t} />
        <OnThisPage />
      </div>
    </main>
  );
}

/* ────────────────────────────────────────── Header + Lang Toggle */
function Header({ lang, onLangChange, t }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-white/80 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
          <Logo size="xl" />

          <nav className="hidden md:flex items-center h-11 gap-1 text-sm rounded-full bg-gradient-to-r from-grad-start to-grad-end px-1.5 shadow-md shadow-grad-start/25">
            <Link
              href="/"
              className="flex items-center px-4 py-1.5 rounded-full font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('Home', 'হোম')}
            </Link>
            <Link
              href="/docs"
              className="flex items-center px-4 py-1.5 rounded-full font-semibold bg-white/20 text-white"
            >
              {t('Docs', 'ডকুমেন্টেশন')}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LangToggle lang={lang} onChange={onLangChange} />
            <div className="hidden sm:block h-11 rounded-full bg-gradient-to-r from-grad-start to-grad-end p-[2px]">
              <Link
                href="/login"
                className="flex items-center h-full rounded-full bg-white text-grad-start hover:text-grad-end transition-colors px-5 text-sm font-semibold"
              >
                {t('Merchant Login', 'মার্চেন্ট লগইন')}
              </Link>
            </div>
            <Link
              href="/register"
              className="hidden sm:flex items-center h-11 rounded-full bg-gradient-to-r from-grad-start to-grad-end text-white px-5 text-sm font-semibold whitespace-nowrap shadow-md shadow-grad-start/25 hover:shadow-lg transition-shadow"
            >
              {t('Get Started', 'শুরু করুন')}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-full text-grad-start hover:bg-slate-100"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <DocsCloseIcon /> : <DocsMenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <aside
        className={[
          'fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 md:hidden shadow-2xl transform transition-transform duration-300 overflow-y-auto',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
            aria-label="Close menu"
          >
            <DocsCloseIcon />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            {t('Home', 'হোম')}
          </Link>
          <Link href="/docs" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg bg-grad-start/10 text-grad-start font-semibold">
            {t('Docs', 'ডকুমেন্টেশন')}
          </Link>
          <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-11 rounded-full border-2 border-grad-start text-grad-start text-sm font-semibold">
              {t('Merchant Login', 'মার্চেন্ট লগইন')}
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-11 rounded-full bg-gradient-to-r from-grad-start to-grad-end text-white text-sm font-semibold shadow-md shadow-grad-start/25">
              {t('Get Started', 'শুরু করুন')}
            </Link>
          </div>
        </nav>
      </aside>
    </header>
  );
}

function DocsMenuIcon() {
  return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function DocsCloseIcon() {
  return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}

function LangToggle({ lang, onChange }) {
  return (
    <div className="h-11 rounded-full bg-gradient-to-r from-grad-start to-grad-end p-[2px] shadow-sm">
      <div className="flex items-stretch h-full rounded-full bg-white text-xs font-bold">
        <button
          type="button"
          onClick={() => onChange('en')}
          className={[
            'flex items-center px-4 rounded-full transition-colors',
            lang === 'en'
              ? 'bg-gradient-to-r from-grad-start to-grad-end text-white shadow-sm'
              : 'text-grad-start hover:bg-slate-50',
          ].join(' ')}
          aria-pressed={lang === 'en'}
        >
          ENG
        </button>
        <button
          type="button"
          onClick={() => onChange('bn')}
          className={[
            'flex items-center px-4 rounded-full transition-colors',
            lang === 'bn'
              ? 'bg-gradient-to-r from-grad-start to-grad-end text-white shadow-sm'
              : 'text-grad-start hover:bg-slate-50',
          ].join(' ')}
          aria-pressed={lang === 'bn'}
        >
          বাংলা
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── Sidebar TOC (left) */
function buildSections(t) {
  return [
    { id: 'overview', label: t('Overview', 'ওভারভিউ'), group: t('Get Started', 'শুরু করুন') },
    { id: 'quickstart', label: t('Quick Start', 'কুইক স্টার্ট'), group: t('Get Started', 'শুরু করুন') },
    { id: 'how', label: t('How It Works', 'কীভাবে কাজ করে'), group: t('Get Started', 'শুরু করুন') },
    { id: 'auth', label: t('Authentication', 'অথেনটিকেশন'), group: t('Concepts', 'ধারণা') },
    { id: 'gateways', label: t('Gateways', 'গেটওয়ে'), group: t('Concepts', 'ধারণা') },
    { id: 'apk', label: t('The APK', 'APK সম্পর্কে'), group: t('Concepts', 'ধারণা') },
    { id: 'step-register', label: t('1. Register', '১. রেজিস্টার'), group: t('Integration', 'ইন্টিগ্রেশন') },
    { id: 'step-configure', label: t('2. Configure Gateway', '২. গেটওয়ে কনফিগার করুন'), group: t('Integration', 'ইন্টিগ্রেশন') },
    { id: 'step-bind', label: t('3. Bind the APK', '৩. APK বাঁধাই করুন'), group: t('Integration', 'ইন্টিগ্রেশন') },
    { id: 'step-checkout', label: t('4. Hosted Checkout', '৪. হোস্টেড চেকআউট'), group: t('Integration', 'ইন্টিগ্রেশন') },
    { id: 'step-verify', label: t('5. Verify on Return', '৫. রিটার্নে ভেরিফাই করুন'), group: t('Integration', 'ইন্টিগ্রেশন') },
    { id: 'api-sessions', label: t('Payment Sessions', 'পেমেন্ট সেশন'), group: t('API Reference', 'API রেফারেন্স') },
    { id: 'api-verify', label: t('Manual Verify', 'ম্যানুয়াল ভেরিফাই'), group: t('API Reference', 'API রেফারেন্স') },
    { id: 'api-devices', label: t('Devices (APK)', 'ডিভাইস (APK)'), group: t('API Reference', 'API রেফারেন্স') },
    { id: 'errors', label: t('Errors & Status Codes', 'এরর ও স্ট্যাটাস কোড'), group: t('API Reference', 'API রেফারেন্স') },
    { id: 'rate-limits', label: t('Rate Limits', 'রেট লিমিট'), group: t('API Reference', 'API রেফারেন্স') },
    { id: 'troubleshoot', label: t('Troubleshooting', 'ট্রাবলশুটিং'), group: t('API Reference', 'API রেফারেন্স') },
    { id: 'best', label: t('Best Practices', 'সেরা পদ্ধতি'), group: t('Production', 'প্রোডাকশন') },
    { id: 'webhooks', label: t('Webhooks', 'ওয়েবহুক'), group: t('Production', 'প্রোডাকশন') },
    { id: 'support', label: t('Support', 'সাপোর্ট'), group: t('Production', 'প্রোডাকশন') },
  ];
}

function SidebarNav({ t }) {
  const [active, setActive] = useState('overview');
  const SECTIONS = buildSections(t);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    className={`block py-1.5 px-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors ${active === s.id ? 'bg-brand-50 text-brand-700 font-semibold' : ''
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

function OnThisPage() {
  return <aside className="hidden xl:block" />;
}

/* ────────────────────────────────────────── Main content */
function ContentArea({ t }) {
  return (
    <article className="min-w-0 prose-docs">
      <Hero t={t} />

      <Section
        id="overview"
        eyebrow={t('Get Started', 'শুরু করুন')}
        title={t('Overview', 'ওভারভিউ')}
      >
        <p>
          <strong>EzyPay</strong>{' '}
          {t(
            "verifies wallet, bank, and UPI payments by matching the customer's transaction ID against the actual SMS your bound Android device receives. We don't process payments — we only confirm them.",
            'গ্রাহকের ট্রানজেকশন আইডি আপনার বাঁধা অ্যান্ড্রয়েড ডিভাইসে আসা আসল SMS-এর সাথে মিলিয়ে ওয়ালেট, ব্যাংক এবং UPI পেমেন্ট ভেরিফাই করে। আমরা পেমেন্ট প্রসেস করি না — শুধু নিশ্চিত করি।'
          )}
        </p>
        <p className="mt-3">
          {t(
            'This guide walks you through the full integration: from creating your merchant account to having verified transactions land in your dashboard.',
            'এই গাইডটি আপনাকে পুরো ইন্টিগ্রেশন প্রক্রিয়া দেখাবে: মার্চেন্ট অ্যাকাউন্ট তৈরি করা থেকে শুরু করে ভেরিফাইড লেনদেন আপনার ড্যাশবোর্ডে আসা পর্যন্ত।'
          )}
        </p>
        <Callout tone="brand" title={t('Three things make a payment work', 'একটি পেমেন্ট কাজ করতে তিনটি জিনিস লাগে')}>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>
              {t(
                <>A configured <strong>gateway</strong> — your wallet/bank account where money lands</>,
                <>একটি কনফিগার করা <strong>গেটওয়ে</strong> — আপনার ওয়ালেট/ব্যাংক অ্যাকাউন্ট যেখানে টাকা আসে</>
              )}
            </li>
            <li>
              {t(
                <>A bound <strong>APK</strong> on the phone that receives the SMS</>,
                <>SMS গ্রহণকারী ফোনে বাঁধা একটি <strong>APK</strong></>
              )}
            </li>
            <li>
              {t(
                <>An <strong>API call</strong> from your backend (or a customer-typed TxnID)</>,
                <>আপনার ব্যাকএন্ড থেকে একটি <strong>API কল</strong> (অথবা গ্রাহকের টাইপ করা TxnID)</>
              )}
            </li>
          </ol>
        </Callout>
      </Section>

      <Section
        id="quickstart"
        eyebrow={t('Get Started', 'শুরু করুন')}
        title={t('Quick Start (5 minutes)', 'কুইক স্টার্ট (৫ মিনিট)')}
      >
        <ol className="space-y-3 text-slate-700">
          <li><span className="font-semibold text-slate-900">1.</span>{' '}
            {t(<>Sign up at <Link href="/register" className="text-brand-600 hover:underline">/register</Link> — pick your country (currency auto-set)</>,
              <><Link href="/register" className="text-brand-600 hover:underline">/register</Link>-এ সাইন আপ করুন — আপনার দেশ বাছাই করুন (মুদ্রা স্বয়ংক্রিয়ভাবে সেট হবে)</>)}
          </li>
          <li><span className="font-semibold text-slate-900">2.</span>{' '}
            {t(<>Note your <code className="text-xs">API Key</code> (Brands page) and <code className="text-xs">Device Auth Key</code> (Devices page)</>,
              <>আপনার <code className="text-xs">API Key</code> (Brands পেজ) এবং <code className="text-xs">Device Auth Key</code> (Devices পেজ) নোট করুন</>)}
          </li>
          <li><span className="font-semibold text-slate-900">3.</span>{' '}
            {t('Add a Gateway — your wallet/bank account number (or last 4 of bank acct)',
              'একটি গেটওয়ে যোগ করুন — আপনার ওয়ালেট/ব্যাংক অ্যাকাউন্ট নম্বর (অথবা ব্যাংক অ্যাকাউন্টের শেষ ৪ ডিজিট)')}
          </li>
          <li><span className="font-semibold text-slate-900">4.</span>{' '}
            {t("Install the APK on your shop's phone, paste the Device Auth Key",
              'আপনার দোকানের ফোনে APK ইনস্টল করুন, Device Auth Key পেস্ট করুন')}
          </li>
          <li><span className="font-semibold text-slate-900">5.</span>{' '}
            {t('Test with a checkout session (see below)', 'একটি চেকআউট সেশন দিয়ে পরীক্ষা করুন (নিচে দেখুন)')}
          </li>
        </ol>

        <CodeBlock language="bash" caption={t('Test the API now — replace pk_live_... with your key', 'এখনই API পরীক্ষা করুন — pk_live_... এর জায়গায় আপনার কী বসান')} copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`curl -X POST https://checkout.ezypay.it.com/api/payment/sessions \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500,
    "order_id": "TEST-001",
    "redirect_url": "https://example.com/done"
  }'`}</CodeBlock>
        <p className="text-sm text-slate-600 mt-2">
          {t(
            <>The response gives you a <code className="text-xs">checkout_url</code> — open it in a browser, pick a gateway, paste a TxnID, click Verify. That&apos;s the whole flow.</>,
            <>রেসপন্সে আপনি একটি <code className="text-xs">checkout_url</code> পাবেন — ব্রাউজারে খুলুন, একটি গেটওয়ে বাছুন, TxnID পেস্ট করুন, Verify ক্লিক করুন। এটাই পুরো ফ্লো।</>
          )}
        </p>
      </Section>

      <Section
        id="how"
        eyebrow={t('Get Started', 'শুরু করুন')}
        title={t('How It Works', 'কীভাবে কাজ করে')}
      >
        <p>
          {t(
            "EzyPay sits between the merchant's e-commerce backend, the customer's browser, and the bound Android phone receiving wallet SMS.",
            'EzyPay মার্চেন্টের ই-কমার্স ব্যাকএন্ড, গ্রাহকের ব্রাউজার এবং ওয়ালেট SMS গ্রহণকারী বাঁধা অ্যান্ড্রয়েড ফোনের মাঝে কাজ করে।'
          )}
        </p>

        <Diagram />

        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li><span className="text-brand-600 font-semibold">1.</span>{' '}
            {t(<>Customer hits your checkout — your backend calls <code className="text-xs">POST /api/payment/sessions</code></>,
              <>গ্রাহক আপনার চেকআউটে আসে — আপনার ব্যাকএন্ড <code className="text-xs">POST /api/payment/sessions</code> কল করে</>)}
          </li>
          <li><span className="text-brand-600 font-semibold">2.</span>{' '}
            {t(<>We return a hosted <code className="text-xs">checkout_url</code> — you redirect the customer</>,
              <>আমরা একটি হোস্টেড <code className="text-xs">checkout_url</code> ফেরত দিই — আপনি গ্রাহককে রিডাইরেক্ট করেন</>)}
          </li>
          <li><span className="text-brand-600 font-semibold">3.</span>{' '}
            {t('Customer pays from their wallet app, then pastes the TxnID on the checkout and clicks Verify',
              'গ্রাহক তার ওয়ালেট অ্যাপ থেকে পেমেন্ট করে, তারপর চেকআউটে TxnID পেস্ট করে Verify ক্লিক করে')}
          </li>
          <li><span className="text-brand-600 font-semibold">4.</span>{' '}
            {t('Your bound APK forwards the incoming wallet SMS to our backend (pure staging — nothing is auto-created from random SMS)',
              'আপনার বাঁধা APK আসা ওয়ালেট SMS আমাদের ব্যাকএন্ডে ফরোয়ার্ড করে (শুধু স্টেজিং — এলোমেলো SMS থেকে কিছু স্বয়ংক্রিয়ভাবে তৈরি হয় না)')}
          </li>
          <li><span className="text-brand-600 font-semibold">5.</span>{' '}
            {t(<>The customer&apos;s TxnID is matched against the staged SMS — match found, transaction marked <strong>Done</strong>, customer redirected back to you</>,
              <>গ্রাহকের TxnID স্টেজড SMS-এর সাথে মিলানো হয় — মিল পাওয়া গেলে লেনদেন <strong>Done</strong> হিসেবে চিহ্নিত হয়, গ্রাহক আপনার কাছে ফিরে যান</>)}
          </li>
        </ul>
      </Section>

      <Section
        id="auth"
        eyebrow={t('Concepts', 'ধারণা')}
        title={t('Authentication', 'অথেনটিকেশন')}
      >
        <p>
          {t('EzyPay uses three credentials, each for a different actor:',
            'EzyPay তিনটি ক্রেডেনশিয়াল ব্যবহার করে, প্রতিটি ভিন্ন অভিনেতার জন্য:')}
        </p>
        <CredentialTable t={t} />
        <Callout tone="amber" title={t('Keep keys server-side', 'কী সার্ভার-সাইডে রাখুন')}>
          {t(
            <>Never expose <code className="text-xs">api_key</code> or <code className="text-xs">device_auth_key</code> to the browser. They belong on your backend (api_key) or inside the bound APK (device_auth_key) — never in client-side JavaScript.</>,
            <><code className="text-xs">api_key</code> বা <code className="text-xs">device_auth_key</code> কখনো ব্রাউজারে দেখাবেন না। এগুলো আপনার ব্যাকএন্ডে (api_key) বা বাঁধা APK-এর ভিতরে (device_auth_key) থাকবে — কখনো ক্লায়েন্ট-সাইড JavaScript-এ নয়।</>
          )}
        </Callout>
      </Section>

      <Section
        id="gateways"
        eyebrow={t('Concepts', 'ধারণা')}
        title={t('Gateways', 'গেটওয়ে')}
      >
        <p>
          {t(
            <>A <strong>gateway</strong> is one wallet/bank account where you receive customer payments — e.g. <em>bKash Personal · 01711111111</em>, or <em>UPI · last-4-of-bank XX6788</em>. Each gateway has an <code className="text-xs">account_number</code> that gets matched against incoming SMS.</>,
            <>একটি <strong>গেটওয়ে</strong> মানে একটি ওয়ালেট/ব্যাংক অ্যাকাউন্ট যেখানে আপনি গ্রাহকের পেমেন্ট পান — যেমন <em>bKash Personal · 01711111111</em>, অথবা <em>UPI · ব্যাংকের শেষ ৪ ডিজিট XX6788</em>। প্রতিটি গেটওয়ের একটি <code className="text-xs">account_number</code> থাকে যা আসা SMS-এর সাথে মিলানো হয়।</>
          )}
        </p>
        <Callout tone="brand" title={t('Multiple identifiers per gateway', 'প্রতি গেটওয়েতে একাধিক আইডেন্টিফায়ার')}>
          {t(
            <>You can comma-separate identifiers in a single gateway. For UPI, store both your <strong>mobile number</strong> (what customers know) and your <strong>bank account suffix</strong> (what your bank SMS shows). Example: <code className="text-xs">8389834331, XX6788</code> — we match if any one appears in the SMS body.</>,
            <>একটি গেটওয়েতে আইডেন্টিফায়ার কমা দিয়ে আলাদা করতে পারেন। UPI-এর জন্য আপনার <strong>মোবাইল নম্বর</strong> (যা গ্রাহকরা জানে) এবং <strong>ব্যাংক অ্যাকাউন্ট সাফিক্স</strong> (যা ব্যাংক SMS-এ দেখায়) উভয়ই রাখুন। উদাহরণ: <code className="text-xs">8389834331, XX6788</code> — SMS বডিতে যেকোনো একটি থাকলেই মিলবে।</>
          )}
        </Callout>
      </Section>

      <Section
        id="apk"
        eyebrow={t('Concepts', 'ধারণা')}
        title={t('The APK', 'APK সম্পর্কে')}
      >
        <p>
          {t(
            <>The EzyPay Android app runs on the phone you use to receive wallet SMS. It does one job: <strong>read incoming wallet SMS and forward them to our backend</strong> as data staging. The SMS only becomes a verification when a customer submits a matching TxnID through your checkout — random unrelated SMS sit unused and never become orphan transactions.</>,
            <>EzyPay অ্যান্ড্রয়েড অ্যাপটি সেই ফোনে চলে যেটিতে আপনি ওয়ালেট SMS পান। এটি একটিই কাজ করে: <strong>আসা ওয়ালেট SMS পড়া এবং আমাদের ব্যাকএন্ডে স্টেজিং ডেটা হিসেবে পাঠানো</strong>। গ্রাহক যখন চেকআউটে মিলে যাওয়া TxnID জমা দেয় তখনই SMS একটি ভেরিফিকেশনে পরিণত হয় — এলোমেলো অপ্রাসঙ্গিক SMS অব্যবহৃত থাকে এবং কখনো orphan লেনদেনে পরিণত হয় না।</>
          )}
        </p>
        <p className="mt-3">
          {t(
            <>The APK also receives <strong>verify requests</strong> for any pending row a customer submits that hasn&apos;t auto-matched yet, so the merchant can Approve / Reject from the phone (mirror of the dashboard&apos;s Mark Paid / Mark Failed).</>,
            <>APK <strong>ভেরিফাই রিকোয়েস্ট</strong>ও গ্রহণ করে — গ্রাহকের জমা দেওয়া যেসব পেন্ডিং রো এখনো অটো-ম্যাচ হয়নি তাদের জন্য, যাতে মার্চেন্ট ফোন থেকেই Approve / Reject করতে পারেন (ড্যাশবোর্ডের Mark Paid / Mark Failed-এর মতো)।</>
          )}
        </p>
        <p className="mt-3">
          {t(
            <>Install the APK on the SIM-receiving device, open it on first launch, paste your <strong>Device Auth Key</strong> from the dashboard (<code className="text-xs">PV-XXXXXX</code>) — done.</>,
            <>SIM-রিসিভিং ডিভাইসে APK ইনস্টল করুন, প্রথম লঞ্চে খুলুন, ড্যাশবোর্ড থেকে আপনার <strong>Device Auth Key</strong> (<code className="text-xs">PV-XXXXXX</code>) পেস্ট করুন — হয়ে গেল।</>
          )}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          {t(
            <>For Android developers building/extending the APK, see the full contract at <code className="text-xs">docs/APK_API.md</code> in the repo.</>,
            <>APK তৈরি/সম্প্রসারণকারী অ্যান্ড্রয়েড ডেভেলপারদের জন্য, রিপোতে <code className="text-xs">docs/APK_API.md</code>-তে সম্পূর্ণ কন্ট্রাক্ট দেখুন।</>
          )}
        </p>
      </Section>

      <Section
        id="step-register"
        eyebrow={t('Integration', 'ইন্টিগ্রেশন')}
        title={t('Step 1 — Register', 'স্টেপ ১ — রেজিস্টার')}
      >
        <p>
          {t(
            <>Visit <Link href="/register" className="text-brand-600 hover:underline">/register</Link>. Fill in your business details. Your country choice determines your default currency (India → INR, Bangladesh → BDT, US → USD, etc.) — you can override per-session later.</>,
            <><Link href="/register" className="text-brand-600 hover:underline">/register</Link>-এ যান। আপনার ব্যবসার বিবরণ পূরণ করুন। আপনার দেশের পছন্দ আপনার ডিফল্ট মুদ্রা নির্ধারণ করে (ভারত → INR, বাংলাদেশ → BDT, US → USD, ইত্যাদি) — পরে প্রতি-সেশনে ওভাররাইড করতে পারবেন।</>
          )}
        </p>
        <p className="mt-3">
          {t('On successful registration, four things are generated for you:',
            'সফল রেজিস্ট্রেশনে আপনার জন্য চারটি জিনিস তৈরি হয়:')}
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>{t(<><code className="text-xs">api_key</code> (pk_live_...) — for your backend</>,
            <><code className="text-xs">api_key</code> (pk_live_...) — আপনার ব্যাকএন্ডের জন্য</>)}</li>
          <li>{t(<><code className="text-xs">secret_key</code> (sk_live_...) — for webhook signatures (future)</>,
            <><code className="text-xs">secret_key</code> (sk_live_...) — ওয়েবহুক সিগনেচারের জন্য (ভবিষ্যতে)</>)}</li>
          <li>{t(<><code className="text-xs">device_auth_key</code> (PV-XXXXXX) — for binding your phone</>,
            <><code className="text-xs">device_auth_key</code> (PV-XXXXXX) — আপনার ফোন বাঁধার জন্য</>)}</li>
          <li>{t(<>A default <strong>brand</strong> matching your domain</>,
            <>আপনার ডোমেইনের সাথে মিলে যাওয়া একটি ডিফল্ট <strong>ব্র্যান্ড</strong></>)}</li>
        </ul>
      </Section>

      <Section
        id="step-configure"
        eyebrow={t('Integration', 'ইন্টিগ্রেশন')}
        title={t('Step 2 — Configure a Gateway', 'স্টেপ ২ — একটি গেটওয়ে কনফিগার করুন')}
      >
        <p>
          {t(
            <>Go to <code className="text-xs">/dashboard/gateways</code> → <strong>Add Gateway</strong> → pick your provider (bKash / Nagad / Rocket / Upay, or whatever admin has configured).</>,
            <><code className="text-xs">/dashboard/gateways</code>-এ যান → <strong>Add Gateway</strong> → আপনার প্রোভাইডার বাছুন (bKash / Nagad / Rocket / Upay, অথবা অ্যাডমিন যা কনফিগার করেছে)।</>
          )}
        </p>
        <p className="mt-3 text-sm text-slate-700">
          {t(
            <>The <strong>Account Number</strong> field must contain what the wallet&apos;s SMS will mention — for UPI/bank deposits, that&apos;s your <strong>bank account suffix</strong> (e.g. <code className="text-xs">XX6788</code>), not your GPay phone (the bank SMS doesn&apos;t echo your GPay number).</>,
            <><strong>Account Number</strong> ফিল্ডে অবশ্যই সেটাই থাকতে হবে যা ওয়ালেটের SMS উল্লেখ করবে — UPI/ব্যাংক ডিপোজিটের জন্য সেটা আপনার <strong>ব্যাংক অ্যাকাউন্ট সাফিক্স</strong> (যেমন <code className="text-xs">XX6788</code>), আপনার GPay ফোন নয় (ব্যাংক SMS আপনার GPay নম্বর দেখায় না)।</>
          )}
        </p>
      </Section>

      <Section
        id="step-bind"
        eyebrow={t('Integration', 'ইন্টিগ্রেশন')}
        title={t('Step 3 — Bind the APK', 'স্টেপ ৩ — APK বাঁধাই করুন')}
      >
        <p>
          {t(
            <>Install EzyPay on the Android phone that receives your wallet SMS. On first launch, paste your <code className="text-xs">device_auth_key</code> (PV-XXXXXX). The phone shows up in <code className="text-xs">/dashboard/devices</code> as Online.</>,
            <>যে অ্যান্ড্রয়েড ফোন আপনার ওয়ালেট SMS পায় সেটিতে EzyPay ইনস্টল করুন। প্রথম লঞ্চে আপনার <code className="text-xs">device_auth_key</code> (PV-XXXXXX) পেস্ট করুন। ফোনটি <code className="text-xs">/dashboard/devices</code>-এ Online হিসেবে দেখা যাবে।</>
          )}
        </p>
        <p className="mt-3 text-sm text-slate-700">
          {t(
            'From this moment, every wallet SMS that arrives on the phone gets forwarded to EzyPay automatically.',
            'এই মুহূর্ত থেকে, ফোনে আসা প্রতিটি ওয়ালেট SMS স্বয়ংক্রিয়ভাবে EzyPay-তে ফরোয়ার্ড হবে।'
          )}
        </p>
      </Section>

      <Section
        id="step-checkout"
        eyebrow={t('Integration', 'ইন্টিগ্রেশন')}
        title={t('Step 4 — Hosted Checkout', 'স্টেপ ৪ — হোস্টেড চেকআউট')}
      >
        <p>
          {t(
            'When a customer reaches your checkout, your backend creates a payment session and redirects them to the EzyPay checkout URL.',
            'যখন একজন গ্রাহক আপনার চেকআউটে আসে, আপনার ব্যাকএন্ড একটি পেমেন্ট সেশন তৈরি করে এবং তাদের EzyPay চেকআউট URL-এ রিডাইরেক্ট করে।'
          )}
        </p>

        <TabGroup tabs={['Node.js', 'PHP', 'Python', 'cURL']}>
          <CodeBlock language="js" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`// Node.js (Express)
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

          <CodeBlock language="php" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`<?php
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

          <CodeBlock language="python" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`# Python (Flask / Django)
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

          <CodeBlock language="bash" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`curl -X POST https://checkout.ezypay.it.com/api/payment/sessions \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":        500,
    "order_id":      "ORD-1001",
    "redirect_url":  "https://yourstore.com/payment/result",
    "customer_phone": "+8801712345678"
  }'`}</CodeBlock>
        </TabGroup>

        <Callout tone="slate" title={t('Session lifecycle', 'সেশন লাইফসাইকেল')}>
          {t(
            <>Sessions stay live for <strong>24 hours</strong> after creation. Once a customer submits a TxnID and we verify it, the session flips to <code className="text-xs">success</code>. If they cancel, it flips to <code className="text-xs">cancelled</code>. Beyond 24 hours, a still-pending session auto-expires.</>,
            <>সেশন তৈরির পর <strong>২৪ ঘণ্টা</strong> সক্রিয় থাকে। গ্রাহক TxnID জমা দিয়ে আমরা ভেরিফাই করার পর সেশন <code className="text-xs">success</code>-এ পরিণত হয়। তারা ক্যান্সেল করলে <code className="text-xs">cancelled</code>-এ পরিণত হয়। ২৪ ঘণ্টা পর pending সেশন স্বয়ংক্রিয়ভাবে মেয়াদ শেষ হয়।</>
          )}
        </Callout>
      </Section>

      <Section
        id="step-verify"
        eyebrow={t('Integration', 'ইন্টিগ্রেশন')}
        title={t('Step 5 — Verify on Return', 'স্টেপ ৫ — রিটার্নে ভেরিফাই করুন')}
      >
        <p>
          {t(
            <>After payment, the customer is redirected back to your <code className="text-xs">redirect_url</code> with query params:</>,
            <>পেমেন্টের পর, গ্রাহককে কোয়েরি প্যারামসহ আপনার <code className="text-xs">redirect_url</code>-এ ফেরত পাঠানো হয়:</>
          )}
        </p>
        <CodeBlock language="text" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`https://yourstore.com/payment/result?session_id=eNOuUpsg2IGX4ko4HbFL&status=success`}</CodeBlock>

        <Callout tone="rose" title={t("Don't trust query params", 'কোয়েরি প্যারামকে বিশ্বাস করবেন না')}>
          {t(
            <>A bad actor could craft <code className="text-xs">?status=success</code> directly without paying. Always verify server-side by calling <code className="text-xs">GET /api/payment/sessions/:id</code>.</>,
            <>একজন খারাপ ব্যক্তি না দিয়েই সরাসরি <code className="text-xs">?status=success</code> বানিয়ে আনতে পারে। সর্বদা <code className="text-xs">GET /api/payment/sessions/:id</code> কল করে সার্ভার-সাইডে ভেরিফাই করুন।</>
          )}
        </Callout>

        <Callout tone="amber" title={t('Heads up — pending returns are normal', 'মনে রাখুন — pending রিটার্ন স্বাভাবিক')}>
          {t(
            <>The checkout waits ~15 s for the APK to confirm, then redirects the customer back to you <em>regardless</em>. So <code className="text-xs">?status=pending</code> simply means &quot;not resolved yet&quot; — <strong>not</strong> &quot;failed&quot;. Render a &quot;we&apos;re confirming your payment&quot; page and poll <code className="text-xs">GET /sessions/:id</code> server-side until it flips to <code className="text-xs">success</code> / <code className="text-xs">failed</code> / <code className="text-xs">expired</code> (within the 24-hour session window). Treating pending as failure will reject paying customers.</>,
            <>চেকআউট APK-এর কনফার্মেশনের জন্য ~১৫ সেকেন্ড অপেক্ষা করে, তারপর গ্রাহককে আপনার কাছে ফেরত পাঠায় — <em>ফলাফল যাই হোক</em>। তাই <code className="text-xs">?status=pending</code> মানে শুধু &quot;এখনো রেজলভ হয়নি&quot; — <strong>&quot;failed&quot; নয়</strong>। একটি &quot;আমরা আপনার পেমেন্ট নিশ্চিত করছি&quot; পেজ দেখান এবং সার্ভার-সাইডে <code className="text-xs">GET /sessions/:id</code> পোল করুন যতক্ষণ না এটি <code className="text-xs">success</code> / <code className="text-xs">failed</code> / <code className="text-xs">expired</code>-এ পরিণত হয় (২৪-ঘণ্টা সেশন উইন্ডোর মধ্যে)। pending-কে failure হিসেবে গণ্য করলে যেসব গ্রাহক পেমেন্ট করেছেন তাদের বাতিল করে দেবেন।</>
          )}
        </Callout>

        <TabGroup tabs={['Node.js', 'PHP', 'cURL']}>
          <CodeBlock language="js" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`app.get('/payment/result', async (req, res) => {
  const r = await fetch(
    \`https://checkout.ezypay.it.com/api/payment/sessions/\${req.query.session_id}\`,
    { headers: { 'X-API-Key': process.env.PAYVERIFY_API_KEY } }
  );
  const { session } = await r.json();
  if (session.status === 'success') {
    await markOrderPaid(session.order_id);
    return res.render('order-confirmed', { session });
  }
  if (session.status === 'pending') {
    // Verification didn't finish before redirect. Show a "processing" page;
    // keep polling GET /sessions/:id server-side until it resolves or expires.
    return res.render('payment-processing', { session });
  }
  res.render('payment-failed', { reason: session.status });
});`}</CodeBlock>

          <CodeBlock language="php" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`<?php
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

          <CodeBlock language="bash" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`curl https://checkout.ezypay.it.com/api/payment/sessions/eNOuUpsg2IGX4ko4HbFL \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxx"`}</CodeBlock>
        </TabGroup>
      </Section>

      <Section
        id="api-sessions"
        eyebrow={t('API Reference', 'API রেফারেন্স')}
        title={t('Payment Sessions', 'পেমেন্ট সেশন')}
      >
        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/payment/sessions"
          auth="X-API-Key"
          description={t(
            'Create a new checkout session for a customer. order_id is enforced unique-per-merchant (see status codes below).',
            'একজন গ্রাহকের জন্য নতুন চেকআউট সেশন তৈরি করুন। order_id প্রতি-মার্চেন্টে অনন্য বাধ্যতামূলক (নিচে স্ট্যাটাস কোড দেখুন)।'
          )}
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

        <Callout tone="slate" title={t('Handling the response', 'রেসপন্স হ্যান্ডেল করা')}>
          {t(
            <>Always use <code className="text-xs">data.checkout_url</code> regardless of whether you get 201 or 200 — the URL is the same when <code className="text-xs">existed: true</code>. Treat <strong>409</strong> as &quot;this order is done — show the customer the paid state, don&apos;t retry.&quot; Treat <strong>402</strong> as &quot;merchant configuration issue — surface a friendly retry-later message.&quot;</>,
            <>আপনি 201 বা 200 যাই পান, সর্বদা <code className="text-xs">data.checkout_url</code> ব্যবহার করুন — <code className="text-xs">existed: true</code> হলেও URL একই থাকে। <strong>409</strong>-কে এভাবে দেখুন: &quot;এই অর্ডার সম্পন্ন — গ্রাহককে পেইড অবস্থা দেখান, পুনরায় চেষ্টা করবেন না।&quot; <strong>402</strong>-কে এভাবে দেখুন: &quot;মার্চেন্ট কনফিগারেশন সমস্যা — পরে আবার চেষ্টা করার বন্ধুসুলভ বার্তা দিন।&quot;</>
          )}
        </Callout>

        <ApiEndpoint
          t={t}
          method="GET"
          path="/api/payment/sessions/:id"
          auth="X-API-Key"
          description={t(
            'Fetch the current status of a session. Use this after the customer returns (and poll it while pending). Always includes latest_transaction — the most recent attempt of ANY status, carrying the UTR, payment method, and the customer’s sender account. successful_transaction is only present once a payment succeeds.',
            'একটি সেশনের বর্তমান স্ট্যাটাস আনুন। গ্রাহক ফেরত আসার পর (এবং pending থাকাকালীন পোল করার সময়) এটি ব্যবহার করুন। সর্বদা latest_transaction থাকে — যেকোনো স্ট্যাটাসের সর্বশেষ অ্যাটেম্পট, যাতে UTR, পেমেন্ট মেথড এবং গ্রাহকের sender account থাকে। successful_transaction শুধু পেমেন্ট সফল হলে থাকে।'
          )}
          response={`// ── PENDING — submitted, waiting for the SMS/APK to confirm ──
{
  "session": {
    "id":         "eNOuUpsg2IGX4ko4HbFL",
    "order_id":   "ORD-1001",
    "amount":     "500.00",
    "currency":   "BDT",
    "status":     "pending",
    "expires_at": "2026-05-13T11:30:00Z",   // 24h after creation
    "created_at": "2026-05-12T11:30:00Z",
    "successful_transaction": null,
    "latest_transaction": {
      "txnid_submitted": "BKX92H1",          // UTR the customer entered
      "method":          "nagad",            // gateway provider (bkash/nagad/rocket/upay)
      "variant":         "personal",
      "account_number":  "01711111111",      // your receiving wallet
      "sender_account":  "01822222222",      // number the customer paid FROM
      "amount":          "500.00",
      "status":          "pending",
      "result_source":   null,
      "failure_reason":  null,
      "verified_at":     null
    }
  }
}

// ── SUCCESS (auto) — matched against the bound APK's SMS ──
{
  "session": {
    "id": "eNOuUpsg2IGX4ko4HbFL", "order_id": "ORD-1001",
    "amount": "500.00", "currency": "BDT", "status": "success",
    "successful_transaction": {
      "txnid_submitted": "BKX92H1",
      "verified_at":     "2026-05-12T11:34:10Z",
      "result_source":   "apk"               // or "sms_inbound" / "sms_late_match"
    },
    "latest_transaction": {
      "txnid_submitted": "BKX92H1", "method": "nagad", "variant": "personal",
      "account_number": "01711111111", "sender_account": "01822222222",
      "amount": "500.00", "status": "success",
      "result_source": "apk", "failure_reason": null,
      "verified_at": "2026-05-12T11:34:10Z"
    }
  }
}

// ── SUCCESS (manually approved) — merchant clicked "Mark Paid" ──
//    Identical to above, except result_source is "manual".
{
  "session": {
    "status": "success",
    "successful_transaction": { "txnid_submitted": "BKX92H1", "result_source": "manual",
                                "verified_at": "2026-05-12T11:40:00Z" },
    "latest_transaction": { "txnid_submitted": "BKX92H1", "method": "nagad",
                            "sender_account": "01822222222", "amount": "500.00",
                            "status": "success", "result_source": "manual",
                            "failure_reason": null, "verified_at": "2026-05-12T11:40:00Z" }
  }
}

// ── FAILED (manually rejected) — merchant clicked "Mark Failed" + reason ──
//    NOTE: the transaction is failed, but session.status stays "pending"
//    so the customer can still retry with a fresh TxnID.
{
  "session": {
    "id": "eNOuUpsg2IGX4ko4HbFL", "order_id": "ORD-1001",
    "status": "pending",
    "successful_transaction": null,
    "latest_transaction": {
      "txnid_submitted": "BKX92H1", "method": "nagad",
      "sender_account": "01822222222", "amount": "500.00",
      "status":         "failed",
      "result_source":  "manual",            // "apk" if rejected from the phone
      "failure_reason": "TxnID not found in our wallet SMS",
      "verified_at":    "2026-05-12T11:40:00Z"
    }
  }
}

// ── EXPIRED — no resolution within the 24h window ──
{ "session": { "status": "expired", "successful_transaction": null, "latest_transaction": null } }

// ── CANCELLED — customer abandoned the checkout ──
{ "session": { "status": "cancelled", "successful_transaction": null } }`}
        />

        <Callout tone="slate" title={t('Reading the states', 'স্ট্যাটাস পড়া')}>
          {t(
            <>Two status fields matter. <code className="text-xs">session.status</code> is the order-level state: <code className="text-xs">pending</code> · <code className="text-xs">success</code> · <code className="text-xs">expired</code> · <code className="text-xs">cancelled</code>. <code className="text-xs">latest_transaction.status</code> is the attempt-level verdict: <code className="text-xs">pending</code> · <code className="text-xs">success</code> · <code className="text-xs">failed</code>. A <strong>manual rejection fails the transaction but keeps the session pending</strong> (so the customer can retry) — so to detect a rejection, read <code className="text-xs">latest_transaction.status === &quot;failed&quot;</code> plus its <code className="text-xs">failure_reason</code>. <code className="text-xs">result_source</code> tells you how it resolved: <code className="text-xs">apk</code> (phone confirmed), <code className="text-xs">sms_inbound</code> / <code className="text-xs">sms_late_match</code> (auto-matched SMS), or <code className="text-xs">manual</code> (merchant Mark Paid/Failed).</>,
            <>দুটি স্ট্যাটাস ফিল্ড গুরুত্বপূর্ণ। <code className="text-xs">session.status</code> হলো অর্ডার-লেভেল অবস্থা: <code className="text-xs">pending</code> · <code className="text-xs">success</code> · <code className="text-xs">expired</code> · <code className="text-xs">cancelled</code>। <code className="text-xs">latest_transaction.status</code> হলো অ্যাটেম্পট-লেভেল রায়: <code className="text-xs">pending</code> · <code className="text-xs">success</code> · <code className="text-xs">failed</code>। একটি <strong>ম্যানুয়াল রিজেকশন ট্রানজেকশনকে failed করে কিন্তু সেশন pending রাখে</strong> (যাতে গ্রাহক আবার চেষ্টা করতে পারে) — তাই রিজেকশন বুঝতে <code className="text-xs">latest_transaction.status === &quot;failed&quot;</code> এবং তার <code className="text-xs">failure_reason</code> পড়ুন। <code className="text-xs">result_source</code> বলে কীভাবে রেজলভ হলো: <code className="text-xs">apk</code> (ফোন কনফার্ম করেছে), <code className="text-xs">sms_inbound</code> / <code className="text-xs">sms_late_match</code> (অটো-ম্যাচড SMS), অথবা <code className="text-xs">manual</code> (মার্চেন্ট Mark Paid/Failed)।</>
          )}
        </Callout>
      </Section>

      <Section
        id="api-verify"
        eyebrow={t('API Reference', 'API রেফারেন্স')}
        title={t('Manual Verify', 'ম্যানুয়াল ভেরিফাই')}
      >
        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/merchant/verify"
          auth="Bearer JWT (merchant login)"
          description={t(
            "Manually verify a TxnID given to you out-of-band. Used by the dashboard's Verify page. Looks up SMS, extracts amount + gateway, creates a transaction if it all matches.",
            'বাইরে থেকে পাওয়া TxnID ম্যানুয়ালি ভেরিফাই করুন। ড্যাশবোর্ডের Verify পেজ এটি ব্যবহার করে। SMS খোঁজে, অ্যামাউন্ট + গেটওয়ে বের করে, সব মিলে গেলে একটি লেনদেন তৈরি করে।'
          )}
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

      <Section
        id="api-devices"
        eyebrow={t('API Reference', 'API রেফারেন্স')}
        title={t('Devices (APK)', 'ডিভাইস (APK)')}
      >
        <p className="mb-4 text-slate-700">
          {t(
            <>These endpoints are called by your <strong>Android APK</strong>, authenticated by <code className="text-xs">device_auth_key</code> in the body. Never call from a server or browser.</>,
            <>এই এন্ডপয়েন্টগুলো আপনার <strong>অ্যান্ড্রয়েড APK</strong> কল করে, বডিতে <code className="text-xs">device_auth_key</code> দিয়ে অথেনটিকেট। সার্ভার বা ব্রাউজার থেকে কখনো কল করবেন না।</>
          )}
        </p>

        <Callout tone="amber" title={t('Wallet-empty (402) handling', 'ওয়ালেট-খালি (402) হ্যান্ডলিং')}>
          {t(
            <>Every APK endpoint EXCEPT <code className="text-xs">/bind</code> and <code className="text-xs">/unbind</code> returns <strong>402</strong> with <code className="text-xs">{'{ insufficient_balance: true, balance, fee, threshold }'}</code> when the merchant&apos;s wallet doesn&apos;t have enough to cover the per-verification fee. The APK should switch to a <em>&quot;Wallet empty — please top up&quot;</em> screen and keep heartbeating; when <code className="text-xs">/heartbeat</code> returns 200 again, auto-recover.</>,
            <><code className="text-xs">/bind</code> এবং <code className="text-xs">/unbind</code> ছাড়া প্রতিটি APK এন্ডপয়েন্ট <strong>402</strong> ফেরত দেয় <code className="text-xs">{'{ insufficient_balance: true, balance, fee, threshold }'}</code> সহ, যখন মার্চেন্টের ওয়ালেটে প্রতি-ভেরিফিকেশন ফি কভার করার মতো ব্যালেন্স থাকে না। APK-কে একটি <em>&quot;ওয়ালেট খালি — দয়া করে টপ-আপ করুন&quot;</em> স্ক্রিনে স্যুইচ করতে হবে এবং হার্টবিট চালিয়ে যেতে হবে; যখন <code className="text-xs">/heartbeat</code> আবার 200 ফেরত দেবে, স্বয়ংক্রিয়ভাবে রিকভার হবে।</>
          )}
        </Callout>

        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/device/bind"
          auth="device_auth_key"
          description={t(
            'Register a phone with the merchant account. Idempotent — re-binding the same device_id refreshes the row.',
            'একটি ফোনকে মার্চেন্ট অ্যাকাউন্টে নিবন্ধন করুন। Idempotent — একই device_id পুনরায় বাঁধাই করলে রো রিফ্রেশ হয়।'
          )}
          request={`{
  "auth_key":     "PV-XXXXXX",
  "device_id":    "android-stable-id",
  "model":        "CPH1937",
  "manufacturer": "OPPO",
  "os_version":   "11"
}`}
        />

        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/device/unbind"
          auth="device_auth_key"
          description={t(
            'User taps "Disconnect" in the app. Soft-delete — the row stays in history.',
            'ব্যবহারকারী অ্যাপে "Disconnect" ট্যাপ করে। সফট-ডিলিট — রো ইতিহাসে থাকে।'
          )}
          request={`{ "auth_key": "PV-XXXXXX", "device_id": "android-stable-id" }`}
        />

        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/device/sms"
          auth="device_auth_key"
          description={t(
            'Forward incoming wallet SMS. Backend stores the SMS as staging data only — it becomes a verification when a customer submits a matching TxnID through the checkout. Unmatched SMS never become orphan transactions.',
            'আসা ওয়ালেট SMS ফরোয়ার্ড করুন। ব্যাকএন্ড SMS-কে শুধু স্টেজিং ডেটা হিসেবে সংরক্ষণ করে — গ্রাহক চেকআউটে মিলে যাওয়া TxnID জমা দিলে এটি ভেরিফিকেশনে পরিণত হয়। মিল না হওয়া SMS কখনো orphan লেনদেনে পরিণত হয় না।'
          )}
          request={`{
  "auth_key":  "PV-XXXXXX",
  "device_id": "android-stable-id",
  "messages": [{
    "sender":      "bKash",
    "body":        "Cash In Tk 500.00 successful. TrxID: BKX92H1 from 01712345678",
    "received_at": "2026-05-12T11:25:30Z"
  }]
}`}
        />

        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/device/poll"
          auth="device_auth_key"
          description={t(
            'Fetch pending verifications waiting for a decision. Call on a timer (every 10–30s). Each returned row has the data needed to render an Approve/Reject prompt offline.',
            'সিদ্ধান্তের অপেক্ষায় থাকা পেন্ডিং ভেরিফিকেশন আনুন। টাইমারে কল করুন (প্রতি ১০–৩০ সেকেন্ডে)। ফিরে আসা প্রতিটি রো-তে অফলাইনে Approve/Reject প্রম্পট রেন্ডার করার জন্য প্রয়োজনীয় ডেটা থাকে।'
          )}
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
}`}
        />

        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/device/report"
          auth="device_auth_key"
          description={t(
            `Resolve a pending verification from the APK ("Approve" / "Reject" buttons). Mirrors the web dashboard's Mark Paid / Mark Failed.`,
            'APK থেকে একটি পেন্ডিং ভেরিফিকেশন রেজলভ করুন ("Approve" / "Reject" বাটন)। ওয়েব ড্যাশবোর্ডের Mark Paid / Mark Failed-এর মতো।'
          )}
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
}`}
        />

        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/device/transactions"
          auth="device_auth_key"
          description={t(
            'List recent transactions (pending + history) for the merchant on the APK. Filter by status, search by TxnID or order_id.',
            'APK-তে মার্চেন্টের জন্য সাম্প্রতিক লেনদেন (পেন্ডিং + ইতিহাস) তালিকা করুন। স্ট্যাটাস দিয়ে ফিল্টার করুন, TxnID বা order_id দিয়ে সার্চ করুন।'
          )}
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
}`}
        />

        <ApiEndpoint
          t={t}
          method="POST"
          path="/api/device/verify"
          auth="device_auth_key"
          description={t(
            'Paste a TxnID into the APK. Backend searches received SMS, validates against a configured gateway, creates a successful transaction if everything aligns. Mirrors the web Verify page.',
            'APK-তে একটি TxnID পেস্ট করুন। ব্যাকএন্ড গ্রহণ করা SMS খোঁজে, কনফিগার করা গেটওয়ের বিপরীতে যাচাই করে, সব মিলে গেলে সফল লেনদেন তৈরি করে। ওয়েব Verify পেজের মতো।'
          )}
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
}`}
        />

        <Callout tone="slate" title={t('Manual verification flow inside the APK', 'APK-এর ভিতরে ম্যানুয়াল ভেরিফিকেশন ফ্লো')}>
          {t('The APK has the same verification powers as the web dashboard:',
            'APK-এ ওয়েব ড্যাশবোর্ডের মতোই ভেরিফিকেশন ক্ষমতা আছে:')}
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              {t(<><strong>List view:</strong> call <code className="text-xs">/api/device/transactions</code> for full history, or <code className="text-xs">/api/device/poll</code> for pending-only.</>,
                <><strong>লিস্ট ভিউ:</strong> সম্পূর্ণ ইতিহাসের জন্য <code className="text-xs">/api/device/transactions</code> কল করুন, বা শুধু পেন্ডিং-এর জন্য <code className="text-xs">/api/device/poll</code>।</>)}
            </li>
            <li>
              {t(<><strong>Approve / Reject:</strong> call <code className="text-xs">/api/device/report</code> with <code className="text-xs">result: &quot;success&quot;</code> or <code className="text-xs">&quot;failed&quot;</code>.</>,
                <><strong>Approve / Reject:</strong> <code className="text-xs">result: &quot;success&quot;</code> বা <code className="text-xs">&quot;failed&quot;</code> দিয়ে <code className="text-xs">/api/device/report</code> কল করুন।</>)}
            </li>
            <li>
              {t(<><strong>Type-a-TxnID verify:</strong> call <code className="text-xs">/api/device/verify</code> — searches SMS, auto-resolves.</>,
                <><strong>TxnID টাইপ-করে ভেরিফাই:</strong> <code className="text-xs">/api/device/verify</code> কল করুন — SMS খোঁজে, স্বয়ংক্রিয়ভাবে রেজলভ করে।</>)}
            </li>
          </ul>
          {t(
            <>All of these flip the same <code className="text-xs">transactions</code> row that the web dashboard reads, so a decision from the phone shows up on the dashboard immediately.</>,
            <>এই সবই সেই একই <code className="text-xs">transactions</code> রো ফ্লিপ করে যা ওয়েব ড্যাশবোর্ড পড়ে, তাই ফোন থেকে নেওয়া সিদ্ধান্ত ড্যাশবোর্ডে তাৎক্ষণিক দেখা যায়।</>
          )}
        </Callout>

        <p className="mt-4 text-sm text-slate-600">
          {t(
            <>Full APK contract (poll/report patterns, SMS matching rules, permissions) lives in <code className="text-xs">docs/APK_API.md</code>.</>,
            <>সম্পূর্ণ APK কন্ট্রাক্ট (poll/report প্যাটার্ন, SMS ম্যাচিং নিয়ম, পারমিশন) <code className="text-xs">docs/APK_API.md</code>-তে রয়েছে।</>
          )}
        </p>
      </Section>

      <Section
        id="errors"
        eyebrow={t('API Reference', 'API রেফারেন্স')}
        title={t('Errors & Status Codes', 'এরর ও স্ট্যাটাস কোড')}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-3 border border-slate-200">{t('Code', 'কোড')}</th>
              <th className="text-left p-3 border border-slate-200">{t('Meaning', 'অর্থ')}</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['200', t('OK (existing resource fetched)', 'OK (বিদ্যমান রিসোর্স আনা হয়েছে)')],
              ['201', t('Created (new session / new resource)', 'Created (নতুন সেশন / নতুন রিসোর্স)')],
              ['202', t('Accepted (TxnID submitted, verification pending)', 'Accepted (TxnID জমা হয়েছে, ভেরিফিকেশন পেন্ডিং)')],
              ['400', t('Bad request — check error message; usually a missing/invalid field', 'Bad request — এরর বার্তা দেখুন; সাধারণত একটি মিসিং/অবৈধ ফিল্ড')],
              ['401', t('Invalid or missing API key (X-API-Key or JWT)', 'অবৈধ বা মিসিং API কী (X-API-Key বা JWT)')],
              ['402', t('Merchant wallet has insufficient balance — top up to resume', 'মার্চেন্ট ওয়ালেটে অপর্যাপ্ত ব্যালেন্স — পুনরায় শুরু করতে টপ-আপ করুন')],
              ['403', t('Forbidden — usually merchant suspended', 'Forbidden — সাধারণত মার্চেন্ট সাসপেন্ডেড')],
              ['404', t('Resource not found (wrong id, or not yours)', 'রিসোর্স পাওয়া যায়নি (ভুল id, বা আপনার নয়)')],
              ['409', t('Conflict — duplicate (TxnID reused, order already paid, session in wrong state)', 'Conflict — ডুপ্লিকেট (TxnID পুনঃব্যবহৃত, অর্ডার ইতিমধ্যে পেইড, সেশন ভুল অবস্থায়)')],
              ['429', t('Too many requests — back off, see Rate Limits below', 'অনেক বেশি রিকোয়েস্ট — ব্যাক অফ করুন, নিচের Rate Limits দেখুন')],
              ['5xx', t('Server error — retry with exponential backoff', 'সার্ভার এরর — এক্সপোনেনশিয়াল ব্যাকঅফ দিয়ে পুনরায় চেষ্টা করুন')],
            ].map(([c, m]) => (
              <tr key={c}>
                <td className="p-3 border border-slate-200 font-mono">{c}</td>
                <td className="p-3 border border-slate-200">{m}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-8 font-semibold text-slate-900">{t('Error response shape', 'এরর রেসপন্স গঠন')}</h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            <>Customer-facing endpoints (<code className="text-xs">/api/payment/sessions</code>, <code className="text-xs">/api/checkout/:id/submit</code>) split every error into two tiers so you can safely route the right text to each audience:</>,
            <>গ্রাহক-মুখী এন্ডপয়েন্ট (<code className="text-xs">/api/payment/sessions</code>, <code className="text-xs">/api/checkout/:id/submit</code>) প্রতিটি এররকে দুটি স্তরে ভাগ করে যাতে আপনি নিরাপদে প্রতিটি শ্রোতার কাছে সঠিক টেক্সট রুট করতে পারেন:</>
          )}
        </p>
        <CodeBlock language="json" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`{
  "error":            "Services currently unavailable.",
  "merchant_message": "Merchant wallet has insufficient balance to cover the per-verification fee. Top up at the dashboard.",
  "insufficient_balance": true,
  "code":             "merchant_wallet_empty"
}`}</CodeBlock>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>{t(<><code className="text-xs">error</code> — <strong>safe to display to your customer</strong>. Neutral, no EzyPay-specific language, no numeric leaks.</>,
            <><code className="text-xs">error</code> — <strong>আপনার গ্রাহককে দেখানো নিরাপদ</strong>। নিরপেক্ষ, EzyPay-নির্দিষ্ট ভাষা নয়, কোনো সংখ্যাগত লিক নেই।</>)}</li>
          <li>{t(<><code className="text-xs">merchant_message</code> — <strong>for your server logs / admin alerts only</strong>. Tells you exactly what to fix. Never render this to the end customer.</>,
            <><code className="text-xs">merchant_message</code> — <strong>শুধু আপনার সার্ভার লগ / অ্যাডমিন অ্যালার্টের জন্য</strong>। ঠিক কী ঠিক করতে হবে বলে। শেষ গ্রাহকের কাছে কখনো রেন্ডার করবেন না।</>)}</li>
          <li>{t(<><code className="text-xs">code</code> — stable machine-readable identifier (e.g. <code className="text-xs">merchant_wallet_empty</code>, <code className="text-xs">order_already_paid</code>). Use this for programmatic branching.</>,
            <><code className="text-xs">code</code> — স্থিতিশীল মেশিন-পাঠযোগ্য আইডেন্টিফায়ার (যেমন <code className="text-xs">merchant_wallet_empty</code>, <code className="text-xs">order_already_paid</code>)। প্রোগ্রাম্যাটিক ব্রাঞ্চিং-এর জন্য এটি ব্যবহার করুন।</>)}</li>
          <li>{t(<>Other fields like <code className="text-xs">insufficient_balance</code> or <code className="text-xs">existing_session_id</code> are programmatic hints — safe but uninformative if shown.</>,
            <><code className="text-xs">insufficient_balance</code> বা <code className="text-xs">existing_session_id</code>-এর মতো অন্যান্য ফিল্ড প্রোগ্রাম্যাটিক ইঙ্গিত — নিরাপদ কিন্তু দেখালে তথ্যবহুল নয়।</>)}</li>
        </ul>

        <Callout tone="rose" title={t("Don't dump the whole response to the customer", 'গ্রাহকের কাছে পুরো রেসপন্স ডাম্প করবেন না')}>
          {t(
            <>A common integration bug: <code className="text-xs">alert(JSON.stringify(response))</code> on the customer&apos;s screen. They see &quot;Merchant wallet has insufficient balance&quot; and lose trust in your site. <strong>Always read <code className="text-xs">error</code> and display only that.</strong></>,
            <>একটি সাধারণ ইন্টিগ্রেশন বাগ: গ্রাহকের স্ক্রিনে <code className="text-xs">alert(JSON.stringify(response))</code>। তারা &quot;Merchant wallet has insufficient balance&quot; দেখে এবং আপনার সাইটে বিশ্বাস হারায়। <strong>সর্বদা <code className="text-xs">error</code> পড়ুন এবং শুধু তা দেখান।</strong></>
          )}
        </Callout>

        <p className="mt-3 text-sm text-slate-700">
          {t('Reference handler (Node):', 'রেফারেন্স হ্যান্ডলার (Node):')}
        </p>
        <CodeBlock language="js" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`const r = await fetch(...);
const body = await r.json();
if (!r.ok) {
  // Log the technical detail for ops
  console.warn('[ezypay]', body.merchant_message || body.error, '— code:', body.code);
  // Show ONLY the safe text to the customer
  return res.status(503).json({ error: body.error });
}`}</CodeBlock>
      </Section>

      <Section
        id="rate-limits"
        eyebrow={t('API Reference', 'API রেফারেন্স')}
        title={t('Rate Limits', 'রেট লিমিট')}
      >
        <p>
          {t(
            'EzyPay throttles every public endpoint to protect against brute force, TxnID mining, and runaway integrations. When you exceed a limit you get HTTP 429 instead of the normal response — the request did not run.',
            'EzyPay প্রতিটি পাবলিক এন্ডপয়েন্ট থ্রটল করে — ব্রুট ফোর্স, TxnID মাইনিং এবং অনিয়ন্ত্রিত ইন্টিগ্রেশন থেকে সুরক্ষার জন্য। সীমা ছাড়িয়ে গেলে আপনি স্বাভাবিক রেসপন্সের পরিবর্তে HTTP 429 পান — রিকোয়েস্টটি চালেইনি।'
          )}
        </p>

        <h3 className="mt-6 font-semibold text-slate-900">{t('Per-endpoint limits', 'এন্ডপয়েন্ট-ভিত্তিক সীমা')}</h3>
        <div className="my-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3 border border-slate-200">{t('Endpoint', 'এন্ডপয়েন্ট')}</th>
                <th className="text-left p-3 border border-slate-200">{t('Limit', 'সীমা')}</th>
                <th className="text-left p-3 border border-slate-200">{t('Window', 'উইন্ডো')}</th>
                <th className="text-left p-3 border border-slate-200">{t('Keyed by', 'কী')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-slate-200 font-mono text-xs">POST /api/payment/sessions</td>
                <td className="p-3 border border-slate-200">60</td>
                <td className="p-3 border border-slate-200">{t('1 min', '১ মিনিট')}</td>
                <td className="p-3 border border-slate-200">{t('API key', 'API কী')}</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 font-mono text-xs">POST /api/checkout/:id/submit</td>
                <td className="p-3 border border-slate-200">6</td>
                <td className="p-3 border border-slate-200">{t('1 min', '১ মিনিট')}</td>
                <td className="p-3 border border-slate-200">{t('IP + session', 'IP + সেশন')}</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 font-mono text-xs">POST /api/merchant/login</td>
                <td className="p-3 border border-slate-200">8</td>
                <td className="p-3 border border-slate-200">{t('15 min', '১৫ মিনিট')}</td>
                <td className="p-3 border border-slate-200">IP</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 font-mono text-xs">POST /api/merchant/verify</td>
                <td className="p-3 border border-slate-200">20</td>
                <td className="p-3 border border-slate-200">{t('1 min', '১ মিনিট')}</td>
                <td className="p-3 border border-slate-200">IP</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 font-mono text-xs">POST /api/device/sms</td>
                <td className="p-3 border border-slate-200">120</td>
                <td className="p-3 border border-slate-200">{t('1 min', '১ মিনিট')}</td>
                <td className="p-3 border border-slate-200">device_auth_key</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 font-semibold text-slate-900">{t('429 response shape', '429 রেসপন্স গঠন')}</h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            'Every throttled response carries a body explaining the retry window and headers a polite client can read.',
            'প্রতিটি থ্রটল রেসপন্সে রিট্রাই উইন্ডো ব্যাখ্যাকারী বডি এবং বন্ধুসুলভ ক্লায়েন্ট পড়তে পারে এমন হেডার থাকে।'
          )}
        </p>
        <CodeBlock language="http" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit:     60
X-RateLimit-Remaining: 0
X-RateLimit-Reset:     1716210000
Retry-After:           37

{
  "error":               "API rate limit exceeded. Slow down session creation.",
  "retry_after_seconds": 37
}`}</CodeBlock>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li><code className="text-xs">X-RateLimit-Limit</code> — {t('the cap for this endpoint.', 'এই এন্ডপয়েন্টের সীমা।')}</li>
          <li><code className="text-xs">X-RateLimit-Remaining</code> — {t('how many calls you have left in the current window.', 'বর্তমান উইন্ডোতে আপনার আর কত কল বাকি।')}</li>
          <li><code className="text-xs">X-RateLimit-Reset</code> — {t('Unix timestamp when the counter resets.', 'কাউন্টার রিসেট হওয়ার ইউনিক্স টাইমস্ট্যাম্প।')}</li>
          <li><code className="text-xs">Retry-After</code> — {t('seconds to wait before retrying (also in the body as retry_after_seconds).', 'পুনরায় চেষ্টার আগে অপেক্ষার সেকেন্ড (বডিতে retry_after_seconds হিসেবেও আছে)।')}</li>
        </ul>

        <Callout tone="amber" title={t('429 does NOT mean the action failed', '429 মানে অ্যাকশন ব্যর্থ হয়েছে এমন নয়')}>
          {t(
            'A 429 means the request did not run at all. It is safe to retry after waiting Retry-After seconds. For /sessions, slow your integration. For /submit, ask the customer to wait a moment and try again — don\'t auto-retry on their behalf or you\'ll just hit the limit harder.',
            'একটি 429 মানে রিকোয়েস্ট মোটেও চালেইনি। Retry-After সেকেন্ড অপেক্ষা করার পর পুনরায় চেষ্টা করা নিরাপদ। /sessions এর জন্য আপনার ইন্টিগ্রেশন ধীর করুন। /submit এর জন্য গ্রাহককে এক মুহূর্ত অপেক্ষা করতে বলুন — তাদের পক্ষে অটো-রিট্রাই করবেন না, তা না হলে সীমায় আরও জোরে আঘাত করবেন।'
          )}
        </Callout>

        <h3 className="mt-8 font-semibold text-slate-900">{t('Polite retry pattern (Node)', 'বন্ধুসুলভ রিট্রাই প্যাটার্ন (Node)')}</h3>
        <CodeBlock language="js" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`async function callWithBackoff(url, init, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = await fetch(url, init);
    if (r.status !== 429) return r;

    // Server told us how long to wait; honour it (cap at 60s).
    const ra = Number(r.headers.get('Retry-After')) ||
               (await r.clone().json().then(b => b.retry_after_seconds).catch(() => 1));
    const waitMs = Math.min(60, Math.max(1, ra)) * 1000;
    if (attempt === maxAttempts) return r; // give up after last attempt
    await new Promise((res) => setTimeout(res, waitMs));
  }
}`}</CodeBlock>

        <Callout tone="slate" title={t('Need a higher limit?', 'আরও বেশি সীমা প্রয়োজন?')}>
          {t(
            'These caps fit normal merchant traffic with plenty of headroom. If you have a legitimate burst use case (bulk reconciliation, migration, etc.) email support before you launch — raising your limit ahead of time is easier than recovering from blocked traffic.',
            'এই সীমাগুলি যথেষ্ট হেডরুমসহ স্বাভাবিক মার্চেন্ট ট্রাফিকের সাথে মানানসই। আপনার যদি বৈধ বার্স্ট ব্যবহারের ক্ষেত্র থাকে (বাল্ক রিকনসিলিয়েশন, মাইগ্রেশন ইত্যাদি) লঞ্চের আগে সাপোর্টে ইমেইল করুন — আগে থেকে সীমা বাড়ানো ব্লকড ট্রাফিক থেকে পুনরুদ্ধার করার চেয়ে সহজ।'
          )}
        </Callout>
      </Section>

      <Section
        id="troubleshoot"
        eyebrow={t('API Reference', 'API রেফারেন্স')}
        title={t('Troubleshooting', 'ট্রাবলশুটিং')}
      >
        <p className="text-slate-600">
          {t('Issues integrators hit most often, with the fix.',
            'ইন্টিগ্রেটররা সবচেয়ে বেশি সম্মুখীন হয় এমন সমস্যা, সমাধানসহ।')}
        </p>

        <h3 className="mt-6 font-semibold text-slate-900">
          PHP cURL: <code className="text-xs">SSL routines:ssl3_read_bytes:tlsv1 unrecognized name</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            "TLS handshake error. The client didn't send a Server Name Indication (SNI) the cert recognizes, and old OpenSSL (≤ 1.0.x, common in PHP 5.x / 7.0–7.3) treats it as fatal instead of a warning. Three checks, in order:",
            'TLS হ্যান্ডশেক এরর। ক্লায়েন্ট এমন SNI পাঠায়নি যা সার্টিফিকেট চিনতে পারে, এবং পুরনো OpenSSL (≤ 1.0.x, PHP 5.x / 7.0–7.3-এ সাধারণ) এটিকে সতর্কতার পরিবর্তে গুরুতর হিসেবে নেয়। ক্রমানুসারে তিনটি চেক:'
          )}
        </p>
        <ol className="mt-3 space-y-2 text-sm text-slate-700 list-decimal pl-5">
          <li>
            {t(
              <><strong>Hostname must be exact.</strong> Use <code className="text-xs">https://checkout.ezypay.it.com</code> — not an IP, not <code className="text-xs">www.</code>, not a CDN alias. Calling by IP doesn&apos;t send SNI at all.</>,
              <><strong>হোস্টনেম অবশ্যই সঠিক হতে হবে।</strong> <code className="text-xs">https://checkout.ezypay.it.com</code> ব্যবহার করুন — IP নয়, <code className="text-xs">www.</code> নয়, CDN অ্যালিয়াস নয়। IP দিয়ে কল করলে SNI পাঠায়ই না।</>
            )}
          </li>
          <li>
            {t(
              <><strong>Don&apos;t bypass DNS.</strong> Do NOT set <code className="text-xs">CURLOPT_RESOLVE</code> or pass <code className="text-xs">--resolve</code> on the CLI — both can send the wrong SNI name.</>,
              <><strong>DNS বাইপাস করবেন না।</strong> <code className="text-xs">CURLOPT_RESOLVE</code> সেট করবেন না বা CLI-তে <code className="text-xs">--resolve</code> পাস করবেন না — উভয়ই ভুল SNI নাম পাঠাতে পারে।</>
            )}
          </li>
          <li>
            {t(
              <><strong>Force TLS 1.2 and keep verification on.</strong> Don&apos;t disable <code className="text-xs">CURLOPT_SSL_VERIFYPEER</code> or <code className="text-xs">CURLOPT_SSL_VERIFYHOST</code> — that often makes the problem worse, not better.</>,
              <><strong>TLS 1.2 জোর করুন এবং ভেরিফিকেশন চালু রাখুন।</strong> <code className="text-xs">CURLOPT_SSL_VERIFYPEER</code> বা <code className="text-xs">CURLOPT_SSL_VERIFYHOST</code> নিষ্ক্রিয় করবেন না — এটি প্রায়ই সমস্যা ভালো না করে আরও খারাপ করে।</>
            )}
          </li>
        </ol>

        <p className="mt-4 text-sm font-semibold text-slate-900">{t('Working PHP example:', 'কর্মক্ষম PHP উদাহরণ:')}</p>
        <CodeBlock language="php" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`<?php
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
    error_log('EzyPay cURL error: ' . curl_error($ch));
}
curl_close($ch);
$body = json_decode($response, true);
header('Location: ' . $body['checkout_url']);`}</CodeBlock>

        <p className="mt-4 text-sm text-slate-700">
          {t('Still failing? Test from the shell first:', 'এখনো ব্যর্থ হচ্ছে? প্রথমে শেল থেকে পরীক্ষা করুন:')}
        </p>
        <CodeBlock language="bash" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`curl -v https://checkout.ezypay.it.com/api/providers`}</CodeBlock>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>{t(<><code className="text-xs">curl</code> works, PHP fails → upgrade PHP/OpenSSL (PHP ≥ 7.4 with OpenSSL ≥ 1.1.1 fixes it permanently).</>,
            <><code className="text-xs">curl</code> কাজ করে, PHP ব্যর্থ হয় → PHP/OpenSSL আপগ্রেড করুন (PHP ≥ 7.4 OpenSSL ≥ 1.1.1 সহ এটি স্থায়ীভাবে ঠিক করে)।</>)}</li>
          <li>{t("Both fail with the same SNI error → you're on the wrong hostname, or behind a corporate proxy mangling SNI.",
            'উভয়ই একই SNI এরর দিয়ে ব্যর্থ হয় → আপনি ভুল হোস্টনেমে আছেন, বা SNI বিকৃত করছে এমন কর্পোরেট প্রক্সির পিছনে।')}</li>
          <li>{t("Both succeed but your code still errors → it's your request body, not TLS. Check the response status & body.",
            'উভয়ই সফল হয় কিন্তু আপনার কোড এখনো এরর দেয় → এটি আপনার রিকোয়েস্ট বডি, TLS নয়। রেসপন্স স্ট্যাটাস ও বডি চেক করুন।')}</li>
        </ul>

        <h3 className="mt-8 font-semibold text-slate-900">
          {t('404 from', '404 এর উৎস')} <code className="text-xs">/api/payment/sessions</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            <>You&apos;re hitting the wrong host. EzyPay has two services — the dashboard UI and the API — on different domains. The API base URL is <code className="text-xs">https://checkout.ezypay.it.com</code>. Pointing your backend at the dashboard URL returns 404 because the dashboard doesn&apos;t serve the API.</>,
            <>আপনি ভুল হোস্টে যাচ্ছেন। EzyPay-এর দুটি সার্ভিস রয়েছে — ড্যাশবোর্ড UI এবং API — ভিন্ন ডোমেইনে। API বেস URL হলো <code className="text-xs">https://checkout.ezypay.it.com</code>। ড্যাশবোর্ড URL-এ আপনার ব্যাকএন্ড পয়েন্ট করলে 404 আসে কারণ ড্যাশবোর্ড API সার্ভ করে না।</>
          )}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            <>Sanity check: <code className="text-xs">curl https://checkout.ezypay.it.com/api/providers</code> should return JSON with the provider list (no auth needed). If it does, the URL is correct; if it doesn&apos;t, fix the base URL first.</>,
            <>স্যানিটি চেক: <code className="text-xs">curl https://checkout.ezypay.it.com/api/providers</code> প্রোভাইডার তালিকাসহ JSON ফেরত দেওয়া উচিত (অথ লাগে না)। যদি দেয়, URL সঠিক; যদি না দেয়, প্রথমে বেস URL ঠিক করুন।</>
          )}
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">
          401 <code className="text-xs">Invalid or expired token</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          {t('You sent the wrong header for the wrong endpoint:', 'আপনি ভুল এন্ডপয়েন্টের জন্য ভুল হেডার পাঠিয়েছেন:')}
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>{t(<>Backend-to-EzyPay (<code className="text-xs">/api/payment/...</code>): use <code className="text-xs">X-API-Key: pk_live_...</code></>,
            <>ব্যাকএন্ড-থেকে-EzyPay (<code className="text-xs">/api/payment/...</code>): <code className="text-xs">X-API-Key: pk_live_...</code> ব্যবহার করুন</>)}</li>
          <li>{t(<>Merchant dashboard / your own JWT calls (<code className="text-xs">/api/merchant/...</code>): use <code className="text-xs">Authorization: Bearer &lt;jwt&gt;</code></>,
            <>মার্চেন্ট ড্যাশবোর্ড / আপনার নিজস্ব JWT কল (<code className="text-xs">/api/merchant/...</code>): <code className="text-xs">Authorization: Bearer &lt;jwt&gt;</code> ব্যবহার করুন</>)}</li>
          <li>{t(<>APK calls (<code className="text-xs">/api/device/...</code>): use the <code className="text-xs">auth_key</code> field in the JSON body.</>,
            <>APK কল (<code className="text-xs">/api/device/...</code>): JSON বডিতে <code className="text-xs">auth_key</code> ফিল্ড ব্যবহার করুন।</>)}</li>
        </ul>

        <h3 className="mt-8 font-semibold text-slate-900">
          {t('Trailing-slash double-slash', 'ট্রেইলিং-স্ল্যাশ ডাবল-স্ল্যাশ')} <code className="text-xs">//api/...</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            <>If your config stores the base URL with a trailing slash and your code appends <code className="text-xs">/api/payment/...</code>, you&apos;ll request <code className="text-xs">https://checkout.ezypay.it.com//api/payment/sessions</code>. Some nginx setups normalize this; others 404. Strip the trailing slash from your base URL.</>,
            <>আপনার কনফিগ ট্রেইলিং স্ল্যাশসহ বেস URL সংরক্ষণ করলে এবং আপনার কোড <code className="text-xs">/api/payment/...</code> যোগ করলে, আপনি <code className="text-xs">https://checkout.ezypay.it.com//api/payment/sessions</code> অনুরোধ করবেন। কিছু nginx সেটআপ এটি স্বাভাবিক করে; অন্যরা 404 দেয়। আপনার বেস URL থেকে ট্রেইলিং স্ল্যাশ সরান।</>
          )}
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">
          402 <code className="text-xs">insufficient_balance</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            "EzyPay charges merchants a small per-verification fee, debited from the merchant's wallet on every successful verification. When the wallet drops below that fee, the merchant's operations are paused:",
            'EzyPay মার্চেন্টদের ছোট প্রতি-ভেরিফিকেশন ফি চার্জ করে, প্রতিটি সফল ভেরিফিকেশনে মার্চেন্টের ওয়ালেট থেকে কাটা হয়। যখন ওয়ালেট সেই ফি-র নিচে নামে, মার্চেন্টের কার্যক্রম থামিয়ে দেওয়া হয়:'
          )}
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>{t(<>New <code className="text-xs">POST /api/payment/sessions</code> calls return 402 — xyz.com can&apos;t create new checkouts.</>,
            <>নতুন <code className="text-xs">POST /api/payment/sessions</code> কল 402 ফেরত দেয় — xyz.com নতুন চেকআউট তৈরি করতে পারে না।</>)}</li>
          <li>{t('APK endpoints (poll/sms/report/verify/heartbeat) return 402 — the phone shows a "Wallet empty" screen.',
            'APK এন্ডপয়েন্ট (poll/sms/report/verify/heartbeat) 402 ফেরত দেয় — ফোন একটি "Wallet empty" স্ক্রিন দেখায়।')}</li>
          <li>{t(<><code className="text-xs">/bind</code> and <code className="text-xs">/unbind</code> stay available so the phone can disconnect/reconnect.</>,
            <><code className="text-xs">/bind</code> এবং <code className="text-xs">/unbind</code> উপলব্ধ থাকে যাতে ফোন ডিসকানেক্ট/রিকানেক্ট করতে পারে।</>)}</li>
        </ul>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            <><strong>Fix:</strong> log into the merchant dashboard → <strong>Wallet</strong> → <strong>Add Balance</strong> → pay via wallet. Operations resume on the next request after the recharge confirms.</>,
            <><strong>সমাধান:</strong> মার্চেন্ট ড্যাশবোর্ডে লগ ইন করুন → <strong>Wallet</strong> → <strong>Add Balance</strong> → ওয়ালেট দিয়ে পে করুন। রিচার্জ নিশ্চিত হওয়ার পরের রিকোয়েস্টে কার্যক্রম পুনরায় শুরু হবে।</>
          )}
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">
          409 <code className="text-xs">&quot;This order has already been paid&quot;</code>
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            <>You called <code className="text-xs">POST /sessions</code> with an <code className="text-xs">order_id</code> that already has a successful session. Don&apos;t retry — fetch the existing session via <code className="text-xs">existing_session_id</code> in the error body and treat the order as fulfilled.</>,
            <>আপনি এমন একটি <code className="text-xs">order_id</code> দিয়ে <code className="text-xs">POST /sessions</code> কল করেছেন যার ইতিমধ্যে একটি সফল সেশন রয়েছে। পুনরায় চেষ্টা করবেন না — এরর বডিতে <code className="text-xs">existing_session_id</code> দিয়ে বিদ্যমান সেশন আনুন এবং অর্ডারটিকে সম্পন্ন হিসেবে গণ্য করুন।</>
          )}
        </p>

        <h3 className="mt-8 font-semibold text-slate-900">{t('Transactions stuck on Pending', 'লেনদেন Pending-এ আটকে আছে')}</h3>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            'The customer submitted a TxnID but no matching SMS has reached the backend. Two common causes:',
            'গ্রাহক একটি TxnID জমা দিয়েছে কিন্তু কোনো মিল-করা SMS ব্যাকএন্ডে পৌঁছায়নি। দুটি সাধারণ কারণ:'
          )}
        </p>
        <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>{t(<><strong>No bound device.</strong> Check Dashboard → Devices. An &quot;Online&quot; row means the APK is heartbeating; it does NOT guarantee SMS is being forwarded. If the SMS log (Dashboard → SMS) is empty, the APK isn&apos;t uploading.</>,
            <><strong>কোনো বাঁধা ডিভাইস নেই।</strong> Dashboard → Devices চেক করুন। একটি &quot;Online&quot; রো মানে APK হার্টবিট করছে; এটি SMS ফরোয়ার্ড হওয়ার গ্যারান্টি দেয় না। যদি SMS লগ (Dashboard → SMS) খালি থাকে, APK আপলোড করছে না।</>)}</li>
          <li>{t(<><strong>Gateway identifier mismatch.</strong> The number you set on the gateway must appear in the SMS body. For SMS that show only a masked bank suffix (e.g. <code className="text-xs">XX6788</code>), store multiple identifiers comma-separated.</>,
            <><strong>গেটওয়ে আইডেন্টিফায়ার মিসম্যাচ।</strong> গেটওয়েতে আপনি যে নম্বর সেট করেছেন তা অবশ্যই SMS বডিতে থাকতে হবে। যেসব SMS শুধু একটি মাস্কড ব্যাংক সাফিক্স দেখায় (যেমন <code className="text-xs">XX6788</code>), কমা-আলাদা একাধিক আইডেন্টিফায়ার রাখুন।</>)}</li>
        </ul>
        <p className="mt-2 text-sm text-slate-700">
          {t(
            "As a fallback, the merchant can resolve any pending row from Dashboard → Transactions (Mark Paid / Mark Failed). Customers still on the checkout page (within ~15s of submitting) see the decision and are redirected; customers who've already returned to your site with status=pending pick up the new state through your backend's polling of GET /sessions/:id.",
            'ব্যাকআপ হিসেবে, মার্চেন্ট Dashboard → Transactions (Mark Paid / Mark Failed) থেকে যেকোনো পেন্ডিং রো রেজলভ করতে পারেন। যেসব গ্রাহক এখনো চেকআউট পেজে আছেন (সাবমিটের ~১৫ সেকেন্ডের মধ্যে) তারা সিদ্ধান্তটি দেখে রিডিরেক্ট হবেন; যেসব গ্রাহক ইতিমধ্যে status=pending নিয়ে আপনার সাইটে ফিরে গেছেন তারা আপনার ব্যাকএন্ডের GET /sessions/:id পোলিং-এর মাধ্যমে নতুন অবস্থা পাবেন।'
          )}
        </p>
      </Section>

      <Section
        id="best"
        eyebrow={t('Production', 'প্রোডাকশন')}
        title={t('Best Practices', 'সেরা পদ্ধতি')}
      >
        <ul className="space-y-3 text-slate-700">
          <li>{t(
            <><strong>1. Always verify server-side.</strong> Don&apos;t trust query params on return — call <code className="text-xs">GET /sessions/:id</code> from your backend before fulfilling.</>,
            <><strong>১. সর্বদা সার্ভার-সাইডে ভেরিফাই করুন।</strong> রিটার্নে কোয়েরি প্যারামকে বিশ্বাস করবেন না — পূর্ণ করার আগে আপনার ব্যাকএন্ড থেকে <code className="text-xs">GET /sessions/:id</code> কল করুন।</>
          )}</li>
          <li>{t(
            <><strong>2. Keep keys out of git + browser.</strong> Store <code className="text-xs">api_key</code> in env vars; never log it.</>,
            <><strong>২. কী গিট ও ব্রাউজারের বাইরে রাখুন।</strong> <code className="text-xs">api_key</code> env ভেরিয়েবলে রাখুন; কখনো লগ করবেন না।</>
          )}</li>
          <li>{t(
            <><strong>3. Set <code className="text-xs">customer_phone</code> on the session.</strong> Tightens SMS matching, reduces false positives dramatically.</>,
            <><strong>৩. সেশনে <code className="text-xs">customer_phone</code> সেট করুন।</strong> SMS ম্যাচিং কঠোর করে, ফল্‌স পজিটিভ অনেক কমায়।</>
          )}</li>
          <li>{t(
            <><strong>4. Use HTTPS for <code className="text-xs">redirect_url</code>.</strong> No exceptions in production.</>,
            <><strong>৪. <code className="text-xs">redirect_url</code>-এর জন্য HTTPS ব্যবহার করুন।</strong> প্রোডাকশনে কোনো ব্যতিক্রম নেই।</>
          )}</li>
          <li>{t(
            <><strong>5. Configure multiple identifiers per gateway.</strong> Mobile + bank suffix (comma-separated) means new banks rolling out won&apos;t silently stop working.</>,
            <><strong>৫. প্রতি গেটওয়েতে একাধিক আইডেন্টিফায়ার কনফিগার করুন।</strong> মোবাইল + ব্যাংক সাফিক্স (কমা-আলাদা) মানে নতুন ব্যাংক চালু হলে নীরবে কাজ বন্ধ হবে না।</>
          )}</li>
          <li>{t(
            <><strong>6. Monitor <code className="text-xs">/dashboard/devices</code>.</strong> If the bound phone goes offline, verifications queue but don&apos;t complete. Set a backup phone if you can.</>,
            <><strong>৬. <code className="text-xs">/dashboard/devices</code> মনিটর করুন।</strong> বাঁধা ফোন অফলাইনে গেলে ভেরিফিকেশন কিউতে যায় কিন্তু সম্পন্ন হয় না। সম্ভব হলে একটি ব্যাকআপ ফোন রাখুন।</>
          )}</li>
          <li>{t(
            <><strong>7. Keep your wallet topped up.</strong> Each successful verification debits a small fee from your wallet balance. Below the per-verification fee, all your endpoints return 402 and your APK is paused. The dashboard shows an amber warning before you hit empty — top up then. <Link href="/dashboard/wallet" className="text-brand-600 hover:underline">Wallet →</Link></>,
            <><strong>৭. আপনার ওয়ালেট টপ-আপ করে রাখুন।</strong> প্রতিটি সফল ভেরিফিকেশন আপনার ওয়ালেট ব্যালেন্স থেকে একটি ছোট ফি কাটে। প্রতি-ভেরিফিকেশন ফি-র নিচে গেলে, আপনার সব এন্ডপয়েন্ট 402 ফেরত দেয় এবং আপনার APK থামিয়ে দেওয়া হয়। খালি হওয়ার আগে ড্যাশবোর্ড অ্যাম্বার সতর্কতা দেখায় — তখনই টপ-আপ করুন। <Link href="/dashboard/wallet" className="text-brand-600 hover:underline">Wallet →</Link></>
          )}</li>
          <li>{t(
            <><strong>8. Handle the order_id idempotency response.</strong> POST /sessions can return 200 (with <code className="text-xs">existed:true</code>) when the same order_id has a live pending session — use the URL it returns, don&apos;t create a parallel checkout.</>,
            <><strong>৮. order_id idempotency রেসপন্স হ্যান্ডেল করুন।</strong> POST /sessions 200 (<code className="text-xs">existed:true</code> সহ) ফেরত দিতে পারে যখন একই order_id-এর একটি লাইভ পেন্ডিং সেশন থাকে — এটি যে URL ফেরত দেয় সেটি ব্যবহার করুন, সমান্তরাল চেকআউট তৈরি করবেন না।</>
          )}</li>
        </ul>
      </Section>

      <Section
        id="webhooks"
        eyebrow={t('Production', 'প্রোডাকশন')}
        title={t('Webhooks (Coming Soon)', 'ওয়েবহুক (শীঘ্রই আসছে)')}
      >
        <p>
          {t(
            <>Today, you confirm payments by polling <code className="text-xs">GET /sessions/:id</code> after the customer returns.</>,
            <>আজ, আপনি গ্রাহক ফেরত আসার পর <code className="text-xs">GET /sessions/:id</code> পোল করে পেমেন্ট নিশ্চিত করেন।</>
          )}
        </p>
        <p className="mt-3">
          {t(
            <>Webhooks are on the roadmap. When live, EzyPay will <code className="text-xs">POST</code> to a URL on your domain whenever a session resolves, signed with HMAC-SHA256 of the body using your brand&apos;s <code className="text-xs">secret_key</code>:</>,
            <>ওয়েবহুক রোডম্যাপে রয়েছে। লাইভ হলে, যখনই একটি সেশন রেজলভ হবে, EzyPay আপনার ডোমেইনের একটি URL-এ <code className="text-xs">POST</code> করবে, আপনার ব্র্যান্ডের <code className="text-xs">secret_key</code> ব্যবহার করে বডির HMAC-SHA256-এ স্বাক্ষরিত:</>
          )}
        </p>
        <CodeBlock language="http" copyLabel={t('Copy', 'কপি')} copiedLabel={t('✓ Copied', '✓ কপি হয়েছে')}>{`POST https://yourstore.com/ezypay/webhook
X-EzyPay-Signature: t=1683900000,v1=<hmac-sha256-hex>

{ "event": "session.success", "session": { ... } }`}</CodeBlock>
        <p className="mt-3 text-sm text-slate-600">
          {t('Until then, polling on customer return is the recommended pattern.',
            'ততক্ষণ পর্যন্ত, গ্রাহক ফেরত আসায় পোল করা সুপারিশকৃত প্যাটার্ন।')}
        </p>
      </Section>

      <Section
        id="support"
        eyebrow={t('Production', 'প্রোডাকশন')}
        title={t('Support', 'সাপোর্ট')}
      >
        <p>
          {t("Questions? Run into something the docs don't cover?",
            'প্রশ্ন? এমন কিছুতে আটকে গেছেন যা ডকুমেন্টেশন কভার করে না?')}
        </p>
        <ul className="mt-3 space-y-1 text-slate-700">
          <li>{t(<>📧 Email: <a href="mailto:support@ezypay.it.com" className="text-brand-600 hover:underline">support@ezypay.it.com</a></>,
            <>📧 ইমেইল: <a href="mailto:support@ezypay.it.com" className="text-brand-600 hover:underline">support@ezypay.it.com</a></>)}</li>
          <li>{t('🐛 Bugs / API issues: open a ticket from your dashboard',
            '🐛 বাগ / API সমস্যা: আপনার ড্যাশবোর্ড থেকে টিকিট খুলুন')}</li>
          <li>{t(<>📖 APK developer reference: <code className="text-xs">docs/APK_API.md</code></>,
            <>📖 APK ডেভেলপার রেফারেন্স: <code className="text-xs">docs/APK_API.md</code></>)}</li>
          <li>{t(<>📖 Integration deep-dive: <code className="text-xs">docs/INTEGRATION.md</code></>,
            <>📖 ইন্টিগ্রেশন ডিপ-ডাইভ: <code className="text-xs">docs/INTEGRATION.md</code></>)}</li>
        </ul>
      </Section>

      <div className="mt-16 mb-8 text-center text-sm text-slate-500">
        {t(
          <>That&apos;s everything. Time to ship → <Link href="/register" className="text-brand-600 font-semibold hover:underline">Create your merchant account</Link></>,
          <>এটাই সব। শিপ করার সময় → <Link href="/register" className="text-brand-600 font-semibold hover:underline">আপনার মার্চেন্ট অ্যাকাউন্ট তৈরি করুন</Link></>
        )}
      </div>
    </article>
  );
}

/* ────────────────────────────────────────── Building blocks */
function Hero({ t }) {
  return (
    <div className="mb-12 pb-8 border-b border-slate-200">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-600">
        {t('Developer Documentation', 'ডেভেলপার ডকুমেন্টেশন')}
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
        EzyPay <span className="text-slate-500 font-normal">{t('Integration Guide', 'ইন্টিগ্রেশন গাইড')}</span>
      </h1>
      <p className="mt-3 text-slate-600 max-w-2xl">
        {t(
          'Everything you need to integrate SMS-based wallet payment verification into your ecommerce flow. Step-by-step, with copy-pasteable code in Node, PHP, Python and cURL.',
          'আপনার ই-কমার্স ফ্লোতে SMS-ভিত্তিক ওয়ালেট পেমেন্ট ভেরিফিকেশন ইন্টিগ্রেট করতে যা প্রয়োজন সবকিছু। ধাপে ধাপে, Node, PHP, Python এবং cURL-এ কপি-পেস্টযোগ্য কোডসহ।'
        )}
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
    brand: 'bg-brand-50 border-brand-200 text-brand-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
  };
  return (
    <div className={`my-5 rounded-lg border px-4 py-3 ${tones[tone]}`}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

function CodeBlock({ children, language, caption, copyLabel = 'Copy', copiedLabel = '✓ Copied' }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { }
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
            {copied ? copiedLabel : copyLabel}
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
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setIdx(i)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${i === idx ? 'text-brand-700 border-b-2 border-brand-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>{panels[idx]}</div>
    </div>
  );
}

function ApiEndpoint({ t, method, path, auth, description, request, response }) {
  const methodColor = {
    GET: 'bg-emerald-100 text-emerald-700',
    POST: 'bg-blue-100   text-blue-700',
    PATCH: 'bg-amber-100  text-amber-700',
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
        {request && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              {t ? t('Request body', 'রিকোয়েস্ট বডি') : 'Request body'}
            </div>
            <CodeBlock
              language="json"
              copyLabel={t ? t('Copy', 'কপি') : 'Copy'}
              copiedLabel={t ? t('✓ Copied', '✓ কপি হয়েছে') : '✓ Copied'}
            >{request}</CodeBlock>
          </div>
        )}
        {response && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              {t ? t('Response (200)', 'রেসপন্স (200)') : 'Response (200)'}
            </div>
            <CodeBlock
              language="json"
              copyLabel={t ? t('Copy', 'কপি') : 'Copy'}
              copiedLabel={t ? t('✓ Copied', '✓ কপি হয়েছে') : '✓ Copied'}
            >{response}</CodeBlock>
          </div>
        )}
      </div>
    </div>
  );
}

function CredentialTable({ t }) {
  const rows = [
    ['api_key (pk_live_...)', t('Per brand', 'প্রতি ব্র্যান্ড'), t("Merchant's server", 'মার্চেন্টের সার্ভার'), t('Create checkout sessions, query session status', 'চেকআউট সেশন তৈরি, সেশন স্ট্যাটাস কোয়েরি')],
    ['secret_key (sk_live_...)', t('Per brand', 'প্রতি ব্র্যান্ড'), t("Merchant's server", 'মার্চেন্টের সার্ভার'), t('Sign webhook payloads (future)', 'ওয়েবহুক পেলোডে স্বাক্ষর (ভবিষ্যত)')],
    ['device_auth_key (PV-…)', t('Per merchant', 'প্রতি মার্চেন্ট'), t('The APK on your phone', 'আপনার ফোনের APK'), t('Bind device, upload SMS, poll for pending verifications', 'ডিভাইস বাঁধাই, SMS আপলোড, পেন্ডিং ভেরিফিকেশন পোল')],
    ['JWT (Bearer)', t('Per session', 'প্রতি সেশন'), t('Merchant dashboard', 'মার্চেন্ট ড্যাশবোর্ড'), t('Logged-in merchant access to /api/merchant/*', '/api/merchant/*-এ লগ-ইন মার্চেন্ট অ্যাক্সেস')],
  ];
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left p-3 border border-slate-200">{t('Credential', 'ক্রেডেনশিয়াল')}</th>
            <th className="text-left p-3 border border-slate-200">{t('Scope', 'স্কোপ')}</th>
            <th className="text-left p-3 border border-slate-200">{t('Used by', 'ব্যবহারকারী')}</th>
            <th className="text-left p-3 border border-slate-200">{t('Purpose', 'উদ্দেশ্য')}</th>
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
│  on yourstore.com   │                                  │   (EzyPay APK)      │
└──────────┬──────────┘                                  └─────────────────────┘
           │   1) POST /api/payment/sessions                       │
           │   ◄──────── checkout_url ────────                      │
           ▼                                                       │
┌─────────────────────┐  2) redirect to checkout_url               │
│  EzyPay hosted      │ ◄─────────────────────────────────         │
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
