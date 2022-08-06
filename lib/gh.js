const clone = require('git-clone/promise');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = class GH {
    repository;
    targetPath = path.resolve(__dirname , '../cloned');
    log;

    constructor(repository, options) {
        this.repository = repository;
        this.log = options.log;
    }


    async clone() {
        const url = this.repository.html_url;

        await this.truncateFolder();      
        await this.createFolderIfNotExists()
        await clone(url, this.targetPath);
        
        this.log('repository cloned..');
    }


    async checkFolder() {

        return new Promise((resolve, reject) => {
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