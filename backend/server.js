 require("dotenv").config();
 const express = require('express'); 
 const cors = require('cors')

 const taskRoutes = require('./routes/taskRoutes')
  const mongoose = require('mongoose');
const AuthRouter = require("./routes/AuthRoutes")
const app = express();
app.use(express.json())


 app.use(cors())
app.use("/",taskRoutes)
app.use("/auth",AuthRouter)
mongoose.connect(process.env.MONGO_URI,{family:4})
.then(()=>{
    console.log("mongoDB connected")
    app.listen(process.env.PORT, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.error("MongoDB connected failed",err.message)
})
