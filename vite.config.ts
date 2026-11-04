import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/**
 * Unwraps Tailwind v4 @layer blocks and elevates utility declarations with !important
 * so that WordPress Core (wp-admin, forms.min.css, common.min.css) and WordPress themes
 * (Elementor, Astra, Hello Elementor) can never override Sportavand's Tailwind styles.
 */
function unwrapAndIsolateTailwindCss(css: string): string {
  function findMatchingBrace(str: string, openBracePos: number): number {
    let depth = 0;
    let inString = false;
    let quoteChar = '';
    let inComment = false;

    for (let i = openBracePos; i < str.length; i++) {
      const ch = str[i];
      const next = i + 1 < str.length ? str[i + 1] : '';
      const prev = i > 0 ? str[i - 1] : '';

      if (inComment) {
        if (ch === '*' && next === '/') {
          inComment = false;
          i++;
        }
        continue;
      }
      if (!inString && ch === '/' && next === '*') {
        inComment = true;
        i++;
        continue;
      }
      if (inString) {
        if (ch === quoteChar && prev !== '\\') {
          inString = false;
        }
        continue;
      }
      if (ch === '"' || ch === "'") {
        inString = true;
        quoteChar = ch;
        continue;
      }
      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  // Remove empty @layer statements like `@layer components;`
  let out = css.replace(/@layer\s+[a-zA-Z0-9_,\s-]+\s*;/g, '');

  const layerRegex = /@layer\s+([a-zA-Z0-9_-]+)\s*\{/;
  let match: RegExpExecArray | null;

  while ((match = layerRegex.exec(out)) !== null) {
    const layerName = match[1];
    const startIdx = match.index;
    const openBraceIdx = startIdx + match[0].length - 1;
    const closeBraceIdx = findMatchingBrace(out, openBraceIdx);

    if (closeBraceIdx === -1) break;

    let innerContent = out.slice(openBraceIdx + 1, closeBraceIdx);

    if (layerName === 'theme') {
      // Attach .spv-scope and #spv-root to :root, :host so Tailwind theme variables are always available inside WP
      innerContent = innerContent.replace(
        /:root,\s*:host\s*\{/g,
        ':root, :host, .spv-scope, .spv-app-container, #spv-root {'
      );
    } else if (layerName === 'base') {
      // Scope Tailwind base preflight strictly inside .spv-scope so it never leaks to WordPress admin sidebar or theme
      innerContent = innerContent.replace(/html,\s*:host\s*\{/g, '&, :host {');
      innerContent = `\n.spv-scope {\n${innerContent}\n}\n`;
    } else if (layerName === 'utilities') {
      // Add !important to standard and vendor-prefixed CSS declarations inside utilities (skipping --tw-* custom properties)
      innerContent = innerContent.replace(
        /^(\s*)(-?[a-zA-Z][a-zA-Z0-9-]*)\s*:\s*([^;{}!]+);/gm,
        '$1$2: $3 !important;'
      );
    }

    out = out.slice(0, startIdx) + innerContent + out.slice(closeBraceIdx + 1);
  }

  return out;
}

function sportavandWpCssIsolation(): Plugin {
  return {
    name: 'sportavand-wp-css-isolation',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('.css') && code.includes('@layer')) {
        return {
          code: unwrapAndIsolateTailwindCss(code),
          map: null,
        };
      }
    },
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        const chunk = bundle[fileName];
        if (chunk.type === 'asset' && fileName.endsWith('.css') && typeof chunk.source === 'string') {
          chunk.source = unwrapAndIsolateTailwindCss(chunk.source);
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sportavandWpCssIsolation()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      cssMinify: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
