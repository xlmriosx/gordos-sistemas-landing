import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, ShieldCheck } from 'lucide-react';
import { Button } from './primitives';
import { Spinner } from './spinner';
import { cn } from '../../lib/utils';

/**
 * PermissionGate: shown before an app opens. Runs a mock "Checking
 * permissions…" check, then lists each required permission as granted or
 * missing. If all are granted the user can enter; if any is missing, entry is
 * blocked behind a "Request access" CTA. `labelFor(id)` resolves permission
 * labels.
 */
export interface PermissionGateProps {
  appName: string;
  /** Permission ids the app consumes. */
  required?: string[];
  /** Permission ids the current user already holds. */
  granted?: string[];
  labelFor?: (id: string) => string;
  onEnter?: () => void;
  onRequestAccess?: (missingIds: string[]) => void;
  onBack?: () => void;
  /** How long the mock verification spins for. */
  checkMs?: number;
}

export function PermissionGate({
  appName,
  required = [],
  granted = [],
  labelFor = (id) => id,
  onEnter,
  onRequestAccess,
  onBack,
  checkMs = 1200,
}: PermissionGateProps) {
  const { t } = useTranslation('ui');
  const [phase, setPhase] = useState<'checking' | 'result'>('checking');
  const [requested, setRequested] = useState(false);
  const key = required.join(',');

  /* Resetting during render instead of from the effect. React documents this as
     the way to adjust state when a prop changes, and it is not the same thing
     as a cascade: it happens before the browser paints, so nobody sees the
     stale phase. Doing it inside the effect below meant the gate rendered once
     with the previous result, then re-rendered as `checking` — a flash of the
     old answer to a question that had already changed. */
  const [checkedKey, setCheckedKey] = useState(key);
  if (checkedKey !== key) {
    setCheckedKey(key);
    setPhase('checking');
    setRequested(false);
  }

  /* The effect keeps only what it is for: a timer, which is an external system,
     and its cleanup. `key` stays in the dependency list even though the body no
     longer reads it, which the linter reports as an extra dependency: it is
     what restarts the countdown when the required set changes, and dropping it
     would leave the gate showing "checking" forever after the second change. */
  useEffect(() => {
    const timer = setTimeout(() => setPhase('result'), checkMs);
    return () => clearTimeout(timer);
  }, [key, checkMs]);

  const checks = required.map((id) => ({ id, label: labelFor(id), ok: granted.includes(id) }));
  const missing = checks.filter((c) => !c.ok);
  const allOk = missing.length === 0;

  return (
    <div className="permission-gate">
      <div className="permission-gate-card">
        <span className="permission-gate-icon" aria-hidden>
          <ShieldCheck size={20} strokeWidth={1.5} />
        </span>
        <h2 className="permission-gate-title">{appName}</h2>
        <p className="permission-gate-sub">{t('permissionGate.intro')}</p>

        {phase === 'checking' ? (
          <div className="permission-gate-checking">
            <Spinner size={16} label={t('permissionGate.checking')} />
            {t('permissionGate.checking')}
          </div>
        ) : (
          <>
            {checks.length === 0 ? (
              <p className="permission-gate-empty">{t('permissionGate.noneRequired')}</p>
            ) : (
              <ul className="permission-gate-list">
                {checks.map((c) => (
                  <li
                    key={c.id}
                    className={cn('permission-gate-item', c.ok ? 'is-ok' : 'is-missing')}
                  >
                    <span className="permission-gate-check" aria-hidden>
                      {c.ok ? <Check size={14} strokeWidth={2} /> : <X size={14} strokeWidth={2} />}
                    </span>
                    <span className="permission-gate-perm">{c.label}</span>
                    <span className="permission-gate-state">
                      {c.ok ? t('permissionGate.hasAccess') : t('permissionGate.noAccess')}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p className="permission-gate-note">
              {allOk ? t('permissionGate.allGranted') : t('permissionGate.someMissing')}
            </p>

            <div className="permission-gate-actions">
              <Button variant="ghost" size="sm" onClick={onBack}>{t('action.back')}</Button>
              {allOk ? (
                <Button variant="solid" size="sm" onClick={onEnter}>
                  {t('permissionGate.openApp')}
                </Button>
              ) : requested ? (
                <Button variant="outline" size="sm" disabled>
                  {t('permissionGate.requestSent')}
                </Button>
              ) : (
                <Button
                  variant="solid"
                  size="sm"
                  onClick={() => {
                    setRequested(true);
                    onRequestAccess?.(missing.map((m) => m.id));
                  }}
                >
                  {t('permissionGate.requestAccess')}
                </Button>
              )}
            </div>

            {requested ? (
              <p className="permission-gate-sent">{t('permissionGate.requestSentNote')}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
