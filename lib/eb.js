
module.exports = class EB {
    target_env;
    app_name;
    eb;
    
    constructor(options) {
        this.target_env     = options.target_env;
        this.app_name       = options.app_name;
        this.bucket         = options.bucket;
        this.log            = options.log;
        this.eb             = new options.aws.ElasticBeanstalk();
    }

    async deploy (label, key) {
        var options = {
            ApplicationName: this.app_name,
            VersionLabel: label,
            Description: 'deployed on hook',
            SourceBundle: {
              S3Bucket: this.bucket,
              S3Key: key
            }
          };

        const versionResult = await this.eb.createApplicationVersion(options).promise();

        this.log('new version created..', versionResult);

        const updateEnvironmentResult = await this.eb.updateEnvironment({
            EnvironmentName: this.target_env,
            VersionLabel: label,
        }).promise();

        this.log('version updated..', versionResult);
        
    }
}
