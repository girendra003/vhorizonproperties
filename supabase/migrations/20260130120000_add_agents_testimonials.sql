-- Create agents table
CREATE TABLE public.agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  image TEXT,
  phone TEXT,
  email TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  image TEXT,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  property_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public can view agents"
  ON public.agents
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view testimonials"
  ON public.testimonials
  FOR SELECT
  USING (true);

-- Admin write access policies (assuming admin role exists or authenticated users for now)
-- Adjust based on actual auth setup, using basic authenticated check for simplicity if admin role logic isn't fully robust yet, 
-- but respecting 'has_role' if that function exists (as seen in properties table).

CREATE POLICY "Admins can insert agents"
  ON public.agents
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update agents"
  ON public.agents
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete agents"
  ON public.agents
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
