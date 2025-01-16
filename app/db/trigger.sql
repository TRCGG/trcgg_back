-- postgres

CREATE OR REPLACE FUNCTION map_subaccount_to_main_name()
RETURNS TRIGGER AS $$
BEGIN
    -- mapping_name에서 부계정과 매칭되는 본계정을 찾음
    IF EXISTS (
        SELECT 1 
        FROM mapping_name 
        WHERE sub_name = NEW.riot_name AND sub_name_tag = NEW.riot_name_tag
    ) THEN
        SELECT main_name, main_name_tag
        INTO NEW.riot_name, NEW.riot_name_tag
        FROM mapping_name
        WHERE sub_name = NEW.riot_name AND sub_name_tag = NEW.riot_name_tag;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER riot_name_mapping_trigger
BEFORE INSERT ON league
FOR EACH ROW
EXECUTE FUNCTION map_subaccount_to_main_name();

CREATE TRIGGER riot_name_mapping_trigger
BEFORE INSERT OR UPDATE ON league
FOR EACH ROW
EXECUTE FUNCTION map_subaccount_to_main_name();