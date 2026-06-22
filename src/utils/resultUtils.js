export const getApiData = (res) => res?.data?.data ?? res?.data ?? null;

export const calculateGrade = (score) => {
  const num = Number(score) || 0;

  if (num >= 75) return "A1";
  if (num >= 70) return "B2";
  if (num >= 65) return "B3";
  if (num >= 60) return "C4";
  if (num >= 55) return "C5";
  if (num >= 50) return "C6";
  if (num >= 45) return "D7";
  if (num >= 40) return "E8";
  return "F9";
};

export const calculateCumulativeData = (allTermResults = {}) => {
  const terms = Object.values(allTermResults);

  if (terms.length === 0) {
    return {
      termScores: {},
      subjectTotals: {},
      cumulativeAverages: {},
      cumulativeGrades: {},
      overallCumulativeAverage: 0,
      cumulativeMarkObtained: 0,
      cumulativeMaxMarkObtainable: 0,
    };
  }

  const termScores = {};
  const subjectTotals = {};
  const subjectCounts = {};

  let cumulativeMarkObtained = 0;
  let cumulativeMaxMarkObtainable = 0;

  terms.forEach((term) => {
    termScores[term.termName] = {};

    term.results.forEach((result) => {
      if (!result.subject) return;

      const total = Number(result.total) || 0;

      subjectTotals[result.subject] = (subjectTotals[result.subject] || 0) + total;
      subjectCounts[result.subject] = (subjectCounts[result.subject] || 0) + 1;
      termScores[term.termName][result.subject] = total;

      cumulativeMarkObtained += total;
      cumulativeMaxMarkObtainable += 100;
    });
  });

  const cumulativeAverages = {};
  const cumulativeGrades = {};

  let totalAverage = 0;
  let subjectCount = 0;

  Object.keys(subjectTotals).forEach((subject) => {
    const average = subjectTotals[subject] / subjectCounts[subject];

    cumulativeAverages[subject] = average.toFixed(1);
    cumulativeGrades[subject] = calculateGrade(average);

    totalAverage += average;
    subjectCount += 1;
  });

  return {
    termScores,
    subjectTotals,
    cumulativeAverages,
    cumulativeGrades,
    overallCumulativeAverage: subjectCount ? totalAverage / subjectCount : 0,
    cumulativeMarkObtained,
    cumulativeMaxMarkObtainable,
  };
};