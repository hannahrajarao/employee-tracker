# Employee Tracker
Manage employees, roles, and departments from a command line interface  
[Walkthrough demonstration](https://drive.google.com/file/d/1XlrupbkeeyfQPQGtciLz01Ekpohi15Np/view?usp=sharing)

## Requires
node, npm, mysql

## How to use 
In node terminal, run 
```
npm i  
```
In MySQL terminal, run  
```
source path\to\schema.sql   
source path\to\seeds.sql  
```
Create .env file at top level containing
```
DB_USER = 'your_mysql_username'
DB_PASSWORD = 'your_mysql_password'
```
entering your MySQL information

Start application using 
```
npm start
```
