var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mongodbURL = 'mongodb://wonghotnig123.cloudapp.net:27017/local';
var mongoose = require('mongoose');


//create
app.post('/',function(req,res) {
		//console.log(req.body);

	
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var rObj = {};
		if(req.body.building == null||req.body.street == null||req.body.zipcode == null||req.body.lon == null||req.body.lat == null||req.body.borough == null||req.body.cuisine == null||req.body.name == null||req.body.restaurant_id == null){
		   res.status(500).json(err);
		   throw err
		}
		rObj.address = {};
		rObj.address.building = req.body.building;
		rObj.address.street = req.body.street;
		rObj.address.zipcode = req.body.zipcode;
		rObj.address.coord = [];
		rObj.address.coord.push(req.body.lon);
		rObj.address.coord.push(req.body.lat);
		rObj.borough = req.body.borough;
		rObj.cuisine = req.body.cuisine;
		rObj.name = req.body.name;
		rObj.restaurant_id = req.body.restaurant_id;
    
    var Restaurant = mongoose.model('Restaurant', restaurantSchema);
    var r = new Restaurant(rObj);
		//console.log(r);
		r.save(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		//console.log('Restaurant created!')
       		db.close();
			res.status(200).json({message: 'insert done', id: r._id});
    	});
    });
});

app.delete('/restaurant_id/:id',function(req,res) {
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find({restaurant_id: req.params.id}).remove(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		//console.log('Restaurant removed!')
       		db.close();
			res.status(200).json({message: 'delete done', id: req.params.id});
    	});
    });
});

app.delete('/:attrib/:attrib_value',function(req,res) {
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		var criteria = {};
		criteria[req.params.attrib] = req.params.attrib_value;
		Restaurant.find(criteria).remove(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		//console.log('Restaurant removed!')
       		db.close();
			res.status(200).json({message: 'delete done', id: req.params.attrib_value});
    	});
    });
});

//uppdate normal
app.put('/restaurant_id/:restaurant_id/:attrib/:attrib_value', function(req,res) {
	if(req.params.attrib == "street"|| req.params.attrib == "zipcode" || req.params.attrib == "building" || req.params.attrib == "borough" || req.params.attrib == "cuisine" || req.params.attrib == "name" || req.params.attrib == "restaurant_id"){
		var criteria = {};
		var temp = req.params.attrib;
		if(temp=="street" ||temp=="zipcode" ||temp=="building"){
			temp = "address."+temp;
		}
		criteria[temp] = req.params.attrib_value;

		//show log in server side
		console.log(criteria);
	
		var restaurantSchema = require('./models/restaurant');
		mongoose.connect(mongodbURL);
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function (callback) {
			var restaurant = mongoose.model('restaurant', restaurantSchema);
			restaurant.update({restaurant_id:req.params.restaurant_id},{$set:criteria},function(err){
				if (err) {
					res.status(500).json(err);
				}
				else {
					res.status(200).json({message: 'update done'});
					db.close();
				}
			});
		});
	}else if(req.params.attrib == "lat" || req.params.attrib == "lon"){
		var restaurantSchema = require('./models/restaurant');
		mongoose.connect(mongodbURL);
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function (callback) {
			var restaurant = mongoose.model('restaurant', restaurantSchema);
			restaurant.findOne({restaurant_id: req.params.restaurant_id}, function(err,result) {
				if (err) return console.error(err);
					console.log(result);
				if(req.params.attrib == "lat"){
					result.address.coord.pop();
					result.address.coord.push(req.params.attrib_value);
				}else if (req.params.attrib == "lon"){
					var lat = result.address.coord.pop();
					result.address.coord.pop();
					result.address.coord.push(req.params.attrib_value);
					result.address.coord.push(lat);
				}
				result.save(function(err) {
					if (err) {
						res.status(500).json(err);
					}
					else {
						res.status(200).json({message: 'update done'});
						db.close();
					}
				});
			});
		});
	}else{
		res.status(200).json({message: 'No matching attribute'});
	}
});



//update to add grade
app.put('/restaurant_id/:restaurant_id/grade', function(req,res) {
	var criteria = {};
	var removeGrade = false;
	if(req.body.remove =="true"){
		console.log("remove");
		removeGrade = true;
	}
	var output = "{message: 'update done'}";
	criteria["date"] = req.body.date;
	criteria["grade"] = req.body.grade;
	criteria["score"] = req.body.score;

	console.log(criteria);
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		

		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.findOne({restaurant_id:req.params.restaurant_id},function(err, r){
			console.log(r);
			var existing = false;
			for (var i=0;i<r.grades.length;i++) {
				if(criteria["date"] == r.grades[i].date && criteria["grade"] == r.grades[i].grade && criteria["score"] == r.grades[i].score){
					if(removeGrade == true) {
						r.grades = r.grades.splice(i,1);
						output = "{message: 'update done. The grade already removed'}";
					}else{
						output = "{message: 'update done but this grade alrealy exist'}";
					}
					existing = true;
				}
			}
			if (existing == false)
				r.grades.push(criteria);
			
			r.save(function(err){
				if (err) {
					res.status(500).json(err);
				}
				else {
					res.status(200).json(output);
					db.close();
				}
			});
		});
	});
});

//display by attribute
app.get('/:attrib/:attrib_value', function(req,res) {
	if(req.params.attrib == "street"|| req.params.attrib == "zipcode" || req.params.attrib == "building" || req.params.attrib == "borough" || req.params.attrib == "cuisine" || req.params.attrib == "name" || req.params.attrib == "restaurant_id" || req.params.attrib == "grade" || req.params.attrib == "date" || req.params.attrib == "score") {
		var criteria = {};
		var temp = req.params.attrib;
		if(temp=="street" ||temp=="zipcode" ||temp=="building"){
			temp = "address."+temp;
		}
		if(temp == "grade" || temp == "date" || temp == "score") {
			temp = "grades."+temp;
		}
		criteria[temp] = req.params.attrib_value;

		//show log in server side
		console.log(criteria);

		var restaurantSchema = require('./models/restaurant');
		mongoose.connect(mongodbURL);
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function (callback) {
			var restaurant = mongoose.model('restaurant', restaurantSchema);
			restaurant.find(criteria,function(err,results){
				if (err) {
					res.status(500).json(err);
				}
				else {
					db.close();
					console.log('Found: ',results.length);
					if(results.length == 0){
						res.status(200).json({message: 'No matching document'});
					}else{
						res.status(200).json(results);
					}
				}
			});
		});
	}else{
		res.status(200).json({message: 'No matching attribute'});
	}
});


//display all
app.get('/', function(req,res) {
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(mongodbURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('restaurant', restaurantSchema);
		restaurant.find({},function(err,results){
			if (err) {
				res.status(500).json(err);
			}
			else {
				db.close();
				console.log('Found: ',results.length);
				if(results.length == 0){
					res.status(200).json({message: 'No matching document'});
				}else{
					res.status(200).json(results);
				}
			}
		});
	});
});

app.listen(process.env.PORT || 8099);