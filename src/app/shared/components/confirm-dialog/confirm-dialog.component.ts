import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly highlightText = input<string | null>(null);
  readonly cancelLabel = input('Cancelar');
  readonly confirmLabel = input('Confirmar');
  readonly isBusy = input(false);
  readonly confirmVariant = input<'danger' | 'primary'>('primary');

  readonly canceled = output<void>();
  readonly confirmed = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    this.canceled.emit();
  }

  onCancel(): void {
    if (this.isBusy()) {
      return;
    }

    this.canceled.emit();
  }

  onConfirm(): void {
    if (this.isBusy()) {
      return;
    }

    this.confirmed.emit();
  }
}
