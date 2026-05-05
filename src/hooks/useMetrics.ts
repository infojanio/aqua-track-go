import { useQuery } from "@tanstack/react-query";
import { metricsService } from "@/services/metrics";

export function useLastMonthMetrics(cityId: string) {
  return useQuery({
    queryKey: ["metrics", "last-month", cityId],
    queryFn: () => metricsService.getLastMonth(cityId),
    staleTime: 1000 * 60 * 10,
  });
}

export function useMonthMetrics(cityId: string, ym: string) {
  return useQuery({
    queryKey: ["metrics", "month", cityId, ym],
    queryFn: () => metricsService.getMonth(cityId, ym),
    staleTime: 1000 * 60 * 10,
  });
}
