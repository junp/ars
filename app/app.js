var express = require('express')
var exphbs = require('express-handlebars')
var svn = require('./routes/svn')

var app = express()

app.use(express.static('public'))
app.use('/svn', svn)
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res){
	res.render('home')
})


app.listen(3000, function(){
	console.log('app runging')
})
