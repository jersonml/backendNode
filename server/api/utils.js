const fs = require('fs')
const { Log_error } = require("../sequelize");

const requestSync = require('sync-request')
const getStream = require('into-stream');
var _ = require('lodash');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const path_bambbu = "server/utils/bambbu.js"
const path_phone = "server/utils/number.js"
const api_url = 'https://apibambbu.azurewebsites.net';
const account = "nxiasmartframeadmin";
const accountKey = "VhvUCxI0ZzXIcjrARL3mRVU2yAa/QVy+A5jAoCiRl+6yb1iL5Ym4h+kGfVXnKSI4DX4ZR4xE2mOiDXl4Z/YxxA==";
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

const getBlobName = originalName => {
    // Use a random number to generate a unique file name, 
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, '');
    return `${identifier}-${originalName}`;
  };


const registerError = async (error, req, user_id) =>{
    try {
        const message = `${error.toString()}--------${JSON.stringify(error)}`;
        const route = `${req.baseUrl}${req.url}`
        const result = await Log_error.create({
            user_id,
            route,
            message
        });
        return true
        
    } catch (error) {
        return false
    }
}


const verify_dirpath = async (verify_path = 1) => {
    var data_token 
    var path
    if (verify_path == 1){
        data_token = {
            token: null,
            updateAt: Date.now()
        }
        path = path_bambbu
    } else if ( verify_path == 2){
        data_token = {
            phone: null
        }
        path = path_phone
    }
    try {
        const fs_exist = await fs.statSync(path);
        return fs_exist
    } catch (error) {
        try {
            json = JSON.stringify(data_token)
            const crear = await fs.writeFileSync(path,json);
            return true
            
        } catch (error) {
            return false
        }
    }
}

const read_token = async (verify_path = 1) => {
    try {
        if (verify_path == 1){
            path = path_bambbu
        } else if ( verify_path == 2){
            path = path_phone
        }
        const content = await fs.readFileSync(path);
        return  JSON.parse(content)
    } catch (error) {
        return false
    }
}

const write_token = async (data_token, verify_path = 1) => {
    try {
        if (verify_path == 1){
            path = path_bambbu
        } else if ( verify_path == 2){
            path = path_phone
        }
        return await fs.writeFileSync(path,JSON.stringify(data_token))
    } catch (error) {
        return false 
    }
    
}

const request_bambbu = async (data_payment, method, url, req, user_id) =>{
    try {
        const content =  await read_token()
        const {
            token
          } = content
        var res = await requestSync(method, `${api_url}/${url}`,{
            headers:{
                'Authorization': `Bearer ${token}`
            },
            json: data_payment
        })  
        return JSON.parse(res.getBody('utf8'));
    } catch (error) {
        registerError(error, req,user_id )
    }
}

const request_generic = async (data, method, url, _headers, req, user_id = null, next) => {
    try {
        var res = await requestSync(method, url,{
            headers: _headers,
            json:data,
        })
        try {
            return JSON.parse(res.body.asciiSlice());
        } catch (error) {
            return res
        } 
    } catch (error) {
        registerError(error, req ,user_id )
        return next(Error(error))
    }
}

const upload_imagen = async (req, name_container) => {
    try {
        const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
        const blobServiceClient = new BlobServiceClient(
            `https://${account}.blob.core.windows.net`,
            sharedKeyCredential
        );
        const blobName = getBlobName(req.file.originalname);
        const stream = getStream(req.file.buffer);
        const containerClient = blobServiceClient.getContainerClient(name_container);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadResponse = await blockBlobClient.uploadStream(stream,
            uploadOptions.bufferSize, uploadOptions.maxBuffers,
            { blobHTTPHeaders: { blobContentType: "image/jpeg" } });
        return uploadResponse
    } catch (error) {
        registerError(error, req, null)
        return false 
    }
}


module.exports = {
    registerError,
    verify_dirpath,
    read_token,
    write_token,
    request_bambbu,
    request_generic,
    upload_imagen
};