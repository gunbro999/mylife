export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      writings: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          word_count: number;
          is_draft: boolean;
          tags: string[];
          mood: string | null;
          weather: string | null;
          cover_image: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          content?: string;
          word_count?: number;
          is_draft?: boolean;
          tags?: string[];
          mood?: string | null;
          weather?: string | null;
          cover_image?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          content?: string;
          word_count?: number;
          is_draft?: boolean;
          tags?: string[];
          mood?: string | null;
          weather?: string | null;
          cover_image?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      novels: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          cover_emoji: string;
          status: string;
          target_word_count: number;
          daily_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          cover_emoji?: string;
          status?: string;
          target_word_count?: number;
          daily_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          cover_emoji?: string;
          status?: string;
          target_word_count?: number;
          daily_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          novel_id: string;
          user_id: string;
          title: string;
          content: string;
          word_count: number;
          sort_order: number;
          parent_chapter_id: string | null;
          is_volume: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          novel_id: string;
          user_id: string;
          title: string;
          content?: string;
          word_count?: number;
          sort_order: number;
          parent_chapter_id?: string | null;
          is_volume?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          novel_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          word_count?: number;
          sort_order?: number;
          parent_chapter_id?: string | null;
          is_volume?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          novel_id: string;
          user_id: string;
          name: string;
          avatar: string;
          role: string;
          gender: string;
          age: string;
          personality: string;
          appearance: string;
          background: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          novel_id: string;
          user_id: string;
          name: string;
          avatar?: string;
          role?: string;
          gender?: string;
          age?: string;
          personality?: string;
          appearance?: string;
          background?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          novel_id?: string;
          user_id?: string;
          name?: string;
          avatar?: string;
          role?: string;
          gender?: string;
          age?: string;
          personality?: string;
          appearance?: string;
          background?: string;
          notes?: string;
          created_at?: string;
        };
      };
      character_relations: {
        Row: {
          id: string;
          novel_id: string;
          user_id: string;
          character_a_id: string;
          character_b_id: string;
          type: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          novel_id: string;
          user_id: string;
          character_a_id: string;
          character_b_id: string;
          type: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          novel_id?: string;
          user_id?: string;
          character_a_id?: string;
          character_b_id?: string;
          type?: string;
          description?: string;
          created_at?: string;
        };
      };
      world_settings: {
        Row: {
          id: string;
          novel_id: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          novel_id: string;
          user_id: string;
          category: string;
          title: string;
          content?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          novel_id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          content?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      excerpts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          author: string;
          dynasty: string | null;
          type: string;
          source_title: string | null;
          personal_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          author: string;
          dynasty?: string | null;
          type: string;
          source_title?: string | null;
          personal_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          author?: string;
          dynasty?: string | null;
          type?: string;
          source_title?: string | null;
          personal_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      emotion_logs: {
        Row: {
          id: string;
          user_id: string;
          writing_id: string | null;
          date: string;
          overall_mood: string;
          scores: Json;
          summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          writing_id?: string | null;
          date: string;
          overall_mood: string;
          scores: Json;
          summary?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          writing_id?: string | null;
          date?: string;
          overall_mood?: string;
          scores?: Json;
          summary?: string;
          created_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          content: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      created_poems: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          genre: string;
          source_ids: string[];
          ai_provider: string;
          ai_model: string;
          edited_content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          genre: string;
          source_ids?: string[];
          ai_provider: string;
          ai_model: string;
          edited_content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          genre?: string;
          source_ids?: string[];
          ai_provider?: string;
          ai_model?: string;
          edited_content?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
