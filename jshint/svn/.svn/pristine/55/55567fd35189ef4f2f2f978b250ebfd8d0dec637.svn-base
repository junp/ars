/**
 * 信息确认
 */
define(function(require, exports, module){
	var token = cashLoanLib.getACSRFToken();
	
	var GET_USER_INFO_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_user_info.cgi';
	var AUTH_USER_INFO_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_auth_user.cgi';
	var CHECK_PWD_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_verify_mqq.cgi';
	var BANK_CONFIRM_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_bank_confirm.cgi';
	
	function MsgCheck(){
		this.init();
	}
	
	MsgCheck.prototype = {
		money : '',
		
		init : function(){
			this.formContainer = $("#form_control");
			this.checkUserBorrowMoney();
			this.bindEvent();
		},
		
		bindEvent : function(){
			var self = this;
			
			$("#next_step").on('click', function(){
				if(!$(this).hasClass('btn-disable')){
					self.nextStep();
				}
			});
			
			$("#card_list").live('change', function(){
				if('bind_card' == $(this).val()){
					$(this).val('');
					self.bindCard();
				}
				self.controlBtn();
			});
			
			$("#support_bank").on('click', function(){
				$("div.poplayer").show();
			});
			
			$("#close_pop").on('click', function(){
				$("div.poplayer").hide();
			});
			
			$("#name").on('blur', function(){
				self.checkName();
			});
			
			$("#name").on('input', function(){
				self.controlBtn();
			});
			
			$("#id_card").on('blur', function(){
				self.checkIdCard();
			});
			
			$("#id_card").on('input', function(){
				self.controlBtn();
			});
		},
		
		checkName : function(){
			var user_name = $.trim($("#name").val());
			if(String(user_name).length > 11){
				mqq.ui.showTips({text: "请输入有效的中文姓名"});
				return false;
			}
			
			var nameReg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3])*$/;
			if(!nameReg.test(user_name)){
				mqq.ui.showTips({text: "请输入有效的中文姓名"});
				return false;
			}
		},
		
		checkIdCard : function(){
			var id_card = $.trim($("#id_card").val());
			var idCardReg = /^(\d{3}x)|(\d{4})$/i;
			if(!idCardReg.test(id_card)){
				mqq.ui.showTips({text: "请输入有效的身份证号码"});
				return false;
			}
		},
		
		controlBtn : function(){
			var selectedOpt = $('option').not(function(){ return !this.selected; });
			var nextStep = $('#next_step');
			var bank_card_id = selectedOpt.attr('bank_card_id');
			var bank_type = $("#card_list").val();
			
			if(this.formContainer.hasClass('form-again')){//再次
				if('' == String(bank_card_id) || '' == bank_type){
					nextStep.addClass('btn-disable');
				}else{
					nextStep.removeClass('btn-disable');
				}
			}else{//首次
				var name = $("#family_name").html() + $.trim($("#name").val());
				
				if('' == String(bank_card_id) || '' == bank_type){
					nextStep.addClass('btn-disable');
					return false;
				}
				
				if(String(name).length > 11){
					nextStep.addClass('btn-disable');
					return false;
				}
				
				if("" == $.trim($("#name").val())){
					nextStep.addClass('btn-disable');
					return false;
				}
				
				var nameReg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3])*$/;
				if(!nameReg.test(name)){
					nextStep.addClass('btn-disable');
					return false;
				}
				
				var id_card_id = $.trim($("#id_card").val());
				var idCardReg = /^(\d{3}x)|(\d{4})$/i;
				if(!idCardReg.test(id_card_id)){
					nextStep.addClass('btn-disable');
					return false;
				}
				
				nextStep.removeClass('btn-disable');
			}
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
        
        myOnError: function(data , type){
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
				money = cashLoanLib.cache.get('borrow_money');
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
			}
			$("#money").html([money,'元'].join(''));
			this.money = money;
			this.getUserInfo();
		},
		
		getUserInfo : function(){
			loading.show();
			var self = this;
			
			self.handleRequest(5, GET_USER_INFO_CGI, {g_tk : token, sid : cashLoanLib.getParameter("sid")}, function(data){
				loading.hide();
				if(0 == data.retcode){
					self.showUserCard(data);
					//判断是否为首次开卡
					if('0' == data.opt_idx){
						self.formContainer.removeClass('form-again');
						self.fillUserInfo(data);
					}
					self.controlBtn();
				}else if(cashLoanLib.CONST_RET_ERR_NOT_LOGIN == data.retcode){//登录超时
					cashLoanLib.loginTimeOut();
				}else if(cashLoanLib.CONST_ERR_NOT_WHITE_LIST == data.retcode){
					cashLoanLib.notWhiteList();
				}else{
					cashLoanLib.systemBusy(data);
				}
			}, function(data, type){
				loading.hide();
				if(type && "abort" == type){
	            	//不处理
	            }else if(type && "timeout" == type){
	            	mqq.ui.showDialog({title : '提示', text : "请求超时", needOkBtn : true, needCancelBtn : true, okBtnText : "取消借款", cancelBtnText : "重试"}, function(result){
						if(0 == result.button){
							mqq.ui.popBack();
						}else{
							self.getUserInfo();
						}
					});
	            }else{
	            	cashLoanLib.systemBusy(data);
	            }
			});
		},
		
		showUserCard : function(data){
			if(!data.bank_count || (data.bank_count && "0" == data.bank_count)){
				var self = this;
				$("div.select-group").html('<div class="text select add-card">添加新的储蓄卡</div>').bind("click", function(){
					self.bindCard();
					return false;
				});
				return;
			}
			
			if(!data.records || !$.isArray(data.records)) return;
			var aBankInfo = data.records;
			var cardCount = aBankInfo.length;
			var cardHtml = '';
			var bflag = false;
			for(var index = 0;index < cardCount; index ++){
				var bankInfo = aBankInfo[index];
				var bankName = bankInfo.bank_name || '';
				var bankCardNo = bankInfo.bank_card_no || '';
				var bankIsvalid = bankInfo.bank_invalid || '';
				var bindSerial = bankInfo.bind_serial || '';
				var remark = bankInfo.remark || '';   //银行不可用时后台配置的文案
				if('1' == bankIsvalid){//可用
					bflag = true;
					cardHtml += ['<option value="',bankInfo.bank_type, '" bank_card_id="',bankCardNo, '" bind_serial="', bindSerial, '" bank_name="', bankName, '">', bankName,'(',bankCardNo, ')', '</option>'].join("");
				}else if('0' == bankIsvalid){//不可用
					//借记卡 or 信用卡
					if('D' == bankInfo.card_type){
						bankName = [bankName,'(',bankCardNo,')', '(', remark ? remark : '暂不支持该银行', ')'].join('');
					}else if('C' == bankInfo.card_type){
						bankName = [bankName,'(',bankCardNo,')','(不支持信用卡)'].join('');
					}
					cardHtml += ['<option disabled="disabled">', bankName,'</option>'].join("");
				}
			}
			cardHtml += '<option value="bind_card">添加新的储蓄卡</option>';
			$("#card_list").html(cardHtml);
			
			if(!bflag){
				$("#card_list").val('');
			}
		},
		
		fillUserInfo : function(data){
			var fullName = data.name || '';
			var family_name = String(fullName).replace(/\*/g, '');
			$("#family_name").html(family_name);
			
			var mask_id_card = data.id_card_no || '';
			if(mask_id_card.length > 4){
				mask_id_card = mask_id_card.substring(0, mask_id_card.length -4);
			}
			
			$("#mask_id_card").html(mask_id_card);

			// 尾号不为X，调用数字键盘
			//key_board = "0"  数字键盘
			//key_board = "1"  普通键盘
			if(data.key_board+'' === '0'){
				$('#id_card').attr('type', 'tel');
			}
			
			this.handleIdCard(mask_id_card);
		},
		
		handleIdCard : function(mask_id_card){
			if(!mqq.android || !mask_id_card){
				return;
			}
			
			var suffix_mask_id_card = mask_id_card.substring(4, mask_id_card.length);
			var prefix_mask_id_card = String(mask_id_card).replace(/\*/g, '');
			mqq.device.getDeviceInfo(function(data){
				if(data && data.systemVersion){
					var an_verson = "2.3.6";
					if(cashLoanLib.compareVersion(an_verson, data.systemVersion) >=0){
						var html = prefix_mask_id_card + '<span style="font-size:10px;">' + suffix_mask_id_card +'</span>';
						$("#mask_id_card").html(html);
					}
				}
			});
		},
		
		bindCard : function(){
			var self = this;
			loading.show();
			mqq.tenpay.openTenpayView({
				userId : cashLoanLib.getCookieUin(),
				viewTag : 'bindNewCard',
				bargainor_id : cashLoanLib.bind_card_bargainor_id
			}, function(data){
				loading.hide();
				if(data.resultCode == 0){//绑卡成功
					location.reload(); //重刷页面
				}else{
					//不提示
					 var opt1 = $('option').not(function(){ return this.disabled || this.value == 'bind_card';});
					 if(0 == opt1.length){
						 $('select').val('');
					 }else{//默认选中第一张
						 $('select')[0].options.selectedIndex = opt1.index();
					 }
					 
					 self.controlBtn();
				}
			});
			
			if(mqq.iOS){
				setTimeout(function(){
					$("#card_list").val('');
				}, 1000);
			}
		},
		
		nextStep : function(){
			if(this.formContainer.hasClass('form-again')){
				this.onceMoreBorrowMoney();
			}else{
				this.firstBorrowMoney();
			}
		},
		
		borrowRoute : function(){
			//进行提示
			var bank_type = $("#card_list").val();
			var money = Number(cashLoanLib.cache.get('borrow_money'));
			var self = this;
			if(("2011" == bank_type && money <= 45000) || ("2011" != bank_type && money <= 145000)){
				self.borrowRoute();
			}else if("2011" == bank_type && money > 45000){
				mqq.ui.showDialog({title : '提示', text : "请注意：招商银行卡单笔交易存在限额。您借款超过4.5万时，无法提前还清。如需提前还清，请改为其他银行卡。（每月通过该银行卡进行自动扣款不受影响。）", needOkBtn : true, needCancelBtn : true, okBtnText : "更换收款卡", cancelBtnText : "继续借款"}, function(result){
					if(1 == result.button){
						self.borrowRoute();
					}
				});
			}else if("2011" != bank_type && money > 145000){
				mqq.ui.showDialog({title : '提示', text : "请注意：收款银行卡单笔交易存在限额。您借款超过14.5万时，无法提前还清。如需提前还清，请分成多笔来借款，每笔不超过14.5万。（每月通过该银行卡进行自动扣款不受影响。）", needOkBtn : true, needCancelBtn : true, okBtnText : "重新借款", cancelBtnText : "继续借款"}, function(result){
					if(1 == result.button){
						self.borrowRoute();
					}else if(0 == result.button){
						cashLoanLib.cache.remove('session_id');
						cashLoanLib.cache.remove('borrow_money');
						cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi');
					}
				});
			}else{
				self.borrowRoute();
			}
		},
		
		firstBorrowMoney : function(){
			var selectedOpt = $('option').not(function(){ return !this.selected; });
			var objParam = {
				brw_lmt	: Number(this.money) * 100,
				name : $("#family_name").html() + $.trim($("#name").val()),
				id_card_id : $("#mask_id_card").html() + $.trim($("#id_card").val()),
				bank_card_id : selectedOpt.attr('bank_card_id'),
				bank_type : $("#card_list").val(),
				bank_name : selectedOpt.attr('bank_name'),
				bind_serial : selectedOpt.attr('bind_serial'),
				session_id : cashLoanLib.cache.get('session_id') || '',
				g_tk : token,
				sid : cashLoanLib.getParameter("sid")
			};
			
			if(!this.checkObjParam(objParam, "first")) return;
			
			var self = this;
			loading.show();
			self.handleRequest(6, AUTH_USER_INFO_CGI, objParam, function(data){
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
					case 0 :
						data.session_id && cashLoanLib.cache.set('session_id', data.session_id);
						//根据返回判断，跳转短信验证or密码验证
						if('1' == data.opt_idx){//短信
							if(data.mobile){
								cashLoanLib.cache.set('user_mobile',data.mobile);
							}
							cashLoanLib.openPage('/cashloan/v2/borrow/verification.html');
						}else if('2' == data.opt_idx){
							//获取密码串，调起密码控件
							self.callPwdWidget(data);
						}else if('3'== data.opt_idx){//非验短、非验密
							window.handleSuccssPage(data);
						}else{
							cashLoanLib.systemBusy(data);
						}
						break;
					case 125910013 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(data){
							location.reload();
						}});
						break;
					case 125910014 :
						cashLoanLib.showDialog({text : data.retmsg || '您的身份信息输入错误，请重新填写。若错误超过3次，该账户将不能借款。 '});
						break;
					case 125910015 :
						cashLoanLib.showDialog({text : data.retmsg || '您的身份信息输入错误，请重新填写。若错误超过3次，该账户将不能借款。 '});
						break;
					case 125910016 :
						cashLoanLib.showDialog({text : data.retmsg || '为保障您的资金安全，还清所有借款前不可选择新的收款银行卡。如需更改，请致电微众银行客服电话 '});
						break;
					case 125910022 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(data){
							location.reload();
						}});
						break;
					case 125910020 :
						cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(data){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
						}});
						break;
					case cashLoanLib.CONST_ERR_NOT_REAL_NAME :
						cashLoanLib.notRealName(data);
						break;
					case 125910023 :
						cashLoanLib.showDialog({text : data.retmsg || '为保障您的资金安全，还清所有借款前不可选择新的收款银行卡。如需更改，请致电微众银行客服电话 '});
						break;
					case 125910025 :
						cashLoanLib.showDialog({text : data.retmsg || '当天获取验证码次数过多，请24小时后再来申请 '});
						break;
					case 125910045 :
						cashLoanLib.showDialog({text : data.retmsg || '您的身份信息输入错误次数过多，该账户不能继续借款了 ', callBack : function(data){
							mqq.ui.popBack();
						}});
						break;
					case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
						cashLoanLib.loginTimeOut(data);
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
		
		onceMoreBorrowMoney : function(){
			var selectedOpt = $('option').not(function(){ return !this.selected; });
			var objParam = {
				brw_lmt	: Number(this.money) * 100,
				bank_card_id : selectedOpt.attr('bank_card_id'),
				bank_type : $("#card_list").val(),
				bank_name : selectedOpt.attr('bank_name'),
				bind_serial : selectedOpt.attr('bind_serial'),
				session_id : cashLoanLib.cache.get('session_id') || '',
				g_tk : token,
				sid : cashLoanLib.getParameter("sid")
			};
			
			if(!this.checkObjParam(objParam, 'onceMore')) return;
			
			loading.show();
			var self = this;
			self.handleRequest(8, BANK_CONFIRM_CGI, objParam, function(data){
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
					case 0 :
						data.session_id && cashLoanLib.cache.set('session_id', data.session_id);
						self.callPwdWidget(data);
						break;
					case 66222208:
						cashLoanLib.showDialog({text : data.retmsg || '银行类型错误'});
						break;
					case 125910014:
					case 125910015:
						cashLoanLib.showDialog({text : data.retmsg || '您的身份信息输入错误，请重新填写。若错误超过3次，该账户将不能借款。'});
						break;
					case 125910016 ://还没还清，不允许再借
						cashLoanLib.showDialog({text : data.retmsg || '为保障您的资金安全，还清借款前不可选择新的收款银行卡。如需更改，请致电微众银行客服电话。'});
						break;
					case 125910021 ://非实名
						cashLoanLib.showDialog({text : data.retmsg || '您还不是实名认证用户，请前往财付通主页www.tenpay.com，登录后在“我的账户”完成实名认证即可继续使用。（15分钟内生效）'});
						break;
					case 125910023:
						cashLoanLib.showDialog({text : data.retmsg || '为保障您的资金安全，还清借款前不可选择新的收款银行卡。如需更改，请致电微众银行客服电话。'});
						break;
					case 125910025 :
						cashLoanLib.showDialog({text : data.retmsg || '短信下发次数过多,请明天再来'});
						break;
					case 125910026 :
						cashLoanLib.showDialog({text : data.retmsg || '收款卡银行暂时不能支持 '});
						break;
					case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
						cashLoanLib.loginTimeOut(data);
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
		
		checkObjParam : function(objParam, type){
			var money = Number(this.money);
			//判断是否小于500块
			if(money < 500){
				mqq.ui.showTips({text: "借款金额不低于500.00元"});
				return false;
			}
			
			//借钱金额需为100的整数倍
			if(money % 100 != 0){
				mqq.ui.showTips({text: "借款金额需为100的整数倍"});
				return false;
			}
			
			if('' == String(objParam.bank_card_id) || '' == objParam.bank_type){
				mqq.ui.showTips({text: "请选择收款银行卡"});
				return false;
			}
			
			//一般不会触发
			var bankCardIdReg = /^\d{4}$/;
			if(!bankCardIdReg.test(objParam.bank_card_id)){
				mqq.ui.showTips({text: "请选择收款银行卡"});
				return false;
			}
			
			if(String(objParam.name).length > 11){
				mqq.ui.showTips({text: "请输入有效的中文姓名"});
				return false;
			}
			
			if("first" == type && "" == $.trim($("#name").val())){
				mqq.ui.showTips({text: "请输入有效的中文姓名"});
				return false;
			}
			
			var nameReg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3])*$/;
			if("first" == type && !nameReg.test(objParam.name)){
				mqq.ui.showTips({text: "请输入有效的中文姓名"});
				return false;
			}
			
			var id_card_id = $.trim($("#id_card").val());
			var idCardReg = /^(\d{3}x)|(\d{4})$/i;
			if("first" == type && !idCardReg.test(id_card_id)){
				mqq.ui.showTips({text: "请输入有效的身份证号码"});
				return false;
			}
			
			return true;
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
			//处理ios回调没关闭的情况
			if(mqq.iOS){
				setTimeout(function(){
					loading.hide();
				}, 3000);
			}
		},
		
		pwdWidgetCallBack : function(data){
			loading.hide();
			if(data && 0 == data.resultCode){
				loading.show();
				var objParam = {
					mqq_code : data.data.pwd,
					brw_lmt : Number(cashLoanLib.getCookie('borrow_money')) * 100,
					g_tk : token,
					session_id : cashLoanLib.cache.get('session_id') || '',
					sid : cashLoanLib.getParameter("sid")
				};
				
				var self = this;
				cashLoanLib.loanHttp({
	                rptid: 7,
	                url: CHECK_PWD_CGI,
	                data: objParam,
	                type: 'POST',
	                onSuccess : function(data){
	                	loading.hide();
						var ret = Number(data.retcode);
						switch (ret) {
							case 0 : //成功
								data.session_id && cashLoanLib.cache.set('session_id', data.session_id);
								if("1" == data.opt_idx){ //验短
									data.mobile && cashLoanLib.cache.set('user_mobile',data.mobile);
									cashLoanLib.openPage('/cashloan/v2/borrow/verification.html');
								}else if("0" == data.opt_idx){ //借款确认
									window.handleSuccssPage(data);
								}else{
									cashLoanLib.systemBusy(data);
								}
								break;
							case 125910034 :
							case 125910035 :
								cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(data){
									cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
								}});
								break;	
							case 125910013 :
								cashLoanLib.showDialog({text : data.retmsg || '系统繁忙，请您稍后再试。', callBack : function(data){
									location.reload();
								}});
								break;
							case 125910025 :
								cashLoanLib.showDialog({text : data.retmsg || '当天获取验证码次数过多，请24小时后再来申请', callBack : function(data){
									mqq.ui.popBack();
								}});
								break;
							case 125910036 :
								cashLoanLib.showDialog({text : data.retmsg || '您的身份信息输入错误次数过多，该账户不能继续借款了'});
								break;
							case 125910045 :
								cashLoanLib.showDialog({text : data.retmsg || '您的身份信息输入错误次数过多，该账户不能继续借款了', callBack : function(data){
									mqq.ui.popBack();
								}});
								break;
							case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
								cashLoanLib.loginTimeOut(data);
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
	                },
	                onError : function(data, type){
	                	 loading.hide();
	                	 if(type && "abort" == type){
	                     	//不处理
	                     }else if(type && "timeout" == type){
	                     	cashLoanLib.requestTimeOut();
	                     }else{
	                     	cashLoanLib.systemBusy(data);
	                     }
	                }
				});
			}else{
			}
		}
	};
	
	window.handleSuccssPage = function(data){
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
	};
	
	exports.init = function(){
		//隐藏mqq loading
		mqq.ui.setLoading({visible:false});
		new MsgCheck();
		FastClick.attach(document.body);
		cashLoanLib.onCloseHandler();
		
		timeStepMark[2] = new Date().getTime() - timeStepMark[0];
		(new cashLoanLib.SpeedRPT()).speedSend({rptid : 4, sTimes : [timeStepMark[1], timeStepMark[2]]});
		
		setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/msg_check');}, 1000);
	};
});