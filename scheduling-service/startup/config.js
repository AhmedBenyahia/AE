const config = require('config');

module.exports = (app) => {
    // verify that the jwt key is defined in the global variable
    //    if (!config.get('jwtPrivateKey')) {
    //        throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
    //    }
    // verify the database connection string
        if (!config.get('db')) {
            throw new Error('FATAL ERROR: db is not defined: no database was provided');
        }
    // enable cross-origin resource sharing
       app.use(function(req, res, next) {
           res.header("Access-Control-Allow-Origin", "*");
           res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS, PATCH");
           res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept ,Authorization");
           next();
          });


          
};
