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
function replaceArray(text) {
  return text.replace(/\n/g, ",").replace(/\s/g, ",");
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
            // 解析数据
            let $ = cheerio.load(res.text);
            // 获取容器，存放在变量里，方便获取
            let $megaPost = $('._toggle.form2');
            let $post = $('.roundy.a-r.at-c>tbody>tr');

            let $selfStudy = $('table.roundy.textblack.a-c.at-c.sortable').eq(0).find('tr.at-c.bgwhite');
            let $CDStudy = $('table.roundy.textblack.a-c.at-c.sortable').eq(1).find('tr.at-c.bgwhite');
            let $eggStudy = $('table.roundy.textblack.a-c.at-c.sortable').eq(2).find('tr.at-c.bgwhite');

            let $STATS = $('.roundy.alignt-center');
            let $MegaSTATS = $('.roundy.alignt-center').eq(1);
            let $handBookExplain = $('a[title="宝可梦图鉴"]').parent('th').parent('tr').parent('tbody').children('tr').eq(1).children('td').children('table[style="border-collapse: collapse;"]');
            let $getWay = $('span[id=".E8.8E.B7.E5.BE.97.E6.96.B9.E5.BC.8F"]').parent('h3').next().find('.bgwhite.at-c');
            let $restrain = $('span[id=".E5.B1.9E.E6.80.A7.E7.9B.B8.E6.80.A7"]').parent('h3').next().children('.tabbertab').eq(0).find('tr').eq(1).children('td').slice(3);
            let $evolution = $('span[id=".E8.BF.9B.E5.8C.96"]').parent('h3').next().children('tbody').children('tr').children('td');

            let selfStudy = [];
            let CDStudy = [];
            let eggStudy = [];

            let megaMain = {};

            let megaSTATS = {};

            let handBookExplain = [];

            let getWay = [];

            let restrain = [];

            let evolution = [];
            
            await new Promise(function (resolve, reject) {
                $selfStudy.each(function(i,elem){
                    let _this = $(elem);
                    if(_this.find('td').not('.hide').length==7){
                        selfStudy.push({
                            level:replaceText(_this.find('td').not('.hide').eq(0).text()),
                            name:replaceText(_this.find('td').not('.hide').eq(1).find('a').text()),
                            detailed:_this.find('td').not('.hide').eq(1).find('span.explain').attr('title'),
                            type:replaceText(_this.find('td').not('.hide').eq(2).text()),
                            classify:replaceText(_this.find('td').not('.hide').eq(3).text()),
                            power:replaceText(_this.find('td').not('.hide').eq(4).text()),
                            hitRate:replaceText(_this.find('td').not('.hide').eq(5).text()),
                            PP:replaceText(_this.find('td').not('.hide').eq(6).text()),
                        });
                    }else if(_this.find('td').not('.hide').length==8){
                        selfStudy.push({
                            smlevel:replaceText(_this.find('td').not('.hide').eq(0).text()),
                            usumlevel:replaceText(_this.find('td').not('.hide').eq(1).text()),
                            name:replaceText(_this.find('td').not('.hide').eq(2).find('a').text()),
                            detailed:_this.find('td').not('.hide').eq(3).find('span.explain').attr('title'),
                            type:replaceText(_this.find('td').not('.hide').eq(3).text()),
                            classify:replaceText(_this.find('td').not('.hide').eq(4).text()),
                            power:replaceText(_this.find('td').not('.hide').eq(5).text()),
                            hitRate:replaceText(_this.find('td').not('.hide').eq(6).text()),
                            PP:replaceText(_this.find('td').not('.hide').eq(7).text()),
                        });
                    }
                    
                });
                // console.log('selfStudy');
                resolve();
            
            });
            
            await new Promise(function (resolve, reject) {
                $CDStudy.each(function(i,elem){
                    let _this = $(elem);
                        CDStudy.push({
                            CDNomber:replaceText(_this.find('td').not('.hide').eq(1).text()),
                            name:replaceText(_this.find('td').not('.hide').eq(2).find('a').text()),
                            detailed:_this.find('td').not('.hide').eq(2).find('span.explain').attr('title'),
                            type:replaceText(_this.find('td').not('.hide').eq(3).text()),
                            classify:replaceText(_this.find('td').not('.hide').eq(4).text()),
                            power:replaceText(_this.find('td').not('.hide').eq(5).text()),
                            hitRate:replaceText(_this.find('td').not('.hide').eq(6).text()),
                            PP:replaceText(_this.find('td').not('.hide').eq(7).text()),
                        });
                    
                });
                // console.log('CDStudy');
                resolve();
            });
            
            await new Promise(function (resolve, reject) {
                $eggStudy.each(function(i,elem){
                    let parent = [];
                    
                    let _this = $(elem);
                    _this.find('td').not('.hide').eq(0).find('a').each(function(i,elem){
                        let _this = $(elem);
                        parent.push(_this.attr('title'));
                    });
                        eggStudy.push({
                            parent:parent,
                            name:replaceText(_this.find('td').not('.hide').eq(1).find('a').text()),
                            detailed:_this.find('td').not('.hide').eq(1).find('span.explain').attr('title'),
                            type:replaceText(_this.find('td').not('.hide').eq(2).text()),
                            classify:replaceText(_this.find('td').not('.hide').eq(3).text()),
                            power:replaceText(_this.find('td').not('.hide').eq(4).text()),
                            hitRate:replaceText(_this.find('td').not('.hide').eq(5).text()),
                            PP:replaceText(_this.find('td').not('.hide').eq(6).text()),
                        });
                    
                });
                // console.log('eggStudy');
                resolve();
            });
            

            if($megaPost.length == 1){
                megaMain = {
                    name:"mega"+replaceText($megaPost.eq(0).find('table.roundy').find('td').eq(0).text()),
                    // type_icon:replaceText($post.eq(0).find('table.roundy').find('td').eq(1).text()),
                    aid:replaceText($post.eq(0).find('table.roundy').find('th').text()),
                    // sid:index,
                    // header_img:'',
                    property:[
                            replaceText($megaPost.find('a[title="属性"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').eq(0).text()),
                            replaceText($megaPost.find('a[title="属性"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').eq(1).text())
                        ],
                    classify:replaceText($megaPost.find('a[title="分类"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    features:{
                        normal:replaceText($megaPost.find('a[title="特性"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').eq(0).text()),
                    },
                    exp_max:replaceText($megaPost.find('a[title="经验值"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    // otherid:{},
                    height:replaceText($megaPost.find('a[title="宝可梦列表（按身高排序）"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    weight:replaceText($megaPost.find('a[title="宝可梦列表（按体重排序）"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    shape:replaceText($megaPost.find('a[title="宝可梦列表（按体形分类）"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').attr('title')),
                    handBookColor:replaceText($megaPost.find('a[title="宝可梦列表（按颜色分类）"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    catchRate:replaceText($megaPost.find('a[title="捕获率"]').parent("b").parent("td").find('td.roundy').eq(0).find('.explain').text()),
                    sexScale:replaceText($megaPost.find('a[title="宝可梦列表（按性别比例分类）"]').parent("b").parent("td").find('table.roundy').find('table.roundy').find('tr').last().text()),
                    Cultivate:{
                        population:replaceText($megaPost.find('a[title="宝可梦培育"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                        stepNumber:replaceText($megaPost.find('a[title="宝可梦培育"]').parent("b").parent("td").find('td.roundy').eq(1).text())
                    },
                    baseStats:[
                        replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(0).text()),
                        replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(1).text()),
                        replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(2).text()),
                        replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(3).text()),
                        replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(4).text()),
                        replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(5).text())
                    ],
                    getExp:{
                        baseExp:replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(1).find('td.roundy').eq(0).text()),
                        fightExp:replaceText($megaPost.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(1).find('td.roundy').eq(1).text())
                    },
                }
            }
            
            if($STATS.length>1){
                megaSTATS = {
                    speciesStrength:{
                        hp:replaceText($MegaSTATS.find('tr.bgl-HP').find('td').eq(0).find('th').eq(1).text()),
                        atk:replaceText($MegaSTATS.find('tr.bgl-攻击').find('td').eq(0).find('th').eq(1).text()),
                        def:replaceText($MegaSTATS.find('tr.bgl-防御').find('td').eq(0).find('th').eq(1).text()),
                        spa:replaceText($MegaSTATS.find('tr.bgl-特攻').find('td').eq(0).find('th').eq(1).text()),
                        spd:replaceText($MegaSTATS.find('tr.bgl-特防').find('td').eq(0).find('th').eq(1).text()),
                        spe:replaceText($MegaSTATS.find('tr.bgl-速度').find('td').eq(0).find('th').eq(1).text()),
                    },
                    range50:{
                        hp:replaceText($MegaSTATS.find('tr.bgl-HP>th').eq(0).text()),
                        atk:replaceText($MegaSTATS.find('tr.bgl-攻击>th').eq(0).text()),
                        def:replaceText($MegaSTATS.find('tr.bgl-防御>th').eq(0).text()),
                        spa:replaceText($MegaSTATS.find('tr.bgl-特攻>th').eq(0).text()),
                        spd:replaceText($MegaSTATS.find('tr.bgl-特防>th').eq(0).text()),
                        spe:replaceText($MegaSTATS.find('tr.bgl-速度>th').eq(0).text()),
                    },
                    range100:{
                        hp:replaceText($MegaSTATS.find('tr.bgl-HP>th').eq(1).text()),
                        atk:replaceText($MegaSTATS.find('tr.bgl-攻击>th').eq(1).text()),
                        def:replaceText($MegaSTATS.find('tr.bgl-防御>th').eq(1).text()),
                        spa:replaceText($MegaSTATS.find('tr.bgl-特攻>th').eq(1).text()),
                        spd:replaceText($MegaSTATS.find('tr.bgl-特防>th').eq(1).text()),
                        spe:replaceText($MegaSTATS.find('tr.bgl-速度>th').eq(1).text()),
                    }
                }
            }

            await new Promise(function (resolve, reject) {
                $handBookExplain.each(function(i,elem){
                    let _this = $(elem);
                    let version = [];
                    let data = [];
                    let $post = _this.children('tbody').children('tr');
                    
                    $post.eq(1).children('td').children('table').each(function(i,elem){
                        let _this = $(elem);
                        if(_this.css('display')!='none'){
                            let version = [];
                            _this.children('tbody').find('th.roundy.textblack').each(function(i,elem){
                                let _this = $(elem);
                                version.push(replaceText(_this.text()));
                            })
                            data.push({
                                version:version,
                                content:replaceText(_this.find('td.at-l').text())
                            });
                        }
                        
                    });
                    handBookExplain.push(
                        {
                            generation:replaceText($post.eq(0).text()),
                            data:data
                        }
                    )
                });
                // console.log('handBookExplain');
                resolve();
            })
            
            await new Promise(function (resolve, reject) {
                $getWay.each(function(i,elem){
                    let _this = $(elem);
                    let version = [];
                    _this.children('td').eq(0).find('.roundy-4').each(function(i,elem){
                        version.push(replaceText($(elem).text()));
                    });
                    getWay.push({
                        version:version,
                        place:replaceText(_this.children('td').eq(1).text()),
                        way:replaceText(_this.children('td').eq(2).text()),
                        remark:replaceText(_this.children('td').eq(3).text())
                    })
                    
                });
                // console.log('getWay');
                resolve();
            })
            
            await new Promise(function (resolve, reject) {
                $restrain.each(function(i,elem){
                    let _this = $(elem);
                    restrain.push(replaceText(_this.text()));
                });
                // console.log('restrain');
                resolve();
            });
            
            await new Promise(function (resolve, reject) {
                $evolution.each(function(i,elem){
                    let _this = $(elem);
                    if(_this.hasClass('textblack')){
                        evolution.push(
                            {
                               type:2,
                               data: replaceText($(elem).children('a').eq(1).text())
                            }
                        )
                    }else{
                        let property = [];
                        $(elem).children('table').find('tr').eq(3).children('td').children('span').each(function(i,elem){
                            property.push(replaceText($(elem).text()))
                        });
                        evolution.push(
                            {
                               type:1,
                               data: {
                                   stage:replaceText($(elem).children('table').find('tr').eq(2).text()),
                                   name:replaceText($(elem).children('table').find('tr').eq(3).children('td').children('a').text()),
                                   property:property
                               }
                            }
                        )
                    }
    
                });
                // console.log('evolution');
                resolve();
            })
            


            // console.log(evolution);
            
            /**
             * 存放数据容器
             * @type {Array}
             */
            let data = {
                main: {
                    name:replaceText($post.eq(0).find('table.roundy').find('td').eq(0).text()),
                    type_icon:replaceText($post.find('a[title="宝可梦列表（按全国图鉴编号）"]').text())+'.png',
                    aid:replaceText($post.find('a[title="宝可梦列表（按全国图鉴编号）"]').text()),
                    // sid:index,
                    // header_img:'',
                    property:[
                            replaceText($post.find('a[title="属性"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').eq(0).text()),
                            replaceText($post.find('a[title="属性"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').eq(1).text())
                        ],
                    classify:replaceText($post.find('a[title="分类"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    features:{
                        normal:[
                            replaceText($post.find('a[title="特性"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').eq(0).text()),
                            replaceText($post.find('a[title="特性"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').eq(1).text())
                        ],
                        special:replaceText($post.find('a[title="特性"]').parent("b").parent("td").find('td.roundy').eq(1).find('a').eq(0).text())
                    },
                    exp_max:replaceText($post.find('a[title="经验值"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    // otherid:{},
                    height:replaceText($post.find('a[title="宝可梦列表（按身高排序）"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    weight:replaceText($post.find('a[title="宝可梦列表（按体重排序）"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    shape:replaceText($post.find('a[title="宝可梦列表（按体形分类）"]').parent("b").parent("td").find('td.roundy').eq(0).find('a').attr('title')),
                    handBookColor:replaceText($post.find('a[title="宝可梦列表（按颜色分类）"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                    catchRate:replaceText($post.find('a[title="捕获率"]').parent("b").parent("td").find('td.roundy').eq(0).find('.explain').text()),
                    sexScale:replaceText($post.find('a[title="宝可梦列表（按性别比例分类）"]').parent("b").parent("td").find('table.roundy').find('table.roundy').find('tr').last().text()),
                    Cultivate:{
                        population:replaceText($post.find('a[title="宝可梦培育"]').parent("b").parent("td").find('td.roundy').eq(0).text()),
                        stepNumber:replaceText($post.find('a[title="宝可梦培育"]').parent("b").parent("td").find('td.roundy').eq(1).text())
                    },
                    baseStats:[
                        replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(0).text()),
                        replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(1).text()),
                        replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(2).text()),
                        replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(3).text()),
                        replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(4).text()),
                        replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(0).find('td.roundy').eq(5).text())
                    ],
                    getExp:{
                        baseExp:replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(1).find('td.roundy').eq(0).text()),
                        fightExp:replaceText($post.find('a[title="基础点数"]').parent("b").parent("td").find('tr').eq(1).find('td.roundy').eq(1).text())
                    },
                },
                megaMain: megaMain,
                skill: {
                    selfStudy:selfStudy,
                    CDStudy:CDStudy,
                    eggStudy:eggStudy
                },
                game: {
                    STATS:{
                        speciesStrength:{
                            hp:replaceText($STATS.find('tr.bgl-HP').find('td').eq(0).find('th').eq(1).text()),
                            atk:replaceText($STATS.find('tr.bgl-攻击').find('td').eq(0).find('th').eq(1).text()),
                            def:replaceText($STATS.find('tr.bgl-防御').find('td').eq(0).find('th').eq(1).text()),
                            spa:replaceText($STATS.find('tr.bgl-特攻').find('td').eq(0).find('th').eq(1).text()),
                            spd:replaceText($STATS.find('tr.bgl-特防').find('td').eq(0).find('th').eq(1).text()),
                            spe:replaceText($STATS.find('tr.bgl-速度').find('td').eq(0).find('th').eq(1).text()),
                        },
                        range50:{
                            hp:replaceText($STATS.find('tr.bgl-HP>th').eq(0).text()),
                            atk:replaceText($STATS.find('tr.bgl-攻击>th').eq(0).text()),
                            def:replaceText($STATS.find('tr.bgl-防御>th').eq(0).text()),
                            spa:replaceText($STATS.find('tr.bgl-特攻>th').eq(0).text()),
                            spd:replaceText($STATS.find('tr.bgl-特防>th').eq(0).text()),
                            spe:replaceText($STATS.find('tr.bgl-速度>th').eq(0).text()),
                        },
                        range100:{
                            hp:replaceText($STATS.find('tr.bgl-HP>th').eq(1).text()),
                            atk:replaceText($STATS.find('tr.bgl-攻击>th').eq(1).text()),
                            def:replaceText($STATS.find('tr.bgl-防御>th').eq(1).text()),
                            spa:replaceText($STATS.find('tr.bgl-特攻>th').eq(1).text()),
                            spd:replaceText($STATS.find('tr.bgl-特防>th').eq(1).text()),
                            spe:replaceText($STATS.find('tr.bgl-速度>th').eq(1).text()),
                        }
                    },
                    megaSTATS:megaSTATS,
                    handBookExplain:handBookExplain,
                    getWay:getWay,
                    restrain:restrain,
                    evolution:evolution
                }
            };

            // console.log(data);

            var insertData = function (db, callback) {
                //连接到表 pmlist
                var collection = db.collection('pmlist'+replaceText($post.eq(0).find('table.roundy').find('th').text()));
                //插入数据
                // collection.deleteMany({});
                collection.insert(data, function (err, result) {
                    if (err) {
                        console.log('Error:' + err);
                        return;
                    }
                    callback(result);
                });
            }
        
            await new Promise((resolce,reject)=>{
                MongoClient.connect(DB_CONN_STR, function (err, db) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("连接成功！"+index);
                    //1、插入
                    insertData(db, function (result) {
                        // console.log(result);
                        db.close();
                    });
                
                });
                resolve();
            })
            
        });
        
    });
    

}