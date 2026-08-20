export interface SeasonRange {
  label: string;
  startDate: string;
  endDate: string;
}

// Saison sportive française classique : septembre → août.
export function currentSeasonLabel(now: Date = new Date()): SeasonRange {
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    label: `${startYear}-${startYear + 1}`,
    startDate: `${startYear}-09-01`,
    endDate: `${startYear + 1}-08-31`,
  };
}
