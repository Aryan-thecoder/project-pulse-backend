// import express-async-handler
const expressAsyncHandler = require("express-async-handler")

// import sequelize from db.config
const sequelize = require("../database/db.config")

// import ProjectDashboard model
const {ProjectDashboard} = require("../models/projectDashboard.model")

// import TeamComposition model
const {TeamComposition} = require("../models/teamComposition.model")

// get all projects
const getAllProjects = expressAsyncHandler(async(request,response)=>{
    let gdo_Id = request.params.gdoId;
    let [projects] = await sequelize.query("SELECT * FROM project_dashboard WHERE gdoHead_id=?",{
        replacements:[gdo_Id]
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
    let gdo_Id = request.params.gdoId
    let projectResult = await ProjectDashboard.findOne({where: {project_id:project_Id, gdoHead_id:gdo_Id},include:[
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
        if (concern.concern_status === "Raised") concernsIndicator++;
    })
    let teamSize=0;
    projectResult.team_compositions.forEach((team)=>{
        if(team.billing_status === "Billed") teamSize++;
    })
    response.send({Message:`Details of project_id ${project_Id}`, projectFitness:projectFitness,concernsIndicator:concernsIndicator,teamSize:teamSize,payload:projectResult})
})

// assign employees to project
const assignEmployeesToProject = expressAsyncHandler(async(request,response)=>{
    await TeamComposition.create(request.body)
    response.send({Message:"Project Team is created"})
})

// update employees of the project
const updateEmployeesOfProject = expressAsyncHandler(async(request,response)=>{
    let id = request.params.id;
    await TeamComposition.update(request.body,{where:{id:id}})
    response.send({Message:"Project Team is updated"})
})

// delete employees from the project
const deleteEmployeesFromProject = expressAsyncHandler(async(request,response)=>{
    let id = request.params.id;
    await TeamComposition.destroy({where:{id:id}})
    response.send({Message:"Employee deleted"})
})


let send = { 
    getAllProjects,
    getProjectDetailsById,
    assignEmployeesToProject,
    updateEmployeesOfProject,
    deleteEmployeesFromProject
}

// export
module.exports = send