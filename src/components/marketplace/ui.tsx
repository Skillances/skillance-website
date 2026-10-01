/**
 * Marketplace UI primitives. Colors come only from `mk-*` Tailwind tokens
 * (src/lib/marketplace/theme.ts). Motion respects prefers-reduced-motion.
 */
import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useId,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Check, ChevronDown, Loader2, RotateCw, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marketplaceCssVars, mkMotion } from '@/lib/marketplace/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/* ------------------------------------------------------------------ Buttons */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';

const buttonVariant: Record<ButtonVariant, string> = {
  primary: 'bg-mk-primary text-mk-on-primary hover:bg-mk-secondary',
  secondary: 'bg-mk-surface text-mk-text-primary border border-mk-border hover:bg-mk-muted',
  ghost: 'bg-transparent text-mk-text-primary hover:bg-mk-muted',
  danger: 'bg-mk-error text-mk-on-primary hover:opacity-90',
  'danger-outline': 'bg-mk-surface text-mk-error border border-mk-border hover:bg-mk-muted',
};

export type MkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  block?: boolean;
  size?: 'md' | 'sm';
};

const mkButtonClass = (variant: ButtonVariant = 'primary', opts?: { block?: boolean; size?: 'md' | 'sm' }) =>
  cn(
    'inline-flex select-none items-center justify-center gap-2 rounded-xl font-mk-display font-semibold',
    'min-h-11 transition-[background-color,color,opacity,transform] duration-150 ease-out',
    'active:scale-[0.97] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50',
    opts?.size === 'sm' ? 'px-3.5 text-[13px]' : 'px-5 text-[15px]',
    opts?.block && 'w-full',
    buttonVariant[variant],
  );

export const MkButton = forwardRef<HTMLButtonElement, MkButtonProps>(function MkButton(
  { variant = 'primary', loading, block, size, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(mkButtonClass(variant, { block, size }), className)}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export function MkLinkButton({
  to,
  variant = 'primary',
  block,
  size,
  className,
  children,
  state,
}: {
  to: string;
  variant?: ButtonVariant;
  block?: boolean;
  size?: 'md' | 'sm';
  className?: string;
  children: ReactNode;
  state?: unknown;
}) {
  return (
    <Link to={to} state={state} className={cn(mkButtonClass(variant, { block, size }), className)}>
      {children}
    </Link>
  );
}

export function MkIconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-mk-text-primary',
        'transition-[background-color,transform] duration-150 ease-out hover:bg-mk-muted active:scale-[0.94] motion-reduce:active:scale-100',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Fields */

const controlClass =
  'w-full rounded-xl bg-mk-muted px-4 text-[15px] text-mk-text-primary placeholder:text-mk-text-tertiary ' +
  'border border-transparent transition-[border-color,background-color] duration-150 ease-out ' +
  'focus:border-mk-primary focus:bg-mk-surface focus:outline-none focus-visible:outline-none ' +
  'disabled:opacity-60 aria-[invalid=true]:border-mk-error';

function FieldShell({
  id,
  label,
  error,
  hint,
  children,
  optional,
}: {
  id: string;
  label?: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block font-mk-display text-[13px] font-semibold text-mk-text-primary">
          {label}
          {optional && <span className="ml-1 font-normal text-mk-text-tertiary">(optional)</span>}
        </label>
      )}
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="err"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mkMotion.control }}
            className="text-[13px] text-mk-error"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p key="hint" id={`${id}-hint`} className="text-[13px] text-mk-text-tertiary">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type FieldExtras = { label?: ReactNode; error?: string | null; hint?: ReactNode; optional?: boolean };

export const MkInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldExtras>(
  function MkInput({ label, error, hint, optional, id, className, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <FieldShell id={fid} label={label} error={error} hint={hint} optional={optional}>
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
          className={cn(controlClass, 'h-12', className)}
          {...rest}
        />
      </FieldShell>
    );
  },
);

export const MkTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldExtras>(
  function MkTextarea({ label, error, hint, optional, id, className, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <FieldShell id={fid} label={label} error={error} hint={hint} optional={optional}>
        <textarea
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
          className={cn(controlClass, 'min-h-[104px] py-3 leading-relaxed', className)}
          {...rest}
        />
      </FieldShell>
    );
  },
);

/** Radix items cannot use an empty string. Mapped back to "" for existing onChange handlers. */
const SELECT_EMPTY = '__mk_empty__';

type SelectOption = { value: string; label: string; disabled: boolean };
type SelectGroup = { label?: string; options: SelectOption[] };

function optionText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(optionText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return optionText(node.props.children);
  return '';
}

function readOption(node: ReactNode): SelectOption | null {
  if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(node)) return null;
  if (node.type !== 'option') return null;
  return {
    value: node.props.value == null ? '' : String(node.props.value),
    label: optionText(node.props.children).trim(),
    disabled: Boolean(node.props.disabled),
  };
}

/** Reads `<option>` and `<optgroup>` children, including fragments and arrays. */
function parseSelectChildren(children: ReactNode): { placeholder?: string; groups: SelectGroup[] } {
  const groups: SelectGroup[] = [];
  const loose: SelectOption[] = [];
  let placeholder: string | undefined;

  const flush = () => {
    if (loose.length > 0) groups.push({ options: loose.splice(0, loose.length) });
  };

  const walk = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement<{ children?: ReactNode; label?: string }>(child)) return;
      if (child.type === Fragment) {
        walk(child.props.children);
        return;
      }
      if (child.type === 'optgroup') {
        flush();
        const options: SelectOption[] = [];
        Children.forEach(child.props.children, (opt) => {
          const parsed = readOption(opt);
          if (parsed) options.push(parsed);
        });
        groups.push({ label: child.props.label, options });
        return;
      }
      const parsed = readOption(child);
      if (parsed) loose.push(parsed);
    });
  };

  walk(children);
  flush();

  for (const group of groups) {
    group.options = group.options.filter((opt) => {
      if (opt.disabled && opt.value === '') {
        placeholder = opt.label;
        return false;
      }
      return true;
    });
  }

  return { placeholder, groups: groups.filter((group) => group.options.length > 0) };
}

function toItemValue(value: string): string {
  return value === '' ? SELECT_EMPTY : value;
}

export const MkSelect = forwardRef<HTMLButtonElement, SelectHTMLAttributes<HTMLSelectElement> & FieldExtras>(
  function MkSelect({ label, error, hint, optional, id, className, children, value, defaultValue, onChange, disabled, name }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    const { placeholder, groups } = parseSelectChildren(children);
    const current = String(value ?? defaultValue ?? '');
    const hasEmptyChoice = groups.some((group) => group.options.some((opt) => opt.value === ''));
    const radixValue = current === '' ? (hasEmptyChoice ? SELECT_EMPTY : '') : current;
    const describedBy = error ? `${fid}-error` : hint ? `${fid}-hint` : undefined;

    const choose = (next: string) => {
      const mapped = next === SELECT_EMPTY ? '' : next;
      onChange?.({ target: { value: mapped }, currentTarget: { value: mapped } } as ChangeEvent<HTMLSelectElement>);
    };

    return (
      <FieldShell id={fid} label={label} error={error} hint={hint} optional={optional}>
        {name ? <input type="hidden" name={name} value={current} /> : null}
        <SelectPrimitive.Root
          value={radixValue}
          onValueChange={choose}
          disabled={disabled}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={fid}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(controlClass, 'flex h-12 items-center justify-between gap-2 text-left', className)}
          >
            <SelectPrimitive.Value placeholder={placeholder} className="truncate data-[placeholder]:text-mk-text-tertiary" />
            <SelectPrimitive.Icon className="shrink-0 text-mk-text-tertiary">
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              collisionPadding={12}
              className={cn(
                'mk-scope z-[100] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-mk-border bg-mk-surface p-1 shadow-mk-card',
                'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]',
                'motion-reduce:animate-none',
              )}
              style={marketplaceCssVars()}
            >
              <SelectPrimitive.Viewport className="max-h-64 overflow-y-auto p-1">
                {groups.map((group, index) => (
                  <SelectPrimitive.Group key={group.label ?? `group-${index}`}>
                    {group.label ? (
                      <SelectPrimitive.Label className="px-3 pb-1 pt-2 text-[12px] font-semibold text-mk-text-tertiary">
                        {group.label}
                      </SelectPrimitive.Label>
                    ) : null}
                    {group.options.map((opt) => (
                      <SelectPrimitive.Item
                        key={`${group.label ?? ''}:${opt.value}`}
                        value={toItemValue(opt.value)}
                        disabled={opt.disabled}
                        className={cn(
                          'relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-3 pr-9 text-left text-[15px] text-mk-text-primary outline-none',
                          'data-[highlighted]:bg-mk-muted data-[state=checked]:font-semibold',
                          'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                        )}
                      >
                        <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                        <SelectPrimitive.ItemIndicator className="absolute right-3">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </SelectPrimitive.ItemIndicator>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.Group>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </FieldShell>
    );
  },
);

/** Form-level error (one message from the API) shown above the primary action. */
export function MkFormError({ message }: { message?: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          key={message}
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: mkMotion.control }}
          className="flex gap-2.5 rounded-xl border border-mk-border bg-mk-surface p-3 text-[14px] text-mk-error"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function MkSwitch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
}) {
  const auto = useId();
  const sid = id ?? auto;
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <label htmlFor={sid} className="min-w-0 flex-1 cursor-pointer">
        <span className="block font-mk-display text-[15px] font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-mk-text-secondary">{description}</span>}
      </label>
      <SwitchPrimitive.Root
        id={sid}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-mk-border transition-colors duration-200 ease-out data-[state=checked]:bg-mk-accent disabled:opacity-50"
      >
        <SwitchPrimitive.Thumb className="block h-[27px] w-[27px] translate-x-[2px] rounded-full bg-mk-surface shadow-mk-avatar transition-transform duration-200 ease-out data-[state=checked]:translate-x-[22px]" />
      </SwitchPrimitive.Root>
    </div>
  );
}

/* --------------------------------------------------------------- Surfaces */

export function MkCard({
  className,
  children,
  as: As = 'div',
}: {
  className?: string;
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return <As className={cn('rounded-2xl border border-mk-border bg-mk-surface p-4', className)}>{children}</As>;
}

export function MkSectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[17px] text-mk-text-primary">{children}</h2>
      {action}
    </div>
  );
}

export function MkPageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** `true` goes back in history; a string navigates there. */
  back?: boolean | string;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="mb-5 flex items-start gap-2">
      {back && (
        <MkIconButton
          label="Back"
          className="-ml-2.5"
          onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </MkIconButton>
      )}
      <div className={cn('min-w-0 flex-1', back && 'pt-1.5')}>
        <h1 className="text-[22px] leading-tight text-mk-text-primary sm:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-mk-text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

const pillTone = {
  neutral: 'text-mk-text-secondary',
  success: 'text-mk-success',
  warning: 'text-mk-warning',
  error: 'text-mk-error',
  info: 'text-mk-info',
  upcoming: 'text-mk-booking-upcoming',
  progress: 'text-mk-booking-in-progress',
} as const;

export type MkTone = keyof typeof pillTone;

export function MkPill({ tone = 'neutral', children }: { tone?: MkTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-mk-border bg-mk-surface px-2.5 py-1 font-mk-display text-[12px] font-semibold',
        pillTone[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function MkAvatar({ src, name, size = 48 }: { src?: string | null; name?: string; size?: number }) {
  const initials = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-mk-muted font-mk-display font-semibold text-mk-text-secondary"
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <img src={src} alt={name ? `${name}` : ''} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials || '?'
      )}
    </span>
  );
}

export function MkRating({ value, count, size = 14 }: { value?: number | null; count?: number | null; size?: number }) {
  const v = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-mk-text-secondary">
      <Star className="text-mk-rating" style={{ width: size, height: size }} fill="currentColor" aria-hidden="true" />
      <span className="font-semibold text-mk-text-primary">{v > 0 ? v.toFixed(1) : 'New'}</span>
      {count != null && count > 0 && <span>({count})</span>}
    </span>
  );
}

/* ---------------------------------------------------------- List states */

export function MkSkeleton({ className }: { className?: string }) {
  return <div className={cn('mk-skeleton rounded-xl', className)} aria-hidden="true" />;
}

export function MkListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-mk-border p-4">
          <MkSkeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <MkSkeleton className="h-4 w-2/5" />
            <MkSkeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MkEmpty({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mk-muted text-mk-text-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-[17px]">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-[14px] text-mk-text-secondary">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function MkErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center" role="alert">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mk-muted text-mk-error">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-[17px]">Could not load this</h3>
      <p className="mt-1.5 max-w-sm text-[14px] text-mk-text-secondary">{message}</p>
      <MkButton variant="secondary" className="mt-5" onClick={onRetry} loading={retrying}>
        {!retrying && <RotateCw className="h-4 w-4" aria-hidden="true" />}
        Try again
      </MkButton>
    </div>
  );
}

/** Cross-fades between skeleton and content. Opacity only, so it is safe with reduced motion. */
export function MkSwap({ id, children }: { id: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: mkMotion.control, ease: mkMotion.ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Animated list: items fade and rise in, removed items fade out. Travel skipped with reduced motion. */
export function MkAnimatedList<T>({
  items,
  getKey,
  render,
  className,
  as = 'ul',
}: {
  items: T[];
  getKey: (item: T) => string;
  render: (item: T, index: number) => ReactNode;
  className?: string;
  as?: 'ul' | 'div';
}) {
  const reduced = usePrefersReducedMotion();
  const Item = as === 'ul' ? motion.li : motion.div;
  const List = as;
  return (
    <List className={className}>
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <Item
            key={getKey(item)}
            layout={reduced ? false : 'position'}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mkMotion.control, ease: mkMotion.ease, delay: reduced ? 0 : Math.min(i, 8) * 0.02 }}
          >
            {render(item, i)}
          </Item>
        ))}
      </AnimatePresence>
    </List>
  );
}

/* --------------------------------------------------------------- Dialogs */

const overlayClass =
  'fixed inset-0 z-[80] bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200';

const panelClass = cn(
  'mk-scope fixed z-[81] w-full bg-mk-surface shadow-mk-hero focus:outline-none duration-200 ease-out',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
  // Bottom sheet on phones, centered dialog from sm up.
  'inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
  'data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:slide-out-to-bottom-6',
  'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6',
  'sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-[0.98] sm:data-[state=closed]:zoom-out-[0.98]',
  'motion-reduce:data-[state=open]:slide-in-from-bottom-0 motion-reduce:data-[state=closed]:slide-out-to-bottom-0 motion-reduce:zoom-in-100 motion-reduce:zoom-out-100',
);

/**
 * Confirm step for destructive or money actions. Radix traps focus and closes on Esc.
 * `onConfirm` may be async; the dialog stays open and shows `error` until it resolves without throwing.
 */
export function MkConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Keep it',
  destructive,
  loading,
  error,
  onConfirm,
  children,
  confirmDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  children?: ReactNode;
  confirmDisabled?: boolean;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={overlayClass} />
        <AlertDialog.Content className={panelClass}>
          <AlertDialog.Title className="text-[19px]">{title}</AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="mt-2 text-[14px] leading-relaxed text-mk-text-secondary">
              {description}
            </AlertDialog.Description>
          ) : (
            <AlertDialog.Description className="sr-only">{title}</AlertDialog.Description>
          )}
          {children && <div className="mt-4 space-y-4">{children}</div>}
          <div className="mt-4">
            <MkFormError message={error} />
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <MkButton variant="secondary" disabled={loading}>
                {cancelLabel}
              </MkButton>
            </AlertDialog.Cancel>
            <MkButton
              variant={destructive ? 'danger' : 'primary'}
              loading={loading}
              disabled={confirmDisabled}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
            >
              {confirmLabel}
            </MkButton>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/** General-purpose dialog (bottom sheet on phones). Focus trapped, Esc closes. */
export function MkDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content className={cn(panelClass, wide && 'sm:max-w-xl')}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-[19px]">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1.5 text-[14px] text-mk-text-secondary">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <MkIconButton label="Close" className="-mr-2 -mt-2">
                <X className="h-5 w-5" aria-hidden="true" />
              </MkIconButton>
            </DialogPrimitive.Close>
          </div>
          <div className="mt-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ----------------------------------------------------------- Segmented */

export function MkSegmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; count?: number; countTone?: 'upcoming' | 'progress' | 'neutral' }[];
  label: string;
}) {
  const reduced = usePrefersReducedMotion();
  const group = useId();
  return (
    <div role="tablist" aria-label={label} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
      <div className="inline-flex min-w-full gap-1 rounded-xl bg-mk-muted p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'relative flex min-h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 font-mk-display text-[13px] font-semibold transition-colors duration-150',
                active ? 'text-mk-text-primary' : 'text-mk-text-secondary hover:text-mk-text-primary',
              )}
            >
              {active && (
                <motion.span
                  layoutId={reduced ? undefined : `seg-${group}`}
                  className="absolute inset-0 rounded-lg bg-mk-surface shadow-mk-nested"
                  transition={{ duration: mkMotion.control, ease: mkMotion.ease }}
                />
              )}
              <span className="relative">{o.label}</span>
              {o.count != null && o.count > 0 && (
                <span
                  className={cn(
                    'relative min-w-5 rounded-full px-1.5 text-[11px] leading-5 text-mk-on-primary',
                    o.countTone === 'upcoming'
                      ? 'bg-mk-booking-upcoming'
                      : o.countTone === 'progress'
                        ? 'bg-mk-booking-in-progress'
                        : 'bg-mk-booking-neutral',
                  )}
                >
                  {o.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
