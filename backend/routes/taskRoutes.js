 const taskRoutes = require('express').Router();
 const upload = require('../middelware/upload')
 const claudinary = require('../config/claudinary')

 const task = require('../models/task')
 const authMiddelware = require('../middelware/AuthMiddelware')

// 1.  get all tasks 

 taskRoutes.get("/tasks",authMiddelware,async(req,res)=>{
    try{
        const tasks = await task.find({user:req.user.UserId})
        res.status(200).json(tasks)
    }catch(err){
        res.status(400).json({error:err.message})
    }
 })

// 2. post Method tasks

taskRoutes.post("/tasks",authMiddelware,async(req,res)=>{
   try{
    const newTask = await task.create({
      title:req.body.title,
      completed:req.body.completed  ,
      user:req.user.UserId,
    })
    res.status(201).json({
        message:"new Task"
    })
   } catch(err){
    res.status(400).json({
        error:err.message
    })
   }
})

//3.get method By Id


taskRoutes.get("/tasks/:id",authMiddelware,async(req,res)=>{
    try{
        const foundtask = await task.findOne({_id:req.params.id,user:req.user.UserId})
        if(!foundtask){
            return res.status(400).json({success:false, error:"Task not Found"})
        }
        res.status(200).json({success:true, data:foundtask})
    } catch(err){
        console.error("Real Error:",err.message)
        res.status(400).json({success:false,error:"Invalid id Format"})
    }
})

// 4.Put method

taskRoutes.put("/tasks/:id",authMiddelware,async(req,res)=>{
   try{
    const { title, completed } = req.body;
     const updateTask =  await task.findOneAndUpdate({_id:req.params.id,user:req.user.UserId},{title,completed},{
    returnDocument: 'after',
    runValidators:true
   })
    if(!updateTask){
     return   res.status(404).json({success:false,message:"Task Not Found"})
    }
    res.status(200).json({success:true,message:"Task Updated Successfuly"})
}catch(err){
    res.status(404).json({success:false,error:err.message})
}
})

//5. delete Method

taskRoutes.delete("/tasks/:id",authMiddelware,async(req,res)=>{
    try{
       const deletetask = await task.findOneAndDelete({_id:req.params.id,
       user:req.user.UserId})

       
       if(!deletetask){
        return res.status(404).json({success:false,error:"Task Not found"})
       }
       res.status(200).json({success:true,message:"Task Deleted"})
    } catch(err){
        res.status(404).json({success:false,error:err.message})
    }
})

// post method Cloudianry 

taskRoutes.post("/upload",authMiddelware,upload.single("image"),(req,res)=>{
   const stream = claudinary.uploader.upload_stream(
    {folder:"my-app"},
    (error,result)=>{
     if(error){
         console.log(error)
         return res.status(500).json({
            message:"Claudianry Upload Failed"
         })
     }
     console.log("result")
     res.status(200).json({
        message:"Image Upload Succes Fully",
        url:result.secure_url,
        public_id:result.public_id
     })
    }
   )
   stream.end(req.file.buffer);
});
module.exports = taskRoutes;