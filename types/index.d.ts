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
 */
export type LoadOptions = {
    url?: string;
    auto?: boolean;
    honorDNT?: boolean;
    canonical?: boolean;
    includedDomains?: string[];
    excludedDomains?: string[];
    spa?: 'auto' | 'history' | 'hash';
};
type FathomCommand = {
    type: 'trackPageview';
    opts: PageViewOptions | undefined;
} | {
    type: 'trackGoal';
    code: string;
    cents: number;
} | {
    type: 'trackEvent';
    eventName: string;
    opts: EventOptions | undefined;
} | {
    type: 'blockTrackingForMe';
} | {
    type: 'enableTrackingForMe';
} | {
    type: 'setSite';
    id: string;
};
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
 * Loads the Fathom script.
 *
 * @param siteId - the id for the Fathom site.
 * @param opts - advanced tracking options (https://usefathom.com/support/tracking-advanced)
 */
export declare const load: (siteId: string, opts?: LoadOptions) => void;
/**
 * Tracks a pageview.
 *
 * @param opts - An optional `url` or `referrer` to override auto-detected values.
 */
export declare const trackPageview: (opts?: PageViewOptions) => void;
/**
 * Tracks a goal.
 *
 * @param code - The goal ID.
 * @param cents - The value in cents.
 * @deprecated If you are using this to track an existing goal, however, it will continue to work.
 * @see https://usefathom.com/docs/features/events
 */
export declare const trackGoal: (code: string, cents: number) => void;
/**
 * Tracks a dynamic event.
 *
 * @param eventName - This can be nearly anything you want. Avoid special chars and emojis.
 * @param opts - A collection of options.
 * @param opts._site_id - The site ID (optional).
 * @param opts._value - The value in cents (optional).
 * @see https://usefathom.com/docs/features/events
 */
export declare const trackEvent: (eventName: string, opts?: EventOptions) => void;
/**
 * Blocks tracking for the current visitor.
 *
 * @see https://usefathom.com/docs/features/exclude
 */
export declare const blockTrackingForMe: () => void;
/**
 * Enables tracking for the current visitor.
 *
 * @see https://usefathom.com/docs/features/exclude
 */
export declare const enableTrackingForMe: () => void;
/**
 * Checks if tracking is enabled for the current visitor.
 */
export declare const isTrackingEnabled: () => boolean;
/**
 * Sets the Site ID.
 *
 * @param id - The new site ID.
 */
export declare const setSite: (id: string) => void;
export {};
