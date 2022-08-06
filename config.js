const repositoryAppMap = {
    'gh-deployer': {
        appName: 'gh-deployer',
        s3Folder: 'gh-deployer',
        environments: { 
            dev: 'gh-deployer-dev',
            prod: 'gh-deployer-prod',
        }
    },
}
const mutualConfigs = {
    repositoryAppMap,
}

module.exports = {
    dev: {
        ...mutualConfigs,
        bucket: 'elasticbeanstalk-eu-west-1-236019483442',
        port: 3000,
        region: 'eu-west-1',
    }, 
    prod: {
        ...mutualConfigs,
        port: 3000,
    }
}