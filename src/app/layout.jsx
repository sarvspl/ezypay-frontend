import './globals.css';

export const metadata = {
  title: {
    default: 'PayVerify — SMS wallet payment verification',
    template: '%s · PayVerify',
  },
  description: 'Instant SMS-based wallet payment verification for ecommerce. Confirm bKash, Nagad, UPI, M-Pesa and other wallet payments in under 2 seconds.',
  applicationName: 'PayVerify',
  authors: [{ name: 'PayVerify' }],
  keywords: ['payment verification', 'SMS verification', 'wallet payments', 'ecommerce'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
