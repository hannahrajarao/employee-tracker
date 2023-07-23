-- Display department
SELECT * FROM department;

-- Display role
SELECT role.id, role.title, department.name AS department, role.salary
FROM role
JOIN department ON role.department_id = department.id;

-- Display employees
SELECT
  e.id,
  e.first_name,
  e.last_name,
  r.title AS role,
  d.name AS department,
  m.first_name AS manager_first_name,
  m.last_name AS manager_last_name
FROM
  employee e
LEFT JOIN role r ON e.role_id = r.id
LEFT JOIN department d ON r.department_id = d.id
LEFT JOIN employee m ON e.manager_id = m.id;

