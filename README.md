# Fathom Client [![CircleCI](https://circleci.com/gh/unstacked/fathom-client.svg?style=svg)](https://circleci.com/gh/unstacked/fathom-client)

A [Fathom Analytics](https://usefathom.com/) wrapper for environments with client-side routing.

## Installation

Run the following to install in your project:

```
npm i fathom-client
```

## Motivation

The standard installation flow for Fathom is to drop their snippet on your page, which will automatically load the library and track a pageview:

```html
<!-- Fathom - simple website analytics - https://usefathom.com -->
<script>
  (function(f, a, t, h, o, m) {
    a[h] =
      a[h] ||
      function() {
        (a[h].q = a[h].q || []).push(arguments);
      };
    (o = f.createElement('script')), (m = f.getElementsByTagName('script')[0]);
    o.async = 1;
    o.src = t;
    o.id = 'fathom-script';
    m.parentNode.insertBefore(o, m);
  })(document, window, '//cdn.usefathom.com/tracker.js', 'fathom');
  fathom('set', 'siteId', 'XXXXXXXX');
  fathom('trackPageview');
</script>
<!-- / Fathom -->
```

Applying this approach gets tricky where:

- Routing happens on the client-side (e.g. an SPA)
- The DOM is abstracted away (e.g. a fully React-based site like Next.js)

This library provides an interface you can use at various points in your page lifecycle to orchestrate Fathom calls:

```js
import Fathom from 'fathom-client';

// Upon initial page load...
Fathom.load();
Fathom.setSiteId('XXXXXXXX');
Fathom.trackPageview();

// In the route changed event handler...
const onRouteChangeComplete = () => {
  Fathom.trackPageview();
};

// In an event handler where a goal is achieved...
const onSignUp = () => {
  Fathom.trackGoal('Sign Up', 100);
};
```

## Releasing

Run the following to publish a new version:

```bash
npm run release
```
