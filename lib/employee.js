const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

const inquireUser = async () => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: [
                'view all departments', 
                'view all roles', 
                'view all employees', 
                'add a department', 
                'add a role', 
                'add an employee', 
                'update an employee role',
                'quit',
            ],
        },
    ])
    .then((response) => {
        // console.log(response);
        const action = response.action;
        if(action === 'quit') {
            console.log("Bye!");
            process.exit();
        }
        else if (action === 'view all departments'){
            viewDepartments();
        }
        else if (action === 'view all roles') {
            viewRoles();
        }
        else if (action === 'view all employees') {
            viewEmployees();
        }
    });
};

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'employee_db'
    },
    console.log("Welcome to the Employee Manager!")
);

const viewDepartments = () => {
    db.query('SELECT * FROM department', (err, results) => {
        console.table(results);
        return inquireUser();
    });
}

const viewRoles = () => {
    const sql = `
        SELECT role.id, role.title, department.name AS department, role.salary 
        FROM role 
        JOIN department ON role.department_id = department.id;`
    db.query(sql, (err, results) => {
        console.table(results);
        return inquireUser();
    });
}

const viewEmployees = () => {
    const sql = `
    SELECT
        e.id,
        e.first_name,
        e.last_name,
        r.title AS role,
        d.name AS department,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM
        employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
    `;
    db.query(sql, (err, results) => {
        console.table(results);
        return inquireUser();
    });
}
