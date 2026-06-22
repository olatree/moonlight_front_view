

export const FEE_TYPES = [
  "Tuition",
  "Library",
  "Sports",
  "Transport",
  "Lab",
  "Development",
  "Other",
];

export const getFeeDescription = (fee) => {
  return (
    fee?.description ||
    fee?.feeStructureId?.description ||
    fee?.otherDescription ||
    ""
  ).trim();
};

export const formatFeeType = (fee) => {
  if (!fee) return "N/A";

  const feeType = fee.feeType || "N/A";
  const description = getFeeDescription(fee);

  if (feeType === "Other" && description) {
    return `Other (${description})`;
  }

  return feeType;
};

export const formatCurrency = (amount) => {
  return `₦${Number(amount || 0).toLocaleString()}`;
};

export const getApiData = (res) => {
  return res.data?.data ?? res.data ?? [];
};