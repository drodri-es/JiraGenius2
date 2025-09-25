import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { JiraConnectionProvider } from '@/context/JiraConnectionContext';

export const metadata: Metadata = {
  title: 'JiraGenius2',
  description: 'AI-powered assistance for your Jira workflow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <JiraConnectionProvider>
          {children}
          <Toaster />
        </JiraConnectionProvider>
      </body>
    </html>
  );
}
