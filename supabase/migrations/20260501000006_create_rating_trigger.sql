-- Migration 006: Postgres trigger to maintain rating_avg and review_count
-- Fires automatically on INSERT, UPDATE, or DELETE on the reviews table.
-- Keeps hospitals.rating_avg and hospitals.review_count always in sync.
-- Only counts approved reviews in the aggregate.

CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle DELETE: use OLD.hospital_id
  -- Handle INSERT/UPDATE: use NEW.hospital_id
  UPDATE public.hospitals
  SET
    rating_avg = (
      SELECT COALESCE(AVG(rating::NUMERIC), 0)
      FROM public.reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires after any write operation on reviews
CREATE TRIGGER trigger_update_hospital_rating
  AFTER INSERT OR UPDATE OR DELETE
  ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hospital_rating();