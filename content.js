(() => {
  const TARGET = 'Noto Sans JP';
  const MARK = 'data-inter-noto-processed';
  const processed = new WeakMap();

  function hasInter(fontFamily) {
    return /\bInter\b/i.test(fontFamily || '');
  }

  function hasNoto(fontFamily) {
    return /["']?Noto Sans JP["']?/i.test(fontFamily || '');
  }

  function normalizeInterToken(token) {
    const trimmed = token.trim();
    const unquoted = trimmed.replace(/^["']|["']$/g, '');
    return /^Inter$/i.test(unquoted);
  }

  function splitFontFamily(fontFamily) {
    const parts = [];
    let current = '';
    let quote = null;

    for (let i = 0; i < fontFamily.length; i++) {
      const ch = fontFamily[i];
      if ((ch === '"' || ch === "'")) {
        if (quote === ch) {
          quote = null;
        } else if (!quote) {
          quote = ch;
        }
        current += ch;
      } else if (ch === ',' && !quote) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) {
      parts.push(current.trim());
    }
    return parts;
  }

  function insertNotoAfterInter(fontFamily) {
    if (!fontFamily || !hasInter(fontFamily) || hasNoto(fontFamily)) {
      return fontFamily;
    }

    const parts = splitFontFamily(fontFamily);
    const result = [];

    for (const part of parts) {
      result.push(part);
      if (normalizeInterToken(part)) {
        result.push(`"${TARGET}"`);
      }
    }

    return result.join(', ');
  }

  function applyToElement(el) {
    if (!(el instanceof Element)) return;
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return;

    let sourceFontFamily = '';
    let existingInline = el.style && el.style.fontFamily ? el.style.fontFamily : '';

    if (existingInline && hasInter(existingInline)) {
      sourceFontFamily = existingInline;
    } else {
      const computed = getComputedStyle(el).fontFamily || '';
      if (!hasInter(computed)) return;
      sourceFontFamily = computed;
    }

    const updated = insertNotoAfterInter(sourceFontFamily);
    if (!updated || updated === sourceFontFamily) return;

    const prev = processed.get(el);
    if (prev === updated) return;

    el.style.setProperty('font-family', updated, 'important');
    el.setAttribute(MARK, '1');
    processed.set(el, updated);
  }

  function walkAndApply(root) {
    if (!root) return;

    if (root instanceof Element) {
      applyToElement(root);
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      null
    );

    let node = walker.currentNode;
    while (node) {
      if (node instanceof Element) {
        applyToElement(node);
      }
      node = walker.nextNode();
    }
  }

  function schedule(root) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => walkAndApply(root), { timeout: 1000 });
    } else {
      setTimeout(() => walkAndApply(root), 50);
    }
  }

  function handleMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) schedule(node);
        });
      } else if (mutation.type === 'attributes') {
        if (mutation.target instanceof Element) {
          schedule(mutation.target);
        }
      }
    }
  }

  function boot() {
    schedule(document.documentElement);

    const observer = new MutationObserver(handleMutations);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
