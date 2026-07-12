'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import type { CreateDepartmentInput, UpdateDepartmentInput } from '@/validators/department';

const DEPARTMENTS_KEY = ['departments'] as const;

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json.data;
}

export function useDepartments(params?: Record<string, string>) {
  const search = params ? '?' + new URLSearchParams(params).toString() : '';
  return useQuery({
    queryKey: [...DEPARTMENTS_KEY, params],
    queryFn: () => apiFetch(`/api/departments${search}`),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDepartmentInput) =>
      apiFetch('/api/departments', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
      notify.success('Department created');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateDepartmentInput & { id: string }) =>
      apiFetch(`/api/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
      notify.success('Department updated');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/departments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
      notify.success('Department deleted');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}

export function useAllDepartments() {
  return useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => apiFetch('/api/departments?limit=100&isActive=true'),
  });
}
