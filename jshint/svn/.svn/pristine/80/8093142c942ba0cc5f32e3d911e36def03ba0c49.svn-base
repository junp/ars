/**
 * 借款结果页
 */
define(function(require, exports, module){
	var moment = require('../../../../lib/sea-modules/moment/moment').moment;
	
	function ResultHandle(){
		this.init();
	}
	
	ResultHandle.prototype = {
		init : function(){
			this.bindEvent();
			this.route();
			this.type = "borrow_success";
			
			//清除session信息
			cashLoanLib.cache.remove('session_id');
			cashLoanLib.cache.remove('user_mobile');
			cashLoanLib.cache.remove('borrow_info');
			cashLoanLib.cache.remove('borrow_money');
		},
		
		route : function(){
			var url = location.href;
			if(url.indexOf("borrow_success")!=-1){
				new BorrowSuccess();
				this.type = "borrow_success";
			}else if(url.indexOf("borrow_wait")!=-1){
				new BorrowWait();
				this.type = "borrow_wait";
			}else if(url.indexOf("borrow_fail")!=-1){
				new BorrowFail();
				this.type = "borrow_fail";
			}else if(url.indexOf("borrow_tel_check")!=-1){
				new BorrowTelCheck();
				this.type = "borrow_tel_check";
			}
			
			var self = this;
			timeStepMark[2] = new Date().getTime() - timeStepMark[0];
			(new cashLoanLib.SpeedRPT()).speedSend({rptid : 7, sTimes : [timeStepMark[1], timeStepMark[2]], extraData : [self.type]});
			
			//上报pv uv
			setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/' + self.type+ '.html');}, 1000);
			
		},
		
		bindEvent : function(){
			$("a.btn-blue").on('click', function(){
				cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi');
			});
		}
	};
	
	function BorrowSuccess(){
		this.fillPage();
	}
	
	BorrowSuccess.prototype = {
		fillPage : function(){
			var resultInfo = this.getData();
			if('' == resultInfo) return;
			
			var money = resultInfo.money || '';
			var bankCardId = resultInfo.bankCardId || '';
			var bankName = resultInfo.bankName || '';
			$("#money").html(money&&[Number(Number(money)/100).toFixed(2),"元"].join(""));
			
			if(bankName && bankCardId){
				$("#bank_info").html([bankName, '(', '尾号',bankCardId,')'].join(""));
			}
			
			if(resultInfo.repayTime){
				var repayMoment = moment(resultInfo.repayTime, "YYYYMMDD");
				var day = repayMoment.format('DD');
				var month = repayMoment.format('MM');
				$("#repay_time").html(['<u>', month, '月', day, '日', '</u>'].join(''));
			}
			
			cashLoanLib.cache.remove('result_info');
		},
		
		getData: function(){
			var resultInfo = cashLoanLib.cache.get('result_info');
			if(!resultInfo){
				return '';
			}
			try{
				resultInfo = JSON.parse(resultInfo);
			}catch(e){
				return '';
			}
			
			return resultInfo;
		}
	};
	
	function BorrowWait(){
	}
	
	BorrowWait.prototype = {
		
	};
	
	function BorrowFail(){
		this.init();
	}	
		
	
	BorrowFail.prototype = {
		init : function (){
			var code = cashLoanLib.getParameter("code");
			if('125621111' == code){
				$("#borrow_fail_msg").html('<p>借款审核未通过</p><p>人行征信报告未通过微众银行审批</p>');
			}
			else if('125621112' == code){
				$("#borrow_fail_msg").html('<p>微粒贷今日提供的额度已经用完</p><p>请明天再来借款</p>');
			}else{
				$("#borrow_fail_msg").html('申请出现问题，您的借款未能成功');
			}
		}
	};
	
	function BorrowTelCheck(){
	}
	
	BorrowTelCheck.prototype = {
		init : function(){
		},
		
		fillPage : function(){
			var resultInfo = this.getData();
			var money = resultInfo.money || '';
			$("#money").html(money&&[Number(Number(money)/100).toFixed(2),"元"].join(""));
			
			var bankCardId = resultInfo.bankCardId || '';
			var bankName = borrowInfo.bankName || '';
			
			if(bankName && bankCardId){
				$("#bank_info").html(['',bankName,'尾号',bankCardId,''].join(""));
			}
			
			//删除数据
			cashLoanLib.cache.remove('result_info');
		},
		
		getData: function(){
			var resultInfo = cashLoanLib.cache.get('result_info');
			if(!resultInfo){
				return '';
			}
			try{
				resultInfo = JSON.parse(resultInfo);
			}catch(e){
				return '';
			}
			
			return resultInfo;
		}
	};
	
	exports.init = function(){
		//隐藏mqq loading
		mqq.ui.setLoading({visible:false});
		//关闭之前的webview
		new ResultHandle();
		FastClick.attach(document.body);
		
		mqq.ui.setOnCloseHandler(function(){
			cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi');
		});
	};
	
});