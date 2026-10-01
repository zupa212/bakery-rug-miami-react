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
    },
    el: {
        // Nav & Common
        'nav.home': 'Αρχική',
        'nav.services': 'Υπηρεσίες',
        'nav.shop': 'Συλλογή',
        'nav.process': 'Διαδικασία',
        'nav.about': 'Σχετικά',
        'nav.blog': 'Άρθρα & Blog',
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

        // Contact & Lead Form
        'contact.tagline': 'Επικοινωνία & Εκτίμηση',
        'contact.headline': 'Ξεκινήστε τη Συντήρηση',
        'contact.description': 'Για να διασφαλίσουμε το υψηλότερο επίπεδο φροντίδας, δεχόμαστε περιορισμένο αριθμό αναθέσεων κάθε εβδομάδα.\n\nΣυμπληρώστε τα στοιχεία του χαλιού σας και οι έμπειροι τεχνίτες μας θα εκτιμήσουν την κατάλληλη μέθοδο καθαρισμού ή επισκευής.',
        'contact.shopLocation': 'Τοποθεσία Καταστήματος',
        'contact.serviceRequired': 'Επιθυμητή Υπηρεσία',
        'contact.cleaning': 'Καθαρισμός Χαλιών & Μοκετών',
        'contact.repair': 'Επισκευή & Συντήρηση',
        'contact.appraisal': 'Εκτίμηση Αξίας',
        'contact.fullName': 'Ονοματεπώνυμο',
        'contact.phone': 'Τηλέφωνο Επικοινωνίας',
        'contact.email': 'Διεύθυνση Email',
        'contact.details': 'Κατάσταση χαλιού, διαστάσεις ή λεπτομέρειες...',
        'contact.terms': 'Αποδέχομαι τους Όρους Χρήσης και την Πολιτική Απορρήτου και συναινώ στην επικοινωνία για την εκτίμηση του χαλιού μου.',
        'contact.submit': 'Αποστολή Αιτήματος Εκτίμησης',
        'contact.submitting': 'Αποστολή...',
        'contact.successTitle': 'Το Αίτημα Ελήφθη Επιτυχώς',
        'contact.successDesc': 'Οι έμπειροι συντηρητές μας θα εξετάσουν το αίτημά σας και θα επικοινωνήσουν άμεσα μαζί σας.',
        'contact.sendAnother': 'Αποστολή νέου αιτήματος',
        'contact.termsError': 'Πρέπει να αποδεχτείτε τους όρους για να συνεχίσετε.',
        'contact.genericError': 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά ή καλέστε μας στο (305) 801-9000.',

        // Blog & Knowledge Hub
        'blog.badge': 'Οδηγοί & Άρθρα Φροντίδας Χαλιών Μαϊάμι',
        'blog.title': 'Bakers Rug Journal & Οδηγοί',
        'blog.subtitle': 'Συμβουλές ειδικών για τον καθαρισμό μοκετών και χαλιών στο Μαϊάμι, τη διατήρηση χειροποίητων περσικών χαλιών και την αφαίρεση λεκέδων.',
        'blog.readMore': 'Διαβάστε τον Οδηγό',
        'blog.backToBlog': '← Επιστροφή στα Άρθρα',
        'blog.shareArticle': 'Κοινοποίηση Άρθρου',
        'blog.author': 'Bakers Rug Master Weavers',
        'blog.expertHelp': 'Χρειάζεστε Επαγγελματικό Καθαρισμό Χαλιών στο Μαϊάμι;',
        'blog.expertHelpDesc': 'Καλέστε το εργαστήριό μας στο (305) 801-9000 για δωρεάν παραλαβή & παράδοση και εκτίμηση χωρίς καμία δέσμευση.',
        'blog.bookNow': 'Κλείστε Δωρεάν Ραντεβού',

        // Admin
        'admin.overview': 'Επισκόπηση',
        'admin.inventory': 'Αποθήκη',
        'admin.leads': 'Εισερχόμενα Leads',
        'admin.settings': 'Ρυθμίσεις',
        'admin.editor': 'Επεξεργαστής',
        'admin.seo': 'SEO & Κατατάξεις',
        'admin.reviewsTab': 'Google Reviews & QR',
        'admin.blogTab': 'Διαχείριση Blog',
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
