/**
 * 短信验证
 */
define(function(require, exports, module){
	var token = cashLoanLib.getACSRFToken();
	
	var SEND_SMS_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_send_sms.cgi';
	var AUTH_SMS_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_auth_sms.cgi';
	
	function Verification(){
		this.init();
	}
	
	Verification.prototype = {
		initCountSec : 60,
		
		timer : null,
		
		money : '',
		
		isFirst : true,
			
		init : function(){
			this.checkUserBorrowMoney();
			this.getMobileNo();
			this.bindEvent();
		},
		
		checkUserBorrowMoney : function(){
			var money = cashLoanLib.cache.get('borrow_money');
			if(!money || isNaN(money)){
				mqq.ui.showDialog({
					title:'提示',
					text:'请确认借款金额',
					needOkBtn: true,
					needCancelBtn: false
				}, function(data){
					mqq.ui.popBack();
				});
				return;
			}
			this.money = money;
			this.sendVerfiyCode();
		},
		
		bindEvent : function(){
			var self = this;
			$("#resend").on('click', function(){
				if(!$(this).hasClass("resend")){
					self.sendVerfiyCode();
				}
			});
			
			$("#verify_code").on('input', function(){
				var token = $.trim($(this).val());
				if('' == token || !token){
					$("div.msg-form-line").removeClass('show-clear');
				}else{
					$("div.msg-form-line").addClass('show-clear');
				}
				if(String(token).length >= 6){
					var sms_code = String(token).substring(0,6);
					$(this).val(sms_code);
					if(self.checkObjParam({sms_code : sms_code})){
						$('#next_step').removeClass('btn-disable');
					}else{
						$('#next_step').addClass('btn-disable');
					}
				}else{
					$('#next_step').addClass('btn-disable');
				}
			});
			
			$("a.ico-clear").on('click', function(){
				var formContainer = $(this).parent().parent().parent();
				$("#verify_code").val('');
				formContainer.removeClass('show-clear');
			});
			
			$("#next_step").on('click', function(){
				if($(this).hasClass('btn-disable')) return;
				self.authVerfiyCode();
			});
			
			$("#change_mobile").on('click', function(){
				$("div.poplayer").show();
			});
			
			$("#i_know").on('click', function(){
				$("div.poplayer").hide();
			});
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
		
		getMobileNo : function(){
			var mobile = cashLoanLib.cache.get('user_mobile');
			$("#mobile_no").html(mobile || '');
		},
		
		sendVerfiyCode : function(){
			var self = this;
			if(self.isFirst){
				$("a.input-link").addClass("resend").html('重新获取（60）');
				self.isFirst = false;
				self.timer = setInterval(function(){
					self.setMsgBtn();
				},1000);
				return;
			}
			
			loading.show();
			self.handleRequest(9, SEND_SMS_CGI, {session_id : cashLoanLib.cache.get('session_id') || '', g_tk : token, sid : cashLoanLib.getParameter("sid")}, function(data){
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
					case 0 :
						data.session_id && cashLoanLib.cache.set('session_id', data.session_id);
						$("a.input-link").addClass("resend").html('重新获取（60）');
						self.timer = setInterval(function(){
							self.setMsgBtn();
						},1000);
						break;
					case 125910013 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(){
							location.reload();
						}});
						break;
					case 125910024 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
						}});
						break;
					case 125910025:
						cashLoanLib.showDialog({text : data.retmsg || '您获取短信验证码次数过多，请重新发起借款', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
						}});
						break;
					case 125910052 :
						cashLoanLib.showDialog({text : data.retmsg || '您今天获取验证码的次数过多，请明天再来申请。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
						}});
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
		},
		
		setMsgBtn : function(){
			if(this.initCountSec == 0){
				$("a.input-link").removeClass('resend').html("&emsp;重新获取&emsp;");
				this.initCountSec = 60;
				clearInterval(this.timer);
			}else{
				this.initCountSec--;
				$("a.input-link").html("重新获取（" + this.initCountSec + "）");
			}
		},
		
		authVerfiyCode : function(){
			var objParam = {
				sms_code : $.trim($("#verify_code").val()),
				brw_lmt : Number(this.money) * 100,
				session_id : cashLoanLib.cache.get('session_id') || '',
				g_tk : token,
				sid : cashLoanLib.getParameter("sid")
			};
			
			if(!this.checkObjParam(objParam)) return;
			
			var self = this;
			loading.show();
			self.handleRequest(10, AUTH_SMS_CGI, objParam, function(data){
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
					case 0 ://成功
						//跳转到借据确认页cgi
						self.handleSuccssPage(data);
						break;
					case 125910011 :
						cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/anomaly.html');
						break;
					case 125910013 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(){
							location.reload();	
						}});
						break;
					case 125910028 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');	
						}});
						break;
					case 125910046 :
						cashLoanLib.showDialog({text : data.retmsg || '短信验证码错误，请重新输入', callBack : function(){
							$("#verify_code").val('');
						}});
						break;
					case 125910047 :
						cashLoanLib.showDialog({text : data.retmsg || '短信验证码失效，请重新获取', callBack : function(){
							$("#verify_code").val('');
						}});
						break;
					case 125910025:
						cashLoanLib.showDialog({text : data.retmsg || '您获取短信验证码次数过多，请重新发起借款', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
						}});
						break;
					case 125910052 :
						cashLoanLib.showDialog({text : data.retmsg || '您今天获取验证码的次数过多，请明天再来申请。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
						}});
						break;
					case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
						cashLoanLib.notLogin(data);
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
		},
		
		checkObjParam : function(objParam){
			var money = Number(this.money);
			//1、判断是否小于500块
			if(money< 500){
				mqq.ui.showTips({text: "借款金额不低于500.00元"});
				return false;
			}
			
			//借钱金额需为100的整数倍
			if(money % 100 != 0){
				mqq.ui.showTips({text: "借款金额需为100的整数倍"});
				return false;
			}
			
			if(!objParam.sms_code || '' == objParam.sms_code){
				mqq.ui.showTips({text: "请输入短信验证码"});
				return false;
			}
			
			var verifyCodeReg = /^\d{6}$/;
			if(!verifyCodeReg.test(objParam.sms_code)){
				mqq.ui.showTips({text: "请输入正确的验证码"});
				return false;
			}
			
			return true;
		},
		
		handleSuccssPage : function(data){
			var money = data.money && Number(data.money/100).toFixed(2);
			var bankCardId = data.bank_card_id || '';
			var bankName = data.bank_name || '';
			var name = data.name || '';
			var idCardNo = data.id_card_no || '';
			var loanTime = data.getloan_time || '';
			var contractPhone = data.mobile || '';
			var rate = data.interest || '';
			var term = data.term || '';
			var borrowLimit = data.period || '';
			var bill_date = data.bill_date || ''; //还款日 如果用户是首次借款，会返回 0
			var is_first_loan = data.is_first_loan || ''; //是否首次借款，0，非，1是
			var ts = data.ts || ''; //系统时间
			var firstloan_date = data.firstloan_date || '';//用户借款时间
			var contractVer = data.contract_ver || '';	// 合同号
			var borrowInfo = {
				money : money,
				bankCardId : bankCardId,
				bankName : bankName,
				name : name,
				idCardNo : idCardNo,
				loanTime : loanTime,
				contractPhone : contractPhone,
				rate : rate,
				term : term,
				borrowLimit : borrowLimit,
				bill_date : bill_date,
				is_first_loan : is_first_loan,
				ts : ts,
				firstloan_date : firstloan_date,
				contractVer: contractVer
			};
			borrowInfo = JSON.stringify(borrowInfo);
			cashLoanLib.cache.set('borrow_info',borrowInfo);
			cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow/my_due_bill.html');
		}
	};
	
	exports.init = function(){
		//隐藏mqq loading
		mqq.ui.setLoading({visible:false});
		new Verification();
		FastClick.attach(document.body);
		cashLoanLib.onCloseHandler();
		
		timeStepMark[2] = new Date().getTime() - timeStepMark[0];
		(new cashLoanLib.SpeedRPT()).speedSend({rptid : 5, sTimes : [timeStepMark[1], timeStepMark[2]]});
	
		setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/verification.html');}, 1000);
	};
});
