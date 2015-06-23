/*var cp = require('child_process')

var result = cp.execSync('svn export --force   svn',{encoding:'utf8'})

console.dir(result.replace(/A\s+/g, '').split('\r\n'))
*/
/*
var readdirp = require('readdirp')
var fs = require('fs')


readdirp({root:'./svn', fileFileter: '*.js'})
	.on('data', function(entry){
		jshint(fs.readFileSync(entry.fullPath,'utf-8'))
		console.log(jshint.errors)
	})


var jshint = require('jshint').JSHINT
var source = [
  'function goo() {'
];
var options = {
  undef: true
};
var predef = {
  foo: false
};

jshint(source)

//console.log(jshint.errors);
*/


var fs = require('fs')
var Q = require('q')
var readdirp = require('readdirp')
var jshint = require('jshint').JSHINT

var fileList = []

var getFileList = function(){
	var deferred = Q.defer()

	readdirp({root:'./svn',fileFileter:'*.js'})
		.on('data', function(entry){
			fileList.push({path: entry.path, fullPath: entry.fullPath})
		})
		.on('end', function(){
			deferred.resolve()	
		})

	return deferred.promise
}

var jshintErrors = []
var getjshintErrors = function(list){
	var deferred = Q.defer()

	list.forEach(function(el, idx){
		jshint(fs.readFileSync(el.fullPath,'utf-8'));
		jshintErrors.push({file: el.path, error: jshint.errors });
	})

	deferred.resolve()

	return deferred.promise
}

var promise = getFileList()

promise.then(function(){
	getjshintErrors(fileList)
})
.then(function(){
	jshintErrors.forEach(function(el, idx){
		console.log(el.error.length)
	})	
})