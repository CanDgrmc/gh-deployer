const http = require('http');
const fs = require('fs');
const html = fs.readFileSync('index.html');
var AWS = require('aws-sdk');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};
log = console.log;

const GH = require('./lib/gh');
const EB = require('./lib/eb');
const Zip = new (require('./lib/zip'))(log);

const env = process.env.NODE_ENV || 'dev';
const config = require('./config')[env];

if (!config) {
    throw new Error('environment config not found..');
}

const port = config.port;

AWS.config.apiVersions = {
    elasticbeanstalk: '2010-12-01',
    s3: '2006-03-01'
};
AWS.config.update({
    region: config.region
});


var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                const bodyAsJson = JSON.parse(body);
                const gh = new GH(bodyAsJson.repository, {log});

                gh.clone().then(result => {
                    Zip.zipAndUpload().then(({path,label, key})=> {

                        log('deploying...');
                        const eb = new EB({
                            app_name: config.repositoryAppMap[bodyAsJson.repository.name].app_name,
                            target_env: config.repositoryAppMap[bodyAsJson.repository.name].environments[env],
                            log,
                        });
                        eb.deploy(path, label, key).then(() => log('the end..'));
                    })
                })
                //log('Received message: ' + body);
            } 
            /*
            else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }
            */
            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        res.writeHead(200);
        res.write(html);
        res.end();
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
