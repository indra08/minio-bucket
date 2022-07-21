const Minio = require('minio');

const endPoint = 'minio.nexa.net.id';
const ipEndpoint = '10.100.104.21';

const minioClient = new Minio.Client({
    endPoint: ipEndpoint,
    port: 8001,
    useSSL: false,
    accessKey: 'gmediaapp',
    secretKey: 'Janglidalam29J'
});

module.exports = {
    minioClient,
    endPoint
};