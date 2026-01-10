import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Placeholder, user needs to provide real ID

export const initGA = () => {
    ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const logEvent = (category: string, action: string, label?: string) => {
    ReactGA.event({
        category,
        action,
        label,
    });
};

export const AnalyticsTracker = () => {
    // Simple component to track page views could be added here if using a router
    return null;
};
