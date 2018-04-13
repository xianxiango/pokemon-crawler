const superagent = require('superagent');
const cheerio = require('cheerio');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://127.0.0.1:27017/pokemonDB');
// const MongoClient = require('mongodb').MongoClient;
// const DB_CONN_STR = 'mongodb://localhost:27017/pokemonDB';

let reptileUrl = "http://wiki.52poke.com/wiki/%E5%B1%9E%E6%80%A7";

/**
 * 处理空格和回车
 * @param text
 * @returns {string}
 */
function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}
superagent.get(reptileUrl).end(function(err,res){
    if(err){
        return Error(err);
    }

    let $ = cheerio.load(res.text);

    let data = [];

    $('.roundy.textwhite td.roundy-15').each(function(i,elem){
        let _this = $(elem);
        var pokemon = [];
        data.push({
            name:replaceText(_this.text())
        })
        
    });
    // 设置数据类型
    var monSchema = new mongoose.Schema({
        skill:{type:Array},
    });
    // 选择集合
    var monModel = db.model('pmTypeList',monSchema);

    var content = {skill:data};
    // 实例化对象并插入数据
    var monInsert = new monModel(content);

    monInsert.save(function(err){
        if(err){
          console.log(err);
        }else{
          console.log('成功插入数据');
        }
        db.close();
    });

    // var insertData = function (db, callback) {
    //     //连接到表 pmlist
    //     var collection = db.collection('pmTypeList');
    //     //插入数据
    //     collection.insert(data, function (err, result) {
    //         if (err) {
    //             console.log('Error:' + err);
    //             return;
    //         }
    //         callback(result);
    //     });
    // }


    // MongoClient.connect(DB_CONN_STR, function (err, db) {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     console.log("连接成功！");
    //     //1、插入
    //     insertData(db, function (result) {
    //         console.log(result);
    //         db.close();
    //     });
    
    // });
})