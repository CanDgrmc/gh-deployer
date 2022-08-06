const eb = new AWS.ElasticBeanstalk();

module.exports = class EB {
    target_env;
    app_name;
    eb;
    aws;
    
    constructor(options) {
        this.target_env     = options.target_env;
        this.app_name       = options.app_name;
        this.bucket         = options.bucket;
        this.log            = options.log;
        this.aws            = options.aws;
    }

    async deploy (label, key) {
        var options = {
            ApplicationName: this.app_name,
            VersionLabel: label,
            Description: 'deployed on hook',
            SourceBundle: {
              S3Bucket: 'elasticbeanstalk-eu-west-1-236019483442',
              S3Key: key
            }
          };

        const versionResult = await eb.createApplicationVersion(options).promise();

        this.log('new version created..');

        const updateEnvironmentResult = await eb.updateEnvironment({
            EnvironmentName: this.target_env,
            VersionLabel: label,
        }).promise();

        this.log('version updated..');
        
    }
}
