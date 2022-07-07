const { Product: Model, Fridge_x_Product } = require("../../sequelize");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const { registerError, upload_imagen } = require('../utils');
var _ = require('lodash');


const account = "nxiasmartframeadmin";
const accountKey = "VhvUCxI0ZzXIcjrARL3mRVU2yAa/QVy+A5jAoCiRl+6yb1iL5Ym4h+kGfVXnKSI4DX4ZR4xE2mOiDXl4Z/YxxA==";
const containerName = "img"//sfdataproducts

exports.create = async (req, res, next) => {
  const { body = {} } = req;

  Model.create(body)
    .then(data => {
      res.status(201);
      res.json({
        success: true,
        data,
      });
    })
    .catch(error => {
      next(new Error(error));
    });
};


exports.getproducts = async (req, res, next) => {
  Model.findAll({ where: { status: 'Active' }, attributes:["id", "name", "photo"]})
    .then(async data => {
      if (!data) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      res.status(200)
      res.json({
        success: true,
        data
      })

    })
    .catch((error) => {
      next(new Error(error));
    });

}

exports.getOneProduct = async( req, res, next ) => {
    try {
        const id = req.params.product_id
        const product = Model.findOne({ id, status:'Active' })
        if (!product){
            res.status(404)
            return res.json({
                success:false,
                msg: "ID product not found"
            })
        }
        res.status(200)
        res.json({
            success: true,
            data: product
        })
    } catch (error) {
        RegisterError(error, req, null)
        return next(new Error(error));
    }
}


exports.putProduct = async (req, res, next) => {
    try {
        const { product_name } = req.body
        const product_id = req.params.id 
        const product = await Model.findOne({ where: { id: product_id, status: "Active" } })
        if (_.isEmpty(product)){
            res.status(404)
            return res.json({
                success: true,
                msg: "There is no product related to the id"
            })
        }
        const { photo, name } = product
        if (!_.isEmpty(req.file)){
            if (!_.isEmpty(photo)){
                const nameFile = photo.slice(photo.lastIndexOf(".net/img/")+ 9)
                const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
                const blobServiceClient = new BlobServiceClient(
                    `https://${account}.blob.core.windows.net`,
                    sharedKeyCredential
                );
                const containerClient = blobServiceClient.getContainerClient(containerName);
                const blockBlobClient = containerClient.getBlockBlobClient(nameFile);
                if ( await blockBlobClient.exists()){
                    const blobDeleteResponse = awaitblockBlobClient.delete();
                }
            } 
            const uploadResponse = await upload_imagen(req, containerName)
            if (!_.isEmpty(uploadResponse)){
                if (uploadResponse._response.status == 201){
                    var name_update
                    const url = uploadResponse._response.request.url.slice(0,-15)
                    if (_.isEmpty(product_name)){
                        name_update = name
                    } else {
                        name_update = product_name
                    }
                    await Model.update({ photo: url, name: name_update }, 
                        { returning: true, where: { id: product_id } })
                } else {
                    res.status(uploadResponse._response.status)
                    return res.json({
                        success: false,
                        msg: "Error upload imagen "
                    })
                }
            } else {
                res.status(400)
                return res.json({
                    success: false,
                    msg: "Error upload image"
                })
            }
            
        
            
        } else {
            if (_.isEmpty(product_name)){
                res.status(400)
                return res.json({
                    success: false,
                    msg: "Attach image or product name"
                })
            }
            await Model.update({ name : product_name }, 
                { returning: true, where: { id: product_id } })
        }
        res.status(200)
        return res.json({
            success:true,
            msg: "Update successfully"
        })
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error));
    }   

}

exports.postProduct = async (req, res, next) => {
    try {
        const { product_name } = req.body
        var response
        if (!_.isEmpty(req.file)){
            const uploadResponse = await upload_imagen(req, containerName)
            if (!_.isEmpty(uploadResponse)){
                if (uploadResponse._response.status == 201){
                    const url = uploadResponse._response.request.url.slice(0,-15)
                    response  = await Model.create({
                        name: product_name, photo:url
                    })
                } else {
                    res.status(400)
                    return res.json({
                        success: false,
                        msg: "Error upload image product",
                        status: uploadResponse._response.status
                    })
                }
            } else {
                res.status(400)
                return res.json({
                    success: false,
                    msg: "Error upload image product"
                })
            }
        } else {
            response = await Model.create({ name: product_name})
        }
        res.status(201)
        return res.json({
            success:true,
            msg: "Product create sucess",
            data: response
        })
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

exports.deleteProduct = async (req, res, next) => {
    try {
        const product_id = req.params.id
        const product = await Model.findOne({ where: { id: product_id } })
        if (_.isEmpty(product)){
            res.status(404)
            return res.json({
                success: true,
                msg: "There is no product related to the id"
            })
        }
        const { photo } = product
       
        if (!_.isEmpty(photo)){
            const nameFile = photo.slice(photo.lastIndexOf(".net/img/")+ 9)
            const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
            const blobServiceClient = new BlobServiceClient(
                `https://${account}.blob.core.windows.net`,
                sharedKeyCredential
            );
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(nameFile);
            if ( await blockBlobClient.exists()){
                const blobDeleteResponse = await blockBlobClient.delete();
            }
            await Model.destroy({where: { id: product_id }})
        }
    
        res.status(204)
        return res.json({
            success:true,
            msg: "Product delete sucess",
        })
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

exports.deleteProductStatus = async (req, res, next) => {
    try {
        const product_id = req.params.id
        const product = await Model.findOne({ where: { id: product_id } })
        if (_.isEmpty(product)){
            res.status(404)
            return res.json({
                success: true,
                msg: "There is no product related to the id"
            })
        }
        await Model.update ({ status: 'Inactive'}, {returning:true, where :{ id: product_id}})
        await Fridge_x_Product.destroy({ where: { product_id: product_id }})
        res.status(204)
        return res.json({
            success:true,
            msg: "Product delete sucess",
        })
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}