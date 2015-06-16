/**
 * 员工验证
 */
define(function(require, exports, module){
	var g_tk = cashLoanLib.getACSRFToken();
	
	var AUTH_RTX_CHECK_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_staff_auth.cgi';

	function RtxCheck(){
		this.init();
	}
	
	RtxCheck.prototype = {
		query_sig : '',
		token_query_sig : '',
		init : function(){
			if("0" == rtx_check_obj.retcode){
				this.checkUserBorrowMoney();
				this.bindEvent();
			}else{
				this.handleErrCode();
			}
		},
		
		handleErrCode : function(){
			var ret = Number(rtx_check_obj.retcode);
			switch (ret) {
				case 66222302:
					cashLoanLib.showDialog({text : rtx_check_obj.retmsg || '您是微粒贷的员工版体验用户，请确保已经在qq.oa.com登记QQ号码，以及对应财付通账户是您本人。', callBack : function(){
						mqq.ui.popBack();
					}});
					break;
				case 66222303:
					cashLoanLib.showDialog({text : rtx_check_obj.retmsg || '不支持token验证', callBack : function(){
						mqq.ui.popBack();
					}});
					break;
				case 66222405:
					cashLoanLib.notLogin();
					break;
				case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
					cashLoanLib.loginTimeOut();
					break;
				case cashLoanLib.CONST_ERR_NOT_WHITE_LIST :
					cashLoanLib.notWhiteList();
					break;
				case cashLoanLib.CONST_ERR_SESSION_QUERY_FAIL :
					cashLoanLib.notLogin();
					break;
				case cashLoanLib.CONST_ERR_SESSION_EXPIRE :
					cashLoanLib.notLogin();
					break;
				default :
					cashLoanLib.systemBusy(rtx_check_obj);
					break;
			}
		},
		
		bindEvent : function(){
			var self = this;
			$("#next_step").on('click', function(){
				if($(this).hasClass('btn-disable')) return;
				self.authStaff();
			});
			
			$("a.ico-clear").on('click', function(){
				var formContainer = $(this).parent().parent();
				$("input.input-text", formContainer).val('');
				formContainer.removeClass('show-clear');
				self.showNextStepBtn();
			});
			
			$("#token").on('input', function(){
				var token = $.trim($(this).val());
				if('' == token || !token){
					$("div.token-form-line").removeClass('show-clear');
				}else{
					$("div.token-form-line").addClass('show-clear');
				}
				if(String(token).length >= 6){
					$(this).val(String(token).substring(0,6));
				}
				
				self.showNextStepBtn();
			});
			
			$("#rtx_name").on('input', function(){
				var rtx_name = $.trim($(this).val());
				if('' == rtx_name || !rtx_name){
					$("div.rtx-form-line").removeClass('show-clear');
				}else{
					$("div.rtx-form-line").addClass('show-clear');
				}
				
				self.showNextStepBtn();
			});
			
			$("#rtx_name").on('blur', function(){
				self.showNextStepBtn();
				setTimeout(function(){
					$("div.rtx-form-line").removeClass('show-clear');
				}, 250);
			});
			
			$("#rtx_name").on('focus', function(){
				var rtx_name = $.trim($(this).val());
				if(rtx_name && '' != rtx_name ){
					$("div.rtx-form-line").addClass('show-clear');
				}
			});
			
			$("#token").on('blur', function(){
				self.showNextStepBtn();
				setTimeout(function(){
					$("div.token-form-line").removeClass('show-clear');
				}, 250);
			});
			
			$("#token").on('focus', function(){
				var token = $.trim($(this).val());
				if(token && '' != token){
					$("div.token-form-line").addClass('show-clear');
				}
				
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
			this.query_sig = rtx_check_obj.query_sig || '';
			this.token_query_sig = rtx_check_obj.token_query_sig || '';
		},
		
		authStaff : function(){
			var rtx_name = $.trim($("#rtx_name").val());
			var token = $.trim($("#token").val());
			
			var objParam = {
				rtxid  : rtx_name,
				token : token,
				query_sig : this.query_sig,
				token_query_sig : this.token_query_sig,
				g_tk : g_tk,
				ssid : cashLoanLib.cache.get('session_id') || '',
				sid : cashLoanLib.getParameter("sid")
			};
			
			if(!this.checkParam(objParam)) return;
			
			loading.show();
			var self = this;
			self.handleRequest(4, AUTH_RTX_CHECK_CGI, objParam, function(data){
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
					case 0 :
						cashLoanLib.openPage("/cashloan/v2/borrow/msg_check.html");
						break;
					case 125910017 :
						cashLoanLib.showDialog({text : data.retmsg || '您的英文ID或TOKEN输入错误，请重新填写。', callBack : function(){
							$("#rtx_name").val('');
							$("#token").val('');
						}});
						break;
					case 125910027 :
						cashLoanLib.showDialog({text : data.retmsg || '您输入的RTX账户名有错误，请重新输入', callBack : function(){
							$("#rtx_name").val('');
							$("#token").val('');
						}});
						break;
					case 125910018 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');	
						}});
						break;
					case 125910048:
						cashLoanLib.showDialog({text : data.retmsg || 'token验密已超过3次 ，请明天再来', callBack : function(){
							cashLoanLib.cache.remove('session_id');
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');	
						}});
						break;
					case 66222403:
						cashLoanLib.showDialog({text : data.retmsg || '您的英文ID或TOKEN输入错误，请重新填写。', callBack : function(){
							$("#rtx_name").val('');
							$("#token").val('');
						}});
						break;
					case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
						cashLoanLib.loginTimeOut(data);
						break;
					case cashLoanLib.CONST_RTX_CHECK_AUTH_TOKEN_ERROR:
						cashLoanLib.showDialog({text : data.retmsg || '动态密码有误或过期，请用新动态密码验证'});
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
		
		showNextStepBtn : function(){
			var rtxName = $.trim($("#rtx_name").val());
			var token = $.trim($("#token").val());
			if(String(token).length == 6 && "" != rtxName){
				$("#next_step").removeClass("btn-disable");
			}else{
				$("#next_step").addClass("btn-disable");
			}
		},
		
		checkParam : function(objParam){
			if('' == objParam.rtxid){
				mqq.ui.showTips({text: "请填写腾讯员工英文id"});
				return false;
			}
			
			if('' == objParam.token){
				mqq.ui.showTips({text: "请填写6位的token"});
				return false;
			}
			
			
			//1、正则验证名字
			var nameReg = /^[a-zA-Z_]{2,30}$/;
			if(!nameReg.test(objParam.rtxid)){
				mqq.ui.showTips({text: "英文ID格式错误，请检查后再填写"});
				return false;
			}
			
			//2、正则验证token
			var tokenReg = /^\d{6}$/;
			if(!tokenReg.test(objParam.token)){
				mqq.ui.showTips({text: "请填写6位的token"});
				return false;
			}
			
			if('' == this.query_sig){
				mqq.ui.showTips({text: "签名获取失败，请稍后再试"});
				return false;
			}
			
			$("#next_step").removeClass("btn-disable");
			
			return true;
		}
	};
	
	exports.init = function(){
		//隐藏mqq loading
		mqq.ui.setLoading({visible:false});
		new RtxCheck();
		FastClick.attach(document.body);
		
		timeStepMark[2] = new Date().getTime() - timeStepMark[0];
		(new cashLoanLib.SpeedRPT()).speedSend({rptid : 3, sTimes : [timeStepMark[1], timeStepMark[2]]});
	
		setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/rtx_check.html');}, 1000);
	};
});