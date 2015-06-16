var cp = require('child_process')

var result = cp.execSync('svn update svn',{encoding:'utf8'})

console.log(result.split("\n"))