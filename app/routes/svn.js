var express = require('express')

var router = express.Router()

router.get('/get_sub_by_path', function(req, res){
	res.send('get...')
})

module.exports = router
