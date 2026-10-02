import React, { createContext, useContext, useState } from 'react';

export type Language = 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Nav & Common
        'nav.home': 'Home',
        'nav.services': 'Services',
        'nav.shop': 'Shop',
        'nav.process': 'Process',
        'nav.about': 'About',
        'nav.blog': 'Blog & Guides',
        'nav.contact': 'Contact',
        'nav.reviews': 'Reviews & QR',
        'nav.admin': 'Admin',
        'nav.callUs': 'Call (305) 801-9000',
        'nav.freeEstimate': 'Free Consultation',

        // Google Review & QR Page
        'review.badge': 'Verified Google Reviews',
        'review.heroTitle': 'Leave a 5-Star Google Review',
        'review.heroSubtitle': 'Scan the QR code with your phone camera or click the button below to share your experience with Bakers Rug Miami.',
        'review.scanPrompt': 'Scan With Mobile Camera',
        'review.scanDetail': 'Open your camera app and point it at the QR code to open the Google Review page instantly.',
        'review.openButton': 'Review Us on Google',
        'review.copyButton': 'Copy Review Link',
        'review.downloadButton': 'Download QR Code',
        'review.printButton': 'Print Showroom Stand / Flyer',
        'review.copied': 'Google Review link copied to clipboard! ⭐',
        'review.ratingText': '4.9 Star Rating • 120+ Verified Client Reviews',
        'review.heritage': 'Over 80 Years of White-Glove Rug Cleaning & Restoration in South Florida',
        'review.showroom': 'Showroom: 8723 SW 132 ST, Miami, FL 33176',
        'review.thankYou': 'Thank you for supporting authentic master craft and luxury rug preservation!',

        // Contact & Lead Form
        'contact.tagline': 'Inquiries',
        'contact.headline': 'Begin the Restoration',
        'contact.description': 'To ensure the highest level of care, we accept a limited number of new commissions each week.\n\nPlease provide details about your rug\'s condition. Our master weavers will assess the best course of action.',
        'contact.shopLocation': 'Shop Location',
        'contact.serviceRequired': 'Service Required',
        'contact.cleaning': 'Carpet & Rug Cleaning',
        'contact.repair': 'Repair & Restoration',
        'contact.appraisal': 'Expert Appraisal',
        'contact.fullName': 'Full Name',
        'contact.phone': 'Phone Number',
        'contact.email': 'Email Address',
        'contact.details': 'Rug condition, size, or questions...',
        'contact.terms': 'I agree to the Terms of Service and Privacy Policy, and consent to be contacted regarding this inquiry in accordance with Miami-Dade consumer protection laws.',
        'contact.submit': 'Request Consideration',
        'contact.submitting': 'Processing...',
        'contact.successTitle': 'Inquiry Received',
        'contact.successDesc': 'Our master weaver will review your request and contact you shortly.',
        'contact.sendAnother': 'Send another request',
        'contact.termsError': 'You must agree to the terms to proceed.',
        'contact.genericError': 'Something went wrong. Please try again or call us at (305) 801-9000.',

        // Blog & Knowledge Hub
        'blog.badge': 'Miami Rug Care & Restoration Journal',
        'blog.title': 'Bakers Rug Journal & Guides',
        'blog.subtitle': 'Expert guides on carpet cleaning in Miami, Persian rug preservation, organic pet stain removal, and South Florida antique care.',
        'blog.readMore': 'Read Guide',
        'blog.backToBlog': '← Back to All Guides',
        'blog.shareArticle': 'Share Guide',
        'blog.author': 'Bakers Rug Master Restorers',
        'blog.expertHelp': 'Need Professional Carpet or Rug Cleaning in Miami?',
        'blog.expertHelpDesc': 'Call our Miami workshop at (305) 801-9000 for complimentary white-glove pickup and transparent estimate.',
        'blog.bookNow': 'Book Free Consultation',

        // Admin
        'admin.overview': 'Overview',
        'admin.inventory': 'Inventory',
        'admin.leads': 'Inbox & Leads',
        'admin.settings': 'Settings',
        'admin.editor': 'Content Editor',
        'admin.seo': 'SEO & Rankings',
        'admin.reviewsTab': 'Google Reviews & QR',
        'admin.blogTab': 'Blog Manager',
        'admin.signOut': 'Sign Out',
        'admin.soundOn': 'Sound On',
        'admin.soundMuted': 'Muted',
        'admin.desktopOn': 'Desktop: ON',
        'admin.desktopAlerts': 'Desktop Alerts',
        'admin.iphonePush': 'iPhone Push',
        'admin.supabaseOk': 'Supabase: Operational (All Good)',
        'admin.forceSync': 'Force Sync',
        'admin.totalRugs': 'Total Rugs',
        'admin.totalLeads': 'Total Leads',
        'admin.dbStatus': 'Supabase DB',
        'admin.allGood': 'Operational (All Good)',
        'admin.failSafe': 'Fail-Safe Store',
        'admin.blobActive': 'Vercel Blob Active',
        'admin.recentLeads': 'Recent Leads',
        'admin.viewAll': 'View All',
        'admin.exportCsv': 'Export CSV',
        'admin.noLeads': 'No leads yet.',
        'admin.testSound': 'Test Sound',
        'admin.testDesktop': 'Test Desktop Popup',
        'admin.testIphone': 'Test iPhone Push',
        'admin.pingDb': 'Ping DB',
        'admin.viewBlobs': 'View Blob Backups',
        'admin.restoreDb': 'Restore to DB',
        'admin.language': 'Language'
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => {},
    toggleLanguage: () => {},
    t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // English is the strictly enforced language
    const language: Language = 'en';

    const setLanguage = (_lang: Language) => {
        // No-op - strictly English
    };

    const toggleLanguage = () => {
        // No-op - strictly English
    };

    const t = (key: string): string => {
        return translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

