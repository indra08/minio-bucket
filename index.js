const express = require('express');
const app = express();
const router = express.Router();
const port = 3000;
const bodyParser = require("body-parser");
const https = require('https'); 
const http = require('http'); 
const fs = require('fs');
const axios = require('axios');

//Here we are configuring express to use body-parser as middle-ware.
var cors = require('cors');
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/',(req, res) => {
    res.end("Point on "+port);
});

app.use("/", router);

//bucket
const fileUpload = require('express-fileupload');
const minioClient = require('./minioClient');
app.use(fileUpload({
  createParentPath: true
}));

app.post('/upload', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    res.send({
        status: 404,
        message: 'bucket is empty, plese fill after link upload/{bucketname}'
    });
});

app.post('/upload/:bucket', function(req, res) {
  
    req.connection.setTimeout( 1000 * 60 * 60 ); // ten minutes
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if(req.params.bucket == null){
        res.send({
            status: 404,
            message: 'bucket is empty, plese fill after link'
        });
    }
    
    const files = req.files;
    var fileName = new Date().getTime() +"."+ files.file.name.split('.').pop();;
    minioClient.minioClient.putObject(req.params.bucket, fileName, files.file.data, function(error, etag) {

        if(error) {
            res.send({
                status: 404,
                message: 'No file uploaded'
            });
        }else{

          const fileUploaded = `https://${minioClient.endPoint}/${req.params.bucket}/${fileName}`;
          res.send({
              response:{
                  url : fileUploaded
              },
              metadata:{
                status: 200,
                message: 'File uploaded successfully'
              }
          });
        }
    });
});

app.post('/upload_link/:bucket', async function(req, res) {
  
    req.connection.setTimeout( 1000 * 60 * 60 ); // ten minutes
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if(req.params.bucket == null){
        res.send({
            status: 404,
            message: 'bucket is empty, plese fill after link'
        });
    }

    let link = req.body.link;  
    let data = link.split('?')[0];
    const ext = data
    .split('.')
    .pop();

    const file = new Date().getTime() +"."+ ext;
    var fileName = file;
    
    const response = await axios.get(
        link,
        { responseType: 'arraybuffer' }
    );
    const buffer = Buffer.from(response.data, 'utf-8');

    minioClient.minioClient.putObject(req.params.bucket, fileName, buffer, function(error, etag) {

        if(error) {
            res.send({
                status: 404,
                message: 'No file uploaded'
            });
        }else{

            const fileUploaded = `https://${minioClient.endPoint}/${req.params.bucket}/${fileName}`;
            res.send({
                response:{
                    url : fileUploaded
                },
                metadata:{
                status: 200,
                message: 'File uploaded successfully'
                }
            });
        }
    });
});

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({'message': err.message});
  
    return;
  });

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
});
