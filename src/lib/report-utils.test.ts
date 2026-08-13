import { describe, expect, it } from "vitest";
import type { ConstructionLog, Engineer } from "./report-types";
import { reportCost, reportMatches, reportsToCsv, validateSplits, vehicleCost } from "./report-utils";

const report: ConstructionLog = {
  id: "1",
  report_date: "2026-08-13",
  city: ["台南市"],
  names: ["王小明"],
  vehicles: ["貨車"],
  work_content: "永康案場安裝支架",
  stay_out: true,
  leave_types: [],
  project_splits: [{ project_name: "永康案場", city: "台南市", weight: 1, description: "安裝支架" }],
};
const engineers: Engineer[] = [{ id: "e1", name: "王小明", daily_wage: 2500 }];

describe("validateSplits", () => {
  it("accepts a complete 1.0 allocation", () => {
    expect(validateSplits(report.project_splits)).toBeNull();
  });

  it("rejects incomplete allocation and missing fields", () => {
    expect(validateSplits([{ ...report.project_splits[0], weight: 0.8 }])).toContain("合計必須為 1");
    expect(validateSplits([{ ...report.project_splits[0], project_name: "" }])).toBe("案場名稱不可空白");
  });
});

describe("report helpers", () => {
  it("calculates wage plus stay-out allowance", () => {
    expect(reportCost(report, { 王小明: 2500 })).toBe(2750);
  });

  it("calculates configured vehicle costs", () => {
    expect(vehicleCost(report, { 貨車: 1200 })).toBe(1200);
  });

  it("searches nested project and content fields", () => {
    expect(reportMatches(report, "永康")).toBe(true);
    expect(reportMatches(report, "高雄")).toBe(false);
  });

  it("exports UTF-8 CSV with totals", () => {
    const csv = reportsToCsv([report], engineers);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("永康案場(1)");
    expect(csv).toContain("2750");
  });
});
