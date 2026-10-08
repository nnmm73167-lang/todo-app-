const tasks = require("../routes/data/tasks")

const validTask = (req,res,next)=>{
    const {title} = req.body
    if(!title){
        return res.status(400).json({
            message:"Tittle are required"
        })
    }
    const alredyExist = tasks.some(
        (task)=>task.title.toLowerCase() === title.toLowerCase()
    )
    if(alredyExist){
        return res.status(400).json({
            message:"task alredy exists"
        })
    }
    next()
}
module.exports = validTask