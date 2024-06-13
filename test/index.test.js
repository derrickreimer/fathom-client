/**
 * @jest-environment jsdom
 */

const Fathom = require('../dist/fathom-script');

const fathomStub = () => {
  return {
    setSite: jest.fn(),
    trackPageview: jest.fn(),
    trackGoal: jest.fn(),
    trackEvent: jest.fn(),
    blockTrackingForMe: jest.fn(),
    enableTrackingForMe: jest.fn()
  };
};

beforeEach(() => {
  window.fathom = undefined;
  delete window.__fathomIsLoading;
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
    Fathom.load('id');

    const fathomScript = document.getElementById('fathom-script');
    expect(fathomScript?.src).toBe('https://cdn.usefathom.com/script.js');
  });

  it('skips injecting the script if already loaded or currently loading', () => {
    // simulate the script already being loaded
    Fathom.load('id');
    // ↓
    window.fathom = fathomStub();

    const firstScript = document.createElement('script');
    document.body.appendChild(firstScript);
    Fathom.load('id');

    const fathomScripts = Array.from(
      document.getElementsByTagName('script')
    ).filter(s => {
      return s.src == 'https://cdn.usefathom.com/script.js';
    });

    expect(fathomScripts.length).toBe(1);

    // simulate 'onload' firing
    const fathomScript = document.getElementById('fathom-script');
    fathomScript?.dispatchEvent(new Event('load'));

    expect(window.__fathomIsLoading).toBe(false);
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
    expect(fathomScript?.src).toBe('https://bobheadxi.dev/fathom.js');
    expect(fathomScript?.getAttribute('data-included-domains')).toBe(
      'bobheadxi.dev'
    );
    expect(fathomScript?.getAttribute('data-auto')).toBe('false');
    expect(fathomScript?.getAttribute('data-honor-dnt')).toBe(null);
  });

  it('runs the queue after load', () => {
    Fathom.trackPageview();

    const firstScript = document.createElement('script');
    document.body.appendChild(firstScript);

    Fathom.load('id');
    // ↓
    window.fathom = fathomStub();

    // simulate 'onload' firing
    const fathomScript = document.getElementById('fathom-script');
    fathomScript?.dispatchEvent(new Event('load'));

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
        trackGoal: jest.fn(),
        trackEvent: jest.fn()
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
        trackGoal: jest.fn(),
        trackEvent: jest.fn()
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

describe('trackEvent', () => {
  it('enqueues the operation if fathom is not loaded', () => {
    Fathom.trackEvent('dynamic event test', { _value: 0 });
    expect(window.__fathomClientQueue).toStrictEqual([
      {
        type: 'trackEvent',
        eventName: 'dynamic event test',
        opts: { _value: 0 }
      }
    ]);
  });

  it('calls the fathom function if loaded', () => {
    return new Promise(resolve => {
      window.fathom = {
        trackPageview: jest.fn(),
        trackEvent: (...args) => {
          expect(args).toStrictEqual(['dynamic event test', { _value: 0 }]);
          resolve();
        }
      };

      Fathom.trackEvent('dynamic event test', {
        _value: 0
      });
    });
  });
});

describe('enableTrackingForMe', () => {
  it('enqueues the operation if fathom is not loaded', () => {
    Fathom.enableTrackingForMe();
    expect(window.__fathomClientQueue).toStrictEqual([
      { type: 'enableTrackingForMe' }
    ]);
  });

  it('calls the fathom function if loaded', () => {
    return new Promise(resolve => {
      window.fathom = {
        trackPageview: jest.fn(),
        enableTrackingForMe: () => {
          resolve();
        }
      };

      Fathom.enableTrackingForMe();
    });
  });
});

describe('blockTrackingForMe', () => {
  it('enqueues the operation if fathom is not loaded', () => {
    Fathom.blockTrackingForMe();
    expect(window.__fathomClientQueue).toStrictEqual([
      { type: 'blockTrackingForMe' }
    ]);
  });

  it('calls the fathom function if loaded', () => {
    return new Promise(resolve => {
      window.fathom = {
        trackPageview: jest.fn(),
        blockTrackingForMe: () => {
          resolve();
        }
      };

      Fathom.blockTrackingForMe();
    });
  });
});

describe('isTrackingEnabled', () => {
  beforeEach(() => localStorage.clear);
  const key = 'blockFathomTracking';

  it("returns `true` if the localStorage value doesn't exist", () => {
    const response = Fathom.isTrackingEnabled();
    expect(localStorage.getItem).toHaveBeenLastCalledWith(key);
    expect(response).toBe(true);
  });
  it("returns `false` when the localStorage value contains string 'true'", () => {
    localStorage.setItem(key, 'true');

    const response = Fathom.isTrackingEnabled();
    expect(localStorage.getItem).toHaveBeenLastCalledWith(key);
    expect(response).toBe(false);
  });
  it("treats localStorage values other than 'true' as non-truthy", () => {
    localStorage.setItem(key, 'function nonsense(){ return "noodle"; }');

    const response = Fathom.isTrackingEnabled();
    expect(localStorage.getItem).toHaveBeenLastCalledWith(key);
    expect(response).toBe(true);
  });
});

describe('setSite', () => {
  it('enqueues the operation if fathom is not loaded', () => {
    Fathom.setSite('NEW_ID');
    expect(window.__fathomClientQueue).toStrictEqual([
      { type: 'setSite', id: 'NEW_ID' }
    ]);
  });

  it('calls the fathom function if loaded', () => {
    return new Promise(resolve => {
      window.fathom = {
        setSite: id => {
          expect(id).toStrictEqual('NEW_ID');
          resolve();
        }
      };

      Fathom.setSite('NEW_ID');
    });
  });
});
