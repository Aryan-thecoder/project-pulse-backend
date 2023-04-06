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

// one to many association between ProjectDashboard and TeamComposition
ProjectDashboard.TeamComposition = ProjectDashboard.hasMany(TeamComposition,{foreignKey:{name:"project_id"},onDelete:"cascade",onUpdate:"cascade"})

// one to many association between ProjectDashboard and ProjectUpdates
ProjectDashboard.ProjectUpdates = ProjectDashboard.hasMany(ProjectUpdates,{foreignKey:{name:"project_id"},onDelete:"cascade",onUpdate:"cascade"})

// one to many association between ProjectDashboard and ProjectConcerns
ProjectDashboard.ProjectConcerns = ProjectDashboard.hasMany(ProjectConcerns,{foreignKey:{name:"project_id"},onDelete:"cascade",onUpdate:"cascade"})

// one to many association between SpecialUsers and ProjectDetails
SpecialUsers.ProjectDetails = SpecialUsers.hasMany(ProjectDashboard,{foreignKey:{name:"gdoHead_id"},onDelete:"cascade",onUpdate:"cascade"})

// one to many association between SpecialUsers and ProjectDetails
SpecialUsers.ProjectDetails = SpecialUsers.hasMany(ProjectDashboard,{foreignKey:{name:"projectManager_id"},onDelete:"cascade",onUpdate:"cascade"})


// Get all the projects
const getAllProjects = expressAsyncHandler(async(request,response)=>{
    let [projects] = await sequelize.query("SELECT * FROM project_dashboard")
    if(projects[0]!==undefined)
    {
        response.status(201).send({Message:"All Projects",payload:projects})
    }
    else{
        response.status(201).send({Message:"No Projects Found"})
    }
})

// Get the projects in detail
const getProjectDetailsById = expressAsyncHandler(async(request,response)=>{
    let project_Id = request.params.projectId
    let projectResult = await ProjectDashboard.findOne({where: {project_id:project_Id},include:[
        {
            association: ProjectDashboard.TeamComposition
        },
        {
            association: ProjectDashboard.ProjectConcerns
        },
        {
            association:ProjectDashboard.ProjectUpdates
        }
    ]})
    let projectFitness = projectResult.project_fitness_indicator;
    let concernsIndicator = 0;
    projectResult.project_concerns.forEach((concern)=>{
        if (concern.concern_status == "Raised") concernsIndicator++;
    })
    let teamSize=0;
    projectResult.team_compositions.forEach((team)=>{
        if(team.billing_status == "Billed") teamSize++;
    })
    response.send({Message:`Details of project_id ${project_Id}`, projectFitness:projectFitness,concernsIndicator:concernsIndicator,teamSize:teamSize,payload:projectResult})
})

// create a new project
const createProject = expressAsyncHandler(async(request,response)=>{
    await ProjectDashboard.create(request.body)
    response.send({Message: "Project has been created"})
})

send ={
    getAllProjects,
    getProjectDetailsById,
    createProject
}

// export
module.exports = send;