# DSS_Project_UG19
Developing Secure Software Group Project for CW2

Trello: [https://trello.com/b/dO4RPoQ2/dss2023-24-002-ug19](https://trello.com/b/dO4RPoQ2/dss2023-24-002-ug19)

## Database setup
1. Download [PGadmin 4](https://www.pgadmin.org/download/) and set up postgres.

2. When prompted to set up a user, create a user called `postgres` with `password` as the password.

3. Create a database called `DSS` to use in the project. Port should be 5432 by default.

<br>

***NOTE:*** If using a different database name, username or password, you can edit the file `/config/db_config.js`:

```
export const dbConfig = {
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    port: 5432,
    database: 'DSS'
}
```

<br>

## Project setup
1. First clone this repo:
```
git clone https://github.com/JimJam117/DSS_Project_UG19.git
```

2. Navigate to the cloned folder and install all the dependencies with npm:
```
npm i
```

3. Run with npm:
```
npm run start
```

<be>

<br>

## HTTPS certificate setup 
1. Install mkcert:
```
choco install mkcert
```

2. Navigate to the certificate folder and install the certificate on your machine
```
mkcert -install
```





After project has started, navigate to:
### [http://localhost:5000/](http://localhost:5000/)

<br>

## Project Layout
The project follows an **MVC** (Model-View-Controller) design pattern:
* **Route** files start with lowercase letters (e.g. `/routes/user.js`, `/routes/movie.js`). These files contain all the route definitions that link to corresponding controller functions
  
* **Controller** files (e.g. `/controllers/userController.js`, `/controllers/movieController.js`). These files contain all the functions to perform actions for a given route
  
* **Model** files start with uppercase letters (e.g. `/models/User.js`, `/models/Movie.js`). These files handle any database interactions. They are used within the controllers
  
* **View** files (e.g. `/views/user.ejs`, `/views/movie.ejs`) use the EJS view engine to render the frontend HTML / JS. These views are rendered at the end of a controller function

 
Also, the `index.js` file contains the entrypoint and configuration for the project, along with database initialisation code. The database should reset each time the server is restarted.
