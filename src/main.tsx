import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Support standalone Vite mode (#root) and WordPress Plugin embedding (.spv-mount-target, #spv-root, plus backward-compatible legacy containers)
function mountSportavand() {
  // 1. Standalone Vite environment
  const standalone = document.getElementById('root');
  if (standalone && !standalone.dataset.spvMounted) {
    standalone.dataset.spvMounted = 'true';
    standalone.classList.add('spv-scope');
    standalone.setAttribute('dir', 'rtl');
    createRoot(standalone).render(<App initialMode="auto" />);
    return;
  }

  // 2. WordPress shortcodes and admin screens (canonical spv-* + legacy fallback)
  const targets = document.querySelectorAll<HTMLElement>(
    '.spv-mount-target, #spv-root, .sportnova-mount-target, #sportnova-root'
  );
  targets.forEach((target) => {
    if (target.dataset.spvMounted) return;
    target.dataset.spvMounted = 'true';
    target.classList.add('spv-scope');
    target.setAttribute('dir', 'rtl');

    const parentContainer = target.closest<HTMLElement>('.spv-app-container, .sportnova-app-container, .spv-admin-wrap');
    if (parentContainer) {
      parentContainer.classList.add('spv-scope');
      parentContainer.setAttribute('dir', 'rtl');
    }

    const wpSettings = typeof window !== 'undefined' ? (window as any).sportavandSettings : undefined;
    const mode = (target.getAttribute('data-mode') || wpSettings?.defaultMode || 'auto') as any;
    const initialTab = (target.getAttribute('data-tab') || wpSettings?.defaultTab || '') as any;
    const presetId = target.getAttribute('data-preset-id') || '17';
    const teamId = target.getAttribute('data-team-id') || 'default';

    createRoot(target).render(
      <App initialMode={mode} initialTab={initialTab} presetId={presetId} teamId={teamId} />
    );
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSportavand);
  } else {
    mountSportavand();
  }
}
