import '@testing-library/jest-dom/vitest';

if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = function () {
    const animation = {
      onfinish: null as any,
      finish() {
        if (typeof this.onfinish === 'function') this.onfinish();
      },
      cancel() {}
    };
    // Svelte expects the animation to trigger finish asynchronously or synchronously
    setTimeout(() => {
      if (typeof animation.onfinish === 'function') animation.onfinish();
    }, 0);
    return animation as any;
  };
}

