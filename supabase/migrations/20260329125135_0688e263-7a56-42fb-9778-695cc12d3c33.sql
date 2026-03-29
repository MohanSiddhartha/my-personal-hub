
-- Saved articles table
CREATE TABLE public.saved_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  source text,
  image_url text,
  published_at timestamp with time zone,
  saved_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own saved articles"
  ON public.saved_articles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
