var EventEmitter = require('events').EventEmitter;
var util = require('util');
var express = require('express');
var path = require('path');
var engine = require('ejs-locals');

var qw;

function Http($config, Qw) {
    qw = Qw.log(this);
    this.app = null;
    this.config = $config;
}
util.inherits(Http, EventEmitter);


Http.prototype.prepare = function () {
    var app = express();

    var staticPath = path.join(__dirname, '../../http/static');
    app.use(express.static(staticPath));
    qw('static files path:', staticPath);
    var viewsPath = path.join(__dirname, '../../http/views');
    app.set('views', viewsPath);
    qw('views path:', viewsPath);
    var uploadsPath = this.config.uploadDir;
    app.set('uploads', uploadsPath);
    qw('uploads path:', uploadsPath);
    app.engine('ejs', engine);
    app.set('view engine', 'ejs');
    app.set('view options', {
        layout: false
    });
    app.use(express.cookieParser());
    app.use(express.bodyParser({
        keepExtensions: true,
        limit: 10000000
    }));
    // app.use(express.multipart());
    app.use(express.methodOverride());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(app.router);
//app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(function (req, res, next) {
        res.status(404);
        // respond with html page

        if (req.accepts('html')) {
            res.render('404', {url: req.url});
            return;
        }
        // respond with json
        if (req.accepts('json')) {
            res.send({error: 'Not found'});
            return;
        }
        // default to plain-text. send()
        res.type('txt').send('Not found');
    });


// development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }
    this.app = app;

}

Http.prototype.addRoute = function (method, path, handler) {
    this.app[method](path, handler);
}
Http.prototype.getApp = function () {
    return this.app;
}
Http.prototype.getVar = function (varName) {
    return this.app.get(varName);
}
Http.prototype.start = function () {
    if (typeof  this.config.port === "number") {
        this.app.listen(this.config.port, this.config.ipAddress);
    } else {
        throw Error('port is not set');
    }
}
Http.prototype.EVENT_USER_AVATAR_RELOAD = 'EVENT_USER_AVATAR_RELOAD';
module.exports = Http;