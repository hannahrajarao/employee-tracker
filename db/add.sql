-- Insert into department
INSERT INTO department (name)
VALUES ('Service');

-- Insert into role
INSERT INTO role (title, salary, department_id)
VALUES ('Customer Service', 80000, 5);

-- Insert into employee
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Sam', 'Kash', 9, null);