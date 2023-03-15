// import express-async-handler
const expressAsyncHandler = require("express-async-handler")

// import sequelize from db.config
const sequelize = require("../database/db.config")

// import SpecialUsers
const {SpecialUsers} = require("../models/specialUsers.model")

// import ProjectDashboard
const {ProjectDashboard} = require("../models/projectDashboard.model")

// import TeamComposition
const {TeamComposition} = require("../models/teamComposition.model")

// import ProjectUpdates
const {ProjectUpdates} = require("../models/projectUpdates.model")

// import ProjectConcerns
const {ProjectConcerns} = require("../models/projectConcerns.model")

// import Employees
const {Employees} = require("../models/employees.model")

// import nodemailer
const nodemailer = require("nodemailer")

// one to many association between SpecialUsers and TeamComposition
SpecialUsers.TeamComposition = SpecialUsers.hasMany(TeamComposition,{foreignKey:{name:"specialUser_id"},onDelete:"cascade",onUpdate:"cascade"})

// one to many association between SpecialUsers and ProjectUpdates
SpecialUsers.ProjectUpdates = SpecialUsers.hasMany(ProjectUpdates,{foreignKey:{name:"specialUser_id"},onDelete:"cascade",onUpdate:"cascade"})

// one to many association between SpecialUsers and ProjectConcerns
SpecialUsers.ProjectConcerns = SpecialUsers.hasMany(ProjectConcerns,{foreignKey:{name:"specialUser_id"},onDelete:"cascade",onUpdate:"cascade"})

// get all projects
const getAllProjects = expressAsyncHandler(async(request,response)=>{
    let project_manager_id = request.params.projectManagerId
    let [projects] = await sequelize.query("SELECT * FROM project_dashboard WHERE projectManager_id=?",{
        replacements:[project_manager_id]
    })
    if(projects[0]!==undefined)
    {
        response.status(201).send({Message:"All Projects",payload:projects})
    }
    else{
        response.status(201).send({Message:"No Projects Found"})
    }
})

// get projects in detail
const getProjectDetailsById = expressAsyncHandler(async(request,response)=>{
    let project_Id = request.params.projectId
    let project_manager_id = request.params.projectManagerId
    let projectResult = await ProjectDashboard.findOne({where: {project_id:project_Id, projectManager_id:project_manager_id},include:[
        {
            association: ProjectDashboard.TeamComposition
        },
        {
            association: ProjectDashboard.ProjectConcerns
        },
        {
            association: ProjectDashboard.ProjectUpdates
        }
    ]})
    let projectFitness = projectResult.project_fitness_indicator;
    let concernsIndicator = 0;
    projectResult.project_concerns.forEach((concern)=>{
        if (concern.concern_status == "Raised") concernsIndicator++;
    })
    let teamSize=0;
    projectResult.team_compositions.forEach((team)=>{
        if(team.billing_status == "billed") teamSize++;
    })
    response.send({Message:`Details of project_id ${project_Id}`, projectFitness:projectFitness,concernsIndicator:concernsIndicator,teamSize:teamSize,payload:projectResult})
})

// create project updates
const createProjectUpdates = expressAsyncHandler(async(request,response)=>{
    await ProjectUpdates.create(request.body)
    response.send({Message:"Project Update created"})
})

// update project updates
const updateProjectUpdates = expressAsyncHandler(async(request,response)=>{
    let id = request.params.id;
    await ProjectUpdates.update(request.body,{where: {id: id}})
    response.send({Message:"Project Update is updated"})
})

// delete project updates
const deleteProjectUpdates = expressAsyncHandler(async(request,response)=>{
    let id = request.params.id;
    await ProjectUpdates.destroy({where: {id: id}})
    response.send({Message:"Project Update is deleted"})
})

// create transporter
const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    }
});

// raising concern and trigger email
const RiaseProjectConcern = expressAsyncHandler(async(request,response)=>{
    await ProjectConcerns.create(request.body)
    let mailOptions = {
        from: "aryan.subscription17@gmail.com",
        to: "aryan.subscription17@gmail.com",
        subject: `Project concern is raised for project ${request.body.project_id} by ${request.body.specialUser_id}`,
        text: `A project concern is raised!
        Concern Description: ${request.body.concern_description}
        severity: ${request.body.concern_severity}`
    };
    transporter.sendMail(mailOptions,(error, info)=>{
        if(error){console.log("Error", error)}
        else{console.log("Email is sent", info.messageId)}
    });
    response.send({ message: "Project Concern Raised" });
})

// update project concern
const updateProjectConcerns = expressAsyncHandler(async(request,response)=>{
    let id = request.params.id;
    await ProjectConcerns.update(request.body,{where: {id: id}})
    response.send({Message:"Project Concern is updated"})
})

// delete project concern
const deleteProjectConcerns = expressAsyncHandler(async(request,response)=>{
    let id = request.params.id;
    await ProjectConcerns.destroy({where: {id: id}})
    response.send({Message:"Project Concern is deleted"})
})

let send ={ 
    getAllProjects,
    getProjectDetailsById,
    createProjectUpdates,
    updateProjectUpdates,
    deleteProjectUpdates,
    RiaseProjectConcern,
    updateProjectConcerns,
    deleteProjectConcerns
}

// export
module.exports = send