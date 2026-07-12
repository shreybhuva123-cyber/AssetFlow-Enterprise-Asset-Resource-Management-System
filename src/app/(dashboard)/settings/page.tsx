'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsLayout, SettingsSection, SettingsRow } from '@/components/layout/settings-layout';
import { TextField } from '@/components/forms/form-field';
import { FormActions } from '@/components/forms/form-actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { updateProfileSchema, type UpdateProfileInput } from '@/validators/auth';
import { useAuthStore } from '@/store/auth.store';
import { notify } from '@/lib/toast';
import { USER_ROLE_LABELS } from '@/types/auth';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, User, Palette, Bell } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Profile', href: '/dashboard/settings', icon: User },
  { label: 'Appearance', href: '/dashboard/settings/appearance', icon: Palette },
  { label: 'Notifications', href: '/dashboard/settings/notifications', icon: Bell },
];

export default function SettingsPage() {
  const profile = useAuthStore((s) => s.profile);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      phone: profile?.phone ?? '',
      jobTitle: profile?.jobTitle ?? '',
      timezone: profile?.timezone ?? 'UTC',
    },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone ?? '',
        jobTitle: profile.jobTitle ?? '',
        timezone: profile.timezone,
      });
    }
  }, [profile, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const res = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Update failed');
      return json.data;
    },
    onSuccess: (updated) => {
      if (user) setAuth(user, { ...profile!, ...updated });
      notify.success('Profile updated');
    },
    onError: (err: Error) => notify.error(err.message),
  });

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <SettingsLayout
        title=""
        navItems={NAV_ITEMS}
        activeHref="/dashboard/settings"
      >
        <div className="space-y-6">
          <SettingsSection title="Personal Information" description="Update your name and contact details.">
            <div className="flex items-center gap-4 mb-6">
              <UserAvatar
                src={profile.avatarUrl ?? undefined}
                firstName={profile.firstName}
                lastName={profile.lastName}
                size="lg"
              />
              <div>
                <p className="font-medium">{profile.displayName}</p>
                <Badge variant="secondary" className="mt-1">
                  {USER_ROLE_LABELS[profile.role]}
                </Badge>
              </div>
            </div>

            <form onSubmit={form.handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField control={form.control} name="firstName" label="First name" required />
                <TextField control={form.control} name="lastName" label="Last name" required />
              </div>
              <TextField control={form.control} name="jobTitle" label="Job title" placeholder="e.g. Senior Engineer" />
              <TextField control={form.control} name="phone" label="Phone" type="tel" placeholder="+1 555 000 0000" />

              <FormActions
                submitLabel="Save changes"
                isSubmitting={isPending}
                align="left"
                onCancel={() => form.reset()}
              />
            </form>
          </SettingsSection>

          <SettingsSection title="Appearance" description="Customize how AssetFlow looks.">
            <SettingsRow label="Theme" description="Choose between light, dark, or system theme.">
              <Select value={theme ?? 'system'} onValueChange={setTheme}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </SettingsSection>
        </div>
      </SettingsLayout>
    </div>
  );
}
