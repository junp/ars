/**
 * 首页js
 */
define(function(require, exports, module) {
	var BORROW_MONEY_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_borrow_init.cgi';
	var GET_INTEREST_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_get_interest.cgi';

	// 逾期
	var CONST_PAGE_OVERDUE = 'over_due';

	// 正常
	var CONST_PAGE_INDEX = 'index_loan';

	// 异常
	var CONST_PAGE_ANOMALY = 'anomaly';
	
	var commons = {

		// 还款详情入口
		repayEntry: function(){
			// 还款详情
			if("1" === index_loan_info.need_repay){
				// 
				if(index_loan_info.acrupay){
					cashLoanLib.cache.set("acrupay", index_loan_info.acrupay);
				}
				else{
					cashLoanLib.cache.remove("acrupay");
				}

				$('#btnRepayDetail').parent().on('click', function(){

					if(curr_repay.bank_name){
						cashLoanLib.cache.set('curr_repay',JSON.stringify(curr_repay));
						cashLoanLib.openPage('/cashloan/v2/repay/repay_detail.html');
					}
					else{
						// TODO
						cashLoanLib.showDialog({text : '系统繁忙，请稍后再试。'});
					}

					return false;
				});
			}
		}
	};
	
	//获取利息
	var InterestInfo = {
		init : function(){
			this.bindEvent();
		},
		
		bindEvent : function(){
			var self = this;
			//借款须知
			$(".must_know").on('click', function(){
				self.getInterest();
			});
			
			//知道了，关闭
			$("#i_know").on('click', function(){
				$("#must_know_container").hide();
			});
		},
		
		getInterest : function(){
			$("#must_know_container").show();
			
			var interestObj = $("#interest");
			var perDayInterestObj = $("#per_day_interest");
			
			var self = this;
			loading.show();
			$.ajax({
				url: GET_INTEREST_CGI,
				data: {g_tk : cashLoanLib.getACSRFToken()},
				type: 'POST',
				dataType: 'json',
				timeout: cashLoanLib.gTimeout,
				success: function(data){
					loading.hide();
					if("0" == data.retcode){
						var sInterest = data.interest;
						var interest = self.getCurrentRate(sInterest);
						if(interest){
							interestObj.html(Number(interest) * 100 || '-');
							var perDayNum = self.mul(10000, Number(interest)).toFixed(2);
							perDayInterestObj.html(String(perDayNum).replace('.00', ''));
						}else{
							self.defaultInterestShow();
						}
					}else{
						//日利率最高0.05%（一万元每天5元利息）
						self.defaultInterestShow();
					}
				},
				error: function(data, type){
					loading.hide();
					//日利率最高0.05%（一万元每天5元利息）
					self.defaultInterestShow();
				}
			});
		},
		
		defaultInterestShow : function(){
			var interestObj = $("#interest");
			var perDayInterestObj = $("#per_day_interest");
			interestObj.html('0.05');
			perDayInterestObj.html('5');
		},
		
		getCurrentRate : function(sInterest) {
			if(!sInterest || sInterest.split(";").length != 3){
				return "";
			}
			
			var aInterest = sInterest.split(";");
			var result = "";
			for (var index = 0, len = aInterest.length; index < len; index++) {
				var interestInfo = aInterest[index].split(":");
				if (2 == interestInfo.length && interestInfo[0] == 5) {
					result = interestInfo[1];
					break;
				}
			}

			return result;
		},
		
		mul : function(arg1, arg2) {
			var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
			try {
				m += s1.split(".")[1].length;
			} catch (e) {
			}
			try {
				m += s2.split(".")[1].length;
			} catch (e) {
			}
			return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
		}	
	};

	/*
	* 状态路由
	* 1、IndexLoan（可借钱）
	* 2、OverDue（逾期）
	**/
	function PageRoute(){
		this.pageType = g_page_type;
		this.route();
		this.bindEvent();
		this.setActionButton();
		//删除金额选择
		cashLoanLib.cache.remove('borrow_money');
		cashLoanLib.yellowTips('tips_weloan_index');
	}
	
	PageRoute.prototype = {
		route : function(){
			timeStepMark[2] = new Date().getTime() - timeStepMark[0];

			var attach =  cashLoanLib.getParameter("attach");
			var page = attach.replace(/\./g, '_');

			// 逾期状态
			if(CONST_PAGE_OVERDUE == this.pageType){

				new OverDue();
				
				(new cashLoanLib.SpeedRPT()).speedSend({
					rptid : 1,
					sTimes : [timeStepMark[1], timeStepMark[2]],
					extraData : [this.pageType]
				});

				setTimeout(function() {
					cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/over_due'+page+'.html');
				}, 1000);
			}
			// 正常
			else if(CONST_PAGE_INDEX == this.pageType){

				new IndexLoan();
				
				(new cashLoanLib.SpeedRPT()).speedSend({
					rptid : 1,
					sTimes : [timeStepMark[1], timeStepMark[2]],
					extraData : [this.pageType]
				});

				setTimeout(function() {
					cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/index_loan'+page+'.html');
				}, 1000);
			}
			// 异常
			else if(CONST_PAGE_ANOMALY == this.pageType){

				new Anomaly();
				
				(new cashLoanLib.SpeedRPT()).speedSend({
					rptid : 1,
					sTimes : [timeStepMark[1], timeStepMark[2]],
					extraData : [this.pageType]
				});

				setTimeout(function() {
					cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/index_anomaly'+page+'.html');
				}, 1000);
			}
		},
	
		setActionButton : function() {
			mqq.ui.setTitleButtons({
				right : {
					title : "借还记录",
					callback : function() {
						bubbleTips.remove();
						location.href = "/cashloan/v2/my_record.html?_bid=" + cashLoanLib.bid;
					}
				}
			});
		},

		
		bindEvent : function(){
			var self = this;
			// 常见问题页面链接
			$("#cjwt").on('click', function(){
				mqq.ui.openUrl({
				    url: "http://kf.qq.com/touch/product/weilidai_platform_app.html?_wv=2097155",
				    target: 1
				});
				return false;
			});
		}
	};
	
	// 个人中心首页
	function IndexLoan(data) {
		this.data = data || {};
		this.riskInfo = null;
		this.init();
	}

	IndexLoan.prototype = {
		init : function() {
			this.getRiskInfo();
			this.bindEvent();
			// 气泡初始化
			bubbleTips.init();
		},
		
		getRiskInfo : function(){

			var self = this;

			mqq.device.getDeviceInfo(function(data){
				self.riskInfo = data;
			});
		},


		bindEvent : function() {

			var self = this;
			
			// 借钱
			$("#borrow_money").parent().on("click", function() {
				

				if("L" == index_loan_info.lockcode){
					cashLoanLib.showDialog({text : '您有一笔借款还在等待银行电话确认，暂时无法继续借款。'});
					return false;
				}
				
				if("N" == index_loan_info.lockcode){
					cashLoanLib.openPage('/cashloan/v2/anomaly.html');
					return false;
				}
				
				// 额度管控
				if("N" === index_loan_info.loan_allow){
					cashLoanLib.showDialog({text : '微粒贷今日提供的额度已经用完，请您明天再来借款。'});
					return false;
				}
				
				// parseInt('0.00')
				if(0 === parseInt(index_loan_info.available_otb)){
					return false;
				}
				
				cashLoanLib.openPage(self.getBorrowMoneyUrl());

				return false;
			});

			// 还款详情
			if("1" === index_loan_info.need_repay){

				commons.repayEntry();

			}
			//标志是否开启 #openToast
			var opent = cashLoanLib.cache.get("opentoast");
			if(opent){ //未正常关闭，比如从其他页面返回
				$('#openToast').addClass('hide').hide();
				cashLoanLib.cache.set("opentoast", 2);
			}else{ //首次进来
				cashLoanLib.cache.set("opentoast", 1);
				//10秒后关闭额度提示
				setTimeout(function(){
					//正常关闭   opentoast = 2
					cashLoanLib.cache.set("opentoast", 2);
					$('#openToast').addClass('hide').hide();
				}, 1000 * 10);
			}
		},

		getBorrowMoneyUrl : function() {
			var url = [BORROW_MONEY_CGI, '?available_otb=', index_loan_info.available_otb, '&credit_otb=',
					index_loan_info.credit_otb, '&sign=', index_loan_info.sign, '&ts=', index_loan_info.ts,
					'&firstloan_date=', index_loan_info.firstloan_date,
					'&pmt_date=', index_loan_info.pmt_date, '&sid=', cashLoanLib.getParameter("sid")];
			var result = url.join("");
			//imei & mobile_info
			if(this.riskInfo && this.riskInfo.identifier){
				result += '&imei=' + this.riskInfo.identifier;
				var mobile_info1 = 'h_location=~h_model='+(this.riskInfo.model||'')+'~h_edition='+(this.riskInfo.modelVersion||'')+'~h_exten=h5~h_lbs=';
				result += "&mobile_info=" + encodeURIComponent(this.riskInfo.identifier + "||" + (this.riskInfo.model||'') + "|" + (this.riskInfo.systemName||'') + "||||" + mobile_info1);
			}
			return result;
		}
	};
	
	// 逾期
	function OverDue(){
		this.init();
	}
	
	OverDue.prototype = {
		init : function(){
			this.bindEvent();
		},
		
		bindEvent : function(){
			$("#over_due").parent().on("click", function() {
				if(overdue_repay.acrupay){
					cashLoanLib.cache.set("acrupay", overdue_repay.acrupay);
				}
				cashLoanLib.openPage('/cashloan/v2/repay/repay_list_overdue.html');
				return false;
			});
		}
	};

	// 账户异常
	function Anomaly(){
		this.init();
	};
	Anomaly.prototype = {
		init: function(){
			this.bindEvent();
		},
		bindEvent: function(){
			
			// 还款详情
			if("1" === index_loan_info.need_repay){

				commons.repayEntry();

			}
		}	
	};

	// 气泡
	var bubbleTips = {
		getKey: function(){
			if(typeof index_loan_info === 'undefined'){
				return '';
			}
			var uin = index_loan_info.uin;
			if(uin){
				return 'w_new_loan_' + uin;
			}
			return '';
		},
		init: function(){
			var self = this;
			var key = this.getKey();
			
			// key不存在，返回
			if(!key){
				return;
			}

			var val = cashLoanLib.storage.get(key);

			// 值不存在，返回
			if(!val){
				this.remove();
				return;
			}
			
			// 借款记录时间
			var date = new Date(parseInt(val) * 1000);

			// 服务器当前时间
			var now = new Date(parseInt(index_loan_info.ts) * 1000);

			// 是否同年同月同日
			if(date.getDate() === now.getDate() 
				&& date.getMonth() === now.getMonth() 
				&& date.getFullYear() === now.getFullYear()){
				
				var $el = $('#mgsTips');

				$el.removeClass('hide');

				$el.on('click', function(){
					// 点击，清除
					self.remove();
					$el.addClass('hide');
					location.href = "/cashloan/v2/my_record.html?_bid=" + cashLoanLib.bid;
				});
				
			}
			// 非当天，清除
			else{
				this.remove();
			}
		},
		remove: function(){
			var key = this.getKey();

			if(key){
				cashLoanLib.storage.remove(key);
			}
			
		}
	};

	exports.init = function() {
		new PageRoute();
		InterestInfo.init();
		FastClick.attach(document.body);
	};
	
	mqq.ui.setOnCloseHandler(function() {
		mqq.ui.popBack();
	});
});