var cp = require('child_process')

var result = cp.execSync('svn export --force ' . $resp . ' svn', {encoding: 'utf8'})

return result.replace(/A\s+/g, '').split('\r\n')
