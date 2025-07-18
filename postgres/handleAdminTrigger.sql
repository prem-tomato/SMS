CREATE OR REPLACE FUNCTION ensure_single_admin_per_society()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if new role is 'admin'
    IF NEW.role = 'admin' THEN

        -- Demote any other existing admin in the same society
        UPDATE public.users
        SET role = 'member' -- demote to 'user', adjust as needed
        WHERE society_id = NEW.society_id
          AND role = 'admin'
          AND id <> NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_ensure_single_admin_per_society
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION ensure_single_admin_per_society();
