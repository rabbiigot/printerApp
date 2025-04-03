const express = require('express');
const services = require('../services/services')
const route = express.Router();
const multer = require('multer');
const path = require('path');

const upload = multer({
    dest: path.join('C:', 'Users', 'Administrator', 'filesToPrint'),  
});

route.get('/api/pdfs', services.getFile);

route.get('/api/flashdrive', services.scanFlashDrive);

route.get('/api/pdfsflash/:fileName', services.getFileflashDrive);

route.delete('/api/delete/:filename', services.deleteFile);
route.delete('/api/deleteflash/:filename', services.deleteFileFlash);

route.post('/api/upload', upload.single('file'), services.uploadFile);


module.exports = route