const express     = require('express');
const session     = require('cookie-session');

const app         = express();
app.set('view engine','ejs');



const MongoClient = require('mongodb').MongoClient;
const ObjectID    = require('mongodb').ObjectID;
const assert      = require('assert');

const mongourl    ='';
const dbName      = 'test';

var username='';
var owner='';
let OBJID={};
let DOC  ={};


const fs          = require('fs');
const formidable  = require('express-formidable');
const { render } = require('ejs');
const { ObjectId } = require('bson');
app.use(formidable());


const SECRETKEY ='SECRETKEY';

const users = new Array (
    {name:'student',password:'student'},
    {name:'demo',password:''}
);

app.set('view engine','ejs');

app.use(session({
    name:'loginSession',
    keys:[SECRETKEY]

}));





//---------------------------------------------FIND-------------------------------------
const findDocument=(db,criteria,callback)=>{
    let cursor = db.collection('restaurants').find(criteria);
    console.log(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs)=>{
        assert.equal(err,null);
        console.log(`findDocument:${docs.length}`);
        callback(docs);

    });

};


const handle_Find=(res,criteria)=>{
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null,err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db,criteria,(docs)=>{
            client.close();
            console.log("Connection closed");
            res.status(200).render('main',{nRestaurants:docs.length, restaurants:docs,name:username});

        });

    });

}
//-----------------------------------------------DETAILS-------------------------------------------

const handle_Details = (res,criteria)=>{
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null,err);
        console.log("Connected successfully(DETAILS)");
        const db = client.db(dbName);

        let DOCID        = {};
        DOCID['_id']     = ObjectID(criteria._id);
        OBJID['_id']     = ObjectID(criteria._id);
        findDocument(db,DOCID,(docs)=>{

            client.close();
            console.log("Close Connection(DETAILS)");
            res.status(200).render('details',{restaurants:docs[0]});
            DOC  =docs[0];
            owner=docs[0].owner;
            console.log(DOC);
            console.log(OBJID);
        })

    })
    
}
//-------------------------------------------------INSERT------------------------------------------------
const insertDocument=(db,insertDoc,callback)=>{

        db.collection(`restaurants`).insertOne(insertDoc,(err,results)=>{

            assert.equal(err,null);
            console.log(`INSERTED!!!`);
            callback(results);

        })

}

const handle_Insert=(req,res)=>{
   
    var insertDoc    = {};
    var address      =
    {
        "street"  :req.fields.street,
        "building":req.fields.building,
        "zipcode" :req.fields.zipcode,
        "coord"   :{"gpslon":req.fields.gpslon,"gpslat":req.fields.gpslat}
    };

    insertDoc['name']                =req.fields.name;
    insertDoc['borough']             =req.fields.borough;
    insertDoc['cuisine']             =req.fields.cuisine;
   
    insertDoc["address"]             =address;
    insertDoc['owner']               =username;
    
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null,err);
        console.log("Connected successfully to server (INSERT)");
        const db = client.db(dbName);
fs.readFile(req.files.filetoupload.path,(err,data)=>{
    assert.equal(err,null);
    insertDoc['photo']=new Buffer.from(data).toString('base64');
    
    insertDocument(db,insertDoc,(results)=>{
        res.status(200).render('info', {message: `Inserted 1 document`})

        client.close();
        console.log("Client closed(INSERT)");
        
    });

})
        
    });

}
//-------------------------------------RATE-----------------------------------------------------------------------
const rateDocument=(db,DOCID,rateDoc,callback)=>{

    db.collection(`restaurants`).updateOne(DOCID,{$push:rateDoc},(err,results)=>{

        assert.equal(err,null);
        console.log(`RATED!!!`);
        callback(results);

    })

}


const handle_Rate=(req,res)=>{
    var rateDoc   = {};
    let DOCID     =OBJID;
    var detect    =false;
    var grade     =
    {
        "user"  :username,
        "score":req.fields.score,
        
    };
    rateDoc['grade'] =grade;
    console.log(rateDoc);
    console.log(OBJID);
    
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null,err);
        console.log("Connected successfully to server (RATE)");
        const db = client.db(dbName);
   

    rateDocument(db,DOCID,rateDoc,(results)=>{
        res.status(200).render('info', {message: `Rated 1 document`})

        client.close();
        console.log("Client closed(RATE)");
        
    });

})

}
//-------------------------------------SEARCH----------------------------------------------------------------------

const handle_name=(req,res,criteria)=>{
    var name = {};
name['name'] = req.fields.name;
console.log(name);

const client = new MongoClient(mongourl);
client.connect((err)=>{
    assert.equal(null,err);
    console.log("Connected successfully to server(SEARCH)");
    const db = client.db(dbName);

    findDocument(db,name,(docs)=>{
        client.close();
        console.log("Close Connection(SEARCH)");
        res.status(200).render('searchResult',{sname:docs});

    })
})
}

const handle_borough=(req,res,criteria)=>{
    var borough = {};
borough['borough'] = req.fields.borough;
console.log(borough);

const client = new MongoClient(mongourl);
client.connect((err)=>{
    assert.equal(null,err);
    console.log("Connected successfully to server(SEARCH)");
    const db = client.db(dbName);

    findDocument(db,borough,(docs)=>{
        client.close();
        console.log("Close Connection(SEARCH)");
        res.status(200).render('searchResultB',{sborough:docs});

    })
})
}

const handle_cuisine=(req,res,criteria)=>{
    var cuisine = {};
cuisine['cuisine'] = req.fields.cuisine;
console.log(cuisine);

const client = new MongoClient(mongourl);
client.connect((err)=>{
    assert.equal(null,err);
    console.log("Connected successfully to server(SEARCH)");
    const db = client.db(dbName);

    findDocument(db,cuisine,(docs)=>{
        client.close();
        console.log("Close Connection(SEARCH)");
        res.status(200).render('searchResultC',{scuisine:docs});

    })
})
}
//-------------------------------------EDIT-----------------------------------------------------------------------

const editDocument=(db,DOCID,editDoc,callback)=>{
    
    console.log(DOCID);
   
    db.collection('restaurants').findOneAndUpdate(DOCID,
        {
            $set:editDoc
        },(err,results)=>{
            assert.equal(err,null);
            console.log(`EDITED!!!`);
            callback(results);
        })

}

  const handle_Edit=(req,res,criteria)=>{
   
    

    var editDoc    = {};
    var address    =
    {
        "street"  :req.fields.street,
        "building":req.fields.building,
        "zipcode" :req.fields.zipcode,
        "coord"   :{"gpslon":req.fields.gpslon,"gpslat":req.fields.gpslat}
    };

    editDoc['name']                =req.fields.name;
    editDoc['borough']             =req.fields.borough;
    editDoc['cuisine']             =req.fields.cuisine;
   
    editDoc["address"]             =address;

    const client= new MongoClient(mongourl);
    if(req.files.filetoupload.size>0){
    fs.readFile(req.files.filetoupload.path,(err,data)=>{
        editDoc['photo']=new Buffer.from(data).toString('base64');
        client.connect((err)=>{
            assert.equal(null,err);
            console.log('Connect successfully to server(EDIT)');
            const db = client.db(dbName);
            editDocument(db,OBJID,editDoc,(results)=>{
                res.status(200).render('info', {message: `Edited 1 document`})
                client.close();
                console.log("Client closed(EDIT)");
            });
        });

    });}
    else{
    client.connect((err)=>{
        assert.equal(null,err);
        console.log('Connect successfully to server(EDIT)');
        const db = client.db(dbName);
        editDocument(db,OBJID,editDoc,(results)=>{
            res.status(200).render('info', {message: `Edited 1 document`})
            client.close();
            console.log("Client closed(EDIT)");
        });
    });}
  }


//-------------------------------------DELETE-----------------------------------------------------------

deleteDocument=(db,criteria,callback)=>{
db.collection('restaurants').deleteOne(criteria,
    (err,results)=>{
        assert.equal(err,null);
        console.log(results);
        callback();

       }
    );

};



const handle_Delete=(res,criteria)=>{

    let DOCID        = {};
    DOCID['_id']     = ObjectID(criteria._id);

    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null,err);
        console.log('Connect successfully to server(DELETE)');
        const db = client.db(dbName);
        if(owner==username){        
        deleteDocument(db,DOCID,()=>{

            client.close();
            console.log("Close connection (DELETE)");

            res.status(200).render('info', {message: `Delete 1 document`})
        });}
        else
        res.status(200).render('info', {message: `You are not allow to do this!!!!`});

    });
}


//-------------------------------------LOGIN SESSION------------------------------------------------------

app.get('/',(req,res)=>{
    console.log(req.session );
    if(!req.session.authenticated){
        res.redirect('/login');
    }
    else
    {
        res.redirect('/main');
    }
});

app.get('/login',(req,res)=>{

    res.status(200).render('login',{});

});

app.post('/login',(req,res)=>{
   for (var i=0; i<users.length;i++){
    if(users[i].name == req.fields.name && 
       users[i].password == req.fields.password){
           req.session.authenticated = true;
           req.session.username      = users[i].name;
           username=req.session.username;
       }
   }
    res.redirect('/');
});
//-----------------------------------------------------------------------------------------

app.get('/main',(req,res)=>{
    if(req.session.authenticated  ==true)
    handle_Find(res,req.query.docs);
    else
    res.status(200).render(`notLogin`,{});
})

app.get('/search',(req,res)=>{
    res.status(200).render(`search`,{});
  
 });

 app.post('/search_name',(req,res)=>{
    handle_name(req,res,req.query);

 });

 app.post('/search_borough',(req,res)=>{
    handle_borough(req,res,req.query);

 });
 
 app.post('/search_cuisine',(req,res)=>{
    handle_cuisine(req,res,req.query);

 }); 

app.get('/details',(req,res)=>{
    handle_Details(res,req.query);
    
})


app.get('/insert',(req,res)=>{
   res.status(200).render(`insert`,{});
 
});  

app.post('/insert',(req,res)=>{
    handle_Insert(req,res,req.query);
   
});

app.get('/map',(req,res)=>{

    res.render("leaflet.ejs",{lat:req.query.lat,lon:req.query.lon,zoom:req.query.zoom?req.query.zoom:15});
    res.end();
});

app.get('/rate',(req,res)=>{

    res.status(200).render('rate',{});

});

app.post('/rate',(req,res)=>{

    handle_Rate(req,res,req.query);
});

app.get('/edit',(req,res)=>{
if(owner==username)
    res.status(200).render('edit',{restaurants:DOC});
else
res.status(200).render('info', {message: `You are not allow to do this!!!!`});
})

app.post('/update',(req,res)=>{

    handle_Edit(req,res,req.query);
});

app.get('/delete',(req,res)=>{
    handle_Delete(res,req.query);

});
//----------------------------------------------RESTful------------------------------
app.get('/api/restaurant/name/:name',(req,res)=>{
 
        let criteria = {};
        criteria['name']=req.params.name;
        console.log(criteria);
        const client = new MongoClient(mongourl);
        client.connect((err)=>{
            assert.equal(null,err);
            console.log('Connect successfully to server(RESTful)');
            const db = client.db(dbName);

            findDocument(db,criteria,(docs)=>{
                client.close();
                console.log("Close connection(RESTful)");
                res.status(200).json(docs);
            });
        });
    
})

app.get('/api/restaurant/borough/:borough',(req,res)=>{
 
    let criteria = {};
    criteria['borough']=req.params.borough;
    console.log(criteria);
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null,err);
        console.log('Connect successfully to server(RESTful)');
        const db = client.db(dbName);

        findDocument(db,criteria,(docs)=>{
            client.close();
            console.log("Close connection(RESTful)");
            res.status(200).json(docs);
        });
    });

})

app.get('/api/restaurant/cuisine/:cuisine',(req,res)=>{
 
    let criteria = {};
    criteria['cuisine']=req.params.cuisine;
    console.log(criteria);
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null,err);
        console.log('Connect successfully to server(RESTful)');
        const db = client.db(dbName);

        findDocument(db,criteria,(docs)=>{
            client.close();
            console.log("Close connection(RESTful)");
            res.status(200).json(docs);
        });
    });

})

app.listen(app.listen(process.env.PORT||8099));
