const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require("util");

require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeetracker_db"
});

connection.query = util.promisify(connection.query);

function start () {
    inquirer.prompt([{
        name: "init",
        type: "list",
        message: "What Would You Like To Do?",
        choices: ['View All Employees', 'View Employees By Dept','View Employees By Manager', 'View Employees By Role', 'Add Employee', 'Add Role', 'Add Dept', 'Update Employee Role', 'Delete Employee', 'Exit']
    }]).then(function(answers) {
        //switch case
        switch(answers.init) {
        case 'View All Employees': viewAllEmployees();
            break;
        case 'View Employees By Dept': viewEmployeesDept();
            break;
        case 'View Employees By Manager': viewEmployeesManager();
            break;
        case 'View Employees By Role': viewEmployeesRole();
            break;
        case 'Add Employee': addEmployee();
            break;
        case 'Add Role': addRole();
            break;
        case 'Add Dept': addDept();
            break;
        case 'Update Employee Role': updateEmployeeRole();
            break;
        case 'Delete Employee': deleteEmployee();
            break;
        case 'Exit': exit();
            break;

        default: console.log("default");
        };
        
    })
};

//

function viewAllEmployees() {

    connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id;", function(err, res) {
        if (err) throw err;
        console.table(res);
        start();
    })
};


async function viewEmployeesDept() {

    var allDept = await connection.query("SELECT * FROM department;");
    var showDept = allDept.map(function(department){
        return department.name
    });

    inquirer.prompt([
        {type: "list",
        name: "departments", 
        message: "What department do you want to view?",
        choices: showDept 
    }
    ]).then(function(answers) {

        connection.query("SELECT employee.id, employee.first_name, employee.last_name, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.name=?;", [answers.departments], function(err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });

    })

};

async function viewEmployeesRole() {

    var allRoles = await connection.query("SELECT * FROM role;");
    var showRoles = allRoles.map(function(role){
        return role.title
    });

    inquirer.prompt([
        {
        type: "list",
        name: "roles", 
        message: "What role do you want to view?",
        choices: showRoles 
    }
    ]).then(function(answers) {

        connection.query("SELECT employee.id, employee.first_name, employee.last_name, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE role.title=?;", [answers.roles], function(err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });

    })

};

async function viewEmployeesManager() {

    var allManagers = await connection.query("SELECT * FROM role;");
    var showManagers = allManagers.map(function(role){
        return role.title
    });

    inquirer.prompt([
        {type: "list",
        name: "managers", 
        choices: showManagers 
    }
    ]).then(function(answers) {

        connection.query("SELECT employee.id, employee.first_name, employee.last_name, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE role.title=?;", [answers.managers], function(err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });

    })

};


async function addEmployee() {

    var allRoles = await connection.query("SELECT * FROM role;");
    var newRoles = allRoles.map(function(role){
        return role.id + ". " + role.title;
    });

    var allManagers = await connection.query("SELECT * FROM employee;");
    var newManagers = allManagers.map(function(employee){
        return employee.id + ". " + employee.first_name + " " + employee.last_name;
    })
    // [{name: "Sales Manager", value: 1}]
    inquirer.prompt([
    {
        type: "input",
            name: "first_name",
            message: "What Is The Employee's First Name?"
        },
        {
            type: "input",
            name: "last_name",
            message: "What Is The Employee's Last Name?"
        },
    {
        type: "list",
        name: "role",
        message: "What Role Does This Employee Have?",
        choices: newRoles,
    },
    {
        type: "list",
        name: "manager",
        message: "Who Is This Employee's Manager",
        choices: newManagers,
    }
]).then(function(answers) {

        var roleId = answers.role.split(".")[0];
        var managerId = answers.manager.split(".")[0];

    connection.query("INSERT INTO employee SET ?", {
        first_name: answers.first_name,
        last_name: answers.last_name,
        role_id: roleId,
        manager_id: managerId,

    },function (err, res) {
        if (err) throw err;
        console.log("Successfully Added Employee: " + res.first_name + " " + res.last_name)

    });
    start();
});
};

async function addRole() {

    var allDepts = await connection.query("SELECT * FROM department;");
    var showDepts = allDepts.map(function(department){
        return department.id + ". " + department.name;
    });

    inquirer.prompt([
    {
        type: "input",
            name: "title",
            message: "What role would you like to add?"
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary? (No $ or , please!)",
            //validate
            default: 10000
        },
    {
        type: "list",
        name: "department",
        message: "what department is this role under?",
        choices: showDepts
    }
]).then(function(answers) {

        var deptId = answers.department.split(".")[0];

    connection.query("INSERT INTO role SET ?", {
        title: answers.title,
        salary: answers.salary,
        department_id: deptId
    },function (err, res) {
        if (err) throw err;
        console.log("Successfully Added Role!" )
    });
    start();
});
};

async function addDept() {

    await inquirer.prompt([
    {
            type: "input",
            name: "dept_name",
            message: "What is the name of the *new* department?"
        },
]).then(function(answers) {

    connection.query("INSERT INTO department SET ?", {
        name: answers.dept_name,
    },function (err, res) {
        if (err) throw err;
        console.log("Successfully Added Dept!" )
    });
    start();
});
};

async function updateEmployeeRole() {

    var employeeName = await connection.query("SELECT * FROM employee;"); 
    var showAll = employeeName.map(function(employee) {
        return employee.id + ". "+ employee.first_name + " " + employee.last_name
    });

    var allRoles = await connection.query("SELECT * FROM role;");
    var showRoles = allRoles.map(function(role){
        return role.id + ". " + role.title;
    });

    inquirer.prompt([
        {
            type: "list",
            name: "employeeList",
            choices: showAll
        }, 
        {
            type: "list",
            name: "roleList",
            choices: showRoles
        }
    ]).then(function(answers) {

        var roleId = answers.roleList.split(".")[0];
        var employeeId = answers.employeeList.split(".")[0];

       var query = connection.query("UPDATE employee SET role_id =? WHERE id=?", [roleId, employeeId]);  
        console.log("Successfully Updated Employee!");
        start();
    }) 
};

async function deleteEmployee() {

    var allEmployees = await connection.query("SELECT * FROM employee;");
    var employeeList = allEmployees.map(function(employee){
        return employee.id + ". " + employee.first_name + " , " + employee.last_name;
    });

    inquirer.prompt([
        {
        type: "list",
        name: "employeeList",
        message: "Please select an employee to delete",
        choices: employeeList
        }
    ]).then(async function (answers) {

        var employeeId = answers.employeeList.split(".")[0];
        await connection.query("DELETE FROM employee WHERE id=?", [employeeId]),
            console.log("Successfully Deleted Employee from DB");
            start();
        });
};

function exit() {
    console.log("Bye!")
    connection.end();
};

connection.connect(function(err) {
    if (err) 
    throw err;
    console.log("Now connected to " + connection.threadId);
    start ();
});