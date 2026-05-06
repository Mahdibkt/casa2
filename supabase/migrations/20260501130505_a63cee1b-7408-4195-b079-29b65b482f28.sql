
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  titre text NOT NULL,
  prix numeric NOT NULL,
  description text,
  image_url text,
  localisation text,
  type text NOT NULL DEFAULT 'vente',
  chambres int4 NOT NULL DEFAULT 0,
  surface numeric,
  commodites text[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (true);
