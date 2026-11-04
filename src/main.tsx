import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Support standalone Vite mode (#root) and WordPress Plugin embedding (.spv-mount-target, #spv-root, plus backward-compatible legacy containers)
function mountSportavand() {
  // 1. Standalone Vite environment
  const standalone = document.getElementById('root');
  if (standalone && !standalone.dataset.spvMounted) {
    standalone.dataset.spvMounted = 'true';
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

    const mode = (target.getAttribute('data-mode') || 'auto') as any;
    const presetId = target.getAttribute('data-preset-id') || '17';
    const teamId = target.getAttribute('data-team-id') || 'default';

    createRoot(target).render(
      <App initialMode={mode} presetId={presetId} teamId={teamId} />
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
