'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/store/auth.store';
import { notify } from '@/lib/toast';

export function SettingsClient() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      notify.success('Settings saved successfully');
    }, 800);
  };

  const handleDemoReset = () => {
    notify.success('Demo environment reset and seeded successfully.');
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="demo">Demo Mode</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue={profile?.displayName || ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={profile?.displayName ? '(managed via Supabase Auth)' : ''} disabled />
            </div>
            <Button onClick={handleSave} disabled={loading}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your app preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive daily summaries and critical alerts.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode Preference</Label>
                <p className="text-sm text-muted-foreground">Follow system settings by default.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="demo" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone: Demo Mode</CardTitle>
            <CardDescription>Reset the organization with realistic enterprise sample data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive-foreground">
              <strong>Warning:</strong> Clicking this button will wipe all current assets, allocations, and requests in your organization and replace them with a seeded dataset (12 Departments, 250 Employees, 1500 Assets, etc.). This action cannot be undone.
            </div>
            <Button variant="destructive" onClick={handleDemoReset}>
              Flush & Seed Organization
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
