const express = require("express");
const app = express();
require('./mon-server');
const userRoutes = require('./routes/users')
const port = process.env.port || 5000;

app.use(express.json());

app.use('/users', userRoutes);

app.listen(port, ()=>{
console.log(`Server is running at ${port}`)
})