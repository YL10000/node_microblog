
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoStore=require('connect-mongo')(express);
var favicon = require('serve-favicon');
var flash=require("connect-flash");
var setting=require('./setting');
var fs=require("fs");

var accessLogfile=fs.createWriteStream("access.log",{flags:'a'})
var errorLogfile=fs.createWriteStream("error.log", {flags: "a"})

var app = express();
app.configure(function(){
	// all environments
	//配置访问日志
	app.use(express.logger({stream:accessLogfile}));
	
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	//app.use(express.bodyParser());


	app.use(express.json());
	app.use(express.urlencoded());


	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret:setting.cookieSecret,
		store: new mongoStore({
			//db:setting.db
			url: 'mongodb://localhost:27017/test'
		})
	}));
	app.use(flash());
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
	
	app.use(function(req,res,next){
		var err=req.session.error;
		var msg=req.session.success;
		delete req.session.error;
		delete req.session.success;
		if (err) {
			res.locals.error=err;
		}
		if (msg) {
			res.locals.success=msg;
		}
		next();
	});
	
	
	//配置错误日志
	app.use(function(err,req,res,next){
		var meta='['+new Date()+']'+req.url+'\n';
		errorLogfile.write(meta+err.stack+'\n');
		next();
	});

	app.get('/', routes.index);//首页
	
	app.get('/u/:user',checkLogin);
	app.get('/u/:user',routes.user);//用户的主页
	
	app.get('/post',routes.post);//去发表信息页面
	app.post('/post',routes.doPost);//发表信息
	
	app.get('/reg',checkNotLogin);//判断没有登录的才能进行注册
	app.get('/reg',routes.reg);	//去注册用户页面
	
	app.post('/reg',checkNotLogin);//判断没有登录的才能进行注册
	app.post('/reg',routes.doReg);//注册用户
	
	app.get('/login',checkNotLogin);//判断没有登录的才能进行登录
	app.get('/login',routes.login);//去登录页面
	
	app.post('/login',checkNotLogin);//判断没有登录的才能进行登录
	app.post('/login',routes.doLogin);//用户登录
	
	app.get('/logout',checkLogin);//判断登录的才能进行登出
	app.get('/logout',routes.logout);//用户登出
	
	app.get('/users', user.list);
	
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function checkLogin(req,res,next){
	if (!req.session.user) {
		req.session.error='您还没有登录！';
		return res.redirect('/login');
	}
	next();
}

function checkNotLogin(req,res,next){
	if (req.session.user) {
		req.session.error='您已经登录！';
		return res.redirect('/');
	}
	next();
}
