DROP DATABASE IF EXISTS employeetracker_db;
CREATE DATABASE employeetracker_db;

USE employeetracker_db;

CREATE TABLE department (
id INTEGER(10) AUTO_INCREMENT,
name VARCHAR(30) NOT NULL,
PRIMARY KEY (id)
);

CREATE TABLE role (
id INTEGER(10) AUTO_INCREMENT,
title VARCHAR(30) NOT NULL,
salary DECIMAL(10,2),
department_id INTEGER(10),
PRIMARY KEY (id)
);

CREATE TABLE employee (
id INTEGER(10) AUTO_INCREMENT,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INTEGER(10),
manager_id INTEGER(10),
PRIMARY KEY (id)
);

INSERT INTO department (name)
VALUES ("Engineering"), ("Sales"), ("Finance"), ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", "90000", 1), ("Salesperson", "75000", 1),("Lead Engineer", "180000", 0), ("Engineer", "100000", 0), ("Lawyer", "160000", 3), ("Accountant", "160000", 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Dahlia", "Amade", 0, null), ("Allison", "Buck", 2, null), ("Leah", "Stan", 3, 1), ("Morgan", "Franklin", 5, null);
