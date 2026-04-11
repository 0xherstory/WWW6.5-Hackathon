
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  wallet_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create music_works table
CREATE TABLE public.music_works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  work_type TEXT NOT NULL DEFAULT 'recording',
  audio_url TEXT DEFAULT '',
  lyrics TEXT DEFAULT '',
  chord_progression TEXT DEFAULT '',
  hash TEXT DEFAULT '',
  is_on_chain BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.music_works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public works viewable by everyone" ON public.music_works FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own works" ON public.music_works FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own works" ON public.music_works FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own works" ON public.music_works FOR DELETE USING (auth.uid() = user_id);

-- Create blockchain_records table
CREATE TABLE public.blockchain_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID NOT NULL REFERENCES public.music_works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL,
  chain_name TEXT NOT NULL DEFAULT 'Avalanche Fuji',
  contract_address TEXT DEFAULT '',
  block_number BIGINT DEFAULT 0,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blockchain_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blockchain records viewable by everyone" ON public.blockchain_records FOR SELECT USING (true);
CREATE POLICY "Users can insert own records" ON public.blockchain_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create follows table
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID NOT NULL REFERENCES public.music_works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create plagiarism_reports table
CREATE TABLE public.plagiarism_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID NOT NULL REFERENCES public.music_works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  melody_score NUMERIC DEFAULT 0,
  chord_score NUMERIC DEFAULT 0,
  rhythm_score NUMERIC DEFAULT 0,
  lyrics_score NUMERIC DEFAULT 0,
  emotion_score NUMERIC DEFAULT 0,
  timbre_score NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plagiarism_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by work owner" ON public.plagiarism_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.plagiarism_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_music_works_updated_at BEFORE UPDATE ON public.music_works FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
