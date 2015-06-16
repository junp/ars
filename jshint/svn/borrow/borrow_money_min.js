/**
 * 借款确认
 */
define(function(require, exports, module) {
	window.FloatMath = require("./float_math_min.js");
	var moment = require('../../../../lib/sea-modules/moment/moment').moment;
	var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js');
	var iScroll = require('../../../../lib/sea-modules/iScroll/iscroll-lite').iScroll;
	
	var token = cashLoanLib.getACSRFToken();

	var AUTH_BORROW_MONEY = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_submit_amt.cgi';
	var RTX_CHECK_CGI = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/xjdloan_query_mb.cgi';
	
	$.fn.textFocus=function(v){
        var range,len,v=v===undefined?0:parseInt(v);
        this.each(function(){
            if(!$.browser.msie){
                len=this.value.length;
                v===0?this.setSelectionRange(len,len):this.setSelectionRange(v,v);
            }else{
            	range=this.createTextRange();
                v===0?range.collapse(false):range.move("character",v);
                range.select();
            }
            this.focus();
        });
        return this;
    };

	window.getMaxDay = function(year, month, index, isCrossMonth, repayDay) {
		if (0 == index) { // 算头不算尾
			var rtMoment = moment(Number(String(borrow_money_obj.curr_time) + "000"));
			var currentDay = Number(rtMoment.format('D'));
			var repayDay = parseInt(repayDay, 10);
			if(isCrossMonth){
				var firstMonthDays = new Date(year, month - 2, 0).getDate();
				var secondMonthDays = new Date(year, month - 1, 0).getDate();
				return (firstMonthDays - currentDay + secondMonthDays + repayDay);
			}else{
				var firstMonthDays = new Date(year, month - 1, 0).getDate();
				return (firstMonthDays - currentDay + repayDay);
			}
		} else {
			return new Date(year, month - 1, 0).getDate();
		}
	};

	window.roundFloat = function(num, digit) {
		var beiNum = Math.pow(10, digit);
		return FloatMath.div(Math.round(FloatMath.mul(num, beiNum)), beiNum).toFixed(2);
	};

	window.openCrossMonthWin = function(month, day) {
		month = /^\d{1,2}$/.test(month) ? parseInt(month, 10) : '';
		day = /^\d{1,2}$/.test(day) ? parseInt(day, 10) : '';
		cashLoanLib.showDialog({
			text : [ '为保证您的还款体验，该笔借款的第一期计息时间为借款当天至下一个还款日（', month, '月', day, '日）。' ].join('')
		});
	};

	function BorrowMoney(data) {
		this.data = data || {};
		this.isBlur = false;
		this.riskInfo = null;
		this.currMoneyLen = 0;
		this.init();
	}

	BorrowMoney.prototype = {
		tpl : '\
	            <%for(var index = repayInfo.index; index < repayInfo.term; index ++ ){%>\
	             <tr <%if(index % 2 != 0){%>class="even"<%}else{%>class="odd"<%}%> >\
	             <%var month = parseInt(repayInfo.repayTimeObj.firstRepayMonth, 10);\
	                 if("12" == month){\
	                     month = "01";\
	                 }else{\
	                     month = Number(month) + index;\
	                     if(month > 12){\
	                         month = month % 12 == 0 ? 12 : month % 12;\
	                     }\
	                     month = month < 10 ? "0" + month : month;\
	                 }\
	                 var principal = Number(repayInfo.money - repayInfo.termMoney * index);\
	                 var perDayInstest = FloatMath.mul(principal, Number(repayInfo.rate));\
	                 var interest = FloatMath.mul(perDayInstest, window.getMaxDay(repayInfo.repayTimeObj.year, Number(parseInt(repayInfo.repayTimeObj.firstRepayMonth, 10))+ index , index, repayInfo.repayTimeObj.isCrossMonth, repayInfo.repayTimeObj.day));\
	            	 \
	            	 var firstMonth = parseInt(repayInfo.repayTimeObj.firstRepayMonth, 10);\
	            	 var firstYear = repayInfo.repayTimeObj.year;\
	            	 var currentYear = firstYear + parseInt((firstMonth + index -1) / 12);\
	            	 var perMonInstest = FloatMath.add(repayInfo.termMoney, interest);\
	              %>\
	              <td class="col1"><%=currentYear%>/<%=month%>/<%=repayInfo.repayTimeObj.day%></td>\
	              <td class="col2"><%=window.roundFloat(perMonInstest, 2)%>\
	              <%if(index == 0 && repayInfo.repayTimeObj.isCrossMonth){%>\
	                  <a class="ico-info-blue" href="javascript:;" onclick="openCrossMonthWin(\'<%=month%>\',\'<%=repayInfo.repayTimeObj.day%>\')"></a>\
	              <%}%>\
	              </td>\
	            </tr>\
	            <%}%>\
	            ',

		init : function() {
			if ("0" == borrow_money_obj.retcode) {
				this.fillPage();
				this.iScrollInit();
				this.bindEvent();
				this.getRiskInfo();
			} else {
				this.handleErrCode();
			}
		},
		
		iScrollInit: function() {
            var self = this;
            if(self.myScroll){
                return;
            }
            self.myScroll = new iScroll('wrapper',{
                click: false,
                hScroll: false,
                hideScrollbar:true,
                fadeScrollbar:true,
                onScrollMove: function(){
                },
                onScrollEnd: function () {
                }
            });
            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
        },

		handleErrCode : function() {
			var ret = Number(borrow_money_obj.retcode);
			switch (ret) {
			case 66222405:
				cashLoanLib.notLogin();
				break;
			case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
				cashLoanLib.notLogin();
				break;
			case cashLoanLib.CONST_ERR_NOT_WHITE_LIST:
				cashLoanLib.notWhiteList();
				break;
			case cashLoanLib.CONST_ERR_SESSION_QUERY_FAIL:
				cashLoanLib.notLogin();
				break;
			case cashLoanLib.CONST_ERR_SESSION_EXPIRE:
				cashLoanLib.notLogin();
				break;
			default:
				cashLoanLib.systemBusy(borrow_money_obj);
				break;
			}
		},

		getRiskInfo : function() {
			var self = this;
			mqq.device.getDeviceInfo(function(data) {
				self.riskInfo = data;
			});
		},

		checkInputNum: function(Obj, tpye){
			var self = this;
			var money = $.trim(Obj.val().replace(".00", ""));
			if (isNaN(money) && "next_click" == tpye) {
				mqq.ui.showTips({
					text : "请输入正确的金额"
				});
				return;
			}
			
			var flag = false;
			if ('' == money || !money) {
				$("div.amount-form-line").removeClass('show-clear');
				$("#next_step").addClass("btn-disable");
				return false;
			} else {
				$("div.amount-form-line").addClass('show-clear');
				$("#next_step").removeClass("btn-disable");
			}

			var inputLen = String(money).length;
			if(self.currMoneyLen == 6 && inputLen == 5){
				flag = true;
			}
			
			self.currMoneyLen = inputLen;
			if (inputLen > 6) {//modify by rc
				Obj.val(String(money).substring(0, 6));
				self.currMoneyLen = 6;
				return false;
			}

			if(!flag && inputLen >= 5 && "next_click" != tpye){//modify by rc 4.26
				return self.calRepayInfo(money, 'input-5');
			}else{
				return self.calRepayInfo(money, tpye);
			}
			return true;
		},

		bindEvent : function() {
			var self = this;
			$("#clear_money").live('click', function() {
				var formContainer = $(this).parent().parent();
				formContainer.removeClass('show-clear');
				$("#money").val('').focus();
				self.clearRepayInfo();
				$("#next_step").addClass("btn-disable");
			});

			$("#money").on('blur', function() {
				var money = $.trim($(this).val());
				if ('' != money) {
					if (isNaN(money)) {
						mqq.ui.showTips({
							text : "请输入正确的金额"
						});
						return;
					}
					if(-1 == money.indexOf(".00")){
						$(this).val([ money, ".00" ].join(""));
					}
					self.isBlur = true;
					self.calRepayInfo(money, 'blur');
				}
				
				self.myScroll.refresh();
				setTimeout(function() {
					$("div.amount-form-line").removeClass('show-clear');
				}, 250);
			});

			$("#money").on('focus', function() {
				self.isBlur = false;
				var money = $.trim($(this).val());
				if ('' != money && -1 != money.indexOf(".00")) {
					money = money.replace(".00", "");
					$("div.amount-form-line").addClass('show-clear');
					$(this).val(money).textFocus(String(money).length);
				}
			});
			
			$("#money").bind('keypress', function(e){
				var charCode = typeof event.charCode == "number" ? event.charCode : event.keyCode;
	        	if(!/\d/.test(String.fromCharCode(charCode)) && charCode >9 && !event.ctrlKey ){
	        		event.preventDefault();
	        	}
			});

			$("#money").on('input', function() {
				var money = $.trim($(this).val());
				$(this).val(money.replace(/[^\d]/g, ""));
				self.checkInputNum($(this), 'input');
			});

			$("#borrow_term").on("change", function() {
				self.setBorrowRate();
				var money = $.trim($("#money").val());
				if ('' == money || !money) {
					return;
				}
				self.clearRepayInfo();
				var money = $.trim($("#money").val());
				self.calRepayInfo(money, 'change');
			});

			// 下一步
			$("#next_step").live('click', function() {
				if ($(this).hasClass('btn-disable') || !self.checkInputNum($('#money'), 'next_click'))
					return;
				$(this).focus();
				self.nextStep();
				return false;
			});
			
			$(window).bind('resize', function(){
				if("" != $("#data_list").html()){//刷新iscroll
					 self.myScroll.refresh();
				}
			});
		},

		initReturn : function() {
			var money = cashLoanLib.cache.get('borrow_money');
			if (!money || isNaN(money)) {
				money = $("#money").val();
				if (!money || isNaN(money)) {
					return;
				}

			}
			$("#money").val(money);
			this.calRepayInfo(money);
		},

		handleRequest : function(rptid, cgi, data, onSuccess, onError) {
			cashLoanLib.loanHttp({
				rptid : rptid,
				url : cgi,
				data : data,
				type : 'POST',
				onSuccess : onSuccess,
				onError : onError
			});
		},

		myOnError : function(data, type) {
			loading.hide();
			if(type && "abort" == type){
            	//不处理
            }else if(type && "timeout" == type){
            	cashLoanLib.requestTimeOut();
            }else{
            	cashLoanLib.systemBusy(data);
            }
		},

		getCurrentRate : function() {
			if (!borrow_money_obj.rate || borrow_money_obj.rate.split(";").length != 3)
				return;
			var aRate = borrow_money_obj.rate.split(";");
			var term = $("#borrow_term").val();
			var result = "";
			for (var index = 0, len = aRate.length; index < len; index++) {
				var rateInfo = aRate[index].split(":");
				if (2 == rateInfo.length && rateInfo[0] == term) {
					result = rateInfo[1];
					break;
				}
			}

			return result;
		},

		calRepayInfo : function(money, type) {
			if ("click" == type && this.isBlur) {// 处理两次提示
				this.isBlur = false;
				return;
			}

			if ("" == money || !money || isNaN(money)) {
				this.clearRepayInfo();
				if ('input' == type)
					return false;
				mqq.ui.showTips({
					text : "请输入借款金额"
				});
				return false;
			}

			// 正则判断金额是否正确
			var reg = /^[1-9]\d*.?[0-9]*$/;
			if (!reg.test(money)) {
				this.clearRepayInfo();
				if ('input' == type)
					return false;
				mqq.ui.showTips({
					text : "请输入正确的金额"
				});
				return false;
			}

			// 1 判断金额是否大于单笔4w
			if (Number(money) > 40000) {
				this.clearRepayInfo();
				if ('input' == type)
					return false;
				mqq.ui.showTips({
					text : "为保证账户安全,单笔最多借40000元"
				});
				return false;
			}

			// 2、判断金额是否大于可借金额
			if (Number(money * 100) > Number(borrow_money_obj.money)) {
				this.clearRepayInfo();
				if ('input' == type)
					return false;
				mqq.ui.showTips({
					text : "借款金额需低于最高可借额度"
				});
				return false;
			}
			
			// 3、判断是否小于500块
			if (Number(money) < 500) {
				this.clearRepayInfo();
				if ('input' == type)
					return false;
				mqq.ui.showTips({
					text : "单笔借款不低于500元"
				});
				return false;
			}

			// 4、100倍整数
			if (money % 100 != 0 && Number(money) <= 40000) {
				this.clearRepayInfo();
				if ('input' == type)
					return false;
				mqq.ui.showTips({
					text : "输入金额需为100的整数倍"
				});
				return false;
			}

			if("next_click" != type){
				this.showTpl(type);
			}
			$("#next_step").removeClass("btn-disable");
			return true;

		},

		clearRepayInfo : function() {
			$("div.container").removeClass("show-repay");
			$("#total_money").html("");
			$("#data_list").html('');
			var self = this;
			setTimeout(function(){
				self.myScroll.refresh();
			},10);
		},

		showTpl : function(userType) {
			if ('blur' == userType)
				return;

			var repayTimeObj = this.getRepayTime();
			var totalMoney = this.getTotalInterestMoney(repayTimeObj);

			var repayInfo = {};
			var term = Number($("#borrow_term").val());
			var money = Number($.trim($("#money").val()));
			repayInfo.term = term;
			repayInfo.repayTimeObj = repayTimeObj;
			repayInfo.money = money;
			repayInfo.termMoney = money / term;
			repayInfo.index = 0;
			repayInfo.rate = this.getCurrentRate();
			var html = template.txTpl(this.tpl, {
				repayInfo : repayInfo
			});
			$("#total_money").html(["每月还款(总利息：", totalMoney, ")"].join(""));// 利息总价
			$("#data_list").html(html);
			$("div.container").addClass("show-repay");
			
			
			var self = this;
			//使用延迟加载iscroll，不然华为、小米等神机有问题
            setTimeout(function(){
                if(self.myScroll){
                    self.myScroll.refresh();
                }
                else{
                    self.iScrollInit();
                }
            }, 1000);
		},

		fillPage : function() {
			if (borrow_money_obj.money) {
				var money = window.roundFloat(FloatMath.div(Number(borrow_money_obj.money), 100), 2);
				$("#quota_money").html(money);
			}

			if (borrow_money_obj.rate) {
				this.setBorrowRate();
			}

			this.initReturn();
		},
		
		setBorrowRate : function(){
			var rateStr = Number(this.getCurrentRate()) * 100 + "%";
			$("#money_rate").html(rateStr);
		},

		getRepayTime : function() {
			var data = borrow_money_obj;
			var result = {};
			if (data.repay_time && data.curr_time && "0" != data.repay_time) { // 非首次
				result.isFirst = false;
				var repayMoment = moment(data.repay_time, "YYYYMMDD");
				var day = repayMoment.format('DD');
				result.day = day;

				// 当前时间比较
				var rtMoment = moment(Number(String(data.curr_time) + "000"));
				var month = rtMoment.format('M');
				result.month = month;
				result.year = Number(rtMoment.format('YYYY'));
				if(this.isCrossMonth(Number(rtMoment.format('D')), Number(repayMoment.format('D')))){
					result.isCrossMonth = true;
					if ("11" == month) {
						result.firstRepayMonth = "01";
						result.year = result.year + 1;
					} else if ("12" == month) {
						result.firstRepayMonth = "02";
						result.year = result.year + 1;
					} else {
						month = Number(month) + 2;
						result.firstRepayMonth = month < 10 ? ("0" + month) : month;
					}
				} else {
					result.isCrossMonth = false;
					if ("12" == month) {
						result.firstRepayMonth = "01";
						result.year = result.year + 1;
					} else {
						month = Number(month) + 1;
						result.firstRepayMonth = month < 10 ? ("0" + month) : month;
					}
				}
			}

			if ("0" == data.repay_time && data.curr_time) {// 首次
				result.isFirst = true;
				result.isCrossMonth = false;
				var rtMoment = moment(Number(String(data.curr_time) + "000"));
				var day = rtMoment.format('DD');
				var month = Number(rtMoment.format('M'));
				result.day = day;
				result.year = Number(rtMoment.format('YYYY'));
				result.month = month;
				if ("12" == month) {
					result.firstRepayMonth = "01";
					result.year = result.year + 1;
				} else {
					month = Number(month) + 1;
					result.firstRepayMonth = month < 10 ? ("0" + month) : month;
				}
				if (29 == day || 30 == day || 31 == day) {
					result.day = 21;
				}
			}

			return result;
		},
		
		isCrossMonth : function(currentDay, repayDay){
			var firstLoanDate = borrow_money_obj.firstloan_date;
			var fLDay = ""; 
			if(firstLoanDate && "0"!= firstLoanDate){
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

		getTotalInterestMoney : function(repayTimeObj) {
			var money = Number($.trim($("#money").val()));
			var term = Number($("#borrow_term").val());

			var year = repayTimeObj.year;
			var month = parseInt(repayTimeObj.firstRepayMonth, 10);
			var totalMoney = 0;
			var termMoeny = FloatMath.div(money, term);
			// (贷款本金-累计已还本金) * 贷款日利率 * 当期实际天数
			for (var index = 0; index < term; index++) {
				var perDayInstest = FloatMath.mul(Number(money - termMoeny * index), Number(this.getCurrentRate()));
				var curreyTermMoney = FloatMath.mul(perDayInstest, window.getMaxDay(year, month + index, index,
						repayTimeObj.isCrossMonth, repayTimeObj.day));
				totalMoney = FloatMath.add(totalMoney, curreyTermMoney);
			}

			return window.roundFloat(totalMoney, 2);
		},

		nextStep : function() {
			var money = $.trim($("#money").val());
			var term = $("#borrow_term").val();

			var objParam = {
				brw_lmt : parseInt(Number(money) * 100),
				periods : term,
				session_id : cashLoanLib.cache.get('session_id') || '',
				interest : this.getCurrentRate(),
				avalid_lmt : borrow_money_obj.money || '',
				credit_limit : borrow_money_obj.credit || '',
				pmt_date : borrow_money_obj.repay_time || '',
				firstloan_date : borrow_money_obj.firstloan_date || '',
				ts : borrow_money_obj.curr_time,
				sign : borrow_money_obj.sign,
				g_tk : token,
				sid : cashLoanLib.getParameter("sid")
			};

			if (this.riskInfo) {
				objParam.imei = this.riskInfo.identifier;
				var mobile_info1 = 'h_location=~h_model=' + this.riskInfo.model || '' + '~h_edition=' + this.riskInfo.modelVersion || ''
						+ '~h_exten=h5~h_lbs=';
				objParam.mobile_info = encodeURIComponent(this.riskInfo.identifier + "||" + this.riskInfo.model || '' + "|"
						+ this.riskInfo.systemName || '' + "||||" + mobile_info1);
			}

			loading.show();
			var self = this;

			self.handleRequest(3, AUTH_BORROW_MONEY, objParam, function(data) {
				loading.hide();
				var ret = Number(data.retcode);
				switch (ret) {
				case 0:
					data.session_id && cashLoanLib.cache.set('session_id', data.session_id);
					cashLoanLib.cache.set('borrow_money', money);
					if ("1" == data.token_verify) {
						cashLoanLib.openPage(RTX_CHECK_CGI);
					} else if ("0" == data.token_verify) {
						cashLoanLib.openPage("/cashloan/v2/borrow/msg_check.html");
					} else {
						cashLoanLib.systemBusy(data);
					}
					break;
				case 66222405://登录超时
					cashLoanLib.notLogin(data);
					break;
				case 125910001:
					cashLoanLib.notWhiteList();
					break;
				case 125910002:
					cashLoanLib.showDialog({
						text : data.retmsg || '支付密码错误，请重新输入。'
					});
					break;
				case 125910003:
					cashLoanLib.showDialog({
						text : data.retmsg || '支付密码输入错误次数过多，请24小时后再来申请'
					});
					break;
				case 125910012:
					mqq.ui.showTips({
						text : data.retmsg || "借款金额需低于最高可借额度"
					});
					break;
				case 125910051:
					cashLoanLib.showDialog({
						text : data.retmsg || '支付密码输入错误次数过多，请24小时后再来申请'
					});
					break;
				// 额度管控
				case 125910063:
					cashLoanLib.showDialog({
						text : data.retmsg || '微粒贷今日提供的额度已经用完，请您明天再来借款',
						callBack: function(){
							cashLoanLib.openPage('/cgi-bin/xjdloan/index.cgi');
						}
					});
					break;
				case 125910050:
					cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125910050");
					break;
				case 125910060:
					cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125910060");
					break;
				case 125910061:
					cashLoanLib.openPage("/cashloan/v2/anomaly.html?code=125910061");
					break;
				case cashLoanLib.CONST_RET_ERR_NOT_LOGIN:
					cashLoanLib.notLogin(data);
					break;
				case cashLoanLib.CONST_ERR_SESSION_QUERY_FAIL:
					cashLoanLib.notLogin(data);
					break;
				case cashLoanLib.CONST_ERR_SESSION_EXPIRE:
					cashLoanLib.notLogin(data);
					break;
				default:
					cashLoanLib.systemBusy(data);
					break;
				}
			}, self.myOnError);
		}
	};

	exports.init = function() {
		// 隐藏mqq loading
		mqq.ui.setLoading({
			visible : false
		});
		new BorrowMoney();
		FastClick.attach(document.body);

		timeStepMark[2] = new Date().getTime() - timeStepMark[0];
		(new cashLoanLib.SpeedRPT()).speedSend({
			rptid : 2,
			sTimes : [ timeStepMark[1], timeStepMark[2] ]
		});

		setTimeout(function() {
			cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/borrow_money.html');
		}, 1000);
	};

});