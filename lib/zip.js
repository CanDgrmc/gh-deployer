const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const stream = require("stream")

module.exports = class Zip {
    targetPath = path.resolve(__dirname , '../cloned');

    constructor({aws, log, s3Folder, bucket}) {
        this.s3 = new aws.S3();
        this.log = log;
        this.s3Folder = s3Folder;
        this.bucket = bucket;
    }

    async zipAndUpload () {

        const date = new Date().toISOString()
            .split('T')
            .join('')
            .split(':')
            .slice(0,2)
            .join('')
            .split('-')
            .join('');
        
        const fileName = `dev_${date}_${require("os").userInfo().username}`;
        const fileNameWithExt = fileName + '.zip';


        const zip = archiver('zip', {
            zlib: { level: 9 }
        });

        zip.on('error', function(err) {
            console.log('err:',err.message);
        });
        const uploadStream = new stream.PassThrough()
        zip.pipe(uploadStream)
        zip.directory(this.targetPath, false);
        zip.finalize();

        console.log('repository zipped..');

        const uploadFromStream = async (pass) => {
            console.log('uploading to s3..');
            const s3params = {
              Bucket: this.bucket,
              Key: `${this.s3Folder}/${fileNameWithExt}`,
              Body: pass,
              ContentType: "application/zip"
            }
            return this.s3.upload(s3params).promise()
        };
        await uploadFromStream(uploadStream);

        console.log('zip process finalized..');

        return {label: fileName, key: `${this.s3Folder}/${fileNameWithExt}`};
        
    }  
}