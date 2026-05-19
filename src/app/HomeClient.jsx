'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo, { LogoMark } from '@/components/Logo';

/* ───────────────────────────────────────────────────────── TRANSLATIONS */
const T = {
  en: {
    nav_how: 'How it Works',
    nav_features: 'Features',
    nav_compare: 'Why Us',
    nav_faq: 'FAQs',
    nav_docs: 'Docs',
    nav_merchant_login: 'Merchant Login',
    nav_get_started: 'Get Started',

    hero_badge: 'Live verification in under 2 seconds',
    hero_title_pre: 'Stop losing money to',
    hero_title_emph: 'fake TxnIDs.',
    hero_subtitle:
      "EzyPay confirms any wallet, bank or UPI payment by matching the customer's transaction ID against the actual SMS on your bound Android phone. No payment gateway. No KYC. No per-transaction fees. Just verification that works — anywhere in the world.",
    hero_cta_primary: 'Start free — get your API Key',
    hero_cta_secondary: 'See how it works',
    hero_pill_1: 'No credit card',
    hero_pill_2: '2-minute setup',
    hero_pill_3: 'Self-hosted SMS reader',

    mock_order: 'Order #ORD1001',
    mock_send_prefix: 'Send',
    mock_to_wallet: 'to wallet',
    mock_txn_label: 'Transaction ID',
    mock_confirm: 'Confirm payment',
    mock_verified: 'Payment verified',
    mock_matched: 'TxnID matched · 1.4s',
    mock_sms_text: 'Payment of ৳4,900.00 received.',
    mock_bound: 'Bound device',

    stat1_label: 'Average verification time',
    stat2_label: 'TxnID match accuracy',
    stat3_label: 'Per-transaction fees',
    stat4_label: 'Verifications / month',

    problem_eyebrow: 'The problem',
    problem_title_1: 'Every fake TxnID is a free order.',
    problem_title_2: "And your team can't check them fast enough.",
    problem_body:
      'Customers screenshot old transactions. They type random TxnIDs. They send less money than the order total. By the time you check the SMS manually, the order is already packed and shipped.',
    problem_li_1: 'Manual SMS checking takes 5–10 minutes per order',
    problem_li_2: 'Fraudulent orders slip through after-hours',
    problem_li_3: 'Customer waits → cart abandoned → revenue lost',
    problem_li_4: 'Payment gateways charge 2–3% per transaction',
    fix_eyebrow: 'The fix',
    fix_title: 'EzyPay, in one sentence:',
    fix_body_a: 'Your customer submits a TxnID. We check the actual SMS on the phone',
    fix_body_em: 'you',
    fix_body_b: " own. The order confirms — or doesn't — in under 2 seconds.",
    fix_pill_1: 'No payment gateway',
    fix_pill_2: 'No KYC paperwork',
    fix_pill_3: 'No transaction fees',
    fix_pill_4: 'Real-time match',

    how_eyebrow: 'How it works',
    how_title: 'From signup to verified order in 2 minutes',
    how_subtitle: 'No complex onboarding. No PCI compliance. No waiting weeks for gateway approval.',
    how_step1_title: 'Register & get keys',
    how_step1_body: 'Create your merchant account. We instantly generate your API Key and Device Auth Key.',
    how_step2_title: 'Install the APK',
    how_step2_body: "Download the EzyPay APK to your shop's phone. Paste the Device Auth Key — done.",
    how_step3_title: 'Integrate the API',
    how_step3_body: 'Add a single API call to your checkout. We support PHP, Node, Python, anything that can POST.',
    how_step4_title: 'Verify automatically',
    how_step4_body: 'Customer submits TxnID. APK reads the SMS. Order confirms in seconds. You ship.',

    feat_eyebrow: 'Why EzyPay',
    feat_title: "Built for merchants who can't wait",
    feat_subtitle: "Everything you need to stop manual verification — and nothing you don't.",
    feat_1_title: 'Sub-2-second verification',
    feat_1_body: 'FCM push + Socket.IO realtime. The customer barely sees a loading spinner.',
    feat_2_title: 'Tamper-proof matching',
    feat_2_body: "We match TxnID, amount, and customer phone. Fake screenshots don't pass.",
    feat_3_title: 'One API call',
    feat_3_body: "POST /verify-payment. That's the entire integration. Works with any backend.",
    feat_4_title: 'Live dashboard',
    feat_4_body: 'Every verification, every match, every miss — in real time. Filter and export.',
    feat_5_title: 'Works with any wallet, anywhere',
    feat_5_body:
      'Mobile wallets, bank transfers, UPI, neobank apps — anything that sends a transaction SMS, in any country.',
    feat_6_title: 'Your phone, your data',
    feat_6_body: "SMS never leaves your device unless it matches. We don't store your inbox.",

    cmp_eyebrow: 'Side-by-side',
    cmp_title: 'EzyPay vs. traditional payment gateways',
    cmp_subtitle: "You don't need a payment processor. You need verification.",
    cmp_col_pv: 'EzyPay',
    cmp_col_gw: 'Payment gateway',
    cmp_row1: 'Setup time',
    cmp_row1_pv: '2 minutes',
    cmp_row1_gw: '2–6 weeks',
    cmp_row2: 'KYC / paperwork',
    cmp_row2_pv: 'None',
    cmp_row2_gw: 'Extensive',
    cmp_row3: 'Per-transaction fee',
    cmp_row3_pv: '৳0',
    cmp_row3_gw: '2–3%',
    cmp_row4: 'Monthly minimum',
    cmp_row4_pv: 'None',
    cmp_row4_gw: 'Often required',
    cmp_row5: 'Works with any wallet',
    cmp_row6: 'No payout delays',
    cmp_row7: 'Self-hosted SMS reader',

    uc_eyebrow: 'Use cases',
    uc_title: 'Wherever you accept wallet payments',
    uc_subtitle: 'If you handwrite SMS checks in WhatsApp groups — this is built for you.',
    uc_1_tag: 'Fashion & retail',
    uc_1_title: 'Confirm orders before they leave the warehouse',
    uc_1_body: "Pack only what's actually paid. Cut reverse-logistics from fake orders to near zero.",
    uc_2_tag: 'Digital services',
    uc_2_title: 'Unlock instantly after payment',
    uc_2_body: 'Course access, game top-ups, subscription credits — auto-fulfill the second SMS lands.',
    uc_3_tag: 'Food delivery',
    uc_3_title: 'Driver dispatched only when verified',
    uc_3_body: "Stop sending bikes for orders that haven't actually been paid for.",

    faq_eyebrow: 'Frequently asked',
    faq_title: 'Answers, fast',
    faq_subtitle: "Still curious? Reach out — we'll respond within a few hours.",
    faq_q1: "Does EzyPay hold or process my customers' money?",
    faq_a1:
      'No. We are pure verification. The customer pays you directly via their wallet. We only confirm the payment happened by reading the SMS on your phone.',
    faq_q2: 'What phone do I need?',
    faq_a2: 'Any Android device (Android 7+) that receives the wallet SMS. It needs to stay online — Wi-Fi or mobile data, your choice.',
    faq_q3: 'What if my phone is offline?',
    faq_a3:
      'Verifications queue up. As soon as your device reconnects, pending checks run. For high-volume merchants we recommend a backup device.',
    faq_q4: 'Can someone send a fake screenshot to fool you?',
    faq_a4:
      "No. We don't look at screenshots. We match the customer-submitted TxnID against the real SMS the wallet provider sent to your phone.",
    faq_q5: 'How do I integrate it into my website?',
    faq_a5:
      'One API call: POST /verify-payment with the TxnID, amount, customer phone, and your order ID. Works with PHP, Node, Python, Laravel, WooCommerce — anything.',
    faq_q6: 'Do you charge per verification?',
    faq_a6: 'No per-transaction fees in our early-access plan. Subscription pricing will be introduced later — locked-in for early signups.',

    cta_title: 'Stop paying for fraud you can prevent.',
    cta_subtitle:
      'Spin up a merchant account in 60 seconds. Your API Key and Device Auth Key are waiting on the next screen.',
    cta_primary: 'Create my merchant account',
    cta_secondary: 'I already have one',

    foot_blurb:
      'SMS-based wallet payment verification for ecommerce. Stop fake TxnIDs. Confirm real orders in seconds.',
    foot_product: 'Product',
    foot_account: 'Account',
    foot_register: 'Register',
    foot_login: 'Merchant login',
    foot_console: 'Console',
    foot_rights: 'All rights reserved.',
    foot_tag: 'Made for merchants who hate fake TxnIDs.',
  },

  bn: {
    nav_how: 'কীভাবে কাজ করে',
    nav_features: 'বৈশিষ্ট্য',
    nav_compare: 'কেন আমরা',
    nav_faq: 'প্রশ্নোত্তর',
    nav_docs: 'ডকুমেন্টেশন',
    nav_merchant_login: 'মার্চেন্ট লগইন',
    nav_get_started: 'শুরু করুন',

    hero_badge: '২ সেকেন্ডের কম সময়ে তাৎক্ষণিক ভেরিফিকেশন',
    hero_title_pre: 'আর টাকা হারাবেন না',
    hero_title_emph: 'জাল TxnID-র কারণে।',
    hero_subtitle:
      'EzyPay গ্রাহকের ট্রানজেকশন আইডি আপনার বাঁধা অ্যান্ড্রয়েড ফোনের আসল SMS-এর সাথে মিলিয়ে যেকোনো ওয়ালেট, ব্যাংক বা UPI পেমেন্ট নিশ্চিত করে। কোনো পেমেন্ট গেটওয়ে নেই। কোনো KYC নেই। কোনো প্রতি-লেনদেন ফি নেই। শুধু ভেরিফিকেশন যা কাজ করে — পৃথিবীর যেকোনো জায়গায়।',
    hero_cta_primary: 'বিনামূল্যে শুরু করুন — API কী নিন',
    hero_cta_secondary: 'কীভাবে কাজ করে দেখুন',
    hero_pill_1: 'ক্রেডিট কার্ড লাগবে না',
    hero_pill_2: '২ মিনিটে সেটআপ',
    hero_pill_3: 'নিজস্ব SMS রিডার',

    mock_order: 'অর্ডার #ORD1001',
    mock_send_prefix: 'পাঠান',
    mock_to_wallet: 'এই ওয়ালেটে',
    mock_txn_label: 'ট্রানজেকশন আইডি',
    mock_confirm: 'পেমেন্ট নিশ্চিত করুন',
    mock_verified: 'পেমেন্ট যাচাই হয়েছে',
    mock_matched: 'TxnID মিলেছে · ১.৪ সে.',
    mock_sms_text: '৳4,900.00 পেমেন্ট গৃহীত হয়েছে।',
    mock_bound: 'বাঁধা ডিভাইস',

    stat1_label: 'গড় ভেরিফিকেশন সময়',
    stat2_label: 'TxnID মেলানোর নির্ভুলতা',
    stat3_label: 'প্রতি-লেনদেন ফি',
    stat4_label: 'মাসে ভেরিফিকেশন',

    problem_eyebrow: 'সমস্যা',
    problem_title_1: 'প্রতিটি জাল TxnID মানে একটি ফ্রি অর্ডার।',
    problem_title_2: 'আর আপনার টিম যথেষ্ট দ্রুত চেক করতে পারে না।',
    problem_body:
      'গ্রাহকরা পুরনো লেনদেনের স্ক্রিনশট দেয়। যেকোনো TxnID টাইপ করে দেয়। অর্ডারের চেয়ে কম টাকা পাঠায়। আপনি যখন SMS ম্যানুয়ালি চেক করেন, ততক্ষণে অর্ডার প্যাক হয়ে শিপ হয়ে যায়।',
    problem_li_1: 'প্রতি অর্ডারে SMS চেক করতে ৫–১০ মিনিট লাগে',
    problem_li_2: 'অফিস ছুটির সময় জাল অর্ডার পার হয়ে যায়',
    problem_li_3: 'গ্রাহক অপেক্ষা করে → কার্ট ছেড়ে দেয় → আয় হারায়',
    problem_li_4: 'পেমেন্ট গেটওয়ে প্রতি লেনদেনে ২–৩% নেয়',
    fix_eyebrow: 'সমাধান',
    fix_title: 'EzyPay, এক বাক্যে:',
    fix_body_a: 'আপনার গ্রাহক একটি TxnID জমা দেয়। আমরা',
    fix_body_em: 'আপনার নিজের',
    fix_body_b: ' ফোনের আসল SMS চেক করি। ২ সেকেন্ডের মধ্যে অর্ডার নিশ্চিত হয় — অথবা হয় না।',
    fix_pill_1: 'কোনো পেমেন্ট গেটওয়ে নয়',
    fix_pill_2: 'কোনো KYC কাগজপত্র নয়',
    fix_pill_3: 'কোনো লেনদেন ফি নয়',
    fix_pill_4: 'রিয়েল-টাইম মিল',

    how_eyebrow: 'কীভাবে কাজ করে',
    how_title: 'সাইনআপ থেকে যাচাইকৃত অর্ডার মাত্র ২ মিনিটে',
    how_subtitle: 'জটিল অনবোর্ডিং নেই। PCI কমপ্লায়েন্স নেই। গেটওয়ে অনুমোদনের জন্য সপ্তাহখানেক অপেক্ষা নেই।',
    how_step1_title: 'রেজিস্টার ও কী নিন',
    how_step1_body: 'আপনার মার্চেন্ট অ্যাকাউন্ট তৈরি করুন। আমরা তাৎক্ষণিক API কী ও ডিভাইস অথ কী তৈরি করে দিই।',
    how_step2_title: 'APK ইনস্টল করুন',
    how_step2_body: 'আপনার দোকানের ফোনে EzyPay APK ডাউনলোড করুন। ডিভাইস অথ কী পেস্ট করুন — হয়ে গেল।',
    how_step3_title: 'API ইন্টিগ্রেট করুন',
    how_step3_body: 'আপনার চেকআউটে একটি মাত্র API কল যোগ করুন। PHP, Node, Python — POST করতে পারে এমন যেকোনো কিছুই সাপোর্ট করি।',
    how_step4_title: 'স্বয়ংক্রিয়ভাবে ভেরিফাই করুন',
    how_step4_body: 'গ্রাহক TxnID জমা দেয়। APK SMS পড়ে। অর্ডার সেকেন্ডে নিশ্চিত হয়। আপনি শিপ করেন।',

    feat_eyebrow: 'কেন EzyPay',
    feat_title: 'যেসব মার্চেন্ট অপেক্ষা করতে পারেন না, তাদের জন্য তৈরি',
    feat_subtitle: 'ম্যানুয়াল ভেরিফিকেশন বন্ধ করতে যা প্রয়োজন সব আছে — অপ্রয়োজনীয় কিছুই নেই।',
    feat_1_title: '২ সেকেন্ডের কম ভেরিফিকেশন',
    feat_1_body: 'FCM পুশ + Socket.IO রিয়েলটাইম। গ্রাহক প্রায় লোডিং স্পিনারই দেখে না।',
    feat_2_title: 'কারচুপি-প্রতিরোধী মিলকরণ',
    feat_2_body: 'আমরা TxnID, অ্যামাউন্ট এবং গ্রাহকের ফোন মিলাই। জাল স্ক্রিনশট পার হতে পারে না।',
    feat_3_title: 'একটি মাত্র API কল',
    feat_3_body: 'POST /verify-payment। এটাই পুরো ইন্টিগ্রেশন। যেকোনো ব্যাকএন্ডের সাথে চলে।',
    feat_4_title: 'লাইভ ড্যাশবোর্ড',
    feat_4_body: 'প্রতিটি ভেরিফিকেশন, প্রতিটি মিল, প্রতিটি মিস — রিয়েল-টাইমে। ফিল্টার ও এক্সপোর্ট করুন।',
    feat_5_title: 'যেকোনো ওয়ালেট, যেকোনো জায়গায়',
    feat_5_body:
      'মোবাইল ওয়ালেট, ব্যাংক ট্রান্সফার, UPI, নিওব্যাংক অ্যাপ — যেকোনো দেশে লেনদেনের SMS পাঠায় এমন যেকোনো কিছু।',
    feat_6_title: 'আপনার ফোন, আপনার ডেটা',
    feat_6_body: 'মিল না হলে SMS কখনোই আপনার ডিভাইস ছাড়ে না। আমরা আপনার ইনবক্স স্টোর করি না।',

    cmp_eyebrow: 'পাশাপাশি',
    cmp_title: 'EzyPay বনাম প্রচলিত পেমেন্ট গেটওয়ে',
    cmp_subtitle: 'আপনার পেমেন্ট প্রসেসর দরকার নেই। আপনার ভেরিফিকেশন দরকার।',
    cmp_col_pv: 'EzyPay',
    cmp_col_gw: 'পেমেন্ট গেটওয়ে',
    cmp_row1: 'সেটআপ সময়',
    cmp_row1_pv: '২ মিনিট',
    cmp_row1_gw: '২–৬ সপ্তাহ',
    cmp_row2: 'KYC / কাগজপত্র',
    cmp_row2_pv: 'নেই',
    cmp_row2_gw: 'বিশাল',
    cmp_row3: 'প্রতি-লেনদেন ফি',
    cmp_row3_pv: '৳0',
    cmp_row3_gw: '২–৩%',
    cmp_row4: 'মাসিক মিনিমাম',
    cmp_row4_pv: 'নেই',
    cmp_row4_gw: 'প্রায়ই দরকার',
    cmp_row5: 'যেকোনো ওয়ালেটে চলে',
    cmp_row6: 'কোনো পেআউট দেরি নেই',
    cmp_row7: 'নিজস্ব SMS রিডার',

    uc_eyebrow: 'ব্যবহারের ক্ষেত্র',
    uc_title: 'যেখানেই ওয়ালেট পেমেন্ট গ্রহণ করেন',
    uc_subtitle: 'যদি WhatsApp গ্রুপে হাতে SMS চেক করেন — এটি আপনার জন্যই তৈরি।',
    uc_1_tag: 'ফ্যাশন ও রিটেইল',
    uc_1_title: 'গুদাম ছাড়ার আগেই অর্ডার নিশ্চিত করুন',
    uc_1_body: 'শুধু পেইড অর্ডারই প্যাক করুন। জাল অর্ডার থেকে রিভার্স-লজিস্টিকস প্রায় শূন্যে আনুন।',
    uc_2_tag: 'ডিজিটাল সেবা',
    uc_2_title: 'পেমেন্টের সাথে সাথে আনলক',
    uc_2_body: 'কোর্স অ্যাক্সেস, গেম টপআপ, সাবস্ক্রিপশন ক্রেডিট — SMS আসার সাথে সাথেই অটো-ফুলফিল।',
    uc_3_tag: 'ফুড ডেলিভারি',
    uc_3_title: 'ভেরিফাই হলেই ড্রাইভার পাঠান',
    uc_3_body: 'যে অর্ডারের পেমেন্ট হয়নি, তার জন্য বাইক পাঠানো বন্ধ করুন।',

    faq_eyebrow: 'সাধারণ প্রশ্ন',
    faq_title: 'দ্রুত উত্তর',
    faq_subtitle: 'এখনো কৌতূহল? যোগাযোগ করুন — কয়েক ঘণ্টার মধ্যেই উত্তর দিচ্ছি।',
    faq_q1: 'EzyPay কি আমার গ্রাহকদের টাকা ধারণ বা প্রসেস করে?',
    faq_a1:
      'না। আমরা শুধু ভেরিফিকেশন করি। গ্রাহক সরাসরি আপনাকে তার ওয়ালেট দিয়ে টাকা পাঠায়। আমরা শুধু আপনার ফোনের SMS পড়ে পেমেন্ট নিশ্চিত করি।',
    faq_q2: 'আমার কোন ফোন দরকার?',
    faq_a2: 'যেকোনো অ্যান্ড্রয়েড ডিভাইস (Android 7+) যেটি ওয়ালেট SMS পায়। এটি অনলাইনে থাকতে হবে — Wi-Fi বা মোবাইল ডেটা, আপনার পছন্দ।',
    faq_q3: 'যদি আমার ফোন অফলাইন থাকে?',
    faq_a3:
      'ভেরিফিকেশন কিউতে জমা হয়। আপনার ডিভাইস সংযুক্ত হলেই পেন্ডিং চেক চালু হয়। বড় ভলিউমের মার্চেন্টদের জন্য একটি ব্যাকআপ ডিভাইস রাখার পরামর্শ দিই।',
    faq_q4: 'কেউ কি জাল স্ক্রিনশট পাঠিয়ে আমাদের বোকা বানাতে পারে?',
    faq_a4: 'না। আমরা স্ক্রিনশট দেখি না। আমরা গ্রাহকের দেওয়া TxnID আপনার ফোনে আসা আসল SMS-এর সাথে মিলাই।',
    faq_q5: 'কীভাবে আমার ওয়েবসাইটে ইন্টিগ্রেট করবো?',
    faq_a5:
      'একটি API কল: TxnID, অ্যামাউন্ট, গ্রাহকের ফোন এবং আপনার অর্ডার আইডি দিয়ে POST /verify-payment। PHP, Node, Python, Laravel, WooCommerce — সব কিছুর সাথে চলে।',
    faq_q6: 'প্রতি ভেরিফিকেশনে কি চার্জ করেন?',
    faq_a6: 'আমাদের আর্লি-অ্যাক্সেস প্ল্যানে কোনো প্রতি-লেনদেন ফি নেই। পরে সাবস্ক্রিপশন প্রাইসিং আসবে — আর্লি সাইনআপের জন্য লক-ইন।',

    cta_title: 'যে জালিয়াতি ঠেকানো যায়, তার জন্য আর টাকা দেবেন না।',
    cta_subtitle: '৬০ সেকেন্ডে একটি মার্চেন্ট অ্যাকাউন্ট তৈরি করুন। আপনার API কী এবং ডিভাইস অথ কী পরের স্ক্রিনেই অপেক্ষা করছে।',
    cta_primary: 'আমার মার্চেন্ট অ্যাকাউন্ট তৈরি করুন',
    cta_secondary: 'আমার ইতিমধ্যেই একটি আছে',

    foot_blurb:
      'ই-কমার্সের জন্য SMS-ভিত্তিক ওয়ালেট পেমেন্ট ভেরিফিকেশন। জাল TxnID বন্ধ করুন। সেকেন্ডে আসল অর্ডার নিশ্চিত করুন।',
    foot_product: 'পণ্য',
    foot_account: 'অ্যাকাউন্ট',
    foot_register: 'রেজিস্টার',
    foot_login: 'মার্চেন্ট লগইন',
    foot_console: 'কনসোল',
    foot_rights: 'সর্বস্বত্ব সংরক্ষিত।',
    foot_tag: 'যারা জাল TxnID ঘৃণা করেন, এমন মার্চেন্টদের জন্য তৈরি।',
  },
};

const LS_KEY = 'pv_lang';

export default function HomeClient() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === 'en' || saved === 'bn') setLang(saved);
    } catch {}
  }, []);

  const changeLang = (next) => {
    setLang(next);
    try { localStorage.setItem(LS_KEY, next); } catch {}
  };

  const t = (k) => T[lang][k] ?? T.en[k] ?? k;

  return (
    <main className={`bg-white text-slate-900 ${lang === 'bn' ? 'font-bn' : ''}`}>
      <Header lang={lang} onLangChange={changeLang} t={t} />
      <Hero t={t} />
      <Stats t={t} />
      <Problem t={t} />
      <HowItWorks t={t} />
      <Features t={t} />
      <Comparison t={t} />
      <UseCases t={t} />
      <FAQ t={t} />
      <FinalCTA t={t} />
      <Footer t={t} />
    </main>
  );
}

/* ───────────────────────────────────────────────────────── HEADER + LANG TOGGLE */
function Header({ lang, onLangChange, t }) {
  const [active, setActive] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const LINKS = [
    { id: 'how',      label: t('nav_how') },
    { id: 'features', label: t('nav_features') },
    { id: 'compare',  label: t('nav_compare') },
    { id: 'faq',      label: t('nav_faq') },
  ];

  useEffect(() => {
    const ids = ['how', 'features', 'compare', 'faq'];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;

    const NAV_OFFSET = 96;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY + NAV_OFFSET + 1;
      let current = null;
      for (const sec of sections) if (sec.offsetTop <= y) current = sec.id;
      if (window.scrollY < 80) current = null;
      setActive(current);
    };
    const onScroll = () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-white/80 backdrop-blur border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
        <Logo size="xl" />

        <nav className="hidden md:flex items-center h-11 gap-1 text-sm rounded-full bg-gradient-to-r from-grad-start to-grad-end px-1.5 shadow-md shadow-grad-start/25">
          {LINKS.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'flex items-center px-4 py-1.5 rounded-full transition-colors font-medium',
                  isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/85 hover:text-white hover:bg-white/10',
                ].join(' ')}
              >
                {l.label}
              </a>
            );
          })}
          <Link
            href="/docs"
            className="flex items-center px-4 py-1.5 rounded-full font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors"
          >
            {t('nav_docs')}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LangToggle lang={lang} onChange={onLangChange} />
          <div className="hidden sm:block h-11 rounded-full bg-gradient-to-r from-grad-start to-grad-end p-[2px]">
            <Link
              href="/login"
              className="flex items-center h-full rounded-full bg-white text-grad-start hover:text-grad-end transition-colors px-5 text-sm font-semibold"
            >
              {t('nav_merchant_login')}
            </Link>
          </div>
          <Link
            href="/register"
            className="hidden sm:flex items-center h-11 rounded-full bg-gradient-to-r from-grad-start to-grad-end text-white px-5 text-sm font-semibold whitespace-nowrap shadow-md shadow-grad-start/25 hover:shadow-lg transition-shadow"
          >
            {t('nav_get_started')}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-full text-grad-start hover:bg-slate-100"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
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
            <CloseIcon />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/docs"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            {t('nav_docs')}
          </Link>
          <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center h-11 rounded-full border-2 border-grad-start text-grad-start text-sm font-semibold"
            >
              {t('nav_merchant_login')}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center h-11 rounded-full bg-gradient-to-r from-grad-start to-grad-end text-white text-sm font-semibold shadow-md shadow-grad-start/25"
            >
              {t('nav_get_started')}
            </Link>
          </div>
        </nav>
      </aside>
    </header>
  );
}

function MenuIcon() {
  return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function CloseIcon() {
  return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
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
          BEN
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── HERO */
function Hero({ t }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
      <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-60 -z-10" />
      <div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('hero_badge')}
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
            {t('hero_title_pre')}{' '}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              {t('hero_title_emph')}
            </span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 max-w-2xl">{t('hero_subtitle')}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary !px-5 !py-3 text-base shadow-md shadow-brand-500/20">
              {t('hero_cta_primary')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a href="#how" className="btn-secondary !px-5 !py-3 text-base">
              {t('hero_cta_secondary')}
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Check /> {t('hero_pill_1')}</span>
            <span className="flex items-center gap-1.5"><Check /> {t('hero_pill_2')}</span>
            <span className="flex items-center gap-1.5"><Check /> {t('hero_pill_3')}</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroMock t={t} />
        </div>
      </div>
    </section>
  );
}

function HeroMock({ t }) {
  return (
    <div className="relative mx-auto max-w-md">
      <div className="card p-5 shadow-xl shadow-slate-900/10 border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs text-slate-500 font-mono">fashionhub.com/checkout</span>
        </div>
        <div className="mt-4 text-sm">
          <div className="text-slate-500">{t('mock_order')}</div>
          <div className="mt-1 text-2xl font-semibold">৳ 4,900.00</div>
          <div className="mt-3 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
            {t('mock_send_prefix')} <strong>৳4,900</strong> {t('mock_to_wallet')} <strong>+880 1··· 8888</strong>
          </div>
          <label className="mt-4 block label">{t('mock_txn_label')}</label>
          <input readOnly value="TXN92H1" className="input font-mono" />
          <button className="btn-primary w-full mt-3">{t('mock_confirm')}</button>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-4 sm:-right-10 w-64 card p-4 shadow-2xl shadow-emerald-500/20 border-emerald-200 bg-white rotate-2 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-700">{t('mock_verified')}</div>
            <div className="text-xs text-slate-500">{t('mock_matched')}</div>
          </div>
        </div>
        <div className="mt-3 text-[11px] font-mono bg-slate-50 text-slate-600 rounded p-2 border border-slate-200">
          &quot;{t('mock_sms_text')}<br />TxnID: TXN92H1&quot;
        </div>
      </div>

      <div className="absolute -top-4 -left-4 sm:-left-8 w-44 card p-3 shadow-xl rotate-[-4deg] hover:rotate-0 transition-transform">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
            <PhoneIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">{t('mock_bound')}</div>
            <div className="text-[10px] text-slate-500">PV-8HJ2K9</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── STATS */
function Stats({ t }) {
  const items = [
    { value: '<2s',  label: t('stat1_label') },
    { value: '99.7%', label: t('stat2_label') },
    { value: '0',    label: t('stat3_label') },
    { value: '∞',    label: t('stat4_label') },
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
function Problem({ t }) {
  return (
    <section className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs uppercase tracking-widest text-rose-400 font-semibold">{t('problem_eyebrow')}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">
            {t('problem_title_1')} <br className="hidden sm:block" />
            <span className="text-rose-400">{t('problem_title_2')}</span>
          </h2>
          <p className="mt-5 text-slate-300 max-w-xl">{t('problem_body')}</p>
          <ul className="mt-6 space-y-3 text-slate-300">
            <li className="flex gap-3"><X /> {t('problem_li_1')}</li>
            <li className="flex gap-3"><X /> {t('problem_li_2')}</li>
            <li className="flex gap-3"><X /> {t('problem_li_3')}</li>
            <li className="flex gap-3"><X /> {t('problem_li_4')}</li>
          </ul>
        </div>

        <div className="lg:pl-10">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 p-6 lg:p-8">
            <span className="inline-block text-xs uppercase tracking-widest text-emerald-400 font-semibold">{t('fix_eyebrow')}</span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold">{t('fix_title')}</h3>
            <p className="mt-3 text-lg text-slate-100">
              {t('fix_body_a')} <em>{t('fix_body_em')}</em>{t('fix_body_b')}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> {t('fix_pill_1')}</span>
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> {t('fix_pill_2')}</span>
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> {t('fix_pill_3')}</span>
              <span className="rounded-md bg-white/10 px-3 py-2 flex items-center gap-2"><Check /> {t('fix_pill_4')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── HOW IT WORKS */
function HowItWorks({ t }) {
  const steps = [
    { n: '01', title: t('how_step1_title'), body: t('how_step1_body'), icon: <UserPlusIcon /> },
    { n: '02', title: t('how_step2_title'), body: t('how_step2_body'), icon: <PhoneIcon /> },
    { n: '03', title: t('how_step3_title'), body: t('how_step3_body'), icon: <CodeIcon /> },
    { n: '04', title: t('how_step4_title'), body: t('how_step4_body'), icon: <CheckCircle /> },
  ];
  return (
    <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <SectionHeader eyebrow={t('how_eyebrow')} title={t('how_title')} subtitle={t('how_subtitle')} />
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
function Features({ t }) {
  const items = [
    { icon: <BoltIcon />,      title: t('feat_1_title'), body: t('feat_1_body') },
    { icon: <ShieldIcon />,    title: t('feat_2_title'), body: t('feat_2_body') },
    { icon: <CodeIcon />,      title: t('feat_3_title'), body: t('feat_3_body') },
    { icon: <DashboardIcon />, title: t('feat_4_title'), body: t('feat_4_body') },
    { icon: <GlobeIcon />,     title: t('feat_5_title'), body: t('feat_5_body') },
    { icon: <LockIcon />,      title: t('feat_6_title'), body: t('feat_6_body') },
  ];
  return (
    <section id="features" className="bg-slate-50/70 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
        <SectionHeader eyebrow={t('feat_eyebrow')} title={t('feat_title')} subtitle={t('feat_subtitle')} />
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
function Comparison({ t }) {
  const rows = [
    [t('cmp_row1'), t('cmp_row1_pv'), t('cmp_row1_gw')],
    [t('cmp_row2'), t('cmp_row2_pv'), t('cmp_row2_gw')],
    [t('cmp_row3'), t('cmp_row3_pv'), t('cmp_row3_gw')],
    [t('cmp_row4'), t('cmp_row4_pv'), t('cmp_row4_gw')],
    [t('cmp_row5'), true,              false],
    [t('cmp_row6'), true,              false],
    [t('cmp_row7'), true,              false],
  ];
  return (
    <section id="compare" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <SectionHeader eyebrow={t('cmp_eyebrow')} title={t('cmp_title')} subtitle={t('cmp_subtitle')} />
      <div className="mt-12 card overflow-hidden">
        <div className="grid grid-cols-3 bg-slate-900 text-white text-sm font-semibold">
          <div className="p-4"></div>
          <div className="p-4 text-center bg-gradient-to-br from-brand-600 to-indigo-600">{t('cmp_col_pv')}</div>
          <div className="p-4 text-center text-slate-300">{t('cmp_col_gw')}</div>
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
function UseCases({ t }) {
  const cases = [
    { tag: t('uc_1_tag'), title: t('uc_1_title'), body: t('uc_1_body') },
    { tag: t('uc_2_tag'), title: t('uc_2_title'), body: t('uc_2_body') },
    { tag: t('uc_3_tag'), title: t('uc_3_title'), body: t('uc_3_body') },
  ];
  return (
    <section className="bg-slate-50/70 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
        <SectionHeader eyebrow={t('uc_eyebrow')} title={t('uc_title')} subtitle={t('uc_subtitle')} />
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
function FAQ({ t }) {
  const items = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
    { q: t('faq_q6'), a: t('faq_a6') },
  ];
  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <SectionHeader eyebrow={t('faq_eyebrow')} title={t('faq_title')} subtitle={t('faq_subtitle')} />
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
function FinalCTA({ t }) {
  return (
    <section className="px-4 sm:px-6 pb-20">
      <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-700 text-white px-6 sm:px-10 py-14 sm:py-16 relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div aria-hidden className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="relative text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">{t('cta_title')}</h2>
          <p className="mt-3 text-brand-50/90 max-w-2xl mx-auto">{t('cta_subtitle')}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="bg-white text-brand-700 hover:bg-slate-100 transition rounded-md font-semibold px-6 py-3 inline-flex items-center">
              {t('cta_primary')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 transition rounded-md font-semibold px-6 py-3 border border-white/20">
              {t('cta_secondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── FOOTER */
function Footer({ t }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-brand-600"><LogoMark className="w-7 h-7" /></span>
            <span className="text-lg font-bold tracking-tight">
              Ezy<span className="text-brand-600">Pay</span>
            </span>
          </div>
          <p className="mt-3 text-slate-600 max-w-sm">{t('foot_blurb')}</p>
        </div>
        <div>
          <div className="font-semibold text-slate-900">{t('foot_product')}</div>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><a href="#how"        className="hover:text-brand-600">{t('nav_how')}</a></li>
            <li><a href="#features"   className="hover:text-brand-600">{t('nav_features')}</a></li>
            <li><a href="#compare"    className="hover:text-brand-600">{t('nav_compare')}</a></li>
            <li><a href="#faq"        className="hover:text-brand-600">{t('nav_faq')}</a></li>
            <li><Link href="/docs"    className="hover:text-brand-600">{t('nav_docs')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-slate-900">{t('foot_account')}</div>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><Link href="/register"    className="hover:text-brand-600">{t('foot_register')}</Link></li>
            <li><Link href="/login"       className="hover:text-brand-600">{t('foot_login')}</Link></li>
            <li><Link href="/console/login" className="hover:text-brand-600">{t('foot_console')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} EzyPay. {t('foot_rights')}</span>
          <span>{t('foot_tag')}</span>
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
