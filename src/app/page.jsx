import HomeClient from './HomeClient';

export const metadata = {
  title: 'PayVerify — Instant SMS wallet payment verification for ecommerce',
  description:
    'Stop losing money to fake TxnIDs. PayVerify confirms any wallet, bank, or UPI payment in under 2 seconds by matching the customer\'s transaction ID against the actual SMS on your bound Android device.',
};

export default function HomePage() {
  return <HomeClient />;
}
