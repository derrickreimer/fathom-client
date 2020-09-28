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
  domains.forEach((domain) => {
    if (regex.exec(domain) !== null)
      console.warn(`The include domain ${domain} might fail to work as intended as it begins with a transfer protocol (http://, https://), consider removing the protocol portion of the string.`);
  });
}

export const load = (siteId: string, opts?: LoadOptions): void => {
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
    if (opts.includedDomains) {
      checkDomainsAndWarn(opts.includedDomains);
      tracker.setAttribute('included-domains', opts.includedDomains.join(','));
    }
    if (opts.excludedDomains) {
      checkDomainsAndWarn(opts.excludedDomains);
      tracker.setAttribute('excluded-domains', opts.excludedDomains.join(','));
    }
    if (opts.spa) tracker.setAttribute('spa', opts.spa);
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
 */
export const trackGoal = (code: string, cents: number) => {
  if (window.fathom) {
    window.fathom.trackGoal(code, cents);
  } else {
    enqueue({ type: 'trackGoal', code, cents });
  }
};
