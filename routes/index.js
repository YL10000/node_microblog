
/*
 * GET home page.
 */
var crypto=require('crypto');
var User=require('../modules/user');
var Post=require('../modules/post');

exports.index = function(req, res){
	var params={title: '首页'};
	Post.get(null, function(err, posts) {
		if (err) {
			posts=[];
		}
		params['posts']=posts;
		if (req.session.error) {
			params['error']=req.session.error;
			delete req.session.error;
		}
		if (req.session.success) {
			params['success']=req.session.success;
			delete req.session.success;
		}
		if (req.session.user) {
			params['user']=req.session.user.name;
		}
		res.render('index',params);
	});
	
};

exports.user=function(req,res){
	var params={};
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.session.error=req.body.user+"不存在！";
			return res.redirect('/');
		}
		Post.get(user.name, function(err,posts) {
			if (err) {
				req.session.error=err;
				return res.redirect('/');
			}
			if (req.session.user) {
				params['user']=req.session.user.name;
			}
			params.title=user.name;
			params.posts=posts;
			res.render('user',params);
		});
	});
};

exports.post=function(req,res){
	var params={title: '发表消息'};
	if (req.session.error) {
		params['error']=req.session.error;
		delete req.session.error;
	}
	if (req.session.success) {
		params['success']=req.session.success;
		delete req.session.success;
	}
	res.render('post',params);
};

exports.doPost=function(req,res){
	var currentUser=req.session.user;
	var post=new Post(currentUser.name, req.body.post);
	post.save(function(err){
		if(err){
			req.session.error=err;
			return res.redirect("/");
		}
		req.session.success='发表成功！';
		return res.redirect('/u/'+currentUser.name);
	});
};

exports.reg=function(req, res){
	var params={title: '用户注册'};
	if (req.session.error) {
		params['error']=req.session.error;
		delete req.session.error;
	}
	if (req.session.success) {
		params['success']=req.session.success;
		delete req.session.success;
	}
	res.render('reg', params);
};

exports.doReg=function(req,res){
	if (req.body['password-repeat']!=req.body['password']) {
		req.session.error='两次输入的口令不一致';
		return res.redirect('/reg');
	}
	var md5=crypto.createHash("md5");
	var password=md5.update(req.body.password).digest("base64");
	var newUser=new User({
		name:req.body.username,
		password:password
	});
	//查找用户名是否已经存在
	User.get(newUser.name, function(err,user){
		if (user) {
			err=newUser.name+'已经存在!';
		}
		if (err) {
			req.session.error=JSON.stringify(err);
			return res.redirect('/reg');
		}
		//如果不存在就添加新用户
		newUser.save(function(err) {
			if (err) {
				req.session.error=err;
				return res.redirect('/reg');
			}
			req.session.user=newUser;
			req.session.success='保存成功！';
			res.redirect("/");
		});
	});
};

exports.login=function(req,res){
	var params={title: '用户登录'};
	if (req.session.error) {
		params['error']=req.session.error;
		delete req.session.error;
	}
	if (req.session.success) {
		params['success']=req.session.success;
		delete req.session.success;
	}
	res.render('login', params);
};

exports.doLogin=function(req,res){
	var md5=crypto.createHash("md5");
	var password=md5.update(req.body.password).digest("base64");
	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.session.error=req.body.username+'不存在！';
			return res.redirect('/login');
		}else {
			if (user.password!=password) {
				req.session.error='密码不正确！';
				return res.redirect('/login');
			}else {
				req.session.success='登录成功！';
				req.session.user=user;
				return res.redirect('/');
			}
		}
	});
	
};

exports.logout=function(req,res){
	req.session.user=null;
	req.session.success='登出成功！';
	res.redirect("/");
};