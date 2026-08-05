-- Seed reference data: roles, one bootstrap admin, sample subscription plans

INSERT INTO role (name, description) VALUES
    ('ADMIN', 'Full access: members, subscriptions, plans, staff & roles'),
    ('TRAINER', 'Staff-level access: members and subscriptions only');

-- Bootstrap admin login: username=admin / password=admin123 (change after first login)
INSERT INTO staff_user (username, email, password_hash, role_id, deleted, created_at, updated_at)
VALUES (
    'admin',
    'admin@ironforge.local',
    '$2b$10$PpFrKmqGTjbRxblWvleNe.ok5krjSw0KMD.8Q33PgS5/zD7b8XIPC',
    (SELECT id FROM role WHERE name = 'ADMIN'),
    FALSE,
    NOW(),
    NOW()
);

INSERT INTO subscription_plan (name, duration_days, price_amount, price_currency, description, active) VALUES
    ('Monthly',      30,  25.00, 'EUR', 'Standard monthly membership',            TRUE),
    ('Quarterly',    90,  65.00, 'EUR', '3-month membership, small discount',      TRUE),
    ('Annual',       365, 220.00,'EUR', 'Best value, full-year membership',        TRUE);
