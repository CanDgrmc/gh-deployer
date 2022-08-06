const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

module.exports = class Zip {
    targetPath = path.resolve(__dirname , '../cloned');

    async zipCloned () {

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
        zip.pipe(output);
        zip.directory(this.targetPath, false);
        await zip.finalize();
        console.log('zip process finalized..');
        return {path: zipPath, label: fileName};
        
    }  
}