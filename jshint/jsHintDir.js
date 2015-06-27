var fs = require('fs')
var Q = require('q')
var readdirp = require('readdirp')
var jshint = require('jshint').JSHINT
var handlebars = require('handlebars')

// 等检测文件列表
var fileList = []

// 错误列表
var jshintErrors = []

var getFileList = function(path){
	var deferred = Q.defer()

	readdirp({root: path, fileFileter:'*.js'})
	       .on('data', function(entry){
			fileList.push({path: entry.path, fullPath: entry.fullPath})
		})
		.on('end', function(){
			deferred.resolve()
		})
	
	return deferred.promise
}

var jshintFiles = function(list){
	var deferred = Q.defer()

	list.forEach(function(el, idx){
		jshint(fs.readFileSync(el.fullPath, 'utf8'))
		jshintErrors.push({file: el.path, error: jshint.errors})
	})

	deferred.resolve()

	return deferred.promise
}

var generateReport = function(reports){
	var tpl = fs.readFileSync('template/report.html', 'utf8')
	var template = handlebars.compile(tpl)
	var html = template({reports: reports})
	console.log(html)
}

var promise = getFileList('testCode')
promise.then(function(){
	jshintFiles(fileList)
})
.then(function(){
	generateReport(jshintErrors)
	console.log(jshintErrors[0].error)
})


