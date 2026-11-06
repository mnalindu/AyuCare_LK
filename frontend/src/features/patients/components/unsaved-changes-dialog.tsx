'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title="Unsaved Changes"
      description="You have unsaved edits in this patient form."
      maxWidth="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Continue Editing
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Discard Changes
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5 py-2">
        <div className="p-2 rounded-xl bg-warning-bg text-warning shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          If you navigate away now, your edits will not be saved to the clinical registry.
          Are you sure you want to discard your changes?
        </p>
      </div>
    </Dialog>
  );
}

