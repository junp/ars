var Client = require('svn-spawn')

var client = new Client()

client.cmd(['export', 'http://code.taobao.org/svn/xmlshop/index.js'], function(err, data){
	console.dir(err)
})
