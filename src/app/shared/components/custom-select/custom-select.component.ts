import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

interface InternalOption {
  readonly label: string;
  readonly value: string | null;
}

export interface SelectOption {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.custom-select-host]': 'true',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class CustomSelectComponent {
  private static nextId = 0;

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly instanceId = CustomSelectComponent.nextId++;

  readonly label = input.required<string>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly value = input<string | null>(null);
  readonly placeholder = input('Selecione');
  readonly emptyOptionLabel = input<string | null>(null);
  readonly disabled = input(false);
  readonly valueChange = output<string | null>();

  readonly expanded = signal(false);
  readonly activeIndex = signal(0);
  readonly listboxId = `custom-select-listbox-${this.instanceId}`;

  readonly optionsList = computed<readonly InternalOption[]>(() => {
    const mappedOptions: InternalOption[] = this.options().map(
      (option: SelectOption): InternalOption => ({
        label: option.label,
        value: option.value,
      }),
    );

    const emptyLabel = this.emptyOptionLabel();
    if (!emptyLabel) {
      return mappedOptions;
    }

    return [{ label: emptyLabel, value: null }, ...mappedOptions];
  });

  readonly displayValue = computed<string>(() => {
    const selectedOption = this.optionsList().find(
      (option: InternalOption): boolean => option.value === this.value(),
    );

    if (selectedOption) {
      return selectedOption.label;
    }

    return this.placeholder();
  });

  readonly hasValue = computed<boolean>(() => this.value() !== null);

  toggleDropdown(): void {
    if (this.disabled()) {
      return;
    }

    if (this.expanded()) {
      this.closeDropdown();
      return;
    }

    this.openDropdown();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    const key = event.key;
    if (!this.expanded()) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.openDropdown();
      }
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this.closeDropdown();
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      this.moveActiveIndex(1);
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      this.moveActiveIndex(-1);
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.selectByIndex(this.activeIndex());
    }
  }

  onOptionMouseEnter(index: number): void {
    this.activeIndex.set(index);
  }

  onOptionClick(index: number): void {
    this.selectByIndex(index);
  }

  onDocumentClick(event: Event): void {
    if (!this.expanded()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    const hostElement = this.elementRef.nativeElement;
    if (hostElement.contains(target)) {
      return;
    }

    this.closeDropdown();
  }

  getOptionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  isOptionSelected(index: number): boolean {
    const option = this.optionsList()[index];
    if (!option) {
      return false;
    }
    return option.value === this.value();
  }

  isOptionActive(index: number): boolean {
    return this.activeIndex() === index;
  }

  private openDropdown(): void {
    const selectedIndex = this.optionsList().findIndex(
      (option: InternalOption): boolean => option.value === this.value(),
    );
    this.activeIndex.set(selectedIndex >= 0 ? selectedIndex : 0);
    this.expanded.set(true);
  }

  private closeDropdown(): void {
    this.expanded.set(false);
  }

  private moveActiveIndex(direction: 1 | -1): void {
    const optionCount = this.optionsList().length;
    if (optionCount === 0) {
      return;
    }

    const currentIndex = this.activeIndex();
    const nextIndex = (currentIndex + direction + optionCount) % optionCount;
    this.activeIndex.set(nextIndex);
  }

  private selectByIndex(index: number): void {
    const option = this.optionsList()[index];
    if (!option) {
      return;
    }

    this.valueChange.emit(option.value);
    this.closeDropdown();
  }
}
