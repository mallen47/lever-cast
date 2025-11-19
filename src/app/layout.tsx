import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/providers/theme-provider';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Levercast - Social Media Content Assistant',
	description:
		'Capture, format, and share your content ideas across multiple social media platforms',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				{/* Blocking script to set theme before React hydrates - prevents hydration mismatch */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var root = document.documentElement;
                  if (theme === 'light' || theme === 'dark') {
                    root.classList.remove('dark');
                    if (theme === 'dark') {
                      root.classList.add('dark');
                    }
                  } else {
                    root.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
					}}
				/>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
