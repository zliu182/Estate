// Define date functions
export const formatDob = (dob: string): string => {
  if (!dob) return "N/A"; // Handle missing dates

  const date = new Date(dob);

  // This converts "1975-12-10" -> "Dec 10, 1975"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
