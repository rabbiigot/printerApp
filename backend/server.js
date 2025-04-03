const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const router = require('./router/routes')
const bodyParser = require('body-parser');
const app = express();
const folderPath = 'G:\\My Drive\\FilesUploaded';

dotenv.config({path:'config.env'});

const PORT = process.env.PORT || 7000

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/", router)
app.use('/pdfs', express.static(folderPath));

app.listen(PORT, ()=>{
    console.log(`Server listening to http://localhost:${PORT}`)
})