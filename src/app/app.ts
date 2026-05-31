import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  private static readonly minimumLoaderDurationMs = 780;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isRouteLoading = signal(false);

  private loaderStartedAtMs = 0;
  private loaderCycleId = 0;
  private hideLoaderTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.onNavigationStart();
          return;
        }

        this.onNavigationFinish();
      });
  }

  ngOnDestroy(): void {
    this.clearHideLoaderTimeout();
  }

  private onNavigationStart(): void {
    this.loaderCycleId += 1;
    this.loaderStartedAtMs = Date.now();
    this.clearHideLoaderTimeout();
    this.isRouteLoading.set(true);
  }

  private onNavigationFinish(): void {
    if (!this.isRouteLoading()) {
      return;
    }

    const currentCycleId = this.loaderCycleId;
    const elapsedMs = Date.now() - this.loaderStartedAtMs;
    const remainingMs = Math.max(App.minimumLoaderDurationMs - elapsedMs, 0);

    this.clearHideLoaderTimeout();
    this.hideLoaderTimeoutId = setTimeout(() => {
      if (currentCycleId !== this.loaderCycleId) {
        return;
      }

      this.isRouteLoading.set(false);
      this.hideLoaderTimeoutId = null;
    }, remainingMs);
  }

  private clearHideLoaderTimeout(): void {
    if (this.hideLoaderTimeoutId === null) {
      return;
    }

    clearTimeout(this.hideLoaderTimeoutId);
    this.hideLoaderTimeoutId = null;
  }
}
