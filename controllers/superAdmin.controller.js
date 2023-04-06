// import express-async-handler
const expressAsyncHandler = require("express-async-handler")

// import sequelize from db.config
const sequelize = require("../database/db.config")


// assign roles to employees
const roleAssignment = expressAsyncHandler(async(request,response)=>{
    let {specialUsers_id,user_role} = request.body;
    let [row] = await sequelize.query("SELECT * FROM special_users WHERE specialUsers_id=?",{
        replacements:[specialUsers_id]
    })
    if(row[0]==undefined)
    {
        response.status(404).send({Message:`No Special User exists with id ${specialUsers_id}`})
    }
    else{
        await sequelize.query("UPDATE special_users SET user_role=? WHERE specialUsers_id=?",{
            replacements:[user_role,specialUsers_id]
        })
        response.status(200).send({Message:`Role is successfully mapped to ${specialUsers_id}`})
    }
});

// get all special users
const getAllSpecialUsers = expressAsyncHandler(async(request,response)=>{
    let [result] = await sequelize.query("SELECT specialUsers_id, first_name, last_name, email_id, user_role FROM special_users")
    response.send({Message:"All Special Users",payload:result})
});

// update special users details
const updateSpecialUsers = expressAsyncHandler(async(request,response)=>{
    let specialUsers_id = request.params.empId
    let {first_name, last_name} = request.body;
    await sequelize.query("UPDATE special_users SET first_name=?, last_name=? WHERE specialUsers_id=?",{
        replacements:[first_name, last_name, specialUsers_id]
    })
    response.send({Message:"Special User Updated"})
})

// delete special users details
const deleteSpecialUsers = expressAsyncHandler(async(request,response)=>{
    let specialUsers_id = request.params.empId;
    await sequelize.query("DELETE FROM special_users WHERE specialUsers_id=?",{
        replacements:[specialUsers_id]
    });
    response.send({Message:"Special User has been deleted",Id:specialUsers_id})
})

let send = {
    roleAssignment,
    getAllSpecialUsers,
    updateSpecialUsers,
    deleteSpecialUsers
}

// export
module.exports = send;