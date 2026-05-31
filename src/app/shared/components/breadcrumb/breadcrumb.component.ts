import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  readonly label: string;
  readonly url?: string;
  readonly isCurrent?: boolean;
}

interface ResolvedBreadcrumbItem {
  readonly id: string;
  readonly label: string;
  readonly url: string | null;
  readonly isCurrent: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  readonly items = input.required<readonly BreadcrumbItem[]>();

  readonly resolvedItems = computed<readonly ResolvedBreadcrumbItem[]>(() => {
    const currentItems = this.items();
    const lastIndex = currentItems.length - 1;

    return currentItems.map((item, index) => ({
      id: `${index}-${item.label}`,
      label: item.label,
      url: item.url ?? null,
      isCurrent: item.isCurrent ?? index === lastIndex,
    }));
  });
}
