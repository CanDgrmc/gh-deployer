const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const stream = require("stream")

var AWS = require('aws-sdk');
AWS.config.apiVersions = {
    elasticbeanstalk: '2010-12-01',
    s3: '2006-03-01'
};
AWS.config.update({
    region: 'eu-west-1'
});

const s3 = new AWS.S3();

module.exports = class Zip {
    targetPath = path.resolve(__dirname , '../cloned');

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
        const zipPath = path.resolve(this.targetPath, '../') + '/' + fileNameWithExt;

        const output = fs.createWriteStream(zipPath);

        output.on('end', function() {
            console.log('ended..')
        });

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
              Bucket: "elasticbeanstalk-eu-west-1-236019483442",
              Key: `gh-deployer/${fileNameWithExt}`,
              Body: pass,
              ContentType: "application/zip"
            }
            return s3.upload(s3params).promise()
        };
        await uploadFromStream(uploadStream);

        console.log('zip process finalized..');
        
        return {path: zipPath, label: fileName, key: `gh-deployer/${fileNameWithExt}`};
        
    }  
}