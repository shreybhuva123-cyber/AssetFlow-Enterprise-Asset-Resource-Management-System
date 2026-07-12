// Auto-generated types stub. Run `npx supabase gen types typescript` to regenerate
// after schema migrations have been applied to your Supabase project.

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
          is_active: boolean;
          settings: Record<string, unknown>;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['organizations']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          org_id: string | null;
          first_name: string;
          last_name: string;
          display_name: string;
          avatar_url: string | null;
          phone: string | null;
          timezone: string;
          locale: string;
          role: Database['public']['Enums']['user_role'];
          is_active: boolean;
          preferences: Record<string, unknown>;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['profiles']['Row'],
          'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          profile_id: string;
          role: Database['public']['Enums']['user_role'];
          is_active: boolean;
          invited_by: string | null;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['org_members']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['org_members']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          org_id: string | null;
          user_id: string | null;
          action: Database['public']['Enums']['audit_action'];
          resource: string;
          resource_id: string | null;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          metadata: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          request_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: never; // Audit logs are immutable
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ASSET_MANAGER' | 'TECHNICIAN' | 'VIEWER';
      org_plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
      audit_action:
        | 'CREATE'
        | 'UPDATE'
        | 'DELETE'
        | 'RESTORE'
        | 'VIEW'
        | 'EXPORT'
        | 'IMPORT'
        | 'LOGIN'
        | 'LOGOUT'
        | 'LOGIN_FAILED'
        | 'PASSWORD_RESET'
        | 'PERMISSION_CHANGE'
        | 'ROLE_CHANGE'
        | 'APPROVE'
        | 'REJECT'
        | 'ASSIGN'
        | 'UNASSIGN';
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertDTO<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateDTO<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
