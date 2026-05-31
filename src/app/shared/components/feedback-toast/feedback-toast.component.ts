import { ChangeDetectionStrategy, Component, OnDestroy, effect, input, output } from '@angular/core';

type ToastVariant = 'success' | 'error' | 'info';

@Component({
  selector: 'app-feedback-toast',
  templateUrl: './feedback-toast.component.html',
  styleUrl: './feedback-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackToastComponent implements OnDestroy {
  readonly message = input<string | null>(null);
  readonly variant = input<ToastVariant>('success');
  readonly autoCloseMs = input<number>(4200);
  readonly closed = output<void>();

  private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private closeCycle = 0;

  constructor() {
    effect(() => {
      const currentMessage = this.message();
      this.closeCycle += 1;
      this.clearHideTimeout();

      if (!currentMessage) {
        return;
      }

      const closeAfterMs = this.autoCloseMs();
      if (closeAfterMs <= 0) {
        return;
      }

      const currentCycle = this.closeCycle;
      this.hideTimeoutId = setTimeout(() => {
        if (this.closeCycle !== currentCycle) {
          return;
        }

        this.closed.emit();
        this.hideTimeoutId = null;
      }, closeAfterMs);
    });
  }

  ngOnDestroy(): void {
    this.clearHideTimeout();
  }

  private clearHideTimeout(): void {
    if (this.hideTimeoutId === null) {
      return;
    }

    clearTimeout(this.hideTimeoutId);
    this.hideTimeoutId = null;
  }
}
