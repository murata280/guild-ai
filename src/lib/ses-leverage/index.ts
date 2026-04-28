import type { LeverageResult, LeverageBreakdown } from "@/types";

export function computeLeverage(salaryJpy: number, royaltyJpy: number[]): LeverageResult {
  const royaltyIncome = royaltyJpy.reduce((sum, r) => sum + r, 0);
  const projectedTrend = Math.round(royaltyIncome * 1.2);
  const totalIncome = salaryJpy + royaltyIncome;
  const multiplier = salaryJpy > 0
    ? Math.round((totalIncome / salaryJpy) * 100) / 100
    : 1;

  const breakdown: LeverageBreakdown = {
    directLabor: salaryJpy,
    royaltyIncome,
    projectedTrend,
  };

  return { multiplier, breakdown, totalIncome };
}
