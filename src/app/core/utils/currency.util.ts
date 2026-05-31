const BRL_NUMBER_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const BRL_CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function sanitizePriceInput(rawValue: string): string {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return '';
  }

  return trimmedValue.replace(/[^\d,.]/g, '');
}

export function parsePriceInput(rawValue: string): number | null {
  if (rawValue.includes('-')) {
    return null;
  }

  const sanitizedValue = sanitizePriceInput(rawValue);
  if (!sanitizedValue) {
    return null;
  }

  const decimalSeparatorIndex = resolveDecimalSeparatorIndex(sanitizedValue);

  let normalizedNumericValue: string;

  if (decimalSeparatorIndex === -1) {
    normalizedNumericValue = sanitizedValue.replace(/[^\d]/g, '');
  } else {
    const integerPart = sanitizedValue.slice(0, decimalSeparatorIndex).replace(/[^\d]/g, '');
    const decimalPart = sanitizedValue.slice(decimalSeparatorIndex + 1).replace(/[^\d]/g, '').slice(0, 2);
    const safeIntegerPart = integerPart || '0';
    normalizedNumericValue = decimalPart ? `${safeIntegerPart}.${decimalPart}` : safeIntegerPart;
  }

  if (!normalizedNumericValue) {
    return null;
  }

  const parsedValue = Number(normalizedNumericValue);
  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

export function formatNumberToBrl(value: number | null): string {
  if (value === null) {
    return '';
  }

  return BRL_NUMBER_FORMATTER.format(value);
}

export function formatCurrencyToBrl(value: number): string {
  return BRL_CURRENCY_FORMATTER.format(value);
}

function resolveDecimalSeparatorIndex(value: string): number {
  const commaOccurrences = (value.match(/,/g) ?? []).length;
  const dotOccurrences = (value.match(/\./g) ?? []).length;
  const lastCommaIndex = value.lastIndexOf(',');
  const lastDotIndex = value.lastIndexOf('.');

  if (commaOccurrences > 0 && dotOccurrences > 0) {
    return Math.max(lastCommaIndex, lastDotIndex);
  }

  const separator = commaOccurrences > 0 ? ',' : dotOccurrences > 0 ? '.' : null;
  if (separator === null) {
    return -1;
  }

  const occurrences = separator === ',' ? commaOccurrences : dotOccurrences;
  const lastSeparatorIndex = separator === ',' ? lastCommaIndex : lastDotIndex;
  const digitsAfterLastSeparator = value.length - lastSeparatorIndex - 1;

  if (occurrences === 1) {
    if (digitsAfterLastSeparator === 0) {
      return -1;
    }

    if (digitsAfterLastSeparator <= 2) {
      return lastSeparatorIndex;
    }

    return -1;
  }

  if (digitsAfterLastSeparator > 0 && digitsAfterLastSeparator <= 2) {
    return lastSeparatorIndex;
  }

  return -1;
}
