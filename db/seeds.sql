INSERT INTO department(name)
VALUES("Engineering"), ("Finance"), ("Legal"), ("Marketing"), ("Sales");

INSERT INTO role(title, salary, department_id)
VALUES("Software Engineer", 125000, 1), ("Lawyer", 80000, 3), ("Account Payable", 70000, 2), ("Customer Service", 60000, 5), ("Content creator", 96000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Virushan', 'Maheswaran', 1, null), ('Lavanya', 'virushan', 1, 2), ('Adithya', 'Virushan', 1, null), ('Chandini', 'Patel', 4, 2), ('Ruha', 'Bai', 4, 4);