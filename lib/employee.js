const inquirer = require('inquirer');
const mysql = require('mysql2');
const db = require('../db/connection.js');
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
                // 'add an employee', 
                // 'update an employee role',
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
        else if (action === 'add a department') {
            addDepartment();
        }
        else if (action === 'add a role') {
            addRole();
        }
    });
};

const viewDepartments = () => {
    db.query('SELECT * FROM department', (err, results) => {
        if(err)
            console.error(err);
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
        if(err)
            console.error(err);
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
        if(err)
            console.error(err);
        console.table(results);
        return inquireUser();
    });
}

const addDepartment = () => {
    inquirer.prompt([{
        type: 'input',
        message: 'What is the name of the department?',
        name: 'department_name',
    }]).then((response) => {
        const dep_name = response.department_name;
        db.query(`INSERT INTO department (name) VALUES (?)`, dep_name, (err, results) => {
            if(err)
                console.error(err);
            else
                console.log(`Added ${dep_name} to the database`);
            return inquireUser();
        })
    })
}

const addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the role?',
            name: 'title',
        },
        {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'salary',
        },
    ]).then((response) => {
        db.query(`SELECT * FROM department`, (err, results) => {
            if(err)
                console.error(err);
            else {
                const depNames = results.map(({id, name}) => name)
                const ids = results.map(({id, name}) => id)
                inquirer.prompt({
                    type: 'list',
                    message: 'Which department does the role belong to?',
                    name: 'department',
                    choices: depNames,
                }).then(department => {
                    const dep_name = department.department
                    const id = ids[depNames.indexOf(dep_name)];
                    const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`
                    db.query(sql, [response.title, parseInt(response.salary), id], (err2, results2) => {
                        if(err2)
                            console.error(err2);
                        else
                            console.log(`Added ${response.title} to the database`);
                        return inquireUser();
                    })
                })
            }
        })
    })
}

module.exports = inquireUser;
