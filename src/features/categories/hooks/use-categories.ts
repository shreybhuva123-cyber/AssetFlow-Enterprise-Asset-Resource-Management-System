'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import type { CreateAssetCategoryInput, UpdateAssetCategoryInput } from '@/validators/asset-category';

const CATEGORIES_KEY = ['categories'] as const;

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json.data;
}

export function useCategories(params?: Record<string, string>) {
  const search = params ? '?' + new URLSearchParams(params).toString() : '';
  return useQuery({
    queryKey: [...CATEGORIES_KEY, params],
    queryFn: () => apiFetch(`/api/categories${search}`),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssetCategoryInput) =>
      apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      notify.success('Category created');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAssetCategoryInput & { id: string }) =>
      apiFetch(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      notify.success('Category updated');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      notify.success('Category deleted');
    },
    onError: (err: Error) => notify.error(err.message),
  });
}
