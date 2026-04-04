
-- Create cats table
CREATE TABLE public.cats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_id TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  city TEXT NOT NULL,
  is_neutered BOOLEAN NOT NULL DEFAULT false,
  photo_url TEXT NOT NULL,
  neutered_at TIMESTAMP WITH TIME ZONE,
  neutered_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  donor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access (no auth required for this app)
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read cats" ON public.cats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert cats" ON public.cats FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update cats" ON public.cats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read donations" ON public.donations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert donations" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('cat-photos', 'cat-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('neutered-proofs', 'neutered-proofs', true);

-- Storage policies
CREATE POLICY "Allow public upload cat photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'cat-photos');
CREATE POLICY "Allow public read cat photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'cat-photos');
CREATE POLICY "Allow public upload neutered proofs" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'neutered-proofs');
CREATE POLICY "Allow public read neutered proofs" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'neutered-proofs');
