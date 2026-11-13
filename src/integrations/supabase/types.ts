export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_controls: {
        Row: {
          employer_status: string
          reason: string | null
          suspended: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          employer_status?: string
          reason?: string | null
          suspended?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          employer_status?: string
          reason?: string | null
          suspended?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      ai_configuration: {
        Row: {
          daily_limit: number
          demo_mode: boolean
          enabled: boolean
          id: number
          model: string
          paused_reason: string | null
          provider: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          daily_limit?: number
          demo_mode?: boolean
          enabled?: boolean
          id?: number
          model?: string
          paused_reason?: string | null
          provider?: string
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          daily_limit?: number
          demo_mode?: boolean
          enabled?: boolean
          id?: number
          model?: string
          paused_reason?: string | null
          provider?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          cost_credits: number | null
          created_at: string
          error_message: string | null
          id: string
          input_tokens: number
          model: string
          output_tokens: number
          status: string
          user_id: string
        }
        Insert: {
          cost_credits?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_tokens?: number
          model: string
          output_tokens?: number
          status?: string
          user_id: string
        }
        Update: {
          cost_credits?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_tokens?: number
          model?: string
          output_tokens?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          note: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          note?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      career_assessments: {
        Row: {
          answers: Json
          created_at: string
          id: string
          readiness_score: number
          result: Json
          target_role: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          readiness_score: number
          result?: Json
          target_role: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          readiness_score?: number
          result?: Json
          target_role?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          owner_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string
          website?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string | null
          category: string
          company_id: string | null
          company_name: string
          created_at: string
          description: string
          experience_level: string
          id: string
          is_sample: boolean
          job_type: string
          location: string
          posted_by: string | null
          published: boolean
          skills: string[]
          title: string
        }
        Insert: {
          apply_url?: string | null
          category: string
          company_id?: string | null
          company_name: string
          created_at?: string
          description: string
          experience_level: string
          id?: string
          is_sample?: boolean
          job_type: string
          location: string
          posted_by?: string | null
          published?: boolean
          skills?: string[]
          title: string
        }
        Update: {
          apply_url?: string | null
          category?: string
          company_id?: string | null
          company_name?: string
          created_at?: string
          description?: string
          experience_level?: string
          id?: string
          is_sample?: boolean
          job_type?: string
          location?: string
          posted_by?: string | null
          published?: boolean
          skills?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          lab_id: string
          max_score: number
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          lab_id: string
          max_score: number
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          lab_id?: string
          max_score?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      platform_content: {
        Row: {
          body: Json
          id: string
          kind: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json
          id?: string
          kind: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json
          id?: string
          kind?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          audience: Database["public"]["Enums"]["audience"] | null
          career_goals: string | null
          created_at: string
          degree: string | null
          education_level: string | null
          experience_level: string | null
          full_name: string | null
          headline: string | null
          id: string
          interests: string[]
          learning_style: string | null
          location: string | null
          onboarded: boolean
          portfolio_public: boolean
          skills: string[]
          specialization: string | null
          target_roles: string[]
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["audience"] | null
          career_goals?: string | null
          created_at?: string
          degree?: string | null
          education_level?: string | null
          experience_level?: string | null
          full_name?: string | null
          headline?: string | null
          id: string
          interests?: string[]
          learning_style?: string | null
          location?: string | null
          onboarded?: boolean
          portfolio_public?: boolean
          skills?: string[]
          specialization?: string | null
          target_roles?: string[]
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["audience"] | null
          career_goals?: string | null
          created_at?: string
          degree?: string | null
          education_level?: string | null
          experience_level?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          interests?: string[]
          learning_style?: string | null
          location?: string | null
          onboarded?: boolean
          portfolio_public?: boolean
          skills?: string[]
          specialization?: string | null
          target_roles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          contributions: string | null
          created_at: string
          demo_url: string | null
          description: string
          github_url: string | null
          id: string
          role: string | null
          screenshot_url: string | null
          technologies: string[]
          title: string
          user_id: string
        }
        Insert: {
          contributions?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          github_url?: string | null
          id?: string
          role?: string | null
          screenshot_url?: string | null
          technologies?: string[]
          title: string
          user_id: string
        }
        Update: {
          contributions?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          github_url?: string | null
          id?: string
          role?: string | null
          screenshot_url?: string | null
          technologies?: string[]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          completed: boolean
          created_at: string
          goal: string
          id: string
          kind: string
          objective: string | null
          position: number
          stage: string
          title: string
          user_id: string
          week: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          goal: string
          id?: string
          kind: string
          objective?: string | null
          position?: number
          stage: string
          title: string
          user_id: string
          week: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          goal?: string
          id?: string
          kind?: string
          objective?: string | null
          position?: number
          stage?: string
          title?: string
          user_id?: string
          week?: number
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      shortlists: {
        Row: {
          candidate_id: string
          created_at: string
          employer_id: string
          note: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          employer_id: string
          note?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          employer_id?: string
          note?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_active: { Args: { _user_id: string }; Returns: boolean }
      admin_manage: {
        Args: { _action: string; _payload?: Json; _target?: string }
        Returns: Json
      }
      admin_snapshot: { Args: never; Returns: Json }
      admin_user_detail: { Args: { _user_id: string }; Returns: Json }
      choose_account_type: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      discover_candidates: {
        Args: never
        Returns: {
          full_name: string
          headline: string
          id: string
          labs: Json
          project_count: number
          skills: string[]
          target_roles: string[]
        }[]
      }
      get_public_portfolio: { Args: { _user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      provision_super_admin: { Args: { _user_id: string }; Returns: undefined }
      reserve_ai_request: {
        Args: { _model: string; _user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "candidate" | "employer" | "admin"
      audience:
        | "student"
        | "graduate"
        | "job_seeker"
        | "professional"
        | "employer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["candidate", "employer", "admin"],
      audience: [
        "student",
        "graduate",
        "job_seeker",
        "professional",
        "employer",
      ],
    },
  },
} as const
