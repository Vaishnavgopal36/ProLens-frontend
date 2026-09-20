/** "Q1 2026", "Q2 2026", … starting from the current quarter. */
export function generateForwardQuarterOptions(numQuarters = 12): string[] {
  const now = new Date();
  let currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  let currentYear = now.getFullYear();

  const quarters: string[] = [];
  for (let i = 0; i < numQuarters; i++) {
    quarters.push(`Q${currentQuarter} ${currentYear}`);
    currentQuarter++;
    if (currentQuarter > 4) {
      currentQuarter = 1;
      currentYear++;
    }
  }
  return quarters;
}
