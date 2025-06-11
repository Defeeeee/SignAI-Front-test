import { useEffect } from 'react';

interface AnalyticsProps {
  measurementId?: string; // Google Analytics measurement ID
  plausibleDomain?: string; // Plausible domain
  matomoUrl?: string; // Matomo URL
  matomoSiteId?: string; // Matomo site ID
}

/**
 * Analytics component for integrating with various analytics providers
 * 
 * Usage:
 * <Analytics 
 *   measurementId="G-XXXXXXXXXX" // For Google Analytics
 *   plausibleDomain="yourdomain.com" // For Plausible
 *   matomoUrl="https://matomo.yourdomain.com" // For Matomo
 *   matomoSiteId="1" // For Matomo
 * />
 */
const Analytics: React.FC<AnalyticsProps> = ({ 
  measurementId, 
  plausibleDomain,
  matomoUrl,
  matomoSiteId
}) => {
  useEffect(() => {
    // Google Analytics
    if (measurementId) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);
      
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', measurementId);
      
      return () => {
        document.head.removeChild(script);
      };
    }
    
    // Plausible Analytics
    if (plausibleDomain) {
      const script = document.createElement('script');
      script.src = 'https://plausible.io/js/plausible.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-domain', plausibleDomain);
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
    
    // Matomo Analytics
    if (matomoUrl && matomoSiteId) {
      const script = document.createElement('script');
      script.innerHTML = `
        var _paq = window._paq = window._paq || [];
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="${matomoUrl}/";
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '${matomoSiteId}']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [measurementId, plausibleDomain, matomoUrl, matomoSiteId]);
  
  return null; // This component doesn't render anything
};

// Add window.dataLayer type definition
declare global {
  interface Window {
    dataLayer: any[];
    _paq: any[];
  }
}

export default Analytics;