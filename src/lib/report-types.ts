export type ProjectSplit = {
  id?: string;
  project_name: string;
  city: string;
  weight: number;
  description: string;
};

export type ConstructionLog = {
  id: string;
  created_at?: string;
  report_date: string;
  city: string[];
  names: string[];
  vehicles: string[];
  work_content: string;
  stay_out: boolean;
  leave_types: string[];
  project_splits: ProjectSplit[];
};

export type Engineer = {
  id: string;
  name: string;
  daily_wage: number;
  created_at?: string;
};

export type ReportFormData = {
  date: string;
  city: string[];
  names: string[];
  vehicles: string[];
  workContent: string;
  stayOut: "是" | "否";
  leaveTypes: string[];
};
