import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'el';

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

        // Admin
        'admin.overview': 'Overview',
        'admin.inventory': 'Inventory',
        'admin.leads': 'Inbox & Leads',
        'admin.settings': 'Settings',
        'admin.editor': 'Content Editor',
        'admin.seo': 'SEO & Rankings',
        'admin.reviewsTab': 'Google Reviews & QR',
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
    },
    el: {
        // Nav & Common
        'nav.home': 'Αρχική',
        'nav.services': 'Υπηρεσίες',
        'nav.shop': 'Συλλογή',
        'nav.process': 'Διαδικασία',
        'nav.about': 'Σχετικά',
        'nav.contact': 'Επικοινωνία',
        'nav.reviews': 'Κριτικές & QR',
        'nav.admin': 'Διαχείριση',
        'nav.callUs': 'Καλέστε (305) 801-9000',
        'nav.freeEstimate': 'Δωρεάν Εκτίμηση',

        // Google Review & QR Page
        'review.badge': 'Επιβεβαιωμένες Κριτικές Google',
        'review.heroTitle': 'Αφήστε μας Κριτική 5 Αστέρων στο Google',
        'review.heroSubtitle': 'Σκανάρετε το QR code με την κάμερα του κινητού σας ή πατήστε το παρακάτω κουμπί για να μοιραστείτε την εμπειρία σας με τη Bakers Rug Miami.',
        'review.scanPrompt': 'Σκανάρετε με την Κάμερα',
        'review.scanDetail': 'Ανοίξτε την κάμερα του smartphone σας και στοχεύστε το QR code για να ανοίξει αμέσως η φόρμα αξιολόγησης του Google.',
        'review.openButton': 'Αξιολόγηση στο Google',
        'review.copyButton': 'Αντιγραφή Συνδέσμου',
        'review.downloadButton': 'Λήψη QR Code (PNG)',
        'review.printButton': 'Εκτύπωση Stand Βιτρίνας',
        'review.copied': 'Ο σύνδεσμος κριτικής αντιγράφηκε στο πρόχειρο! ⭐',
        'review.ratingText': '4.9 Αστέρια • 120+ Επιβεβαιωμένες Κριτικές Πελατών',
        'review.heritage': 'Πάνω από 80 Χρόνια Εμπειρίας στον Καθαρισμό & Συντήρηση Χαλιών στη Νότια Φλόριντα',
        'review.showroom': 'Έκθεση: 8723 SW 132 ST, Miami, FL 33176',
        'review.thankYou': 'Σας ευχαριστούμε θερμά που εμπιστεύεστε και στηρίζετε την παράδοσή μας!',

        // Admin
        'admin.overview': 'Επισκόπηση',
        'admin.inventory': 'Αποθήκη',
        'admin.leads': 'Εισερχόμενα Leads',
        'admin.settings': 'Ρυθμίσεις',
        'admin.editor': 'Επεξεργαστής',
        'admin.seo': 'SEO & Κατατάξεις',
        'admin.reviewsTab': 'Google Reviews & QR',
        'admin.signOut': 'Αποσύνδεση',
        'admin.soundOn': 'Ήχος Ενεργός',
        'admin.soundMuted': 'Σε Σίγαση',
        'admin.desktopOn': 'Desktop: ON',
        'admin.desktopAlerts': 'Ειδοποιήσεις Desktop',
        'admin.iphonePush': 'Ειδοποιήσεις iPhone',
        'admin.supabaseOk': 'Supabase: Όλα εντάξει',
        'admin.forceSync': 'Συγχρονισμός',
        'admin.totalRugs': 'Σύνολο Χαλιών',
        'admin.totalLeads': 'Σύνολο Leads',
        'admin.dbStatus': 'Βάση Supabase',
        'admin.allGood': 'Όλα εντάξει (Live)',
        'admin.failSafe': 'Εφεδρική Αποθήκη',
        'admin.blobActive': 'Vercel Blob Active',
        'admin.recentLeads': 'Πρόσφατα Leads',
        'admin.viewAll': 'Προβολή Όλων',
        'admin.exportCsv': 'Εξαγωγή CSV',
        'admin.noLeads': 'Δεν υπάρχουν leads ακόμα.',
        'admin.testSound': 'Δοκιμή Ήχου',
        'admin.testDesktop': 'Δοκιμή Desktop Alert',
        'admin.testIphone': 'Δοκιμή iPhone Push',
        'admin.pingDb': 'Ping Βάσης',
        'admin.viewBlobs': 'Προβολή Backup Blobs',
        'admin.restoreDb': 'Επαναφορά στη Βάση',
        'admin.language': 'Γλώσσα'
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => {},
    toggleLanguage: () => {},
    t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bakers_lang') as Language;
            if (saved === 'en' || saved === 'el') return saved;
            // Check browser preferred language
            if (navigator.language && navigator.language.startsWith('el')) return 'el';
        }
        return 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('bakers_lang', lang);
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'el' : 'en');
    };

    const t = (key: string): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
