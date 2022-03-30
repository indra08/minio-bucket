const express = require('express');
const app = express();
const router = express.Router();
const port = 3000;
const bodyParser = require("body-parser");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',(req, res) => {
    res.end("Point on "+port);
});

app.listen(port, ()=>{
    console.log(`app listening at port ${port}`)
});

//bucket
const fileUpload = require('express-fileupload');
const minioClient = require('./minioClient');
app.use(fileUpload({
  createParentPath: true
}));

app.post('/upload:bucket', function(req, res) {
  
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


app.use("/", router);