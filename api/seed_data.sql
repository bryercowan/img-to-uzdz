-- Database seeding script for img-to-uzdz API
-- Run this after creating the database schema

-- 1. Create a test regular user (you can signup through API instead)
INSERT INTO users (id, email, password_hash, created_at, updated_at) 
VALUES (
    'test-user-id-1234567890abcdef', 
    'test@example.com', 
    '$2b$12$example.hash.for.password123', 
    NOW(), 
    NOW()
);

-- 2. Create test organization for the user
INSERT INTO orgs (id, name, owner_user_id, created_at, updated_at)
VALUES (
    'test-org-id-1234567890abcdef',
    'Test Organization',
    'test-user-id-1234567890abcdef',
    NOW(),
    NOW()
);

-- Note: Stripe products should be created in your Stripe dashboard:
-- 1. Starter Package: 10 credits for $10.00
-- 2. Professional Package: 50 credits for $45.00  
-- 3. Enterprise Package: 200 credits for $160.00
-- The system will pull these via Stripe API

-- 3. Create some sample jobs for testing the dashboard
INSERT INTO jobs (id, org_id, status, cost_credits, created_at, updated_at) VALUES
('job-1-completed', 'test-org-id-1234567890abcdef', 'completed', 2.5, NOW() - INTERVAL '1 hour', NOW()),
('job-2-completed', 'test-org-id-1234567890abcdef', 'completed', 1.0, NOW() - INTERVAL '2 hours', NOW()),
('job-3-running', 'test-org-id-1234567890abcdef', 'running', 2.5, NOW() - INTERVAL '30 minutes', NOW()),
('job-4-failed', 'test-org-id-1234567890abcdef', 'failed', 0, NOW() - INTERVAL '45 minutes', NOW()),
('job-5-queued', 'test-org-id-1234567890abcdef', 'queued', 1.0, NOW() - INTERVAL '5 minutes', NOW());

-- 4. Create sample job images for the completed jobs
INSERT INTO job_images (id, job_id, storage_key, filename, created_at) VALUES
('img-1', 'job-1-completed', 'uploads/test-org/image1.jpg', 'product1.jpg', NOW() - INTERVAL '1 hour'),
('img-2', 'job-1-completed', 'uploads/test-org/image2.jpg', 'product2.jpg', NOW() - INTERVAL '1 hour'),
('img-3', 'job-1-completed', 'uploads/test-org/image3.jpg', 'product3.jpg', NOW() - INTERVAL '1 hour'),
('img-4', 'job-2-completed', 'uploads/test-org/image4.jpg', 'shoe1.jpg', NOW() - INTERVAL '2 hours'),
('img-5', 'job-2-completed', 'uploads/test-org/image5.jpg', 'shoe2.jpg', NOW() - INTERVAL '2 hours'),
('img-6', 'job-2-completed', 'uploads/test-org/image6.jpg', 'shoe3.jpg', NOW() - INTERVAL '2 hours');

-- 5. Create sample job outputs for completed jobs
INSERT INTO job_outputs (id, job_id, format, storage_key, size_bytes, created_at) VALUES
('out-1-glb', 'job-1-completed', 'glb', 'outputs/job-1/model.glb', 2048576, NOW() - INTERVAL '55 minutes'),
('out-1-usdz', 'job-1-completed', 'usdz', 'outputs/job-1/model.usdz', 1536000, NOW() - INTERVAL '55 minutes'),
('out-2-glb', 'job-2-completed', 'glb', 'outputs/job-2/model.glb', 1876543, NOW() - INTERVAL '1 hour 55 minutes'),
('out-2-usdz', 'job-2-completed', 'usdz', 'outputs/job-2/model.usdz', 1423987, NOW() - INTERVAL '1 hour 55 minutes');

-- 6. Create sample credits transactions
INSERT INTO credits_ledger (id, org_id, amount, transaction_type, reference_type, reference_id, created_at) VALUES
('credit-1', 'test-org-id-1234567890abcdef', 50.0, 'purchase', 'stripe_payment', 'pi_test123', NOW() - INTERVAL '3 days'),
('credit-2', 'test-org-id-1234567890abcdef', -2.5, 'job_charge', 'job', 'job-1-completed', NOW() - INTERVAL '1 hour'),
('credit-3', 'test-org-id-1234567890abcdef', -1.0, 'job_charge', 'job', 'job-2-completed', NOW() - INTERVAL '2 hours'),
('credit-4', 'test-org-id-1234567890abcdef', 100.0, 'purchase', 'stripe_payment', 'pi_test456', NOW() - INTERVAL '1 week');

-- 7. Create sample usage events for the admin activity feed
INSERT INTO usage_events (id, user_id, org_id, event_type, description, timestamp) VALUES  
(gen_random_uuid(), 'test-user-id-1234567890abcdef', 'test-org-id-1234567890abcdef', 'job_completed', 'Job job-1-completed finished successfully', NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), 'test-user-id-1234567890abcdef', 'test-org-id-1234567890abcdef', 'job_created', 'New job job-3-running created with 4 images', NOW() - INTERVAL '30 minutes'),
(gen_random_uuid(), 'test-user-id-1234567890abcdef', 'test-org-id-1234567890abcdef', 'payment_processed', 'Credit purchase of 100 credits completed', NOW() - INTERVAL '1 week'),
(gen_random_uuid(), 'test-user-id-1234567890abcdef', 'test-org-id-1234567890abcdef', 'job_failed', 'Job job-4-failed failed due to insufficient image quality', NOW() - INTERVAL '45 minutes'),
(gen_random_uuid(), 'test-user-id-1234567890abcdef', 'test-org-id-1234567890abcdef', 'user_created', 'New user registered: test@example.com', NOW() - INTERVAL '3 days');

-- 8. Create a sample API key for testing
INSERT INTO api_keys (id, org_id, name, key_hash, created_at) VALUES
('api-key-test-123', 'test-org-id-1234567890abcdef', 'Test API Key', '$2b$12$example.hash.for.apikey456', NOW() - INTERVAL '2 days');

-- 9. Create sample Stripe customer record
INSERT INTO stripe_customers (id, org_id, stripe_customer_id, created_at, updated_at) VALUES
('stripe-cust-test', 'test-org-id-1234567890abcdef', 'cus_test1234567890', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Note: The admin user should be created via API signup:
-- POST /auth/signup with {"email": "admin@img-to-uzdz.com", "password": "your_secure_password", "org_name": "Admin Organization"}