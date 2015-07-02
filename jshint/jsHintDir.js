var fs = require('fs')
var cp = require('child_process')
var path = require('path')
var Q = require('q')
var readdirp = require('readdirp')
var jshint = require('jshint').JSHINT
var handlebars = require('handlebars')
var NTof = require('ntof')

// 等检测文件列表
var fileList = []

// 错误列表
var jshintErrors = []

var getFileList = function(dir){
	var deferred = Q.defer()

	readdirp({root: path.join(__dirname, dir), fileFilter:function(entry){
						return entry.name.substr(-3) === '.js' && entry.name !== 'qqapi.custom_1.0.js'
					}})
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

	var options = JSON.parse(fs.readFileSync(path.join(__dirname, '.jshintrc'), 'utf8'))
	var predef = options.globals
	delete options.globals
	list.forEach(function(el, idx){
		var source = fs.readFileSync(el.fullPath, 'utf8')
		jshint(source, options, predef)
		var data = jshint.data()
		jshintErrors.push({file: el.path,options: data.options,globals: data.globals,unused: data.unused, errors: jshint.errors})
	})

	deferred.resolve()

	return deferred.promise
}

var generateReport = function(jshintErrors){
	var tpl = fs.readFileSync(path.join(__dirname, 'template/report.html'), 'utf8')
	var template = handlebars.compile(tpl)

	var html = template({reports:jshintErrors})

	var ntof = new NTof('fac82ac77d6d449bb6fb27b6a4a593b2')
	//console.log(ntof.mail)
	//ntof.mail({to:'junpzheng,ronnyliang,runchangwen',cc:'junpzheng',from:'CaiBei',title:'jshint report','content':html, callback: function(ret){console.log(ret)}})
	console.log(html)
	//console.log(jshintErrors[0])
}

//cp.execSync('svn export --force http://tc-svn.tencent.com/pay/pay_caibei_rep/qpay_app_proj/branches/weloan/701_wx/mqq-imgcache.gtimg.cn/htdocs/js/app/cashloan/v2/ '+path.join(__dirname,'testCode'), {encoding: 'utf8'})

var promise = getFileList('testCode')
promise.then(function(){
	jshintFiles(fileList)
})
.then(function(){
	generateReport(jshintErrors)
})

handlebars.registerHelper('substr', function(str, len){
	return str.substr(0, len || 100)
})
handlebars.registerHelper('pass', function(errors, unused, tips){
	if(errors && errors.length === 0 && typeof unused ==='undefined'){
		return tips || 'pass'
	}
	return '';
})
