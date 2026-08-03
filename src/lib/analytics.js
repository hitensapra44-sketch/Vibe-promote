import ReactGA from "react-ga4";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-L6H86DMQ3G";
let isInitialized = false;

export const initGA = () => {
  if (isInitialized) return;
  if (!GA_ID) {
    console.error("GA4: MEASUREMENT_ID is missing. Check your .env file.");
    return;
  }

  try {
    // Ensure dataLayer exists before initializing GA
    if (typeof window !== 'undefined' && !window.dataLayer) {
      window.dataLayer = [];
    }
    // Define gtag if not present (helps SSR or edge cases)
    if (typeof window !== 'undefined' && typeof window.gtag !== 'function') {
      window.gtag = function(){ window.dataLayer.push(arguments); };
    }

    ReactGA.initialize(GA_ID);
    isInitialized = true;
    console.log("GA4: Initialized successfully with ID:", GA_ID);
  } catch (error) {
    console.error("GA4: Initialization failed", error);
  }
};

export const logPageView = (path) => {
  if (!isInitialized) return;
  try {
    if (typeof window !== 'undefined' && typeof ReactGA.send === 'function') {
      ReactGA.send({ hitType: 'pageview', page: path });
      console.log(`GA4: Page view tracked for ${path}`);
    } else {
      // Fallback: attempt to push to dataLayer directly if available
      if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'page_view', page: path });
        console.log(`GA4: Page view (fallback) tracked for ${path}`);
      }
    }
  } catch (error) {
    console.warn("GA4: Failed to track page view", error);
  }
};

export const logEvent = (category, action, label) => {
  if (!isInitialized) return;
  try {
    if (typeof window !== 'undefined' && typeof ReactGA.event === 'function') {
      ReactGA.event({ category, action, label });
      console.log(`GA4: Event tracked - ${category} | ${action} | ${label}`);
    } else if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: category, action, label });
      console.log(`GA4: Event tracked (fallback) - ${category} | ${action} | ${label}`);
    }
  } catch (error) {
    console.warn("GA4: Failed to track event", error);
  }
};
