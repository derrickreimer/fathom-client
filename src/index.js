const ensureFathom = () => {
  window.fathom =
    window.fathom ||
    function() {
      (window.fathom.q = window.fathom.q || []).push(arguments);
    };
};

const load = () => {
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
};

const setSiteId = siteId => {
  ensureFathom();
  window.fathom('set', 'siteId', siteId);
};

const trackPageview = () => {
  ensureFathom();
  window.fathom('trackPageview');
};

const trackGoal = (id, cents) => {
  ensureFathom();
  window.fathom('trackGoal', id, cents);
};

export default { load, setSiteId, trackPageview, trackGoal };
