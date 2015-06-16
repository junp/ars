/**
 * 欢迎首页
 */
define(function(require, exports, module){
	var token = cashLoanLib.getACSRFToken();
	
	var GET_PWD_SIGN_INFO_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_measure.cgi';
	var OPEN_ACCT_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_open_acct.cgi';
	var QUOTA_SHOW_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_info_open.cgi';

	window.riskInfo = null;
	window.pwdSignObj = {};
	
	function Welcome(data){
		this.data = data || {};
		this.init();
	}
	
	Welcome.prototype = {
		init : function(){
			this.getRiskInfo();
			this.bindEvent();
			cashLoanLib.yellowTips('tips_weloan_welcome');
		},
		
		bindEvent : function(){
			var self = this;
			$("#test_quota").on('click', function(){
				if(!$("span.ico-check").hasClass('uncheck')){
					self.getPwdSign();
				}else{
					cashLoanLib.showDialog({text : '请先阅读并同意《借款额度合同》及相关授权', title : '温馨提示'});
				}
			});
			
			$("#user_protocol").on('click', function(){
				if($("span.ico-check").hasClass('uncheck')){
					$("span.ico-check").removeClass('uncheck');
				}else{
					$("span.ico-check").addClass('uncheck');
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
        
        getRiskInfo : function(){
			mqq.device.getDeviceInfo(function(data){
				window.riskInfo = data;
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
		
		getPwdSign : function(){
			loading.show();
			var self = this;
			var objParam = {
				g_tk : token,
				sid : cashLoanLib.getParameter("sid")
			};
			
			if(window.riskInfo){
				objParam.imei = window.riskInfo.identifier;
				var mobile_info1 = 'h_location=~h_model='+window.riskInfo.model+'~h_edition='+window.riskInfo.modelVersion+'~h_exten=h5~h_lbs=';
				objParam.mobile_info = encodeURIComponent(window.riskInfo.identifier + "||" + window.riskInfo.model + "|" + window.riskInfo.systemName + "||||" + mobile_info1);
			}
			
			self.handleRequest(1, GET_PWD_SIGN_INFO_CGI, objParam, function(data){
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
					case 0 :
						window.pwdSignObj = data;
						self.callPwdWidget(data);
						break;
					case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
						cashLoanLib.loginTimeOut(data);
						break;
					case cashLoanLib.CONST_ERR_NOT_WHITE_LIST :
						cashLoanLib.notWhiteList();
						break;
					case 66222207 :
						cashLoanLib.notRealName(data);
						break;
					default :
						cashLoanLib.systemBusy(data);
						break;
				}
			}, self.myOnError);
		},

		callPwdWidget : function(data){
			loading.show();
			var self = this;
			mqq.tenpay.openTenpayView({
				userId : cashLoanLib.getCookieUin(),
				bargainor_id : data.sp_id,
				viewTag : 'checkPsw',
				extra_data:{
	                bargainor_id: data.sp_id,
	                buss_uin: cashLoanLib.getCookieUin(),
	                time_stamp: data.time_stamp,
	                pass_type:"1",
	                sign: data.sp_sign
	            }
			}, self.pwdWidgetCallBack);

			//处理回调没关闭的情况
			if(mqq.iOS){
				setTimeout(function(){
					loading.hide();
				}, 3000);
			}
		},
		
		pwdWidgetCallBack : function(data){
			loading.hide();
			var self = this;
			if(data && 0 == data.resultCode){
				loading.show();
				var objParam = {
					mqq_code : data.data.pwd,
					g_tk : token,
					sid : cashLoanLib.getParameter("sid"),
					sign : window.pwdSignObj.sign || '',
					ts : window.pwdSignObj.time_stamp || ''
				};
				
				if(window.riskInfo){
					objParam.imei = window.riskInfo.identifier;
					var mobile_info1 = 'h_location=~h_model='+window.riskInfo.model+'~h_edition='+window.riskInfo.modelVersion+'~h_exten=h5~h_lbs=';
					objParam.mobile_info = encodeURIComponent(window.riskInfo.identifier + "||" + window.riskInfo.model + "|" + window.riskInfo.systemName + "||||" + mobile_info1);
				}
				
				cashLoanLib.loanHttp({
	                rptid: 2,
	                url: OPEN_ACCT_CGI,
	                data: objParam,
	                type: 'POST',
	                onSuccess : function(data){
	                	loading.hide();
						var ret = Number(data.retcode);
						switch (ret) {
							case 0 :
								data.session_id && cashLoanLib.cache.set('session_id', data.session_id);
								var url = [QUOTA_SHOW_CGI, "?available_otb=", data.available_otb || '', "&credit_otb=", data.available_otb || '',  "&pmt_date=", data.pmt_date || '', "&ts=", data.ts || '', "&sign=" , data.sign || ''].join("");
								Welcome.gettingQuotaAnimation({}, function(){
									cashLoanLib.openPage(url);
								});

								break;
							case 125910001 :
								cashLoanLib.notWhiteList();
								break;
							case 125910002 :
								cashLoanLib.showDialog({text : data.retmsg || '支付密码错误，请重新输入。'});
								break;
							case 125910003 :
								cashLoanLib.showDialog({text : data.retmsg || '支付密码输入错误次数过多，请24小时后再来申请'});
								break;
							case 125910007 :
							case 125910004 :
								cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。错误码：'+ ret, callBack : function(data){
									location.reload();
								}});
								break;
							case 125910050 : //命中欺诈
								cashLoanLib.openPage("/cashloan/v2/anomaly.html");
								break;
							case 125910005 :
								cashLoanLib.showDialog({text : data.retmsg || '您是微粒贷的员工版体验用户，请确保您在hr.oa.com登记的QQ，以及对应财付通账户的实名认证信息是您本人。', callBack : function(data){
									mqq.ui.popBack();
								}});
								break;
							case 125620114:
								cashLoanLib.showDialog({text : data.retmsg || '该用户已经在使用微粒贷,请勿重复开通此功能。'});
								break;
							case 125620126:
								cashLoanLib.openPage("/cashloan/v2/anomaly.html");
								break;
							case 125620090:
								cashLoanLib.showDialog({text : data.retmsg || '您已经开通了微粒贷，请勿重复开通。'});
								break;
							case 125910057:
								cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125910057");
								break;
							case 125910058:
								cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125910058");
								break;
							case 125910059:
								cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125910059");
								break;
							case 125621113:
								cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125621113");
								break;
							case 125621114:
								cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125621114");
								break;
							case 125620089:
								cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125620089");
								break;
							case 125900317://主键冲突赶快刷新，代表用户已开户
								cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
								break;
							case cashLoanLib.CONST_ERR_NOT_REAL_NAME :
								cashLoanLib.notRealName(data);
								break;
							case cashLoanLib.CONST_RET_ERR_NOT_LOGIN :
								cashLoanLib.loginTimeOut(data);
								break;
							case cashLoanLib.CONST_ERR_NOT_WHITE_LIST :
								cashLoanLib.notWhiteList();
								break;
							default :
								cashLoanLib.systemBusy(data);
								break;
						}
	                },
	                onError : function(data, type){
	                	 loading.hide();
	                	 if(type && "timeout" == type){//可能已成功了,做刷新操作
	                		 cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
	                	 }else if(type && "abort" == type){
	                	 }else{
	                		 cashLoanLib.requestTimeOut();
	                	 }
	                }
	            });
			}
		},
	};
	//开户动画
	Welcome.gettingQuotaAnimation = function(para,callback){
		$('.loading-content').toggleClass('hide')
		var itimer = setTimeout(function(){
			//动画结束
			typeof callback == 'function' ? callback() : function(){};
		}, 5000);
		return false;
	}
	exports.init = function(){
		//隐藏mqq loading
		mqq.ui.setLoading({visible:false});
		new Welcome();
		FastClick.attach(document.body);
		
		timeStepMark[2] = new Date().getTime() - timeStepMark[0];
		(new cashLoanLib.SpeedRPT()).speedSend({rptid : 1, sTimes : [timeStepMark[1], timeStepMark[2]], extraData : ['welcome']});
		
		// 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/welcome.html');}, 1000);
	};

	mqq.ui.setOnCloseHandler(function() {
		mqq.ui.popBack();
	});
});