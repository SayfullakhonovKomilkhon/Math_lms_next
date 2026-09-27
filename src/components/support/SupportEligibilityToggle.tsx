"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { errorMessage } from "./support-api";

export function SupportEligibilityToggle({
  teacherId,
  enabled,
  name,
}: {
  teacherId: string;
  enabled: boolean;
  name: string;
}) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (isSupport: boolean) =>
      api.patch(`/teachers/${teacherId}/support`, { isSupport }),
    onSuccess: async () => {
      await Promise.all(
        [
          "teachers",
          "sa-teachers",
          "teacher",
          "support",
          "support-teachers",
          "support-slots",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
    },
  });
  return (
    <div className="mt-3 space-y-1">
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          role="switch"
          aria-label={`${name}: может проводить занятия как суппорт`}
          checked={enabled}
          disabled={mutation.isPending}
          onChange={(e) => mutation.mutate(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-emerald-600"
        />
        <span>Может проводить занятия как суппорт</span>
      </label>
      <p className="text-xs text-slate-500">
        Отключение запрещает новые записи. Назначенные занятия сохраняются.
      </p>
      {mutation.isPending && (
        <p role="status" className="text-xs">
          Сохраняем…
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="text-xs text-red-700">
          {errorMessage(mutation.error)}
        </p>
      )}
    </div>
  );
}
