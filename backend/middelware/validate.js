
const validate = (schema)=>async(req,res,next)=>{
    try{
        req.body = await schema.parseAsync(req.body)
        next()
    }catch(err){
        const errorMessage = err.errors.map((e)=>({
            field:e.path.join(" . "),
            message:e.message
        }))
        return res.status(400).json({
            success:false,
            message:"Validation Failed",
            error:errorMessage
        })
    }
}
module.exports = validate