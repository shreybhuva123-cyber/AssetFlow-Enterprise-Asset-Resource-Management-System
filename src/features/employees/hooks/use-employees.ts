'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import type { UpdateEmployeeInput } from '@/validators/employee';
import type { UserRole } from '@/types/auth';

const EMPLOYEES_KEY = ['employees'] as const;

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json.data;
}

export function useEmployees(params?: Record<string, string>) {
  const search = params ? '?' + new URLSearchParams(params).toString() : '';
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, params],
    queryFn: () => apiFetch(`/api/employees${search}`),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, id],
    queryFn: () => apiFetch(`/api/employees/${id}`),
    enabled: !!id,
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateEmployeeInput & { id: string }) =>
      apiFetch(`/api/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      qc.invalidateQueries({ queryKey: [...EMPLOYEES_KEY, vars.id] });
      notify.success('Employee updated');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}

export function useChangeEmployeeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      apiFetch(`/api/employees/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      notify.success('Role updated');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}
