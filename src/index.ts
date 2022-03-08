interface Fathom {
  blockTrackingForMe: () => void;
  enableTrackingForMe: () => void;
  trackPageview: (opts?: PageViewOptions) => void;
  trackGoal: (code: string, cents: number) => void;
  setSite: (id: string) => void;
}

export type PageViewOptions = {
  url?: string;
  referrer?: string;
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
};

type FathomCommand =
  | { type: 'trackPageview'; opts: PageViewOptions | undefined }
  | { type: 'trackGoal'; code: string; cents: number }
  | { type: 'blockTrackingForMe' }
  | { type: 'enableTrackingForMe' }
  | { type: 'setSite'; id: string };

declare global {
  interface Window {
    fathom?: Fathom;
    __fathomClientQueue: FathomCommand[];
  }
}

/**
 * Enqueues a command to dispatch to fathom when the library is loaded.
 *
 * @param command - A set of arguments to dispatch to fathom later.
 */
const enqueue = (command: FathomCommand): void => {
  window.__fathomClientQueue = window.__fathomClientQueue || [];
  window.__fathomClientQueue.push(command);
};

/**
 * Flushes the command queue.
 */
const flushQueue = (): void => {
  window.__fathomClientQueue = window.__fathomClientQueue || [];
  window.__fathomClientQueue.forEach(command => {
    switch (command.type) {
      case 'trackPageview':
        trackPageview(command.opts);
        return;

      case 'trackGoal':
        trackGoal(command.code, command.cents);
        return;

      case 'enableTrackingForMe':
        enableTrackingForMe();
        return;

      case 'blockTrackingForMe':
        blockTrackingForMe();
        return;

      case 'setSite':
        setSite(command.id);
        return;
    }
  });
  window.__fathomClientQueue = [];
};

/**
 * Loops through list of domains and warns if they start with
 * http, https, http://, etc... as this does not work with the
 * Fathom script.
 *
 * @param domains - List of domains to check
 */
const checkDomainsAndWarn = (domains: string[]): void => {
  const regex = /(https?)(?=:|\/|$)/; // matches http or https followed by
  // either a : or /
  domains.forEach(domain => {
    if (regex.exec(domain) !== null)
      console.warn(
        `The include domain ${domain} might fail to work as intended as it begins with a transfer protocol (http://, https://). Consider removing the protocol portion of the string.`
      );
  });
};

export const load = (siteId: string, opts?: LoadOptions): void => {
  let tracker = document.createElement('script');
  let firstScript = document.getElementsByTagName('script')[0] || document.querySelector('body');

  tracker.id = 'fathom-script';
  tracker.async = true;
  tracker.setAttribute('data-site', siteId);
  tracker.src =
    opts && opts.url ? opts.url : 'https://cdn.usefathom.com/script.js';
  if (opts) {
    if (opts.auto !== undefined)
      tracker.setAttribute('data-auto', `${opts.auto}`);
    if (opts.honorDNT !== undefined)
      tracker.setAttribute('data-honor-dnt', `${opts.honorDNT}`);
    if (opts.canonical !== undefined)
      tracker.setAttribute('data-canonical', `${opts.canonical}`);
    if (opts.includedDomains) {
      checkDomainsAndWarn(opts.includedDomains);
      tracker.setAttribute(
        'data-included-domains',
        opts.includedDomains.join(',')
      );
    }
    if (opts.excludedDomains) {
      checkDomainsAndWarn(opts.excludedDomains);
      tracker.setAttribute(
        'data-excluded-domains',
        opts.excludedDomains.join(',')
      );
    }
    if (opts.spa) tracker.setAttribute('data-spa', opts.spa);
  }
  tracker.onload = flushQueue;
  firstScript.parentNode.insertBefore(tracker, firstScript);
};

/**
 * Tracks a pageview.
 *
 * @param opts - An optional `url` or `referrer` to override auto-detected values.
 */
export const trackPageview = (opts?: PageViewOptions): void => {
  if (window.fathom) {
    if (opts) {
      window.fathom.trackPageview(opts);
    } else {
      window.fathom.trackPageview();
    }
  } else {
    console.warn("Fathom was not detected. Queueing trackPageview() call for when Fathom loads.")
    enqueue({ type: 'trackPageview', opts });
  }
};

/**
 * Tracks a goal.
 *
 * @param code - The goal ID.
 * @param cents - The value in cents.
 */
export const trackGoal = (code: string, cents: number) => {
  if (window.fathom) {
    window.fathom.trackGoal(code, cents);
  } else {
    console.warn("Fathom was not detected. Queueing trackGoal() call for when Fathom loads.")
    enqueue({ type: 'trackGoal', code, cents });
  }
};

/**
 * Blocks tracking for the current visitor.
 *
 * See https://usefathom.com/docs/features/exclude
 */
export const blockTrackingForMe = (): void => {
  if (window.fathom) {
    window.fathom.blockTrackingForMe();
  } else {
    console.warn("Fathom was not detected. Queueing blockTrackingForMe() call for when Fathom loads.")
    enqueue({ type: 'blockTrackingForMe' });
  }
};

/**
 * Enables tracking for the current visitor.
 *
 * See https://usefathom.com/docs/features/exclude
 */
export const enableTrackingForMe = (): void => {
  if (window.fathom) {
    window.fathom.enableTrackingForMe();
  } else {
    console.warn("Fathom was not detected. Queueing enableTrackingForMe() call for when Fathom loads.")
    enqueue({ type: 'enableTrackingForMe' });
  }
};

/**
 * Sets the Site ID.
 *
 * @param id - The new site ID.
 */
export const setSite = (id: string): void => {
  if (window.fathom) {
    window.fathom.setSite(id);
  } else {
    console.warn("Fathom was not detected. Queueing setSite() call for when Fathom loads.")
    enqueue({ type: 'setSite', id });
  }
};
