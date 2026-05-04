import { useQuery } from "@tanstack/react-query";
import { metricsService } from "@/services/metrics";

export function useLastMonthMetrics(cityId: string) {
  return useQuery({
    queryKey: ["metrics", "last-month", cityId],
    queryFn: () => metricsService.getLastMonth(cityId),
    staleTime: 1000 * 60 * 10,
  });
}
