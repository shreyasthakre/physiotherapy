const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialised = false;

/** Inject the GA4 gtag.js snippet once, if a measurement ID is configured. */
export const initAnalytics = () => {
  if (initialised || !GA_ID) return;
  initialised = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: false });
};

/** Record a page view (call on route change). */
export const trackPageView = (path) => {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
  });
};

/** Record a custom event (e.g. appointment_booked). */
export const trackEvent = (name, params = {}) => {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', name, params);
};
