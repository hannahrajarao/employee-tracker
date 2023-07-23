const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

// const db = mysql.createConnection(
//     {
//         host: 'localhost',
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: 'employee_db'
//     }
// );

inquirer.prompt([
    {
        type: 'list',

        message: 'What would you like to do?',
        name: 'query',
        choices: [
            'view all departments', 
            'view all roles', 
            'view all employees', 
            'add a department', 
            'add a role', 
            'add an employee', 
            'update an employee role',
            'quit'
        ],
    },
])
.then(answers => {
    console.log(answers)
})