# Fathom Client [![CircleCI](https://circleci.com/gh/unstacked/fathom-client.svg?style=svg)](https://circleci.com/gh/unstacked/fathom-client)

This library is a JavaScript client for [Fathom Analytics](https://usefathom.com/). It provides a `load` function that will asynchronously inject the Fathom `<script>` tag and tracking functions (`trackPageview` and `trackGoal`) that you can safely call anytime (even if the Fathom script has not yet finished loading).

Extracted from the [StaticKit](https://statickit.com) website.

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
  excludedDomains: ['localhost']
});
```

See [advanced options for tracking](https://usefathom.com/support/tracking-advanced).

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
Fathom.load('YOUR_FATHOM_ID');

// In the route changed event handler...
const onRouteChangeComplete = () => {
  Fathom.trackPageview();
};

// In an event handler where a goal is achieved...
const onSignUp = () => {
  Fathom.trackGoal('Sign Up', 100);
};
```

## Usage

### Next.js

Create an `_app.js` file in your `pages` directory, [like this](https://nextjs.org/docs#custom-app):

```jsx
import React, { useEffect } from 'react';
import Router from 'next/router';
import * as Fathom from 'fathom-client';

// Record a pageview when route changes
Router.events.on('routeChangeComplete', () => {
  Fathom.trackPageview();
});

function App({ Component, pageProps }) {
  // Initialize Fathom when the app loads
  useEffect(() => {
    Fathom.load('ZREWXXJZ', {
      excludedDomains: ['localhost']
    });
  }, []);

  return <Component {...pageProps} />;
}

export default App;
```

## Releasing

Run the following to publish a new version:

```bash
npm run release
```
