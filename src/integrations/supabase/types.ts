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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      founders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string
          environment: string
          id: string
          paid_at: string | null
          payment_status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          email: string
          environment?: string
          id?: string
          paid_at?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string
          environment?: string
          id?: string
          paid_at?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_type: Database["public"]["Enums"]["springr_user_type"] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["springr_user_type"] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["springr_user_type"] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      offres: {
        Row: {
          id: string
          title: string
          company: string
          city: string
          remote: boolean
          type: string
          sector: string
          posted_at: string
          tags: string[]
          apply_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          city: string
          remote?: boolean
          type: string
          sector: string
          posted_at?: string
          tags?: string[]
          apply_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          city?: string
          remote?: boolean
          type?: string
          sector?: string
          posted_at?: string
          tags?: string[]
          apply_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      candidatures: {
        Row: {
          id: string
          user_id: string
          offre_id: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          offre_id: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          offre_id?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidatures_offre_id_fkey"
            columns: ["offre_id"]
            isOneToOne: false
            referencedRelation: "offres"
            referencedColumns: ["id"]
          }
        ]
      }
      alertes_emploi: {
        Row: {
          id: string
          user_id: string
          frequency: string
          sectors: string[]
          types: string[]
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          frequency?: string
          sectors?: string[]
          types?: string[]
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          frequency?: string
          sectors?: string[]
          types?: string[]
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewer_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      mentors: {
        Row: {
          id: string
          first_name: string
          last_name: string
          position: string
          company: string
          sector: string
          city: string
          bio: string | null
          skills: string[]
          availability: string
          sessions: number
          avatar_color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          position: string
          company: string
          sector: string
          city: string
          bio?: string | null
          skills?: string[]
          availability?: string
          sessions?: number
          avatar_color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          position?: string
          company?: string
          sector?: string
          city?: string
          bio?: string | null
          skills?: string[]
          availability?: string
          sessions?: number
          avatar_color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      evenements: {
        Row: {
          id: string
          title: string
          organizer: string
          date: string
          city: string
          type: string
          description: string | null
          url: string | null
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          organizer: string
          date: string
          city: string
          type: string
          description?: string | null
          url?: string | null
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          organizer?: string
          date?: string
          city?: string
          type?: string
          description?: string | null
          url?: string | null
          featured?: boolean
          created_at?: string
        }
        Relationships: []
      }
      bons_plans: {
        Row: {
          id: string
          titre: string
          description: string
          categorie: string
          badge_texte: string
          badge_couleur: string
          lien_url: string | null
          code_promo: string | null
          valeur_reduction: string | null
          actif: boolean
          ordre_affichage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titre: string
          description?: string
          categorie: string
          badge_texte?: string
          badge_couleur?: string
          lien_url?: string | null
          code_promo?: string | null
          valeur_reduction?: string | null
          actif?: boolean
          ordre_affichage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titre?: string
          description?: string
          categorie?: string
          badge_texte?: string
          badge_couleur?: string
          lien_url?: string | null
          code_promo?: string | null
          valeur_reduction?: string | null
          actif?: boolean
          ordre_affichage?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ecoles: {
        Row: {
          id: string
          name: string
          type: string
          city: string
          website: string | null
          description: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          city: string
          website?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          city?: string
          website?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      avis_ecoles: {
        Row: {
          id: string
          ecole_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ecole_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ecole_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avis_ecoles_ecole_id_fkey"
            columns: ["ecole_id"]
            isOneToOne: false
            referencedRelation: "ecoles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avis_ecoles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_1?: string
          participant_2?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      jpos: {
        Row: {
          id: string
          nom_ecole: string
          date: string
          ville: string
          region: string
          type_ecole: string
          lien_inscription: string | null
          source_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom_ecole: string
          date: string
          ville: string
          region?: string
          type_ecole?: string
          lien_inscription?: string | null
          source_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom_ecole?: string
          date?: string
          ville?: string
          region?: string
          type_ecole?: string
          lien_inscription?: string | null
          source_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      springr_user_type: "etudiant" | "entreprise"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user"],
      springr_user_type: ["etudiant", "entreprise"],
    },
  },
} as const
