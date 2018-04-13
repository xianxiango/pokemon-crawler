const superagent = require('superagent');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
const DB_CONN_STR = 'mongodb://localhost:27017/pokemonDB';

let reptileUrl = "http://wiki.52poke.com/wiki/%E5%AE%9D%E5%8F%AF%E6%A2%A6%E5%88%97%E8%A1%A8%EF%BC%88%E6%8C%89%E5%85%A8%E5%9B%BD%E5%9B%BE%E9%89%B4%E7%BC%96%E5%8F%B7%EF%BC%89";

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

    $('.eplist').each(function(i,elem){
        
        
            if(i==0||i==3){
                let _this = $(elem);
                var pokemon = [];
                _this.find('.sprite-icon').parent("td").parent('tr').each(function(i,elem){
                    let _this = $(elem);
                    pokemon.push({
                        tPmId: replaceText(_this.find('td').eq(0).text()),
                        allPmId:replaceText(_this.find('td').eq(1).text()),
                        img:_this.find('.sprite-icon').attr('class').split(/\s+/)[1],
                        pmNameCN:replaceText(_this.find('td').eq(3).text()),
                        pmNameJA:replaceText(_this.find('td').eq(4).text()),
                        pmNameEN:replaceText(_this.find('td').eq(5).text()),
                        tpye:[replaceText(_this.find('td').eq(6).text()),replaceText(_this.find('td').eq(7).text())]
                    });
                });
                data.push({
                    sid: _this.attr('class').split(/\s+/)[2],
                    pm:pokemon
                })
            }else if((i>=1&&i<=2)||i==4||i==6){
                let _this = $(elem);
                var pokemon = [];
                _this.find('.sprite-icon').parent("td").parent('tr').each(function(i,elem){
                    let _this = $(elem);
                    pokemon.push({
                        tPmIdOld: replaceText(_this.find('td').eq(0).text()),
                        tPmIdNew: replaceText(_this.find('td').eq(1).text()),
                        allPmId:replaceText(_this.find('td').eq(2).text()),
                        img:_this.find('.sprite-icon').attr('class').split(/\s+/)[1],
                        pmNameCN:replaceText(_this.find('td').eq(4).text()),
                        pmNameJA:replaceText(_this.find('td').eq(5).text()),
                        pmNameEN:replaceText(_this.find('td').eq(6).text()),
                        tpye:[replaceText(_this.find('td').eq(7).text()),replaceText(_this.find('td').eq(8).text())]
                    });
                });
                data.push({
                    sid: _this.attr('class').split(/\s+/)[2],
                    pm:pokemon
                })
            }else if(i==5){
                let _this = $(elem);
                var pokemon = [];
                _this.find('.sprite-icon').parent("td").parent('tr').each(function(i,elem){
                    let _this = $(elem);
                    pokemon.push({
                        tPmIdCenter: replaceText(_this.find('td').eq(0).text()),
                        tPmIdCoast: replaceText(_this.find('td').eq(1).text()),
                        tPmIdKop: replaceText(_this.find('td').eq(2).text()),
                        allPmId:replaceText(_this.find('td').eq(3).text()),
                        img:_this.find('.sprite-icon').attr('class').split(/\s+/)[1],
                        pmNameCN:replaceText(_this.find('td').eq(5).text()),
                        pmNameJA:replaceText(_this.find('td').eq(6).text()),
                        pmNameEN:replaceText(_this.find('td').eq(7).text()),
                        tpye:[replaceText(_this.find('td').eq(8).text()),replaceText(_this.find('td').eq(9).text())]
                    });
                });
                data.push({
                    sid: _this.attr('class').split(/\s+/)[2],
                    pm:pokemon
                })
            }
        
    });


    

    var insertData = function (db, callback) {
        //连接到表 pmlist
        var collection = db.collection('pmlist');
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