/**
 * 我的借款信息
 */
define(function(require, exports, module){
	var token = cashLoanLib.getACSRFToken();
	var moment = require('../../../../lib/sea-modules/moment/moment').moment;
	var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl;
	
	var CONFIRM_BORROW_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_brw_confirm.cgi';
	
	function MyDueBill(){
		this.container = $("#due_bill_info");
		this.isFirst = true;
		this.init();
	}
	
	MyDueBill.prototype = {
		tpl : '\
			<div class="info-section title-section">\
				<p class="gray">实际起止时间及还款日以银行系统记录为准</p>\
			</div>\
			<div class="info-section first-section">\
				<div class="flex flex-pack-justify"><span class="gray">借款人姓名</span><span><%=dueBill.name%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">借款金额</span><span><%=dueBill.money%>元</span></div>\
				<div class="flex flex-pack-justify"><span class="gray">收款账户</span><span><%=dueBill.accountInfo%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">日利率</span><span><%=dueBill.rate%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">起止时间</span><span><%=dueBill.start_time%>-<%=dueBill.end_time%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">首次还款日</span><span><%=dueBill.firstRepayDay%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">借款合同</span><span><a class="line-text" id="btnView" data-version="<%=dueBill.contractVer%>" href="javascript:;">查看</a></span></div>\
			</div>\
			<%if(dueBill.isMoreShow){%>\
			<div class="info-section second-section">\
				<div class="flex flex-pack-justify"><span class="gray">借款人身份证</span><span><%=dueBill.idCardNo%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">借款人联系方式</span><span><%=dueBill.contractPhone%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">还款日</span><span>每月<%=dueBill.repayDay%>日</span></div>\
				<div class="flex flex-pack-justify"><span class="gray">借款期限</span><span><%=dueBill.borrowLimit%>期</span></div>\
				<div class="flex flex-pack-justify"><span class="gray">借款用途</span><span>个人日常消费</span></div>\
			</div>\
			<div class="info-section third-section">\
				<div class="flex flex-pack-justify"><span class="gray">还款银行卡</span><span><%=dueBill.accountInfo%></span></div>\
				<div class="flex flex-pack-justify"><span class="gray">贷款发放人</span><span>微众银行</span></div>\
			</div>\
			<%}%>\
			',
		
		init : function(){
			this.show();
			this.bindEvent();
		},
		
		bindEvent : function(){
			var self = this;
			$("div.more-wrap").on("click", function(){
				self.show();
				var spanObj = $("span.more-arrow");
				if(spanObj.hasClass('arrow-up')){
					spanObj.removeClass('arrow-up');
				}else{
					spanObj.addClass('arrow-up');
				}
				return false;
			});
			
			$("#confirm_borrow").on("click", function(){
				self.confirmBorrow();
			});

			// 查看合同
			$(document).on('click', '#btnView', function(){
				var version = $(this).data('version');
				if(version){
					cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_qry_contract.cgi?contract_ver='+version, {style:1,target:1});
				}
				return false;
			})
		},
		
		handleRequest: function(rptid,cgi,data,onSuccess,onError){
            cashLoanLib.loanHttp({
                rptid: rptid,
                url: cgi,
                data: data,
                type: 'POST',
                onSuccess : onSuccess,
                onError : onError
            });
        },
        
        myOnError: function(data, type){
            loading.hide();
           	if(type && "abort" == type){
            	//不处理
            }else if(type && "timeout" == type){
            	cashLoanLib.requestTimeOut();
            }else{
            	cashLoanLib.systemBusy(data);
            }
        },
		
		getData : function(){
			var borrowInfo = cashLoanLib.cache.get('borrow_info');
			if(!borrowInfo){
				return '';
			}
			try{
				borrowInfo = JSON.parse(borrowInfo);
			}catch(e){
				return '';
			}
			
			return borrowInfo;
		},
		
		show : function(){
			var dueBill = {};
			$.extend(dueBill, this.getData());
			if(dueBill.bankName && dueBill.bankCardId){
				dueBill.accountInfo = [dueBill.bankName,'(', dueBill.bankCardId,')'].join("");
			}else{
				dueBill.accountInfo = '';
			}
			if(this.isFirst || $("span.more-arrow").hasClass("arrow-up")){
				dueBill.isMoreShow = false;
			}else{
				dueBill.isMoreShow = true;
			}
			
			//空值处理
			dueBill.name = dueBill.name || '';
			dueBill.idCardNo = dueBill.idCardNo || '';
			dueBill.money = dueBill.money || '';
			dueBill.contractPhone = dueBill.contractPhone || '';
			dueBill.rate = dueBill.rate ? Number(dueBill.rate) * 100 + "%" : "";
			dueBill.borrowLimit = dueBill.borrowLimit || '';
			dueBill.start_time = this.getStartTime(dueBill.ts);
			dueBill.firstRepayDay = this.getFirstRepayDay(dueBill.is_first_loan, dueBill.ts, dueBill.bill_date, dueBill.firstloan_date);
			dueBill.end_time = this.getEndTime(dueBill.firstRepayDay, dueBill.borrowLimit);
			dueBill.repayDay = this.getRepayDay(dueBill.is_first_loan, dueBill.ts, dueBill.bill_date);
			
			var html = template(this.tpl, {dueBill : dueBill});
			this.container.html(html);
			this.isFirst = false;
		},
		
		getStartTime : function(currTime){
			if(!currTime) return '';
			var rtMoment = moment(Number(String(currTime) + "000"));
			return rtMoment.format('YYYY/MM/DD');
		},
		
		getEndTime : function(firstRepayDay, borrowLimit){
			if(!firstRepayDay || !borrowLimit) return '';
			var rtMoment = moment(firstRepayDay, "YYYY/MM/DD");
			return rtMoment.add('months', Number(borrowLimit) -1 ).format('YYYY/MM/DD');
		},
		
		getFirstRepayDay : function(isFirstLoan, currTime, billDate, firstLoanDate){
			if("1" == isFirstLoan){//首次借款
				if(!currTime) return '';
				var rtMoment = moment(Number(String(currTime) + "000"));
				var day = rtMoment.format('DD');
				var month = Number(rtMoment.format('M'));
				var year = Number(rtMoment.format('YYYY'));
				var firstRepayMonth;
				if ("12" == month) {
					firstRepayMonth = "01";
					year = year + 1;
				} else {
					month = Number(month) + 1;
					firstRepayMonth = month < 10 ? ("0" + month) : month;
				}
				if (29 == day || 30 == day || 31 == day) {
					day = 21;
				}
				
				return [year, '/', firstRepayMonth, '/', day].join('');
			}else if("0" == isFirstLoan){//非首次
				if(!currTime || !billDate) return '';
				
				var rtMoment = moment(Number(String(currTime) + "000"));
				var repayMoment = moment(billDate, "YYYYMMDD");
				var day = repayMoment.format('DD');
				var month = rtMoment.format('M');
				var year = Number(rtMoment.format('YYYY'));
				var firstRepayMonth;
				if(this.isCrossMonth(Number(rtMoment.format('D')), Number(repayMoment.format('D')), firstLoanDate)){
					if ("11" == month) {
						firstRepayMonth = "01";
						year = year + 1;
					} else if ("12" == month) {
						firstRepayMonth = "02";
						year = year + 1;
					} else {
						month = Number(month) + 2;
						firstRepayMonth = month < 10 ? ("0" + month) : month;
					}
				}else{
					if ("12" == month) {
						firstRepayMonth = "01";
						year = year + 1;
					} else {
						month = Number(month) + 1;
						firstRepayMonth = month < 10 ? ("0" + month) : month;
					}
				}
				return [year, '/', firstRepayMonth, '/', day].join('');
			}
			return '';
		},
		
		isCrossMonth : function(currentDay, repayDay, firstLoanDate){
			var fLDay = ""; 
			if(firstLoanDate && "0" != firstLoanDate){
				var fLMoment = moment(firstLoanDate, "YYYYMMDD");
				fLDay = fLMoment.format('D');
			}
			
			if('21' == repayDay && -1 != $.inArray(fLDay, ['29','30','31'])){
				if(currentDay == fLDay){
					return false;
				}else{
					return true;
				}
			}else{
				if (currentDay > repayDay) {
					return true;
				}else{
					return false;
				}
			}
		},
		
		getRepayDay : function(isFirstLoan, currTime, billDate){
			if("1" == isFirstLoan){//首次借款
				if(!currTime) return '';
				var rtMoment = moment(Number(String(currTime) + "000"));
				return rtMoment.format('D');
			}else if("0" == isFirstLoan){
				if(!billDate) return '';
				var repayMoment = moment(billDate, "YYYYMMDD");
				return repayMoment.format('D');
			}
			
			return "";
		},
		
		confirmBorrow : function(){
			var self = this;
			loading.show();
			self.handleRequest(11, CONFIRM_BORROW_CGI, {session_id : cashLoanLib.cache.get('session_id') || '', g_tk : token, sid : cashLoanLib.getParameter("sid")}, function(data){
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
					case 0 :
						var result_info ={
							money : data.money || '', 
							bankName : data.bank_name ||'', 
							bankCardId : data.bank_card_id, 
							repayTime : data.pmt_date ||'', 
							telTime : data.ts || ''
						};
						var resultInfo = JSON.stringify(result_info);
						cashLoanLib.cache.set('result_info',resultInfo);
						if("1" ==data.loan_result){//需电核
							cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow/borrow_tel_check.html');
						}else{ //成功
							cashLoanLib.storage.set('w_new_loan_' + data.uin || cashLoanLib.getCookieUin(), data.ts || '');
							cashLoanLib.newLoanRecord.add(data.uin || cashLoanLib.getCookieUin(), {loanId: data.receipt_no || '', ts: data.ts || ''});
							cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow/borrow_success.html');
						}
						break;
					case 125910011 :
						cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/anomaly.html');
						break;
					case 125910012 :
						cashLoanLib.showDialog({text : data.retmsg || '借款金额不能大于当前可借额度'});
						break;
					case 125910028 :
					case 125910029 :
					case 125910040 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');	
						}});
						break;
					case 125910030 :
					case 125910031 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(){
							mqq.ui.popBack();
						}});
						break;
					case 125910032 :
						cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow/borrow_fail.html');
						break;
					case 125910033 :
						cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow/borrow_wait.html');
						break;
					case 125620023 :
						cashLoanLib.showDialog({text : data.retmsg || '您当日的借款次数过多，请明天再试。'});
						break;
					case 125620128:
						cashLoanLib.showDialog({text : data.retmsg || '系统出现问题,无法继续借款'});
						break;
					case 125620122 :
						cashLoanLib.showDialog({text : data.retmsg || '您账户下还未还清的借款过多，无法继续借款。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');	
						}});
						break;
					case 125620123 :
						cashLoanLib.showDialog({text : data.retmsg || '您选择的收款卡不正确，请重新申请借款。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');	
						}});
						break;
					case 125621111 :  //人行不良拒绝借款确认提交拒绝
						cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow/borrow_fail.html?code=125621111');
						break;
					case 125621112 :  //额度管控
						cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow/borrow_fail.html?code=125621112');
						break;
					case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
						cashLoanLib.loginTimeOut(data);
						break;
					case cashLoanLib.CONST_ERR_NOT_WHITE_LIST :
						cashLoanLib.notWhiteList();
						break;
					case cashLoanLib.CONST_ERR_SESSION_QUERY_FAIL :
						cashLoanLib.notLogin(data);
						break;
					case cashLoanLib.CONST_ERR_SESSION_EXPIRE :
						cashLoanLib.notLogin(data);
						break;
					default :
						cashLoanLib.systemBusy(data);
						break;
				}
			}, self.myOnError);
		}
	}
	
	exports.init = function(){
		//隐藏mqq loading
		mqq.ui.setLoading({visible:false});
		new MyDueBill();
		FastClick.attach(document.body);
		cashLoanLib.onCloseHandler();
		
		timeStepMark[2] = new Date().getTime() - timeStepMark[0];
		(new cashLoanLib.SpeedRPT()).speedSend({rptid : 6, sTimes : [timeStepMark[1], timeStepMark[2]]});
	
		setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/my_due_bill.html');}, 1000);
	};
});