const ElasticBeanstalk = require('elastic-beanstalk.js');


module.exports = class EB {
    target_env;
    eb;
    constructor(options) {
        this.target_env = options.target_env;

        this.eb = new ElasticBeanstalk({
            aws: {
                accessKeyId: 'AKIATN463QMZMUFLUXHY',
                secretAccessKey: '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',
                applicationName: options.app_name,
                versionsBucket: options.bucket,
                region: 'eu-west-1',
            }
        })
        
    }

    async deploy (filePath, label) {

        console.log('deploy', {
            /* Elastic Beanstalk environment where the package must be deployed */
            environment: this.target_env,
            
            /* Path to the local package (an Elastic Beanstalk package must be a .zip file */
            filename: filePath,
            
            /* Name of the package in the S3 bucket */
            remoteFilename: 'gh-deployer/'+label + '.zip',
            /* Label of the version in Elastic Beanstalk */
            versionLabel: label,
            
            /* Description of the version in Elastic Beanstalk */
            description: 'deployed on hook',
          });
        await this.eb.createVersionAndDeploy({
            /* Elastic Beanstalk environment where the package must be deployed */
            environment: this.target_env,
            
            /* Path to the local package (an Elastic Beanstalk package must be a .zip file */
            filename: filePath,
            
            /* Name of the package in the S3 bucket */
            remoteFilename: 'gh-deployer/'+label + '.zip',
            /* Label of the version in Elastic Beanstalk */
            versionLabel: label,
            
            /* Description of the version in Elastic Beanstalk */
            description: 'deployed on hook',
          })
    }
}
