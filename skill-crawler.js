const superagent = require('superagent');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
const DB_CONN_STR = 'mongodb://localhost:27017/pokemonDB';

let reptileUrl = "http://wiki.52poke.com/wiki/%E6%8B%9B%E5%BC%8F%E5%88%97%E8%A1%A8";

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
    // console.log($('.textwhite').parent('tr').length);
    $('.textwhite').parent('tr').each(function(i,elem){
        let _this = $(elem);
        data.push({
            skillId: replaceText(_this.find('td').eq(0).text()),
            skillCN:replaceText(_this.find('td').eq(1).text()),
            skillJA:replaceText(_this.find('td').eq(2).text()),
            skillEN:replaceText(_this.find('td').eq(3).text()),
            type:replaceText(_this.find('td').eq(4).text()),
            classify:replaceText(_this.find('td').eq(5).text()),
            power:replaceText(_this.find('td').eq(6).text()),
            hitRate:replaceText(_this.find('td').eq(7).text()),
            PP:replaceText(_this.find('td').eq(8).text()),
        });
    });
   


    

    var insertData = function (db, callback) {
        //连接到表 pmlist
        var collection = db.collection('pmSkillList');
        //插入数据
        collection.insert(data, function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    }


    MongoClient.connect(DB_CONN_STR, function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("连接成功！");
        //1、插入
        insertData(db, function (result) {
            console.log(result);
            db.close();
        });
    
    });
})