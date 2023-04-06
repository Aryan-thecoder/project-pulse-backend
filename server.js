//import express
const exp = require('express')

//call function 
const app = exp()
const cors = require('cors');
app.use(cors());
// const helmet = require('helmet')
// app.use(helmet())

//configure dotenv
require('dotenv').config

// port
const PORT = process.env.PORT || 9999;
app.listen(PORT, ()=>console.log(`Connected to PORT: ${PORT}`))

// import sequelize from db.config
const sequelize = require("./database/db.config")

// test the DB connection
sequelize.authenticate()
.then(()=>console.log("Connection successful"))
.catch(err=>console.log("Error in connection",err))

// create tables for all models
sequelize.sync()

// body parser
app.use(exp.json())

// import adminApp from adminUser.route
const adminApp = require("./routes/admin.route")
app.use("/admin-api",adminApp)

// import gdoHeadApp from gdoHead.route
const gdoHeadApp = require("./routes/gdoHead.route")
app.use("/gdoHead-api",gdoHeadApp)

// import projectManagerApp fromprojectManager.route
const projectManagerApp = require("./routes/projectManager.route")
app.use("/projectManager-api",projectManagerApp)

// import specialUsersApp from specialUsers.route
const specialUsersApp = require("./routes/specialUsers.route")
app.use("/specialUsers-api",specialUsersApp)

// import superAdminApp from superAdmin.route
const superAdminApp = require("./routes/superAdmin.route")
app.use("/superAdmin-api",superAdminApp)

// Error handling for invalid path
app.use('*',(request,response,next)=>{
    response.send({Message:"Invalid path"})
})

// Error handling for unknown error
app.use((error,request,response,next)=>{
    response.send({Message:"An error has occcured",Error:error.message})
})


// module.exports = app;