var	expressSanitizer 	=		require("express-sanitizer"),
	methodOverride 		= 		require("method-override"),
	bodyParser 			=	 	require("body-parser"),
	mongoose 			= 		require("mongoose"),
	express 			= 		require("express"),
	app 				=		express();

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

//  ========================== RESTFUL ROUTES ==========================

app.get('/', function(req,res){
	res.redirect("/blogs")
})

app.get("/blogs", function(req,res){
	Blog.find({}, function(err, posts){
		if (err) {
			console.log("ERROR!");
		} else {
			res.render("index", {posts: posts});
		}
	});
});
// NEW ROUTE
app.get("/blogs/new", function(req,res){
	res.render("new");
})
// CREATE ROUTE
app.post("/blogs", function(req,res){
	req.body.content = req.sanitize(req.body.content);
	var data = {
		title: req.body.title,
		image:  req.body.image,
		body: req.body.content
	};
	Blog.create(data, function(err, newPost){
		if (err) {
			res.render("new");
		} else {
			console.log(newPost);
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
	
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
	req.body.newContent = req.sanitize(req.body.newContent);
	var newData = {
		title: req.body.newTitle,
		image:  req.body.newImage,
		body: req.body.newContent
	};
	Blog.findByIdAndUpdate(req.params.id, newData, function(err, updated){
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/"+req.params.id);
		}
	})
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
})


app.listen(8000, process.env.IP, function(){
	console.log("Server is running!")
});
