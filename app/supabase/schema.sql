-- ═══════════════════════════════════════════
-- 浮生记 (MyLife) — 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ═══════════════════════════════════════════

-- 启用 uuid-ossp 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════
-- 核心表
-- ═══════════════════════════════════════════

-- 写作表 (日记/随笔/笔记/小说章节)
CREATE TABLE writings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('diary', 'essay', 'note')),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT,
  weather TEXT,
  cover_image TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_writings_user_id ON writings(user_id);
CREATE INDEX idx_writings_type ON writings(type);
CREATE INDEX idx_writings_created_at ON writings(created_at DESC);
CREATE INDEX idx_writings_user_type ON writings(user_id, type);

-- 小说表
CREATE TABLE novels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_emoji TEXT NOT NULL DEFAULT '📖',
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'writing', 'completed', 'paused')),
  target_word_count INTEGER NOT NULL DEFAULT 0,
  daily_goal INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_novels_user_id ON novels(user_id);

-- 章节表
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  is_volume BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX idx_chapters_sort ON chapters(novel_id, sort_order);

-- 人物表
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '😊',
  role TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  personality TEXT NOT NULL DEFAULT '',
  appearance TEXT NOT NULL DEFAULT '',
  background TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_novel_id ON characters(novel_id);

-- 人物关系表
CREATE TABLE character_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_a_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  character_b_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT '其他',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_character_relations_novel_id ON character_relations(novel_id);

-- 世界设定表
CREATE TABLE world_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_world_settings_novel_id ON world_settings(novel_id);

-- 摘录表
CREATE TABLE excerpts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  dynasty TEXT,
  type TEXT NOT NULL CHECK (type IN ('诗', '词', '曲', '文')),
  source_title TEXT,
  personal_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_excerpts_user_id ON excerpts(user_id);
CREATE INDEX idx_excerpts_type ON excerpts(type);

-- 情绪记录表
CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  writing_id UUID REFERENCES writings(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  overall_mood TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_emotion_logs_user_id ON emotion_logs(user_id);
CREATE INDEX idx_emotion_logs_date ON emotion_logs(date);

-- AI 创作诗歌表
CREATE TABLE created_poems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  genre TEXT NOT NULL,
  source_ids TEXT[] NOT NULL DEFAULT '{}',
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  edited_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_created_poems_user_id ON created_poems(user_id);

-- ═══════════════════════════════════════════
-- RLS (Row Level Security) 策略
-- ═══════════════════════════════════════════

-- 所有表的通用 RLS 策略：用户只能操作自己的数据
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['writings', 'novels', 'chapters', 'characters', 'character_relations', 'world_settings', 'excerpts', 'emotion_logs', 'created_poems'])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "Users can manage own data" ON %I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', tbl);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════
-- Storage Bucket (图片存储)
-- ═══════════════════════════════════════════

-- 请在 Supabase Dashboard → Storage 中手动创建 bucket:
-- Bucket name: writing-images
-- Public bucket: YES
-- 然后在 SQL Editor 中执行以下 RLS:

-- Storage RLS: 用户只能访问自己的图片
-- CREATE POLICY "Users can upload own images" ON storage.objects
--   FOR INSERT WITH CHECK (auth.uid() = (storage.foldername(name))[1]::uuid);
-- CREATE POLICY "Users can view own images" ON storage.objects
--   FOR SELECT USING (auth.uid() = (storage.foldername(name))[1]::uuid);
-- CREATE POLICY "Users can delete own images" ON storage.objects
--   FOR DELETE USING (auth.uid() = (storage.foldername(name))[1]::uuid);

-- ═══════════════════════════════════════════
-- 全文搜索索引
-- ═══════════════════════════════════════════

-- 为 writings 表创建全文搜索索引 (使用 pg_bigm 或内置 tsvector)
-- 中文搜索建议使用 pg_bigm 扩展 (CREATE EXTENSION IF NOT EXISTS pg_bigm;)
-- 或在应用层实现搜索

-- 简单的 tsvector 索引 (适用于英文/拼音，中文效果有限)
CREATE INDEX idx_writings_content_search ON writings USING gin(to_tsvector('simple', content));
CREATE INDEX idx_writings_title_search ON writings USING gin(to_tsvector('simple', title));

-- ═══════════════════════════════════════════
-- 触发器: 自动更新 updated_at
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['writings', 'novels', 'chapters', 'excerpts'])
  LOOP
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
  END LOOP;
END $$;
