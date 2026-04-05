-- ==========================================
-- SIRA - Complete Supabase Database Setup
-- ==========================================
-- Run this in Supabase SQL Editor to set up all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 2. NOTES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own notes" ON public.notes 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 3. SNIPPETS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  code TEXT DEFAULT '',
  language TEXT NOT NULL DEFAULT 'typescript',
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own snippets" ON public.snippets 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. PORTFOLIO: EXPERIENCES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own experiences" ON public.experiences 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 5. PORTFOLIO: PROJECTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  link TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects" ON public.portfolio_projects 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 6. PORTFOLIO: EDUCATION TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own education" ON public.education 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 7. PORTFOLIO: SKILLS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own skills" ON public.skills 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 8. QUIZ RESULTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  score INT NOT NULL,
  total INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own quiz results" ON public.quiz_results 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 9. SAVED ARTICLES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.saved_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  source text,
  image_url text,
  published_at timestamp with time zone,
  saved_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own saved articles" ON public.saved_articles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 10. STORAGE: FILE VAULT
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('vault-files', 'vault-files', false, 20971520)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==========================================
-- SETUP COMPLETE
-- ==========================================
-- All tables created successfully!
-- You can now use your app with full functionality.
