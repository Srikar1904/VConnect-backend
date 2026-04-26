-- Insert test complaints
INSERT INTO complaints (complaint_id, user_mobile, type, location, description, image, status, created_at)
VALUES 
('C001', '9876543210', 'Road Damage', 'Main Street, Village A', 'Large pothole on main road causing accidents', 'https://via.placeholder.com/200', 'Pending', NOW()),
('C002', '9876543211', 'Water Supply Issue', 'North Colony, Village B', 'No water supply for past 3 days', 'https://via.placeholder.com/200', 'In Progress', NOW()),
('C003', '9876543212', 'Street Light Not Working', 'Market Area, Village C', 'Street lights in market area are not functioning', 'https://via.placeholder.com/200', 'Resolved', NOW()),
('C004', '9876543213', 'Garbage Collection', 'Residential Area, Village D', 'Garbage is not being collected regularly', 'https://via.placeholder.com/200', 'Pending', NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status);
