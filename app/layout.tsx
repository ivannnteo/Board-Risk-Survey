import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { TopBrandBar } from './components/ui';

export const metadata: Metadata = {
  title: 'Board Risk Preparedness Survey',
  description: 'Assess and benchmark organisational risk preparedness.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBrandBar />
        {children}
      </body>
    </html>
  );
}
