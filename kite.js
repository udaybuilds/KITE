var express=require('express');
const Nexmo = require('nexmo');
var app=express();
var http=require('http');
var socket=require('socket.io');
var fs = require('fs');
var path = require('path');
var mongo=require('mongodb').MongoClient;
var assert= require('assert');
var server=http.createServer(app);
var url="mongodb://localhost:27017/test";
var io=socket(server);
app.use(express.static(path.join(__dirname,'public')),function(req,res,next){
	console.log(req.url);
	next();
});
app.get('/',function(req,res){
		res.sendFile(__dirname + '/front.html');
	  
});
app.get('/signup.html',function(req,res){
		res.sendFile(__dirname + '/signup.html');
});
app.get('/cred.html',function(req,res){
		res.sendFile(__dirname + '/cred.html');
});
app.get('/signin.html',function(req,res){
		res.sendFile(__dirname + '/signin.html');
});
app.get('/HOME.html',function(req,res){
		res.sendFile(__dirname + '/HOME.html');
});
io.on("connection",function(socket){
	console.log('A user connected');
	socket.on("verifymob",function(data){
		const nexmo = new Nexmo({
		apiKey: 'c96ca7d2',
		apiSecret: 'WoCemm0UrZKh2Qyr',
		});
	const from = 'Nexmo';
	const to = data.mob;
	const text = "your KITE registration code is "+data.randm;
	nexmo.message.sendSms(from, to, text);
	io.emit("sent");
	socket.on("confirm",function(data2,req,res){
		console.log("reached");
		if(data2==data.randm)
			{
				console.log("user confirmed");
				io.emit("redirect");
			}
		else{
			console.log("User not confirmed");
			io.emit("redirect");
		}
		
	});
	});
	socket.on("ins",function(data){
		console.log("ssss");
	var item={	name:data.name,
		adhaar:data.adhaar,
		add:data.add,
		sex:data.sex,
		states:data.states,
		district:data.district,
		pin:data.pin,
		mail:data.mail,
		dob:data.dob,
		mob:data.mob,
	};
	
		mongo.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");

  dbo.collection("farmers").insertOne(item, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
    console.log("yupps");
    io.emit("proceed");
  });
});
	});
	socket.on("verify",function(data){
		 var item2={ name:data.name,
				   pass:data.pass,
		 };
		mongo.connect(url, function(err, db){
		var dbo =db.db("test");
		var check="false";
		if(dbo.collection("farmers").find( { mob:{$in:[item2.name]}}))
			{check="true";
			}
		console.log(check);
		console.log(item2.name);
		if(check!="false"){var cursor=dbo.collection("farmers").find({mob:item2.name}).toArray(function(err,record){
			if(err) throw err;
			console.log(record[0].dob);
			if(item2.pass==record[0].dob)
			{
				console.log("inkite");
				io.emit("verified");
			}
			else
			{
				io.emit("trya");
			}
			
		});
		}
		else
		{
			io.emit("trya");
		}
		db.close();	
	});

	});
	});
server.listen(3000);