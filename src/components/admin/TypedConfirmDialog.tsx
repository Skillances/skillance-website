import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle } from 'lucide-react';

interface TypedConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /**
   * The exact string the user must type to enable the confirm button.
   * Typically the task id (e.g. `trim_query_metrics`).
   */
  confirmPhrase: string;
  /** Optional short impact blurb shown in a warning banner above the input. */
  impact?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

/**
 * Destructive-action confirmation dialog. User must type an exact phrase
 * (case-sensitive) before the confirm button becomes clickable.
 *
 * Used for admin maintenance tasks that hard-delete rows or freeze funds.
 */
const TypedConfirmDialog: React.FC<TypedConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmPhrase,
  impact,
  confirmLabel = 'Run',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const matches = value === confirmPhrase;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-neutral-200 text-black sm:max-w-md rounded-2xl shadow-soft-lg">
        <DialogHeader>
          <DialogTitle className="text-black font-serif text-xl">{title}</DialogTitle>
          <DialogDescription className="text-neutral-500 leading-relaxed">{description}</DialogDescription>
        </DialogHeader>

        {impact && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs leading-relaxed">{impact}</p>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <label className="text-xs text-neutral-500">
            Type{' '}
            <span className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800">
              {confirmPhrase}
            </span>{' '}
            to confirm:
          </label>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={confirmPhrase}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-sm"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches && !isLoading) {
                onConfirm();
              }
            }}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-black rounded-full"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || !matches}
            className="bg-red-600 text-white hover:bg-red-700 rounded-full disabled:bg-red-300 disabled:text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TypedConfirmDialog;
