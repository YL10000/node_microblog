/**
 * 数据库配置
 */
var Setting=require("../setting");
var Db=require('mongodb').Db;
var Connection=require("mongodb").Connection;
var Server=require("mongodb").Server;

module.exports=new Db(Setting.db, new Server(Setting.host, 27017,{}));