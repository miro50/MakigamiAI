
export interface ProcessMetrics {
  total_lead_time_minutes: number;
  total_touch_time_minutes: number;
  efficiency_score_pce: number;
}

export interface HealthCheck {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  main_issue: string;
}

export interface MetaAnalysis {
  process_name: string;
  difficulty_rating: 'Low' | 'Medium' | 'High';
  metrics: ProcessMetrics;
  health_check: HealthCheck;
}

export interface Swimlane {
  id: string;
  name: string;
  type: 'HUMAN' | 'SYSTEM' | 'EXTERNAL';
}

export interface StepTimes {
  touch_minutes: number; // Value Added (in minutes)
  wait_minutes: number;  // Non-Value Added (in minutes)
}

export interface MakigamiStep {
  id: number;
  swimlane_id: string;
  description: string;
  trigger: string;
  times: {
    touch_minutes: number;
    wait_minutes: number;
  };
  waste_tags: string[];
  is_value_added: boolean;
  // Nuovi campi:
  next_step_ids: number[];
  is_rework_loop: boolean;
}

export interface KaizenRecommendation {
  target_step_id: number;
  suggestion: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface MakigamiProcess {
  meta_analysis: MetaAnalysis;
  swimlanes: Swimlane[];
  steps: MakigamiStep[];
  kaizen_recommendations: KaizenRecommendation[];
}
