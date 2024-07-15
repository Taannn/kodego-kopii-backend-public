// importing the required modules
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// load router
const kopiiRouter = require('./routes/kopii.router');

/*
  use the following to receive response data
  In summary, adding express.urlencoded({extended: false}) ensures that your Express application can handle form submissions and parse the data sent in the request body. It's a common setup when dealing with HTML forms in web applications
  By using both, your server can handle a variety of data formats and types, making it versatile in processing different types of requests from clients. This is especially important when building APIs that might receive data in various formats, depending on the client or use case.
*/
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors());

// the port we're gonna be using and the port the server will listen on
const PORT = process.env.PORT || 3001;

// default router for kopii
app.use("/kopii", kopiiRouter);

// starting the server
app.listen(PORT, ()=>{
  console.log("Server is running....")
});