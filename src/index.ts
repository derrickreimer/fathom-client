export interface Fathom {
  blockTrackingForMe: () => void;
  enableTrackingForMe: () => void;
  trackPageview: (opts?: PageViewOptions) => void;
  trackGoal: (code: string, cents: number) => void;
  trackEvent: (eventName: string, opts?: EventOptions) => void;
  setSite: (id: string) => void;
}

/**
 * @see https://usefathom.com/docs/script/script-advanced#api
 */
export type PageViewOptions = {
  url?: string;
  referrer?: string;
};

/**
 * @see https://usefathom.com/docs/features/events
 */
export type EventOptions = {
  _value?: number;
  _site_id?: string;
};

/**
 * @see https://usefathom.com/support/tracking-advanced
 **/ 
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
  | { type: 'trackEvent'; eventName: string; opts: EventOptions | undefined }
  | { type: 'blockTrackingForMe' }
  | { type: 'enableTrackingForMe' }
  | { type: 'setSite'; id: string };

declare global {
  interface Window {
    fathom?: Fathom;

    /** @internal */
    __fathomClientQueue: FathomCommand[];
    /** @internal */
    __fathomIsLoading?: boolean;
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
  window.__fathomIsLoading = false;
  window.__fathomClientQueue = window.__fathomClientQueue || [];

  window.__fathomClientQueue.forEach(command => {
    switch (command.type) {
      case 'trackPageview':
        trackPageview(command.opts);
        return;

      case 'trackGoal':
        trackGoal(command.code, command.cents);
        return;

      case 'trackEvent':
        trackEvent(command.eventName, command.opts);
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
 * Loops through list of domains and warns if they start with http, https,
 * http://, etc... as this does not work with the Fathom script.
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

/**
 * Loads the Fathom script.
 * 
 * @param siteId - the id for the Fathom site.
 * @param opts - advanced tracking options (https://usefathom.com/support/tracking-advanced)
 */
export const load = (siteId: string, opts?: LoadOptions): void => {
  if (window.__fathomIsLoading || window.fathom) return;

  // Mark that fathom is loading, so that we can prevent a race condition if
  // `load` is called again BEFORE the fathom script finishes initializing (and
  // so before `window.fathom` is actually defined)
  window.__fathomIsLoading = true;

  let tracker = document.createElement('script');

  let firstScript =
    document.getElementsByTagName('script')[0] ||
    document.querySelector('body');

  tracker.id = 'fathom-script';
  tracker.async = true;
  tracker.setAttribute('data-site', siteId);
  tracker.src = opts?.url || 'https://cdn.usefathom.com/script.js';

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
    enqueue({ type: 'trackPageview', opts });
  }
};

/**
 * Tracks a goal.
 *
 * @param code - The goal ID.
 * @param cents - The value in cents.
 * @deprecated If you are using this to track an existing goal, however, it will continue to work.
 * @see https://usefathom.com/docs/features/events
 */
export const trackGoal = (code: string, cents: number) => {
  if (window.fathom) {
    window.fathom.trackGoal(code, cents);
  } else {
    enqueue({ type: 'trackGoal', code, cents });
  }
};

/**
 * Tracks a dynamic event.
 *
 * @param eventName - This can be nearly anything you want. Avoid special chars and emojis.
 * @param opts - A collection of options.
 * @param opts._site_id - The site ID (optional).
 * @param opts._value - The value in cents (optional).
 * @see https://usefathom.com/docs/features/events
 */
export const trackEvent = (eventName: string, opts?: EventOptions) => {
  if (window.fathom) {
    window.fathom.trackEvent(eventName, opts);
  } else {
    enqueue({ type: 'trackEvent', eventName, opts });
  }
};

/**
 * Blocks tracking for the current visitor.
 *
 * @see https://usefathom.com/docs/features/exclude
 */
export const blockTrackingForMe = (): void => {
  if (window.fathom) {
    window.fathom.blockTrackingForMe();
  } else {
    enqueue({ type: 'blockTrackingForMe' });
  }
};

/**
 * Enables tracking for the current visitor.
 *
 * @see https://usefathom.com/docs/features/exclude
 */
export const enableTrackingForMe = (): void => {
  if (window.fathom) {
    window.fathom.enableTrackingForMe();
  } else {
    enqueue({ type: 'enableTrackingForMe' });
  }
};

/**
 * Checks if tracking is enabled for the current visitor.
 */
export const isTrackingEnabled = (): boolean => {
  const preferenceStorage: string | null = localStorage.getItem(
    'blockFathomTracking'
  );
  return preferenceStorage !== null ? preferenceStorage !== 'true' : true;
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
    enqueue({ type: 'setSite', id });
  }
};
