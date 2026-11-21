import { useEffect, useId, useRef } from 'react';
import { playSfx } from '@/audio/sfx';
import { useUi } from '@/state/ui';
import { Icon } from '../Icon';
import { describePanel } from './registry';

/** The information panel: consistent location, heading, back + close, keyboard friendly (plan §12). */
export function PanelHost() {
  const panels = useUi((s) => s.panels);
  const top = panels[panels.length - 1];
  const headingId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const body = useRef<HTMLDivElement>(null);

  const isOpen = !!top;
  useEffect(() => {
    if (isOpen) {
      restoreFocus.current ??= document.activeElement as HTMLElement | null;
    } else if (restoreFocus.current) {
      restoreFocus.current.focus?.();
      restoreFocus.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!top) return;
    heading.current?.focus();
    body.current?.scrollTo({ top: 0 });
  }, [top]);

  if (!top) return null;
  const v = describePanel(top);
  const ui = useUi.getState();
  const close = () => {
    playSfx('close');
    ui.closePanel();
    ui.setHighlightGroup(null);
  };
  const nav = (p: Parameters<typeof ui.pushPanel>[0]) => {
    playSfx('select');
    useUi.getState().pushPanel(p);
  };

  return (
    <aside className="panel" role="dialog" aria-modal="false" aria-labelledby={headingId}>
      <header className="panel__header">
        {panels.length > 1 && (
          <button
            type="button"
            className="icon-btn"
            onClick={() => useUi.getState().backPanel()}
            aria-label="Back"
          >
            <Icon name="back" />
          </button>
        )}
        <div className="panel__titles">
          <div className="panel__eyebrow">{v.eyebrow}</div>
          <h2 id={headingId} ref={heading} className="panel__title" tabIndex={-1}>
            {v.title}
          </h2>
        </div>
        <button type="button" className="icon-btn" onClick={close} aria-label="Close panel (Escape)">
          <Icon name="close" />
        </button>
      </header>
      <div className="panel__body" ref={body}>
        {v.body(nav)}
      </div>
    </aside>
  );
}
