-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to generate UUIDv7 (if not supported natively)
-- This is a compatibility function for uuid_generate_v7()
CREATE
OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid LANGUAGE sql AS $ $
SELECT
    uuid_generate_v4();

$ $;
