import { useQuery } from "@tanstack/react-query";
import { metricsService } from "@/services/metrics";

export function useLastMonthMetrics() {
  return useQuery({
    queryKey: ["metrics", "last-month"],
    queryFn: () => metricsService.getLastMonth(),
    staleTime: 1000 * 60 * 10,
  });
}
