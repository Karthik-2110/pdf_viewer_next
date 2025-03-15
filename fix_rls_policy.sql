-- First, ensure RLS is enabled on the organization table
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert into organization" ON organization;
DROP POLICY IF EXISTS "Allow users to read organization data" ON organization;
DROP POLICY IF EXISTS "Allow users to update organization data" ON organization;
DROP POLICY IF EXISTS "Allow users to read their own organization data" ON organization;
DROP POLICY IF EXISTS "Allow users to update their own organization data" ON organization;
DROP POLICY IF EXISTS "Allow public access to organization" ON organization;

-- Create a policy that allows public access to the organization table
-- This is less secure but will work for testing purposes
CREATE POLICY "Allow public access to organization"
ON organization
USING (true)
WITH CHECK (true);

-- Alternatively, you can create separate policies for authenticated users
-- CREATE POLICY "Allow authenticated users to insert into organization"
-- ON organization
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- CREATE POLICY "Allow users to read organization data"
-- ON organization
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- CREATE POLICY "Allow users to update organization data"
-- ON organization
-- FOR UPDATE
-- TO authenticated
-- USING (true)
-- WITH CHECK (true); 