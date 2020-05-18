interface Fathom {
  (...args: any[]): void;
  q?: Array<IArguments>;
}

declare global {
  interface Window {
    fathom: Fathom;
  }
}

const getFathom = (): Fathom => {
  return (window.fathom =
    window.fathom ||
    function() {
      (window.fathom.q = window.fathom.q || []).push(arguments);
    });
};

// refer to https://usefathom.com/support/tracking-advanced
export type LoadOptions = {
  url?: string;
  auto?: boolean;
  honorDNT?: boolean;
  canonical?: boolean;
  includedDomains?: string[];
  excludedDomains?: string[];
  spa?: 'auto' | 'history' | 'hash';
}

export const load = (siteId: string, opts?: LoadOptions): void => {
  window.fathom =
    window.fathom ||
    function() {
      (window.fathom.q = window.fathom.q || []).push(arguments);
    };

  let tracker = document.createElement('script');
  let firstScript = document.getElementsByTagName('script')[0];

  tracker.id = 'fathom-script';
  tracker.async = true;
  tracker.setAttribute('site', siteId);
  tracker.src = (opts && opts.url) ? opts.url : 'https://cdn.usefathom.com/script.js';
  if (opts) {
    if (opts.auto !== undefined) tracker.setAttribute('auto', `${opts.auto}`);
    if (opts.honorDNT !== undefined) tracker.setAttribute('honor-dnt', `${opts.honorDNT}`);
    if (opts.canonical !== undefined) tracker.setAttribute('canonical', `${opts.canonical}`);
    if (opts.includedDomains) tracker.setAttribute('included-domains', opts.includedDomains.join(','));
    if (opts.excludedDomains) tracker.setAttribute('excluded-domains', opts.excludedDomains.join(','));
    if (opts.spa) tracker.setAttribute('spa', opts.spa);
  }
  firstScript.parentNode.insertBefore(tracker, firstScript);
};

export const setSiteId = (siteId: string): void => {
  let fathom = getFathom();
  fathom('set', 'siteId', siteId);
};

export type PageViewOptions = {
  url?: string;
  referrer?: string;
}

export const trackPageview = (opts?: PageViewOptions): void => {
  let fathom = getFathom();
  opts ? fathom('trackPageview', opts) : fathom('trackPageview');
};

export const trackGoal = (id: string, cents: number) => {
  let fathom = getFathom();
  fathom('trackGoal', id, cents);
};
