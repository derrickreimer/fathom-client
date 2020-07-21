interface Fathom {
  trackPageview: (opts?: PageViewOptions) => void;
  trackGoal: (code: string, cents: number) => void;
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
  | { type: 'trackGoal'; code: string; cents: number };

declare global {
  interface Window {
    fathom?: Fathom;
    __fathomClientQueue: FathomCommand[];
  }
}

/**
 * Checks current environment is browser based
 */
const isBrowser = typeof window !== 'undefined'

/**
 * Enqueues a command to dispatch to fathom when the library is loaded.
 *
 * @param command - A set of arguments to dispatch to fathom later.
 */
const enqueue = (command: FathomCommand): void => {
  if (isBrowser) {
    window.__fathomClientQueue = window.__fathomClientQueue || [];
    window.__fathomClientQueue.push(command);
  }
};

/**
 * Flushes the command queue.
 */
const flushQueue = (): void => {
  if (isBrowser) {
    window.__fathomClientQueue = window.__fathomClientQueue || [];
    window.__fathomClientQueue.forEach(command => {
      switch (command.type) {
        case 'trackPageview':
          if (command.opts) {
            window.fathom.trackPageview(command.opts);
          } else {
            window.fathom.trackPageview();
          }
          return;

        case 'trackGoal':
          window.fathom.trackGoal(command.code, command.cents);
          return;
      }
    });
    window.__fathomClientQueue = [];
  }
};

export const load = (siteId: string, opts?: LoadOptions): void => {
  if (isBrowser) {
    let tracker = document.createElement('script');
    let firstScript = document.getElementsByTagName('script')[0];

    tracker.id = 'fathom-script';
    tracker.async = true;
    tracker.setAttribute('site', siteId);
    tracker.src =
      opts && opts.url ? opts.url : 'https://cdn.usefathom.com/script.js';
    if (opts) {
      if (opts.auto !== undefined) tracker.setAttribute('auto', `${opts.auto}`);
      if (opts.honorDNT !== undefined)
        tracker.setAttribute('honor-dnt', `${opts.honorDNT}`);
      if (opts.canonical !== undefined)
        tracker.setAttribute('canonical', `${opts.canonical}`);
      if (opts.includedDomains)
        tracker.setAttribute('included-domains', opts.includedDomains.join(','));
      if (opts.excludedDomains)
        tracker.setAttribute('excluded-domains', opts.excludedDomains.join(','));
      if (opts.spa) tracker.setAttribute('spa', opts.spa);
    }
    tracker.onload = flushQueue;
    firstScript.parentNode.insertBefore(tracker, firstScript);
  }
};

/**
 * Tracks a pageview.
 *
 * @param opts - An optional `url` or `referrer` to override auto-detected values.
 */
export const trackPageview = (opts?: PageViewOptions): void => {
  if (isBrowser && window.fathom) {
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
 */
export const trackGoal = (code: string, cents: number) => {
  if (isBrowser && window.fathom) {
    window.fathom.trackGoal(code, cents);
  } else {
    enqueue({ type: 'trackGoal', code, cents });
  }
};
