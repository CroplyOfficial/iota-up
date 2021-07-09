/**
 * Compares two arrays and returns the number of matching
 * elements that match.
 *
 * @param {Array<any>} arrayOne first array to compare
 * @param {Array<any>} arrayTwo second array to compare
 * @returns {Number} matches number of matches
 */

const getArrayMatches = (arrayOne: any[], arrayTwo: any[]): number => {
  let matches: number = 0;
  let isMatched: any[] = [];
  arrayOne.forEach((item: any) => {
    if (arrayTwo.includes(item) && !isMatched.includes(item)) {
      isMatched.push(item);
      matches++;
    }
  });
  return matches;
};

export { getArrayMatches };
