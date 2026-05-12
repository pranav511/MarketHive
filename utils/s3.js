const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config");
const { v4: uuidv4 } = require("uuid");

exports.uploadToS3 = async (file) => {
  
  const fileName = `${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  
  const res = await s3.send(new PutObjectCommand(params));
  
  const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return imageUrl;
};

exports.deleteFromS3 = async (url) => {

  const key = url.split(".amazonaws.com/")[1];

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };

  await s3.send(new DeleteObjectCommand(params));
};