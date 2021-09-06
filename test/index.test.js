import * as Fathom from '../src';

beforeEach(() => {
  window.fathom = undefined;
  delete window.__fathomClientQueue;
});

describe('load', () => {
  beforeEach(() => {
    // reset the script node before each test
    const script = document.getElementById('fathom-script');
    if (script) script.remove();
  });

  it('injects the Fathom script', () => {
    const firstScript = document.createElement('script');
    document.body.appendChild(firstScript);
    Fathom.load();

    const fathomScript = document.getElementById('fathom-script');
    expect(fathomScript.src).toBe('https://cdn.usefathom.com/script.js');
  });

  it('injects the Fathom script with options', () => {
    const firstScript = document.createElement('script');
    document.body.appendChild(firstScript);
    Fathom.load('abcde123', {
      url: 'https://bobheadxi.dev/fathom.js',
      auto: false,
      includedDomains: ['bobheadxi.dev']
    });

    const fathomScript = document.getElementById('fathom-script');
    expect(fathomScript.src).toBe('https://bobheadxi.dev/fathom.js');
    expect(fathomScript.getAttribute('data-included-domains')).toBe(
      'bobheadxi.dev'
    );
    expect(fathomScript.getAttribute('data-auto')).toBe('false');
    expect(fathomScript.getAttribute('data-honor-dnt')).toBe(null);
  });

  it('runs the queue after load', () => {
    Fathom.trackPageview();

    window.fathom = {
      trackPageview: jest.fn(),
      trackGoal: jest.fn()
    };

    const firstScript = document.createElement('script');
    document.body.appendChild(firstScript);
    Fathom.load();

    // simulate 'onload' firing
    const fathomScript = document.getElementById('fathom-script');
    fathomScript.dispatchEvent(new Event('load'));

    expect(window.fathom.trackPageview.mock.calls.length).toBe(1);
  });

  it('warns when loading include domains which are not bare domains', () => {
    window.console = {
      warn: jest.fn()
    };

    const firstScript = document.createElement('script');
    document.body.appendChild(firstScript);
    Fathom.load('abcde123', {
      url: 'https://bobheadxi.dev/fathom.js',
      auto: false,
      includedDomains: ['https://bobheadxi.dev']
    });

    expect(window.console.warn).toHaveBeenCalledWith(
      'The include domain https://bobheadxi.dev might fail to work as intended as it begins with a transfer protocol (http://, https://). Consider removing the protocol portion of the string.'
    );
  });
});

describe('trackPageview', () => {
  it('enqueues the operation if fathom is not loaded', () => {
    Fathom.trackPageview();
    expect(window.__fathomClientQueue).toStrictEqual([
      { type: 'trackPageview', opts: undefined }
    ]);
  });

  it('calls the fathom function if loaded', () => {
    return new Promise(resolve => {
      window.fathom = {
        trackPageview: (...args) => {
          expect(args).toStrictEqual([]);
          resolve();
        },
        trackGoal: jest.fn()
      };

      Fathom.trackPageview();
    });
  });

  it('calls the fathom function with arguments if loaded', () => {
    return new Promise(resolve => {
      window.fathom = {
        trackPageview: (...args) => {
          expect(args).toStrictEqual([{ url: 'https://bobheadxi.dev' }]);
          resolve();
        },
        trackGoal: jest.fn()
      };

      Fathom.trackPageview({ url: 'https://bobheadxi.dev' });
    });
  });
});

describe('trackGoal', () => {
  it('enqueues the operation if fathom is not loaded', () => {
    Fathom.trackGoal('Sign Up', 0);
    expect(window.__fathomClientQueue).toStrictEqual([
      { type: 'trackGoal', code: 'Sign Up', cents: 0 }
    ]);
  });

  it('calls the fathom function if loaded', () => {
    return new Promise(resolve => {
      window.fathom = {
        trackPageview: jest.fn(),
        trackGoal: (...args) => {
          expect(args).toStrictEqual(['Sign Up', 0]);
          resolve();
        }
      };

      Fathom.trackGoal('Sign Up', 0);
    });
  });
});
