const superagent = require('superagent');
const cheerio = require('cheerio');
const DB_CONN_STR = 'mongodb://localhost:27017/pokemonDB';
const mkdirp = require('mkdirp');
const fs = require('fs');
const request = require('request');
const MongoClient = require('mongodb').MongoClient;

let reptileUrl = "http://wiki.52poke.com/wiki/%E5%AE%9D%E5%8F%AF%E6%A2%A6%E5%88%97%E8%A1%A8%EF%BC%88%E6%8C%89%E5%85%A8%E5%9B%BD%E5%9B%BE%E9%89%B4%E7%BC%96%E5%8F%B7%EF%BC%89";

/**
 * 处理空格和回车
 * @param text
 * @returns {string}
 */
function replaceSrc(text) {
  return text.replace(/media\.52poke\.com/g, "s1.52poke.wiki");
}
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
        let _this = $(elem);
        if(i==0||i==3){
            _this.find('.sprite-icon').parent("td").parent('tr').each(function(i,elem){
                let _this = $(elem);
                let url = $(elem).find('td').eq(3).find('a').attr('href');
                data.push(url);
            });
        }else if((i>=1&&i<=2)||i==4||i==6){
            _this.find('.sprite-icon').parent("td").parent('tr').each(function(i,elem){
                let _this = $(elem);
                let url = $(elem).find('td').eq(4).find('a').attr('href');
                data.push(url);
            });
        }else if(i==5){
            _this.find('.sprite-icon').parent("td").parent('tr').each(function(i,elem){
                let _this = $(elem);
                let url = $(elem).find('td').eq(5).find('a').attr('href');
                data.push(url);
            });
        }
    });
    // console.log(data);
    data.forEach(async function(item,i){

        await getArticle(item,i+1);
    });

    

    
})


function getArticle(url,index) {
    return new Promise((resolve, reject) => {
        superagent.get('http://wiki.52poke.com'+url).end(async function(err, res) {
            // 抛错拦截
            if (err) {
                return Error(err);
            }

            //本地存储目录
            var dir = './images';
            
            //创建目录
            mkdirp(dir, function(err) {
                if(err){
                    console.log(err);
                }
            });
            // 解析数据
            let $ = cheerio.load(res.text);
            // 获取容器，存放在变量里，方便获取
            let $post = $('.roundy.a-r.at-c>tbody>tr');

            
            
            /**
             * 存放数据容器
             * @type {Array}
             */
            // console.log(src);
            var insertData = function (db, callback) {
                //连接到表 pmlist
                var collection = db.collection('pmlist'+replaceText($post.eq(0).find('table.roundy').find('th').text()));
                //插入数据
                collection.drop(function (err, result) {
                    if (err) {
                        console.log('Error:' + err);
                        return;
                    }
                    callback(result);
                });
            }
        
        
            MongoClient.connect(DB_CONN_STR,await function (err, db) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("连接成功！");
                //1、插入
                insertData(db,function (result) {
                    console.log("成功"+result);
                    db.close();
                });
            
            });
            resolve();
            
        });
        
    });
    

}