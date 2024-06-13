# Fathom Client [![CircleCI](https://circleci.com/gh/derrickreimer/fathom-client.svg?style=svg)](https://circleci.com/gh/derrickreimer/fathom-client)

This library is a JavaScript client for [Fathom Analytics](https://usefathom.com/).

- **Asynchronous script loading.** We provide a `load` function that will asynchronously inject the Fathom `<script>` tag (great for single-page app environments).
- **`import`-able tracking functions.** We provide tracking functions (`trackPageview` and `trackEvent`) that you can import and safely call anywhere (even if the Fathom script has not yet finished loading).

---

Maintained with ♥️ by the [SavvyCal](https://savvycal.com/?utm_source=github&utm_medium=oss&utm_campaign=fathom-client) team

## Installation

Run the following to install in your project:

```
npm install fathom-client
```

## Motivation

The standard installation flow for Fathom is to drop their snippet on your page, which will automatically load the library and track a pageview. This approach works great for server-rendered sites with full page refreshes, but gets tricky when:

- Routing happens on the client-side (e.g. an SPA)
- The DOM is abstracted away (e.g. Next.js)

This library provides an interface you can use to orchestrate Fathom calls at various points in your page lifecycle:

```js
import * as Fathom from 'fathom-client';

// Upon initial page load...
Fathom.load('MY_FATHOM_ID');

// In the route changed event handler...
const onRouteChangeComplete = () => {
  Fathom.trackPageview();
};

// In an event handler where a goal is achieved...
const onSignUp = () => {
  Fathom.trackEvent('Sign Up');
};
```

## API Reference

### `load(siteId: string, opts?: object)`

Injects the Fathom script into the DOM and loads the script asynchronously.

#### Arguments

- `siteId` - The site ID provided in the Fathom UI.
- `opts` - An Object of options:
  - `auto` - When `false`, skips automatically tracking page views on script load (defaults to `true`).
  - `honorDNT` - When `true`, honors the [DNT header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/DNT) in the visitor's browser
  - `canonical` - When `false`, ignores the canonical tag if present (defaults to `true`).
  - `spa` - Accepts one of the following values: `auto`, `history`, or `hash` (see [advanced docs](https://usefathom.com/support/tracking-advanced)).

#### Example

```js
import { load } from 'fathom-client';

load('MY_FATHOM_ID', {
  // Add options here
});
```

### `trackPageview(opts?: object)`

Tracks a pageview.

#### Arguments

- `opts` - An Object of options:
  - `url` - When set, overrides `window.location`.
  - `referrer` - When set, overrides `document.referrer`.

#### Example

```js
import { trackPageview } from 'fathom-client';

trackPageview();
```

### `trackEvent(eventName: string, opts?: object)`

Tracks an event.

See [Creating and using events](https://usefathom.com/docs/features/events).

#### Arguments

- `eventName` - This can be nearly anything you want. Avoid special chars and emojis.
- `opts` - An Object of options:
  - `_site_id` - The Fathom site ID.
  - `_value` - The value of the event (in cents).

#### Example

```js
import { trackEvent } from 'fathom-client';

trackEvent('checkout completed', { _value: 100 });
```

### `trackGoal(code: string, cents: number)`

Tracks a goal. **This is now deprecated, see `trackEvent` instead**.

#### Arguments

- `code` - the code provided in the Fathom UI.
- `cents` - the value of the goal conversion.

#### Example

```js
import { trackGoal } from 'fathom-client';

trackGoal('MY_GOAL_CODE', 100);
```

### `enableTrackingForMe()`

Enables tracking for the current visitor.

See https://usefathom.com/docs/features/exclude.

#### Arguments

None.

#### Example

```js
import { enableTrackingForMe } from 'fathom-client';

enableTrackingForMe();
```

### `blockTrackingForMe()`

Blocks tracking for the current visitor.

See https://usefathom.com/docs/features/exclude.

#### Arguments

None.

#### Example

```js
import { blockTrackingForMe } from 'fathom-client';

blockTrackingForMe();
```

### `isTrackingEnabled()`

Checks if tracking is enabled for the current visitor.

See https://usefathom.com/docs/features/exclude.

#### Arguments

None.

#### Returns

Boolean.

#### Example

```js
import { isTrackingEnabled } from 'fathom-client';

const check = isTrackingEnabled(); // `true` by default
```

### `setSite(id: string)`

Sets the site ID for tracking (overrides the ID used when loading Fathom).

#### Arguments

- `id` - The site ID provided in the Fathom UI.

#### Example

```js
import { load, setSite } from 'fathom-client';

load('MY_FATHOM_ID');

setSite('A_DIFFERENT_FATHOM_ID');
```

## Allowed Domains

Manage your allowed domains within your Fathom site's Firewall settings. Doing so enables the usage of wildcards (e.g., \*.example.com). See https://usefathom.com/docs/script/firewall#allowed

The `includedDomains` and `excludedDomains` options, while deprecated, are still supported to ensure backward compatibility.

## Usage

This library is JavaScript framework-agnostic. Below are some usage examples with popular frameworks.

### Next.js

#### Using `pages` directory (v12 and older)

> If you are using the latest Next.js beta with the `app` directory, see the modified instructions below.

Create an `_app.js` file in your `pages` directory, [like this](https://nextjs.org/docs#custom-app):

```jsx
import React, { useEffect } from 'react';
import Router from 'next/router';
import * as Fathom from 'fathom-client';

// Record a pageview when route changes
Router.events.on('routeChangeComplete', (as, routeProps) => {
  if (!routeProps.shallow) {
    Fathom.trackPageview();
  }
});

function App({ Component, pageProps }) {
  // Initialize Fathom when the app loads
  useEffect(() => {
    Fathom.load('MY_FATHOM_ID', {
      // Add options here
    });
  }, []);

  return <Component {...pageProps} />;
}

export default App;
```

#### Using the experimental `app` directory (v13)

Create a `Fathom` client component:

```tsx
// Fathom.tsx
'use client';

import { load, trackPageview } from 'fathom-client';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load the Fathom script on mount
  useEffect(() => {
    load('MY_FATHOM_ID', {
      auto: false
    });
  }, []);

  // Record a pageview when route changes
  useEffect(() => {
    if (!pathname) return;

    trackPageview({
      url: pathname + searchParams?.toString(),
      referrer: document.referrer
    });
  }, [pathname, searchParams]);

  return null;
}

export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
```

Note that we explicitly pass the `url` to `trackPageview` to avoid race conditions that occur when we allow the Fathom script to infer the URL from the browser.

Then, add the client component to your root `layout.tsx` file:

```tsx
// layout.tsx

import Fathom from './Fathom';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <Fathom />
        {children}
      </body>
    </html>
  );
}
```

## Upgrading to 3.x

The 3.0 release comes with a new way to load Fathom:

```diff
- Fathom.load();
- Fathom.setSiteId('MY_FATHOM_ID');
+ Fathom.load('MY_FATHOM_ID');
```

The `load` function also accepts an object of options:

```js
Fathom.load('MY_FATHOM_ID', {
  // Add options here
});
```

See [advanced options for tracking](https://usefathom.com/support/tracking-advanced).

## Releasing

Run the following to publish a new version:

```bash
npm run release
```
