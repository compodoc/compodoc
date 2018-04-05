// import * as cluster from 'cluster';
// const numCPUs = require('os').cpus().length;

// export function concurrentProcessing(pages, block, callback) {
//     const start = Date.now();

//     if (cluster.isMaster) {
//         for (let i = 0; i < numCPUs; i++) {
//             const worker = cluster.fork();
//             worker.on('message', function(result) {
//                 callback(result);
//                 // tslint:disable-next-line:no-invalid-this
//                 console.log('Process ' + this.process.pid + '  has finished sorting its arrays.');
//                 // tslint:disable-next-line:no-invalid-this
//                 this.destroy();
//             });

//             // Here we're sending some random chuncks for the worker to process
//             worker.send(pages.splice(0, pages.length / numCPUs));
//         }

//         cluster.on('exit', worker => {
//             // When the master has no more workers alive it
//             // prints the elapsed time and then kills itself
//             if (Object.keys(cluster.workers).length === 0) {
//                 console.log('Every worker has finished its job.');
//                 console.log('Elapsed Time: ' + (Date.now() - start) + 'ms');
//                 process.exit(1);
//             }
//         });
//     } else {
//         console.log('running in a cluster');
//         process.on('message', (chunks) => {
//             console.log('Process ' + process.pid + '  is starting to process.');
//             process.send(block());
//         });
//     }
// }
