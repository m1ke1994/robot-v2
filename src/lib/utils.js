export function cn(...classes) {
  return classes
    .flat()
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .join(' ');
}

