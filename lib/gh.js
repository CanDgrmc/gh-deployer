const clone = require('git-clone/promise');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = class GH {
    repository;
    targetPath = path.resolve(__dirname , '../cloned');

    constructor(repository, options) {
        this.repository = repository;
    }


    async clone() {
        const url = this.repository.html_url;

        await this.truncateFolder();      
        await this.createFolderIfNotExists()
        await clone(url, this.targetPath);
        
        console.log('repository cloned');
       
    }


    async checkFolder() {

        return new Promise((resolve, reject) => {
            console.log('targetPath', this.targetPath);
            fs.access(this.targetPath, (err, access) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true)
                }
            })
        })
    }

    async createFolderIfNotExists() {
        const folderExists = await this.checkFolder();
        console.log('exists', folderExists);
        if (!folderExists) {
            return new Promise((resolve, reject) => {
                fs.mkdir(this.targetPath, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }

    async truncateFolder() {
        const folderExists = await this.checkFolder();
        console.log('exits', folderExists);

        return new Promise((resolve, reject) => {
            if (folderExists) {
                try {
                    fs.rmdirSync(this.targetPath,{ recursive: true, force: true});
                    resolve(true);
                } catch(e) {
                    reject(e);
                }
            }
            resolve();
            
        })
    }
}