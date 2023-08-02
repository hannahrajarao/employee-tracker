const inquirer = require('inquirer');
const mysql = require('mysql2');
const db = require('./db/connection.js');
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
      const action = response.action;
      if (action === 'quit') {
        console.log("Bye!");
        process.exit();
      }
      else if (action === 'view all departments') {
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
      else if (action === 'add an employee') {
        addEmployee();
      }
      else if (action === 'update an employee role') {
        updateEmployee();
      }
    });
};

const viewDepartments = () => {
  db.query('SELECT * FROM department', (err, results) => {
    if (err)
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
    if (err)
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
    if (err)
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
      if (err)
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
      if (err)
        console.error(err);
      else {
        const depNames = results.map(({ id, name }) => name)
        const ids = results.map(({ id, name }) => id)
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
            if (err2)
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

const addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      message: 'What is the employee\'s first name?',
      name: 'first_name',
    },
    {
      type: 'input',
      message: 'What is the employee\'s last name?',
      name: 'last_name',
    },
  ]).then(names => {
    db.query('SELECT * FROM role', (err, roles_results) => {
      if (err)
        console.log(err);
      else {
        const roles = roles_results.map(({ id, title, salary, department_id }) => title);
        const role_ids = roles_results.map(({ id, title, salary, department_id }) => id);
        inquirer.prompt({
          type: 'list',
          message: 'What is the employee\'s role?',
          name: 'role',
          choices: roles,
        }).then(role_response => {
          const role_id = role_ids[roles.indexOf(role_response.role)];
          db.query('SELECT * FROM employee', (err2, employee_query) => {
            if (err2) console.log(err2);
            const employees_name_choices = employee_query.map(({id, first_name, last_name, role_id, manager_id}) => (first_name+' '+last_name));
            const employee_ids = employee_query.map(({id, first_name, last_name, role_id, manager_id}) => id);
            inquirer.prompt({
              type: 'list',
              message: 'Who is the employee\'s manager?',
              name: 'manager',
              choices: ['None', ...employees_name_choices],
            }).then(manager_response => {
              const manager_index = employees_name_choices.indexOf(manager_response.manager)
              const manager_id = manager_index < 0 ? null : employee_ids[manager_index];
              const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
              db.query(sql, [names.first_name, names.last_name, role_id, manager_id], (insert_error, insert_results) => {
                if(insert_error)
                  console.log(insert_error);
                else {
                  console.log(`Added ${names.first_name} ${names.last_name} to the database`);
                }
                return inquireUser();
              })
            })
          })
        })
      }
    })
  })
}

const updateEmployee = () => {
  db.query('SELECT * FROM employee', (err, employee_results) => {
    if (err) console.log(err);
    const employee_choices = employee_results.map(({id, first_name, last_name, role_id, manager_id}) => (first_name+' '+last_name));

    inquirer.prompt({
      type: 'list',
      message: 'Which employee\'s role do you want to update?',
      name: 'employee',
      choices: employee_choices,
    }).then(employee_response => {
      const employee_name = employee_response.employee
      // get all roles to display
      db.query('SELECT * FROM role', (err2, role_results) => {
        if (err) console.log(err);
        const roles = role_results.map(({ id, title, salary, department_id }) => title);
        const role_ids = role_results.map(({ id, title, salary, department_id }) => id);

        inquirer.prompt({
          type: 'list',
          message: `Which role do you want to assign ${employee_name}?`,
          name: 'role',
          choices: roles,
        }).then(role_response => {
          const role = role_response.role
          const role_id  = role_ids[roles.indexOf(role)];

          // update table
          const sql = `UPDATE employee SET role_id = ? WHERE first_name = ?`
          const first_name = employee_name.split(' ')[0];
          db.query(sql, [role_id, first_name], (update_error, update_results) => {
            if(update_error) console.log(update_error);
            else {
              console.log(`Updated ${employee_name}'s role to ${role}`);
              return inquireUser();
            }
          })
        })
      })
    })
  })
}

module.exports = inquireUser;
