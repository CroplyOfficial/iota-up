const categories: any = {
  community: [
    'business',
    'culture',
    'education',
    'environment',
    'events',
    'human rights',
    'wellness',
  ],
  creative: [
    'art',
    'design',
    'film',
    'games',
    'journalism',
    'performance',
    'writing',
  ],
  technology: [
    'applications',
    'green tech',
    'hardware',
    'research',
    'software',
    'websites',
  ],
};

export const findTopCategory = (cats: string[]) => {
  for (const topCategory of Object.keys(categories)) {
    if (categories[topCategory].includes(cats[0])) {
      return topCategory;
    }
  }
  return 'NA';
};
