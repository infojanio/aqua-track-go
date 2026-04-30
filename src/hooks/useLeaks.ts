import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaksService } from "@/services/leaks";
import type { CreateLeakInput, UpdateLeakInput } from "@/types/leak";

const KEY = ["leaks"] as const;

export function useLeaks() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => leaksService.list(),
  });
}

export function useCreateLeak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeakInput) => leaksService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLeak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateLeakInput }) =>
      leaksService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
