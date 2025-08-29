import Providers from "@/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Society Manager - Complete Society Management System | SmartManager",
  description: "India's leading society management system for residential societies, housing complexes, and gated communities. Manage society accounts, maintenance, visitor management, and more with SmartManager Society Management Software.",
  keywords: [
    "society management system",
    "society manager",
    "residential society management",
    "housing society software",
    "apartment management system",
    "society accounting software",
    "maintenance management",
    "visitor management system",
    "gated community management",
    "society billing software",
    "housing complex management",
    "residential community software",
    "society administration",
    "apartment billing system",
    "society maintenance tracker"
  ],
  authors: [{ name: "SmartManager" }],
  creator: "SmartManager",
  publisher: "SmartManager",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://smartmanager.co.in'),
  alternates: {
    canonical: 'https://smartmanager.co.in',
  },
  openGraph: {
    title: "Society Manager - Complete Society Management System",
    description: "India's leading society management system for residential societies, housing complexes, and gated communities. Streamline your society operations with our comprehensive management software.",
    url: 'https://smartmanager.co.in',
    siteName: 'SmartManager - Society Management System',
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image
        width: 1200,
        height: 630,
        alt: 'SmartManager Society Management System',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Society Manager - Complete Society Management System",
    description: "India's leading society management system for residential societies and housing complexes. Streamline operations with SmartManager.",
    creator: '@smartmanager', // Replace with your actual Twitter handle
    images: ['/twitter-image.jpg'], // You'll need to add this image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'Business Software',
  referrer: 'origin-when-cross-origin',
  other: {
    'application-name': 'SmartManager Society Management',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Society Manager',
    'theme-color': '#2563eb', // Customize your brand color
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
  }
}

// Additional JSON-LD structured data for better SEO
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SmartManager Society Management System',
  description: 'Complete society management software for residential societies, housing complexes, and gated communities in India.',
  url: 'https://smartmanager.co.in',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR'
  },
  provider: {
    '@type': 'Organization',
    name: 'SmartManager',
    url: 'https://smartmanager.co.in'
  },
  featureList: [
    'Society Account Management',
    'Maintenance Billing',
    'Visitor Management',
    'Notice Board',
    'Complaint Management',
    'Vendor Management',
    'Security Management',
    'Financial Reports'
  ],
  screenshot: 'https://smartmanager.co.in/screenshots/dashboard.jpg'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
