/**
 * 借据详情
 */
define(function(require, exports, module){
	var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl

	// 渲染页面
	var render = function(){
		var tpl = $('#recordTpl').html()

		// sessionStroage数据
		var ret =cashLoanLib.cache.get('repay_ret')
 		//ret = "{'contractVer':'1_0','beginDate':'2015/02/15','expireDate':'2015/03/26','firstBillDate':'2015/03/26','loanAmt':'40000.00','loanTime':'2014/10/09','interestRate':'0.05%','currState':'2','remainFee':'34000.00','repayDate':'09','repayType':'按月还本付息','termTimes':'20','bankInfo':'招商银行(4332)','loanFrom':'微众银行','useFor':'日常消费','myName':'XXX','myId':'4525**************','myMobile':'1892******0'}"
		if(!ret) {
            mqq.ui.popBack()
        }
       
        ret = ret.replace(/\'/g, '"')
        var record = JSON.parse(ret)

        var html = template(tpl, {
            record: record
        })

        $('#my_record').append(html)

        $('.container').css({'visibility':'visible'})
	}

	var bindEvent = function(){
		$('#btnView').on('click', function(){
			var version = $(this).data('version')
			if(version){
				cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_qry_contract.cgi?contract_ver='+version, {style:1,target:1})
			}
			return false
		})
	}
	
	
	exports.init = function(){

		render()

		bindEvent()

		FastClick.attach(document.body)
		
		timeStepMark[2] = new Date().getTime() - timeStepMark[0]

		;(new cashLoanLib.SpeedRPT()).speedSend({rptid : 3, sTimes : [timeStepMark[1], timeStepMark[2]], extraData: ['debt_info']})
	
		setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/debt_info.html')}, 1000)
	};
});