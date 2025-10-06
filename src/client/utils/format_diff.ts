const HASH_UNIT_ARRAY = [
  { unit: 1_000_000_000_000_000_000_000_000, suffix: 'Y' }, // YottaHash
  { unit: 1_000_000_000_000_000_000_000, suffix: 'Z' }, // ZettaHash
  { unit: 1_000_000_000_000_000_000, suffix: 'E' }, // ExaHash
  { unit: 1_000_000_000_000_000, suffix: 'P' }, // PetaHash
  { unit: 1_000_000_000_000, suffix: 'T' }, // TeraHash
  { unit: 1_000_000_000, suffix: 'G' }, // GigaHash
  { unit: 1_000_000, suffix: 'M' }, // MegaHash
  { unit: 1_000, suffix: 'K' }, // KiloHash
];

export const format_diff = (diff: number, locale?: Intl.LocalesArgument) => {
  let suffix = ``;
  let value = diff;

  for (let i = 0; i < HASH_UNIT_ARRAY.length; i++) {
    const item = HASH_UNIT_ARRAY[i]
    if (value >= item.unit) {
      suffix = item.suffix;
      value = value / item.unit;
      break;
    }
  }

  return `${value.toLocaleString(locale, { maximumFractionDigits: 2 })} ${suffix}`
}
