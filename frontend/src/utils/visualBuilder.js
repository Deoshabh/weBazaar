const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

export const parseMaybeJson = (value, fallback = null) => {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getByPath = (source, path) => {
  if (!path || !isObject(source)) return undefined;
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), source);
};

export const resolveDynamicString = (value, context = {}) => {
  if (typeof value !== 'string') return value;

  return value.replace(/\{\{\s*([\w.[\]]+)\s*\}\}/g, (_, token) => {
    const normalizedToken = String(token).replace(/\[(\w+)\]/g, '.$1');
    const resolved = getByPath(context, normalizedToken);
    return resolved == null ? '' : String(resolved);
  });
};

export const resolveDynamicObject = (value, context = {}) => {
  if (Array.isArray(value)) {
    return value.map((item) => resolveDynamicObject(item, context));
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, resolveDynamicObject(nested, context)]),
    );
  }

  return resolveDynamicString(value, context);
};

const isDateInRange = (start, end, now = Date.now()) => {
  const startMs = start ? Date.parse(start) : null;
  const endMs = end ? Date.parse(end) : null;

  if (Number.isFinite(startMs) && now < startMs) return false;
  if (Number.isFinite(endMs) && now > endMs) return false;
  return true;
};

export const evaluateVisibilityRules = (rules, runtime = {}) => {
  const normalizedRules = parseMaybeJson(rules, rules);
  if (!normalizedRules || !isObject(normalizedRules)) return true;

  const { device, pathname, query, isLoggedIn } = runtime;

  if (Array.isArray(normalizedRules.devices) && normalizedRules.devices.length > 0) {
    if (!normalizedRules.devices.includes(device)) return false;
  }

  if (typeof normalizedRules.loggedInOnly === 'boolean') {
    if (normalizedRules.loggedInOnly && !isLoggedIn) return false;
    if (!normalizedRules.loggedInOnly && isLoggedIn) return false;
  }

  if (Array.isArray(normalizedRules.routes) && normalizedRules.routes.length > 0) {
    if (!normalizedRules.routes.some((route) => String(pathname || '').startsWith(String(route)))) {
      return false;
    }
  }

  if (isObject(normalizedRules.queryParam)) {
    const key = normalizedRules.queryParam.key;
    const expected = normalizedRules.queryParam.value;
    if (key) {
      const actual = query?.get?.(key) ?? null;
      if (expected != null && String(actual ?? '') !== String(expected)) return false;
      if (expected == null && !actual) return false;
    }
  }

  if (!isDateInRange(normalizedRules.startAt, normalizedRules.endAt)) return false;

  return true;
};

const hashString = (input) => {
  const str = String(input || '');
  let hash = 0;
  for (let index = 0; index < str.length; index += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const resolveExperimentVariant = (experiments, seedKey = '') => {
  const normalizedExperiments = parseMaybeJson(experiments, experiments);
  if (!normalizedExperiments?.enabled || !Array.isArray(normalizedExperiments.variants)) return null;

  const variants = normalizedExperiments.variants.filter((variant) => (variant?.weight ?? 0) > 0);
  if (variants.length === 0) return null;

  const totalWeight = variants.reduce((sum, variant) => sum + Number(variant.weight || 0), 0);
  if (totalWeight <= 0) return null;

  const bucket = hashString(seedKey) % totalWeight;
  let cursor = 0;
  for (const variant of variants) {
    cursor += Number(variant.weight || 0);
    if (bucket < cursor) return variant;
  }

  return variants[0] || null;
};

const sanitizeCss = (cssText = '') =>
  String(cssText)
    .replace(/<\/?style[^>]*>/gi, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript\s*:/gi, '');

const MAX_SCOPED_CSS_LENGTH = 4500;

export const compileScopedCss = (scopeSelector, cssText = '') => {
  const cleaned = sanitizeCss(cssText).trim();
  if (!cleaned) return '';
  if (cleaned.length > MAX_SCOPED_CSS_LENGTH) {
    return '';
  }

  if (cleaned.includes('{{scope}}')) {
    return cleaned.replaceAll('{{scope}}', scopeSelector);
  }

  if (!cleaned.includes('{')) {
    return `${scopeSelector} { ${cleaned} }`;
  }

  return cleaned.replace(/(^|})\s*([^@}{][^{}]*)\{/g, (full, boundary, selector) => {
    const selectorText = String(selector).trim();
    if (!selectorText) return full;

    const scopedSelector = selectorText
      .split(',')
      .map((item) => `${scopeSelector} ${item.trim()}`)
      .join(', ');

    return `${boundary} ${scopedSelector} {`;
  });
};

export const resolveResponsiveProps = (props = {}, device = 'desktop') => {
  if (!isObject(props)) return {};

  const responsive = isObject(props.responsive) ? props.responsive : {};
  const desktopProps = isObject(responsive.desktop) ? responsive.desktop : {};
  const tabletProps = isObject(responsive.tablet) ? responsive.tablet : {};
  const mobileProps = isObject(responsive.mobile) ? responsive.mobile : {};

  const deviceOverride =
    device === 'mobile'
      ? { ...desktopProps, ...tabletProps, ...mobileProps }
      : device === 'tablet'
        ? { ...desktopProps, ...tabletProps }
        : desktopProps;

  return {
    ...props,
    ...deviceOverride,
  };
};

export const compileGlobalClassCss = (scopeSelector, classStyles) => {
  const normalized = parseMaybeJson(classStyles, classStyles);
  if (!isObject(normalized)) return '';

  const blocks = Object.entries(normalized)
    .map(([className, cssText]) => {
      if (!className || !cssText) return '';
      const safeClass = String(className).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!safeClass) return '';
      return compileScopedCss(`${scopeSelector} .${safeClass}`, String(cssText));
    })
    .filter(Boolean);

  return blocks.join('\n');
};

const walkBlocks = (blocks = [], depth = 1, state = { count: 0, maxDepth: 0, imageCount: 0, animatedCount: 0 }) => {
  const normalized = Array.isArray(blocks) ? blocks : [];
  state.maxDepth = Math.max(state.maxDepth, depth);

  normalized.forEach((node) => {
    if (!node) return;
    state.count += 1;

    const type = node.type || 'text';
    if (type === 'image') state.imageCount += 1;

    const hasAnimation = Boolean(node?.props?.animation || node?.props?.transition || node?.props?.motion);
    if (hasAnimation) state.animatedCount += 1;

    if (Array.isArray(node.children) && node.children.length > 0) {
      walkBlocks(node.children, depth + 1, state);
    }
  });

  return state;
};

export const analyzeBlockPerformance = (blocks = []) => {
  const metrics = walkBlocks(parseMaybeJson(blocks, blocks) || []);
  const score =
    metrics.count * 1 +
    metrics.imageCount * 2 +
    metrics.animatedCount * 2 +
    Math.max(0, metrics.maxDepth - 3) * 2;

  let level = 'low';
  if (score >= 30) level = 'high';
  else if (score >= 16) level = 'medium';

  return {
    ...metrics,
    score,
    level,
  };
};

export const lintCssContent = (cssText = '') => {
  const warnings = [];
  const text = String(cssText || '');

  if (!text.trim()) return warnings;

  if (text.length > 2200) {
    warnings.push('Custom CSS is large; consider splitting into global classes.');
  }
  if (/!important/gi.test(text)) {
    warnings.push('Avoid !important to keep styles maintainable.');
  }
  if (/\*\s*\{/g.test(text)) {
    warnings.push('Universal selector (*) can hurt performance in large trees.');
  }
  if (/position\s*:\s*fixed/gi.test(text)) {
    warnings.push('Fixed positioning may overlap editor overlays on some devices.');
  }

  return warnings;
};
