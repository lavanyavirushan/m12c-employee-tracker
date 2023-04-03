const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
const figlet = require('figlet');
require('dotenv').config();
const connection = require('./config/db');
const { Console } = require('console');

const query = util.promisify(connection.query).bind(connection);

connection.connect(async (error) => {
    if (error) throw error;
    console.log(figlet.textSync('Employee'));
    console.log("");
    console.log(figlet.textSync('Manager'));
    const answer = await promptQuestions();
    if(answer){
        connection.end();
    }
});



const questions = [
    {
      name: 'choice',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View All Employees',
        'Add Employee',
        'Update Employee Role',
        'View All Roles',
        'Add Role',
        'View All Departments',
        'Add Department',
        'Update Employee Manager',
        'Total utilized budge',
        'Quit'
        ]
    }
  ];

async function promptQuestions(){
    const prompt = await inquirer.prompt(questions)

    if(prompt.choice === "View All Employees"){
        await viewAllEmployees()
    }else if(prompt.choice === "Add Employee"){
        await addEmployee();
    }else if(prompt.choice === "Update Employee Role"){
        await updateEmployeeRole();
    }else if(prompt.choice == "View All Roles"){
        await viewAllRoles();
    }else if(prompt.choice == "Add Role"){
        await AddRole();
    }else if(prompt.choice == "View All Departments"){
        await viewAllDepartments();
    }else if(prompt.choice == "Add Department"){
        await addDepartment();
    }else if(prompt.choice == "Update Employee Manager"){
        await updateEmployeeManager();
    }else if(prompt.choice == "Total utilized budge")
        await totalBudget();
    if(prompt.choice != "Quit"){
        await promptQuestions();
    }

    return true;
}

/**
 * Get all employees from database
 * @returns 
 */
async function getEmployee(){
    let sql = "SELECT * FROM employee";
    const employees = await query(sql);
    return employees;
}

/**
 * Get all Roles from database
 * @returns 
 */
async function getRoles(){
    let sql = "SELECT * FROM role";
    const roles = await query(sql);
    return roles;
}

/**
 * Get all department from database
 * @returns 
 */
async function getDepartments(){
    let sql = "SELECT * FROM department";
    const departments = await query(sql);
    return departments;
}

/**
 * List All employees by departments 
 */
async function viewAllEmployees(){
    let sql = `SELECT employee.id AS 'Employee Id', 
    employee.first_name AS 'First Name', 
    employee.last_name AS 'Last Name', 
    role.title AS 'Job Title', 
    department.name AS 'Department', 
    role.salary AS 'Salary'
    FROM employee, role, department 
    WHERE department.id = role.department_id 
    AND role.id = employee.role_id
    ORDER BY employee.first_name ASC`;
    const employees = await query(sql);
    const table = cTable.getTable(employees);

    console.log("")
    console.log("---------------------------------------------")
    console.log(" List All Employees")
    console.log("---------------------------------------------")
    console.log(table);
    console.log("---------------------------------------------")
}

/**
 * Add Employee to database
 */
async function addEmployee(){

    const listRoles = await getRoles();
    const roles = listRoles.map(({ id, title }) => ({ name: title, value: id }));

    const listEmployees = await getEmployee();
    const managers = listEmployees.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

    const namesQuestion = await inquirer.prompt([
        {
          type: 'input',
          name: 'fistName',
          message: "What is employee's first name?",
          validate: validateInput
        },
        {
          type: 'input',
          name: 'lastName',
          message: "What is employee's last name?",
          validate: validateInput
        }
    ]);

    const rolesQuestion = await inquirer.prompt([
        {
          type: 'list',
          name: 'role',
          message: "What is this employee's role?",
          choices: roles
        }
    ]);

    const managersQuestions = await inquirer.prompt([
        {
          type: 'list',
          name: 'manager',
          message: "Who is this employee's manager?",
          choices: managers
        }
    ]);

    try{
        const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES ("${namesQuestion.fistName}", "${namesQuestion.lastName}", "${rolesQuestion.role}", "${managersQuestions.manager}")`;
        const addEmployee = await query(sql);
        console.log("")
        console.log("---------------------------------------------")
        console.log("Added Successfully!");
        console.log("---------------------------------------------")
        console.log("")
        console.log("Added Successfully!");
    }catch(err){
        console.log("Unable to Add Employee at this moment!");
    }

}

/**
 * Update Employee Role
 */
async function updateEmployeeRole(){
    const listRoles = await getRoles();
    const roles = listRoles.map(({ id, title }) => ({ name: title, value: id }));

    const listEmployees = await getEmployee();
    const employees = listEmployees.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

    const updateRoleQuestion = await inquirer.prompt([
        {
            name: 'employee',
            type: 'list',
            message: 'Choose employee to change role:',
            choices: employees
        },
        {
            name: 'role',
            type: 'list',
            message: 'What is their new role?',
            choices: roles
        }
    ]);

    try{
        let sqls = `UPDATE employee SET employee.role_id = ${updateRoleQuestion.role} WHERE employee.id = ${updateRoleQuestion.employee}`;
        const updateEmployee = await query(sqls);
        console.log("")
        console.log("---------------------------------------------")
        console.log("Successfully updated employee's new role!");
        console.log("---------------------------------------------")
        console.log("")
        
    }catch(err){
        console.log("Unable to update Employee");
    }
}

/**
 * List All Roles
 */
async function viewAllRoles(){
    try{
        const sqls = `SELECT role.id as ID, role.title as Role, department.name AS Department
        FROM role
        INNER JOIN department ON role.department_id = department.id`;

        const roles = await query(sqls)
        console.log("")
        console.log("---------------------------------------------")
        console.log(" List All Roles")
        console.log("---------------------------------------------")
        console.log(cTable.getTable(roles));
        console.log("---------------------------------------------")


    }catch(err){
        console.log("Unable to list roles at this time!")
    }
}

/**
 * Add new role
 */
async function AddRole(){
    try{
        const departmentsQuery = await getDepartments();
        const departments = departmentsQuery.map(({ id, name }) => ({ name: name, value: id }));
        const newRolesQuestions = await inquirer.prompt([
            {
                name: 'role',
                type: 'input',
                message: 'What is the name of the new role?',
                validate: validateInput
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary?',
                validate: validateInput
            }
        ]);

        const departmentQuestions = await inquirer.prompt([
            {
                name: 'department',
                type: 'list',
                message: 'Which department is this new role in?',
                choices: departments
            }
        ])

        console.log(departmentQuestions)
        const sqls = `INSERT INTO role (title, salary, department_id) VALUES ('${newRolesQuestions.role}', ${newRolesQuestions.salary}, ${departmentQuestions.department})`;
        await query(sqls)
        console.log("")
        console.log("---------------------------------------------")
        console.log("Successfully added new role!");
        console.log("---------------------------------------------")
        console.log("")
    }catch(err){
        console.log("Unable to add Role at this time!")
    }
}

/**
 * list all Departments
 */
async function viewAllDepartments(){
    try{
        const departments = await getDepartments();
        console.log("")
        console.log("---------------------------------------------")
        console.log(" List All Departments")
        console.log("---------------------------------------------")
        console.log(cTable.getTable(departments))
        console.log("---------------------------------------------")
    }catch(err){
        console.log(err);
        console.log("Unable to pull the departments at this time!")
    }
}

/**
 * Add new department
 */
async function addDepartment(){
    try{
        const newDepartment = await inquirer.prompt([
            {
                name: 'department',
                type: 'input',
                message: 'What is the name of the Department?',
                validate: validateInput
            }
        ]);

        let sql = `INSERT INTO department (name) VALUES ('${newDepartment.department}')`;
        const dep = await query(sql);
        console.log("")
        console.log("---------------------------------------------")
        console.log("Successfully added new department")
        console.log("---------------------------------------------")

    }catch(err){
        console.log(err);
        console.log("Unable to add Department at this time");
    }
}

/**
 * updates the employee manager 
 */
async function updateEmployeeManager(){
    const listEmployees = await getEmployee();
    const employees = listEmployees.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
    try{
        const employeeManagerQuestion = await inquirer.prompt([
          {
            name: 'employee',
            type: 'list',
            message: 'Select the employee:',
            choices: employees
          },
          {
            name: 'manager',
            type: 'list',
            message: 'Choose new manager:',
            choices: employees
          }
        ])

        const sql = `UPDATE employee SET employee.manager_id = ${employeeManagerQuestion.manager} WHERE employee.id = ${employeeManagerQuestion.employee}`;

        await query(sql);

        console.log("");
        console.log("-----------------------------------------------------");
        console.log("Employee's Manager updated successfully!")
        console.log("-----------------------------------------------------");
        console.log("");

    }catch(err){
        console.log("Unable to update the new manager at this time!")
    }
}

/**
 * Check department budget
 */
async function totalBudget(){
    try{
        const sql = `select department.name as Department, sum(role.salary) as Total From role, employee, department WHERE employee.role_id = role.id and department.id = role.department_id group by department_id;`
        const budget = await query(sql);
        
        console.log("")
        console.log("-----------------------------------------------------------------");
        console.log("   Department budgets")
        console.log("-----------------------------------------------------------------");
        console.log(cTable.getTable(budget));
        console.log("-----------------------------------------------------------------");
        console.log("")
    }catch(err){
        console.log("Unable to list the budges at this time!")
    }
}

function validateInput(value){
    if (value.trim() == "") {
        console.log('Field cannot be Empty!');
        return false;
    } else {
        return true;
    }
}