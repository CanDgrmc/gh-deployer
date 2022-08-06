const GH = require('./lib/gh');
const EB = require('./lib/eb');
const Zip = new (require('./lib/zip'))();

const repositoryAppMap = require('./repositoryAppMap');


var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};
log = console.log;

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                const bodyAsJson = JSON.parse(body);
                const gh = new GH(bodyAsJson.repository);

                gh.clone().then(result => {
                    Zip.zipCloned().then(({path,label})=> {
                        console.log('path',path);
                        console.log('label',label);

                        console.log('#########################################################');
                        console.log('deploying...');
                        console.log('#########################################################');
                        log(result);
                        const eb = new EB({
                            app_name: repositoryAppMap[bodyAsJson.repository.name],
                            target_env: repositoryAppMap[bodyAsJson.repository.name] + '-dev',
                            bucket: 'elasticbeanstalk-eu-west-1-236019483442',
                        });

                        eb.deploy(path,label).then(r => {
                            console.log('deployed..');
                        })
                        
                    })
                })
                //log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

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
