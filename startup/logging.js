const winston = require('winston');
// require('winston-mongodb');
require('express-async-errors');




module.exports = function(){


winston.add(new winston.transports.File({filename:'logger.log'}));
// winston.add(new winston.transports.MongoDB({ 
//                                             db:'mongodb://localhost/vidly',
//                                             level:'error'
//                                             }));

process.on('uncaughtException',(ex)=>{

    winston.error(ex.message, ex);
    process.exit(1);
});

process.on('unhandledRejection',(ex)=>{
    
    winston.error(ex.message, ex);
    process.exit(1);
});



}