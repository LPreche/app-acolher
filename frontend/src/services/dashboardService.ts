import { apiFetch } from './api';
import { MetricasResumo, Visitante } from '@/types/visitante';

export interface DashboardMetricasResponse {
  resumo: MetricasResumo;
  prioritarios: Visitante[];
}

export const dashboardService = {
  async obterMetricas(tipoAcolhimento?: string): Promise<DashboardMetricasResponse> {
    const params = new URLSearchParams();
    if (tipoAcolhimento && tipoAcolhimento !== 'todos') {
      params.append('tipo_acolhimento', tipoAcolhimento);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<DashboardMetricasResponse>(`/dashboard/metricas${queryString}`);
  },
};
