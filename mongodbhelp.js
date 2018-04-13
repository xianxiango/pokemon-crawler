var insertData = function (db, callback) {
    //连接到表 pmlist
    var collection = db.collection('pmlist');
    //插入数据
    // var data = [{ "name": "网站1", "url": "www.test1.com" }, { "name": "网站2", "url": "www.test2.com" }];
    collection.insert(data, function (err, result) {
        if (err) {
            console.log('Error:' + err);
            return;
        }
        callback(result);
    });
}

var selectData = function(db,callback){
    //连接到表
    var collection = db.collection('pmlist');
    //查询数据
    var whereStr = {"name":"网站1"};
    collection.find(whereStr).toArray(function(err,result){
        if(err){
            console.log("Error"+err);
            return;
        }
        callback(result);
    })
}
var updateData = function(db,callback){
    //连接到表
    var collection = db.collection('pmlist');
    //更新数据
    var whereStr = {"name":"网站1"};
    var updateStr = {$set:{"url":"https://www.test1.com"}};
    collection.update(whereStr,updateStr,function(err,result){
        if(err){
            console.log('Error:'+err);
            return;
        }
        callback(result);
    })
}
var delData = function(db,callback){
    //连接到表
    var collection = db.collection('pmlist');
    //删除数据
    var whereStr = {"name":"网站1"};
    collection.remove(whereStr,function(err,result){
        if(err){
            console.log('Error'+err);
            return;
        }
        callback(result);
    })
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
    //2、查询数据
    selectData(db, function (result) {
        console.log(result);
        db.close();
    });
    //3、更新数据
    updateData(db, function (result) {
        console.log(result);
        db.close();
    });
    //4、删除数据
    delData(db, function (result) {
        console.log(result);
        db.close();
    });

});