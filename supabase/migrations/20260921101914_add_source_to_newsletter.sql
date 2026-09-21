-- Add source column to newsletter_signups to track where signups come from
ALTER TABLE public.newsletter_signups ADD COLUMN source text DEFAULT 'homepage';
