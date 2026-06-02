-- Carefinder seed data — 20 hospitals across 5 Nigerian cities
-- All coordinates within Nigeria bounding box (lat 4–14°N, lng 2–15°E)
-- All phone numbers match +234[0-9]{10} format
-- Mixed specialties and ownership types

BEGIN;

INSERT INTO public.hospitals
  (name, address, city, lga, phone, email, specialties, ownership, location,
   description_md, visiting_hours, status)
VALUES

-- ─────────────────────────────────────────────
-- LAGOS (4 hospitals)
-- ─────────────────────────────────────────────

(
  'Lagos General Hospital',
  '1 Marina, Lagos Island',
  'Lagos', 'Lagos Island',
  '+2348001234567',
  'info@lagosgeneral.gov.ng',
  ARRAY['general', 'emergency'],
  'public',
  ST_MakePoint(3.3958, 6.4531)::GEOGRAPHY,
  '# Lagos General Hospital

A major public referral hospital on Lagos Island serving the Lagos metropolitan area. Equipped with 24-hour emergency services and a broad range of outpatient clinics.',
  'Monday – Friday: 8 am – 6 pm
Emergency: 24 hours, 7 days',
  'published'
),

(
  'St. Nicholas Hospital',
  '57 Campbell Street, Lagos Island',
  'Lagos', 'Lagos Island',
  '+2348012345670',
  'enquiries@stnicholas.com.ng',
  ARRAY['maternity', 'pediatric', 'general'],
  'private',
  ST_MakePoint(3.3912, 6.4475)::GEOGRAPHY,
  '# St. Nicholas Hospital

One of Lagos''s oldest private hospitals, offering maternal and child health services alongside general medical care. NHIS-accredited.',
  'Monday – Saturday: 7 am – 8 pm
Sunday: 9 am – 5 pm
Emergency: 24 hours',
  'published'
),

(
  'Reddington Hospital',
  '12 Idowu Martins Street, Victoria Island',
  'Lagos', 'Eti-Osa',
  '+2348023456780',
  'contact@reddingtonhospital.com',
  ARRAY['emergency', 'cardiology', 'orthopedic'],
  'private',
  ST_MakePoint(3.4222, 6.4281)::GEOGRAPHY,
  '# Reddington Hospital

A tertiary private hospital on Victoria Island with specialist cardiac and orthopaedic units. JCI-accredited with an intensive care facility.',
  'All services: 24 hours, 7 days',
  'published'
),

(
  'Ikeja General Hospital',
  'Hospital Road, Ikeja',
  'Lagos', 'Ikeja',
  '+2348034567890',
  'ikejagh@lagosstate.gov.ng',
  ARRAY['general', 'emergency', 'pediatric'],
  'public',
  ST_MakePoint(3.3424, 6.6018)::GEOGRAPHY,
  '# Ikeja General Hospital

The main public referral hospital for mainland Lagos. Provides emergency, outpatient, and paediatric services to residents of Ikeja and surrounding LGAs.',
  'Monday – Friday: 8 am – 5 pm
Emergency: 24 hours',
  'published'
),

-- ─────────────────────────────────────────────
-- ABUJA (4 hospitals)
-- ─────────────────────────────────────────────

(
  'National Hospital Abuja',
  'Plot 132 Central Business District',
  'Abuja', 'Municipal Area Council',
  '+2348045678901',
  'info@nationalhospital.gov.ng',
  ARRAY['general', 'emergency', 'cardiology', 'orthopedic'],
  'public',
  ST_MakePoint(7.4915, 9.0579)::GEOGRAPHY,
  '# National Hospital Abuja

The Federal Government''s flagship tertiary hospital in the capital. Offers specialist cardiac surgery, orthopaedics, and a 24-hour trauma centre.',
  'All services: 24 hours, 7 days',
  'published'
),

(
  'Garki General Hospital',
  '1 Hospital Road, Garki',
  'Abuja', 'Municipal Area Council',
  '+2348056789012',
  'garki@fct.gov.ng',
  ARRAY['general', 'maternity', 'pediatric'],
  'public',
  ST_MakePoint(7.4905, 9.0415)::GEOGRAPHY,
  '# Garki General Hospital

An FCT-run district hospital in Garki offering antenatal care, delivery services, paediatric outpatient clinics, and general medicine.',
  'Monday – Friday: 8 am – 5 pm
Maternity: 24 hours',
  'published'
),

(
  'Maitama District Hospital',
  '3 Dar es Salaam Crescent, Maitama',
  'Abuja', 'Municipal Area Council',
  '+2348067890123',
  NULL,
  ARRAY['general', 'emergency'],
  'public',
  ST_MakePoint(7.5102, 9.0892)::GEOGRAPHY,
  '# Maitama District Hospital

A district-level public hospital serving the Maitama diplomatic zone. Provides general outpatient consultations and emergency first-response services.',
  'Monday – Saturday: 7 am – 7 pm
Emergency: 24 hours',
  'published'
),

(
  'Cedarcrest Hospitals',
  '7 Kumasi Crescent, Wuse 2',
  'Abuja', 'Municipal Area Council',
  '+2348078901234',
  'abuja@cedarcresthospitals.com',
  ARRAY['maternity', 'pediatric', 'cardiology'],
  'private',
  ST_MakePoint(7.4932, 9.0755)::GEOGRAPHY,
  '# Cedarcrest Hospitals

A leading private multi-specialist hospital in Abuja with a dedicated NICU, paediatric ward, and cardiac diagnostics suite.',
  'All services: 24 hours, 7 days',
  'published'
),

-- ─────────────────────────────────────────────
-- KANO (4 hospitals)
-- ─────────────────────────────────────────────

(
  'Aminu Kano Teaching Hospital',
  'Hospital Road, Tarauni',
  'Kano', 'Tarauni',
  '+2348089012345',
  'info@akth.edu.ng',
  ARRAY['general', 'emergency', 'maternity', 'pediatric'],
  'public',
  ST_MakePoint(8.5241, 11.9921)::GEOGRAPHY,
  '# Aminu Kano Teaching Hospital

The major federal teaching hospital in Kano State, affiliated with Bayero University. Provides tertiary care including obstetrics, neonatology, and trauma surgery.',
  'All services: 24 hours, 7 days',
  'published'
),

(
  'Murtala Mohammed Specialist Hospital',
  'Muhammadu Buhari Way, Fagge',
  'Kano', 'Fagge',
  '+2348090123456',
  NULL,
  ARRAY['general', 'maternity', 'orthopedic'],
  'public',
  ST_MakePoint(8.5178, 12.0003)::GEOGRAPHY,
  '# Murtala Mohammed Specialist Hospital

Kano State Government specialist hospital offering maternity services, orthopaedic surgery, and general medicine. NHIS-accredited.',
  'Monday – Saturday: 7 am – 6 pm
Maternity: 24 hours',
  'published'
),

(
  'Hasiya Bayero Paediatric Hospital',
  'Zoo Road, Nasarawa',
  'Kano', 'Nasarawa',
  '+2348001234568',
  NULL,
  ARRAY['pediatric'],
  'public',
  ST_MakePoint(8.5310, 11.9980)::GEOGRAPHY,
  '# Hasiya Bayero Paediatric Hospital

A dedicated children''s hospital run by Kano State providing inpatient, outpatient, and emergency paediatric services including a nutritional rehabilitation unit.',
  'Monday – Friday: 8 am – 5 pm
Emergency: 24 hours',
  'published'
),

(
  'Clinocare Hospital',
  '45 Bompai Road, Nassarawa',
  'Kano', 'Nassarawa',
  '+2348012345671',
  'info@clinocare.ng',
  ARRAY['general', 'dental', 'eye'],
  'private',
  ST_MakePoint(8.5432, 12.0052)::GEOGRAPHY,
  '# Clinocare Hospital

A private multi-specialty clinic in Kano offering general consultations, dental care, and ophthalmic services under one roof.',
  'Monday – Saturday: 8 am – 7 pm
Sunday: 10 am – 4 pm',
  'published'
),

-- ─────────────────────────────────────────────
-- PORT HARCOURT (4 hospitals)
-- ─────────────────────────────────────────────

(
  'University of Port Harcourt Teaching Hospital',
  'East-West Road, Choba',
  'Port Harcourt', 'Obio-Akpor',
  '+2348023456781',
  'info@upth.gov.ng',
  ARRAY['general', 'emergency', 'maternity', 'pediatric'],
  'public',
  ST_MakePoint(7.0134, 4.8156)::GEOGRAPHY,
  '# University of Port Harcourt Teaching Hospital

The premier federal teaching hospital in Rivers State, offering a full range of tertiary medical and surgical services including a Level 3 NICU and trauma centre.',
  'All services: 24 hours, 7 days',
  'published'
),

(
  'Braithwaite Memorial Specialist Hospital',
  'Aba Road, Diobu',
  'Port Harcourt', 'Port Harcourt',
  '+2348034567891',
  NULL,
  ARRAY['general', 'emergency', 'orthopedic'],
  'public',
  ST_MakePoint(7.0120, 4.7787)::GEOGRAPHY,
  '# Braithwaite Memorial Specialist Hospital

A Rivers State Government specialist hospital providing orthopaedic surgery, general surgery, and 24-hour emergency services.',
  'All services: 24 hours, 7 days',
  'published'
),

(
  'Kelsey Harrison Hospital',
  '68 Rumuola Road, Rumuola',
  'Port Harcourt', 'Port Harcourt',
  '+2348045678902',
  'info@kelseyharrison.com',
  ARRAY['maternity', 'pediatric'],
  'private',
  ST_MakePoint(7.0251, 4.7835)::GEOGRAPHY,
  '# Kelsey Harrison Hospital

A well-established private hospital in Port Harcourt renowned for its maternal and child health services, with a fully equipped delivery suite and NICU.',
  'All services: 24 hours, 7 days',
  'published'
),

(
  'Meridian Hospitals',
  '23 Birabi Street, GRA Phase 1',
  'Port Harcourt', 'Port Harcourt',
  '+2348056789013',
  'portharcourt@meridianhospitals.com',
  ARRAY['general', 'dental', 'emergency'],
  'private',
  ST_MakePoint(7.0043, 4.7699)::GEOGRAPHY,
  '# Meridian Hospitals Port Harcourt

A private full-service hospital in GRA offering emergency care, dental services, and general outpatient consultations in a modern facility.',
  'Monday – Saturday: 7 am – 9 pm
Emergency: 24 hours',
  'published'
),

-- ─────────────────────────────────────────────
-- IBADAN (4 hospitals)
-- ─────────────────────────────────────────────

(
  'University College Hospital',
  'Queen Elizabeth II Road, Aleshinloye',
  'Ibadan', 'Ibadan North',
  '+2348067890124',
  'info@uch-ibadan.edu.ng',
  ARRAY['general', 'emergency', 'maternity', 'pediatric', 'cardiology'],
  'public',
  ST_MakePoint(3.8969, 7.4013)::GEOGRAPHY,
  '# University College Hospital

Nigeria''s first teaching hospital, affiliated with the University of Ibadan. Offers sub-specialist services across all major disciplines including cardiac surgery, oncology, and neonatology.',
  'All services: 24 hours, 7 days',
  'published'
),

(
  'Adeoyo State Hospital',
  'Ring Road, Ibadan',
  'Ibadan', 'Ibadan South-West',
  '+2348078901235',
  NULL,
  ARRAY['general', 'maternity', 'pediatric'],
  'public',
  ST_MakePoint(3.8881, 7.3772)::GEOGRAPHY,
  '# Adeoyo State Hospital

A Oyo State Government hospital on Ring Road offering maternity and paediatric services to residents of south-west Ibadan.',
  'Monday – Friday: 8 am – 5 pm
Maternity: 24 hours',
  'published'
),

(
  'Jericho General Hospital',
  'Jericho Road, Jericho',
  'Ibadan', 'Ibadan North-East',
  '+2348089012346',
  'jericho@oyostate.gov.ng',
  ARRAY['general', 'emergency'],
  'public',
  ST_MakePoint(3.9123, 7.4121)::GEOGRAPHY,
  '# Jericho General Hospital

A state-run general hospital serving the Jericho and Bodija corridors of Ibadan. Provides emergency, outpatient, and surgical services.',
  'Monday – Saturday: 7 am – 7 pm
Emergency: 24 hours',
  'published'
),

(
  'St. Mary''s Catholic Hospital',
  '15 Kongi Road, Bodija',
  'Ibadan', 'Ibadan North',
  '+2348090123457',
  'info@stmarysibadan.org',
  ARRAY['maternity', 'pediatric', 'dental'],
  'private',
  ST_MakePoint(3.9021, 7.4198)::GEOGRAPHY,
  '# St. Mary''s Catholic Hospital

A faith-based private hospital in Bodija with a strong reputation for maternal care and paediatric outpatient services, plus a dental clinic.',
  'Monday – Saturday: 7 am – 6 pm
Maternity: 24 hours',
  'published'
);

COMMIT;
