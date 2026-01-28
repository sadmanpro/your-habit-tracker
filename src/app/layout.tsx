import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from './components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'YOUR HABIT TRACKER',
  description: 'A monthly habit tracker to cultivate growth.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative isolate min-h-screen">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
              <div
              style={{
                  clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 dark:opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              />
          </div>
          <FirebaseClientProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster />
            </ThemeProvider>
          </FirebaseClientProvider>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
              <div
                  style={{
                  clipPath:
                      'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                  }}
                  className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent to-destructive opacity-20 dark:opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              />
          </div>
        </div>
      </body>
    </html>
  );
}
