import type { ConstructionLog, Engineer, ProjectSplit, VehicleCost } from "./report-types";

const WEIGHT_TOLERANCE = 0.001;

export function validateSplits(splits: ProjectSplit[]): string | null {
  if (splits.length === 0) return "至少需要一筆案場拆分";
  if (splits.some((split) => !split.project_name.trim())) return "案場名稱不可空白";
  if (splits.some((split) => !split.city.trim())) return "每筆案場都必須選擇縣市";
  if (splits.some((split) => !Number.isFinite(split.weight) || split.weight <= 0 || split.weight > 1)) {
    return "每筆工時權重必須大於 0 且不超過 1";
  }
  const total = splits.reduce((sum, split) => sum + split.weight, 0);
  if (Math.abs(total - 1) > WEIGHT_TOLERANCE) return `工時權重合計必須為 1，目前為 ${total.toFixed(2)}`;
  return null;
}

export function reportCost(report: ConstructionLog, wageMap: Record<string, number>): number {
  const wages = report.names.reduce((sum, name) => sum + (wageMap[name] ?? 0), 0);
  return wages + (report.stay_out ? 250 : 0);
}

export function buildWageMap(engineers: Engineer[]): Record<string, number> {
  return Object.fromEntries(engineers.map((engineer) => [engineer.name, Number(engineer.daily_wage) || 0]));
}

export function buildVehicleCostMap(vehicles: VehicleCost[]): Record<string, number> {
  return Object.fromEntries(vehicles.map((vehicle) => [vehicle.name, Number(vehicle.daily_cost) || 0]));
}

export function vehicleCost(report: ConstructionLog, vehicleCostMap: Record<string, number>): number {
  return report.vehicles.reduce((sum, name) => sum + (vehicleCostMap[name] ?? 0), 0);
}

export function reportMatches(report: ConstructionLog, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase("zh-TW");
  if (!needle) return true;
  const text = [
    report.report_date,
    report.work_content,
    ...report.city,
    ...report.names,
    ...report.vehicles,
    ...report.project_splits.flatMap((split) => [split.project_name, split.city, split.description]),
  ].join(" ").toLocaleLowerCase("zh-TW");
  return text.includes(needle);
}

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function reportsToCsv(reports: ConstructionLog[], engineers: Engineer[], vehicles: VehicleCost[] = []): string {
  const wageMap = buildWageMap(engineers);
  const vehicleCostMap = buildVehicleCostMap(vehicles);
  const header = ["日期", "縣市", "出勤人員", "車輛", "外宿", "假別", "工作內容", "案場拆分", "人員成本", "車輛成本", "總成本"];
  const rows = reports.map((report) => [
    report.report_date,
    report.city.join("、"),
    report.names.join("、"),
    report.vehicles.join("、"),
    report.stay_out ? "是" : "否",
    report.leave_types.join("、"),
    report.work_content,
    report.project_splits.map((split) => `${split.project_name}(${split.weight})`).join("；"),
    reportCost(report, wageMap),
    vehicleCost(report, vehicleCostMap),
    reportCost(report, wageMap) + vehicleCost(report, vehicleCostMap),
  ]);
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}`;
}
