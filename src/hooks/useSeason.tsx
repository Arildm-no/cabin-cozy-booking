import { useMemo } from 'react';

export type Season = 'summer' | 'winter';

export const useSeason = (): Season => {
  return useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const day = now.getDate();

    // Summer starts on May 14 (month 5, day 14)
    // Winter starts on November 23 (month 11, day 23)
    
    if (month < 5 || (month === 5 && day < 14)) {
      return 'winter';
    } else if (month < 11 || (month === 11 && day < 23)) {
      return 'summer';
    } else {
      return 'winter';
    }
  }, []);
};
