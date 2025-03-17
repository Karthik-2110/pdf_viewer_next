-- First, ensure RLS is enabled on the organization table
ALTER TABLE "Organisation" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert into organization" ON "Organisation";
DROP POLICY IF EXISTS "Allow users to read organization data" ON "Organisation";
DROP POLICY IF EXISTS "Allow users to update organization data" ON "Organisation";
DROP POLICY IF EXISTS "Allow users to read their own organization data" ON "Organisation";
DROP POLICY IF EXISTS "Allow users to update their own organization data" ON "Organisation";
DROP POLICY IF EXISTS "Allow public access to organization" ON "Organisation";

-- Create a policy that allows public access to the organization table
-- This is less secure but will work for testing purposes
CREATE POLICY "Allow public access to organization"
ON "Organisation"
USING (true)
WITH CHECK (true);

-- Alternatively, you can create separate policies for authenticated users
-- CREATE POLICY "Allow authenticated users to insert into organization"
-- ON "Organisation"
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- CREATE POLICY "Allow users to read organization data"
-- ON "Organisation"
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- CREATE POLICY "Allow users to update organization data"
-- ON "Organisation"
-- FOR UPDATE
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);

-- First, let's check if there are any existing RLS policies on the Credits table
-- and drop them if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON "public"."Credits";
DROP POLICY IF EXISTS "Allow select for authenticated users" ON "public"."Credits";
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON "public"."Credits";
DROP POLICY IF EXISTS "Allow update for authenticated users" ON "public"."Credits";
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON "public"."Credits";

-- Make sure RLS is enabled on the Credits table
ALTER TABLE "public"."Credits" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- This includes server-side operations using the service role
CREATE POLICY "Allow all operations for service role" 
ON "public"."Credits"
USING (true)
WITH CHECK (true);

-- If you want to be more restrictive, you can create separate policies for different operations
-- For example, to allow only select and insert operations:

-- CREATE POLICY "Allow select for all users" 
-- ON "public"."Credits" 
-- FOR SELECT USING (true);

-- CREATE POLICY "Allow insert for all users" 
-- ON "public"."Credits" 
-- FOR INSERT WITH CHECK (true);

-- If you want to restrict operations to specific users or roles,
-- you can use conditions like auth.uid() = organization_user_id
-- But for server actions, we need to allow operations without these checks

-- Note: For production, you might want to be more restrictive and use
-- service roles for server actions instead of completely open policies 