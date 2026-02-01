-- Seed Agents
INSERT INTO public.agents (id, name, role, specialty, image, phone, email, bio)
VALUES
(
  'ag_01',
  'Jatin Sharabu ',
  'Senior Broker',
  'Studio Apartments',
  '/Jatin.jpeg',
  '+91 8700273095',
  'vhorizonproperties@gmail.com',
  'With over 15 years of experience in Studio Apartments.'
),
(
  'ag_02',
  'Aarav Dhaka',
  'Director of Sales',
  'Luxury Penthouses',
  '/Aarav.jpeg',
  '+91 97604 40610',
  'vhorizonproperties@gmail.com',
  'Aarav leads our operations with a keen eye for ultra-luxury penthouses and premium properties.'
),
(
  'ag_03',
  'Utkarsh Badhoutia',
  'Director',
  'commercial ',
  '/Utkarsh.png',
  '+91 99106 86088',
  'vhorizonproperties@gmail.com',
  'Utkarsh brings 10 years of expertise in commercial properties, with a focus on NCR''s commercial properties.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  image = EXCLUDED.image,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio;

-- Seed Testimonials
INSERT INTO public.testimonials (id, name, role, image, quote, rating, property_type)
VALUES
(
  't1',
  'Rajesh Gupta',
  'Tech Entrepreneur',
  '/rajesh.jpg',
  'V Horizon Properties made finding our dream home in Noida effortless. Their attention to detail and understanding of our needs was exceptional.',
  5,
  'Villa'
),
(
  't2',
  'Ananya Patel',
  'Film Producer',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
  'The team at V Horizon helped us find the perfect penthouse with stunning views. Their professionalism and market knowledge is unmatched.',
  5,
  'Penthouse'
),
(
  't3',
  'Vikram Singh',
  'Investment Banker',
  '/vikram.png',
  'Exceptional service from start to finish. They understood exactly what we were looking for and delivered beyond our expectations.',
  5,
  'Estate'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  image = EXCLUDED.image,
  quote = EXCLUDED.quote,
  rating = EXCLUDED.rating,
  property_type = EXCLUDED.property_type;
