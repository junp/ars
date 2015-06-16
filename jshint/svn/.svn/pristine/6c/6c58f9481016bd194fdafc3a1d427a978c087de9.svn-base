;(function(){
	var CashLoanLib = CashLoanLib || {};
	
	CashLoanLib = {
		gMinUin     : 10000, //最小的QQ号
		gTimeout    : 12000, //统一定义js拉取数据的超时时间为12s,
		bind_card_bargainor_id : '1230997301',     //正式环境：    2000000501
		bid : 2061,
		
		// 统一定义新的错误返回码
		CONST_RET_OK : 0,
		CONST_RET_ERR : -1000, //系统繁忙
		CONST_RET_ERR_NOT_LOGIN : 66210007, //用户未登录
		CONST_ERR_STEP_CHECK_FAIL : 125910019,//上下文步骤校验不通过 
		
		CONST_ERR_GET_STAFF_QQ : 66222301,      //验证员工QQ报错
		CONST_ERR_NOT_STAFF_QQ : 66222302,      //非员工QQ
		CONST_ERR_NOT_SUPPORT_TOKEN : 66222303, //不支持token
		CONST_ERR_AUTH_TOKEN_OVER_MAX : 66222401, //token验密已超过3次
		CONST_ERR_STAFF_RTX_ID : 66222402, //员工RTX英文校验失败
		CONST_ERR_NOT_WHITE_LIST : 66222202, //非白名单用户
		CONST_ERR_NOT_REAL_NAME : 125910021,//非实名人验证
		
		CONST_ERR_SESSION_QUERY_FAIL : 125910041,// session查询失败
		CONST_ERR_SESSION_EXPIRE : 125910042, //session失效
		
		CONST_ERR_NOT_REPAY_TIME : 66224601,		//还款时间不合法
		CONST_ERR_CEP_PROCESSING : 66224700,		//银行处理中
		
		//param为object
		showDialog : function(param){
			var title = param.title || '提示';
			var text = param.text || '';
			if(param.callBack && $.isFunction(param.callBack)){
				mqq.ui.showDialog({
					title : title,
					text : text,
					needOkBtn: true,
					needCancelBtn: false
				}, param.callBack);
			}else{
				mqq.ui.showDialog({
					title : title,
					text : text,
					needOkBtn: true,
					needCancelBtn: false
				}, function(data){});
			}
		},
		
		notLogin : function(data){
			var self = this;
			var sMsg = '页面已经过期，请重新操作';
			if(data && data.retmsg){
				sMsg = data.retmsg;
			}
			this.showDialog({text : sMsg, callBack : function(data){
				self.cache.remove('session_id');
				self.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi');
			}});
		},
		
		loginTimeOut : function(){
			var self = this;
			var sMsg = 'QQ登录超时，请关闭QQ后重新打开';
			this.showDialog({text : sMsg, callBack : function(data){
				mqq.ui.popBack();
			}});
		},
		
		notRealName : function(data){
			var sMsg = '您目前还不是实名认证用户，请在QQ钱包内添加一张银行卡即可继续使用。（添加后预计10分钟生效，请耐心等候）';
			if(data && data.retmsg){
				sMsg = data.retmsg;
			}
			
			var self = this;
			loading.show();
			
			mqq.ui.showDialog({title : '提示', text : sMsg, needOkBtn : true, needCancelBtn : true, okBtnText : "添加银行卡", cancelBtnText : "取消"}, function(result){
				if(0 === result.button){
					mqq.tenpay.openTenpayView({
						userId : self.getCookieUin(),
						viewTag : 'bindNewCard',
						bargainor_id : self.bind_card_bargainor_id
					}, function(data){
						loading.hide();
						if(data.resultCode == 0){//绑卡成功
							location.reload(); //重刷页面
						}else{
							//不提示
						}
					});
					
				}
				setTimeout(function(){
					loading.hide();
				}, 3000);
			});
		},
		
		systemBusy : function(data){
			var self = this;
			var errMsg = '系统繁忙，请稍后再来。';
			if(data && "1" == data.err_trans_status){
				errMsg = data.retmsg;
			}else{
				data.retcode &&  (errMsg += '错误码：' + data.retcode);
			}
			setTimeout(function(){
				//当前页面可见时才提示错误，否则在手q中返回到某页面后，还提示上一个页面的错误
				mqq.ui.pageVisibility(function(r){
					if(r) self.showDialog({text : errMsg}); 
				});
			}, 500);

		},
		
		requestTimeOut : function(){
			this.showDialog({text : '网络繁忙，请您稍后再试'});
		},
		
		onCloseHandler : function(){
			var self = this;
			mqq.ui.setOnCloseHandler(function(result){
				mqq.ui.showDialog({title : '提示', text : "是否要放弃本次借款申请？", needOkBtn : true, needCancelBtn : true, okBtnText : "放弃", cancelBtnText : "继续借款"}, function(result){
					if(0 == result.button){
						self.cache.remove('session_id');
						self.cache.remove('borrow_money');
						self.cache.remove('user_mobile');
						self.cache.remove('borrow_info');
						self.cache.remove('result_info');
						self.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi');
					}
				});
			});
		},
		
		getCookieUin : function(){
			return String(this.getCookie("uin")).replace(/^o?0*/,'');
		},
		
		getACSRFToken: function(){
			var skey = this.getCookie('skey');
			var hash = 5381;
			for(var i = 0, len = skey.length; i < len; ++i){
				hash += (hash << 5) + skey.charAt(i).charCodeAt();
			}
			return hash & 0x7fffffff;
		},
		
		openPage : function(url, options){
			if(!url) return;
			
			if(mqq.QQVersion==='0'){
				location.href = url;
			}
			
			var sid = this.getParameter("sid");
			if(sid && "" != sid){
				if(-1 != url.indexOf('?')){
					url += "&sid=" + sid;
				}else{
					url += "?sid=" + sid;
				}
			}

			if(typeof options === 'object'){
				options.url = url;
				mqq.ui.openUrl(options);
			}
			else{
				location.href = url;
			}
		},
		
		/**
		 * 获取cookie信息        
		 * 
		 * @method $.getCookie         
		 * @param {String} name 获取的cookie的键值
		 * @return {String} 获取的cookie值
		*/
		getCookie: function(name){
			var re = new RegExp('(?:^|;+|\\s+)' + name + '=([^;]*)');
			var result = document.cookie.match(re);
			
			return (!result ? '' : result[1]);
		},
		
		/**
		 * 设置cookie信息        
		 * 
		 * @method $.setCookie         
		 * @param {String} name 设置cookie的键值
		 * @param {String} value 设置的cookie的值
		 * @param {String} [domain:tenpay.com] 设置cookie的域名，默认在财付通的根域
		 * @param {String} [path:/] cookie存放的路径
		 * @param {Number} minuts 设置的cookie的有效期
		*/     
		setCookie: function(name, value, domain, path, minute){
			if (minute) {
				var now = new Date(),
					expire = new Date();
					
				expire.setTime(parseFloat(+now) + 60 * 1000 * minute); 
			}
			
			document.cookie = name + '=' + value + '; ' + (minute ? ('expires=' + expire.toUTCString() + '; ') : '') +
				('path=' + (path || '/cashloan') + '; domain=' + (domain || 'weloan.tenpay.com') + ';');
		},
		
		delCookie : function (name, domain, path) {
			document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=weloan.tenpay.com;"));
		},
		
		getParameter : function(n, s, d){
			var reg = new RegExp( "(?:^|[&\?])"+n+"=([^&#]*)(?:[&#].*|$)");
			var val = (s||location.search||'').match(reg);
			if(val){
				val = val[1];
			}
			val = val || '';
			return d && val? decodeURIComponent(val) : val;
		},

		myParseFloat: function(num){
			//当字符处理
			var tmp = '000' + num
			if(/^\d{4,16}$/.test(tmp)){
				var len = tmp.length
				tmp = parseInt(tmp.substr(0, len - 2), 10) + '.' + tmp.substr(len - 2 , len)
				return tmp
			}else return '0.00'
		},
		//===========start SpeedRPT
		/**
		 * 架平数据上报
		 * @returns {{URL: string, getStmp: Function, makeUrl: Function, send: Function, cgiSend: Function, speedSend: Function}}
		 * @constructor
		 */
		SpeedRPT: function(){
			function SReport() {
				this.isSend = true
				this.para = [
					"u=" + CashLoanLib.getCookieUin() || '',
					//"n=" + ,
					"s="  + ($.os.ios ? "ios" : ($.os.android ? "android" : "unknow")),
					"sv=" + $.os.version,
					"qv=" + mqq.QQVersion
				]
			}
			SReport.prototype = {
				URL: "http://p.store.qq.com/mqq_loan?op=all", getStmp: function () {
					return (new Date()).getTime()
				}, makeUrl: function (rptData) {
					var e;
					return e = this.URL + "&" + this.para.concat(rptData).join("&")
				}, send: function (src) {
					if (src && this.isSend) {
						var img = new Image()
						img.src = src
					}
					img && (img = null)
				},
				/**
				 *
				 * @param praObj (object)
				 * {  rptid(Int): 上报标识,
			 * 	  retCode(Str):cgi返回码,
			 * 	  sTime(Int): cgi耗时,
			 * 	  extraData (Array): 预留字段k1、k2的值，如[1, 2]
			 * }
				 */
				_cgiSend: function (praObj) {
					var re = /^\d+$/
					var re2 = /[A-Za-z0-9]+/
					if (re.test(praObj.rptid) && re.test(praObj.retCode) && re.test(praObj.sTime)) {
						var ds = ['t=1', 'c=' + praObj.rptid, 'r=' + praObj.retCode, 'f1=' + praObj.sTime]
						for (var i = 0; i < praObj.extraData.length; i++) {
							if (re2.test(praObj.extraData[i]))
								ds.push('k' + i + '=' + praObj.extraData[i])
						}
						if (praObj.netType) ds.push('n=' + praObj.netType)
						var src = this.makeUrl(ds)
						this.send(src)
					}
				},
				cgiSend: function (praObj) {
					var self = this
					mqq.device.getNetworkType(function (n) {
						if (-1 != n) {  //没网络放弃上报
							self._cgiSend({
								rptid: praObj.rptid,
								retCode: praObj.retCode,
								netType: n,
								sTime: praObj.sTime,
								extraData: praObj.extraData
							})
						}
					})
				},

				/**
				 *
				 * @param praObj (object)
				 * {  rptid(Int): 上报标识,
			 * 	  sTimes(Array): css、js加载耗时,
			 * 	  extraData (Array): 预留字段k1、k2的值，如[]
			 * }
				 */
				_speedSend: function (praObj) {
					var re = /^\d+$/
					var re2 = /[A-Za-z0-9]+/
					praObj.extraData = praObj.extraData || []
					if (re.test(praObj.rptid) && praObj.sTimes.length >= 2 && re.test(praObj.sTimes[0]) && re.test(praObj.sTimes[1])) {
						var ds = ['t=0', 'p=' + praObj.rptid, 'f1=' + praObj.sTimes[0], 'f2=' + praObj.sTimes[1]]
						for (var i = 0; i < praObj.extraData.length; i++) {
							if (re2.test(praObj.extraData[i]))
								ds.push('k' + i + '=' + praObj.extraData[i])
						}
						if (praObj.netType) ds.push('n=' + praObj.netType)
						var src = this.makeUrl(ds)
						this.send(src)
					}
				},
				//srpt.speedSend({rptid:14, sTimes:[G_times[1], G_times[2]], extraData: ['', '']})
				speedSend: function (praObj) {
					var self = this
					mqq.device.getNetworkType(function (n) {
						if (-1 != n) {  //没网络放弃上报
							self._speedSend({
								rptid: praObj.rptid,
								netType: n,
								sTimes: praObj.sTimes,
								extraData: praObj.extraData
							})
						}
					})
				}
			}

			return (new SReport())
		},
		//===========end SpeedRPT
		/**
		 * 统一请求。含上报逻辑
		 * @param paraObj {
		 *  rptid: 上报标识,存在此字段才会上报否则不报,
		 * 	url: 请求URL,
		 * 	data: 请求参数,
		 * 	type: 请求类型，默认post,
		 *  onSuccess:function(){},
		 *  onError:function(){}
		 * }
		 */
		loanHttp: function(paraObj){
			var params = paraObj || {}
			var t1 = (new Date()).getTime()
			var srpt = new CashLoanLib.SpeedRPT()
			$.ajax({
				url: params.url,
				data: params.data,
				type: params.type || 'POST',
				dataType: 'json',
				timeout: CashLoanLib.gTimeout,
				success: function(data){
					if(/^\d+$/.test(paraObj.rptid)){
						srpt.cgiSend({  rptid: paraObj.rptid || '',
							retCode: data.retcode,
							sTime: (new Date()).getTime() - t1,
							extraData: []
						})
					}
					if(typeof paraObj.onSuccess == 'function')
						paraObj.onSuccess(data)
				},
				error: function(data, type){
					if(/^\d+$/.test(paraObj.rptid)){
						srpt.cgiSend({  rptid: paraObj.rptid || '',
							retCode: data.retcode,
							sTime: (new Date()).getTime() - t1,
							extraData: []
						})
					}
					if(typeof paraObj.onError == 'function')
						paraObj.onError(data, type)
				},
				complete: function(){}
			})
		},


		
		cache : {
			set: function(key, val){
				if(!!window.sessionStorage){
					try{
						sessionStorage.setItem(key, val);
					}
					catch(e){
					}
				}else{//只能存cookie
					this.setCookie(key,value);
				}
			},
			get: function(key){
				if(!!window.sessionStorage){
					return sessionStorage.getItem(key);
				}else{
					return this.getCookie(key);
				}
				return null;
			},
			remove : function(key){
				if(!!window.sessionStorage){
					try{
						sessionStorage.removeItem(key);
					}catch(e){
						
					}
				}else{
					this.delCookie(key);
				}
			}
		},

		storage : {
			set: function(key, val){
				if(!!window.localStorage){
					try{
						localStorage.setItem(key, val);
					}
					catch(e){
					}
				}
			},
			get: function(key){
				if(!!window.localStorage){
					return localStorage.getItem(key);
				}
				return null;
			},
			remove : function(key){
				if(!!window.localStorage){
					try{
						localStorage.removeItem(key);
					}catch(e){
						
					}
				}
			}
		},

		/**
		 * 浮点数乘法运算
		 * @param arg1
		 * @param arg2
		 * @returns {number}
		 */
		accMul: function (arg1, arg2) {
		     var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
		     try {
			        m += s1.split(".")[1].length;
			     }
		     catch (e) {
			     }
		     try {
			         m += s2.split(".")[1].length;
			     }
		     catch (e) {
			     }
		     return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
		},
		getScript: function(o){
			var n = $(document.createElement("script"));
			
			n.attr({
				"src"     : o.url,
				"charset" : o.charset||"utf-8"
			});
			
			n.on("load",function(e){o.success && o.success();});
			n.on("error",function(e){o.error && o.error();});
			
			$("head").append(n);
		},
		
		reportPV: function(domain, url){
			var src = 'http://pingjs.qq.com/tcss.ping.js';
			if(/^https:/.test(location.href)){
				src = 'https://img.tenpay.com/res/js/stat/ping_tcss_https.3.1.0.js';
			}

			this.getScript({
				url: src,
				success: function(){
					if(typeof(pgvMain) == "function"){
						pgvMain({
							"virtualDomain" : domain,
							"virtualURL" : url,
							"repeatApplay" : "true"
						});
					}
				}
			});
		},
		
		isOpenInMqq : function(){
			if(/^https:/.test(location.href) && '0' == mqq.QQVersion){
				location.href = "/cashloan/v2/error_page.html?_bid=" + this.bid;
			}
		},
		
		base64encode : function (input) {
			var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			var utf8Encode = function (string) {
				string = string.replace(/\r\n/g,"\n");
				var utftext = "";
				for (var n = 0; n < string.length; n++) {
					var c = string.charCodeAt(n);
					if (c < 128) {
						utftext += String.fromCharCode(c);
					} else if((c > 127) && (c < 2048)) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128);
					} else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128);
					}
		 
				}
				return utftext;
			};

			input = utf8Encode(input);

			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output +
				keyStr.charAt(enc1) + keyStr.charAt(enc2) +
				keyStr.charAt(enc3) + keyStr.charAt(enc4);
			}
			return output;
		},
		
		notWhiteList : function(){
			location.href = "/cashloan/v2/white_list.html?_bid="+this.bid;
		},
		
		compareVersion : function(a, b){
	        a = String(a).split('.');
	        b = String(b).split('.');
	        try{
	            for(var i = 0, len = Math.max(a.length, b.length); i<len; i++){
	                var l=isFinite(a[i]) && Number(a[i]) || 0,
	                    r=isFinite(b[i]) && Number(b[i]) || 0;
	                if(l<r){
	                    return -1;
	                }else if(l>r){
	                    return 1;
	                }
	            }
	        }catch(e){
	            return -1;
	        }
	        return 0;
    	},
    	
    	isSupportVersion : function(){
    		//判断版本
			var version = mqq.compare("5.4.0");
			if(version < 0 ){
				this.showDialog({text : '您需要将手机QQ升级到v5.4以上版本才能借款。点击【确定】按钮去更新', callBack : function(){
					if(0==ret.button){window.location.replace('http://im.qq.com/mobileqq/touch/index.html');}
					else{
						mqq.ui.popBack();
					}
				}});
				return;
			}
    	},
    	
    	yellowTips : function(tipsId){
    		if(!tipsId) return;
    		var self = this;
    		var paramObj = {tips_id : tipsId, g_tk : self.getACSRFToken(), sid : self.getParameter("sid")};
    		var tips_cgi = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/tips.cgi';
    		$.ajax({
				url: tips_cgi,
				data: paramObj,
				type: 'get',
				dataType: 'json',
				timeout: CashLoanLib.gTimeout,
				success: function(data){
					if("0" == data.retcode && data.tips){
						//判断优先级 4 不覆盖
						var tipsContainer = $("div.announce");
						var tips_text = $("span.announce-text");
						var isBlueTips = tipsContainer.hasClass('announce-blue');
						var isYellowTips = false;
						var blueTips = tips_text.html();
						
						//是否为小黄条
						if(!isBlueTips && !tipsContainer.hasClass('hide')){
							isYellowTips = true;
						}
						
						var flag = false;
						if("4" != data.priority){//强制覆盖
							tipsContainer.removeClass('announce-blue');
							tips_text.html(data.tips);
							flag = true;
						}else{
							if(tipsContainer.hasClass('hide')){
								tips_text.html(data.tips);
								flag = true;
							}
						}
						tipsContainer.removeClass('hide');
						if(flag && data.show_time && "-1" != data.show_time){
							setTimeout(function(){
								tipsContainer.addClass('hide');
								//恢复小蓝条
								if(isBlueTips){
									tips_text.html(blueTips);
									tipsContainer.addClass('announce-blue').removeClass('hide');
								}
								
								//恢复小黄条
								if(isYellowTips){
									tips_text.html(blueTips);
								}
							}, Number(data.show_time)* 1000);
						}
					}
				}
			});
    	}
	};
	/**
	 * 获取系统版本
	 */
	(function($){
		//创建一个detect函数，参数为ua
		function detect(ua, platform){
			var os = this.os = {}, browser = this.browser = {},
		      webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
		      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
		      osx = !!ua.match(/\(Macintosh\; Intel /),
		      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
		      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
		      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
		      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
		      win = /Win\d{2}|Windows/.test(platform),
		      wp = ua.match(/Windows Phone ([\d.]+)/),
		      touchpad = webos && ua.match(/TouchPad/),
		      kindle = ua.match(/Kindle\/([\d.]+)/),
		      silk = ua.match(/Silk\/([\d._]+)/),
		      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
		      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
		      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
		      playbook = ua.match(/PlayBook/),
		      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
		      firefox = ua.match(/Firefox\/([\d.]+)/),
		      firefoxos = ua.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
		      ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
		      webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
		      safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

		    // Todo: clean this up with a better OS/browser seperation:
		    // - discern (more) between multiple browsers on android
		    // - decide if kindle fire in silk mode is android or not
		    // - Firefox on Android doesn't specify the Android version
		    // - possibly devide in os, device and browser hashes

		    if (browser.webkit = !!webkit) browser.version = webkit[1]

		    if (android) os.android = true, os.version = android[2]
		    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
		    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
		    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
		    if (wp) os.wp = true, os.version = wp[1]
		    if (webos) os.webos = true, os.version = webos[2]
		    if (touchpad) os.touchpad = true
		    if (blackberry) os.blackberry = true, os.version = blackberry[2]
		    if (bb10) os.bb10 = true, os.version = bb10[2]
		    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
		    if (playbook) browser.playbook = true
		    if (kindle) os.kindle = true, os.version = kindle[1]
		    if (silk) browser.silk = true, browser.version = silk[1]
		    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
		    if (chrome) browser.chrome = true, browser.version = chrome[1]
		    if (firefox) browser.firefox = true, browser.version = firefox[1]
		    if (firefoxos) os.firefoxos = true, os.version = firefoxos[1]
		    if (ie) browser.ie = true, browser.version = ie[1]
		    if (safari && (osx || os.ios || win)) {
		      browser.safari = true
		      if (!os.ios) browser.version = safari[1]
		    }
		    if (webview) browser.webview = true

		    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
		      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
		    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
		      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
		      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
		  }

		  detect.call($, navigator.userAgent, navigator.platform)
		  // make available to unit tests
		  $.__detect = detect
	})($);
	
	;(function(){
		'use strict';function FastClick(layer,options){var oldOnClick;options=options||{};this.trackingClick=false;this.trackingClickStart=0;this.targetElement=null;this.touchStartX=0;this.touchStartY=0;this.lastTouchIdentifier=0;this.touchBoundary=options.touchBoundary||10;this.layer=layer;this.tapDelay=options.tapDelay||200;this.tapTimeout=options.tapTimeout||700;if(FastClick.notNeeded(layer)){return}function bind(method,context){return function(){return method.apply(context,arguments)}}var methods=['onMouse','onClick','onTouchStart','onTouchMove','onTouchEnd','onTouchCancel'];var context=this;for(var i=0,l=methods.length;i<l;i++){context[methods[i]]=bind(context[methods[i]],context)}if(deviceIsAndroid){layer.addEventListener('mouseover',this.onMouse,true);layer.addEventListener('mousedown',this.onMouse,true);layer.addEventListener('mouseup',this.onMouse,true)}layer.addEventListener('click',this.onClick,true);layer.addEventListener('touchstart',this.onTouchStart,false);layer.addEventListener('touchmove',this.onTouchMove,false);layer.addEventListener('touchend',this.onTouchEnd,false);layer.addEventListener('touchcancel',this.onTouchCancel,false);if(!Event.prototype.stopImmediatePropagation){layer.removeEventListener=function(type,callback,capture){var rmv=Node.prototype.removeEventListener;if(type==='click'){rmv.call(layer,type,callback.hijacked||callback,capture)}else{rmv.call(layer,type,callback,capture)}};layer.addEventListener=function(type,callback,capture){var adv=Node.prototype.addEventListener;if(type==='click'){adv.call(layer,type,callback.hijacked||(callback.hijacked=function(event){if(!event.propagationStopped){callback(event)}}),capture)}else{adv.call(layer,type,callback,capture)}}}if(typeof layer.onclick==='function'){oldOnClick=layer.onclick;layer.addEventListener('click',function(event){oldOnClick(event)},false);layer.onclick=null}}var deviceIsWindowsPhone=navigator.userAgent.indexOf("Windows Phone")>=0;var deviceIsAndroid=navigator.userAgent.indexOf('Android')>0&&!deviceIsWindowsPhone;var deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent)&&!deviceIsWindowsPhone;var deviceIsIOS4=deviceIsIOS&&(/OS 4_\d(_\d)?/).test(navigator.userAgent);var deviceIsIOSWithBadTarget=deviceIsIOS&&(/OS [6-7]_\d/).test(navigator.userAgent);var deviceIsBlackBerry10=navigator.userAgent.indexOf('BB10')>0;FastClick.prototype.needsClick=function(target){switch(target.nodeName.toLowerCase()){case'button':case'select':case'textarea':if(target.disabled){return true}break;case'input':if((deviceIsIOS&&target.type==='file')||target.disabled){return true}break;case'label':case'iframe':case'video':return true}return(/\bneedsclick\b/).test(target.className)};FastClick.prototype.needsFocus=function(target){switch(target.nodeName.toLowerCase()){case'textarea':return true;case'select':return!deviceIsAndroid;case'input':switch(target.type){case'button':case'checkbox':case'file':case'image':case'radio':case'submit':return false}return!target.disabled&&!target.readOnly;default:return(/\bneedsfocus\b/).test(target.className)}};FastClick.prototype.sendClick=function(targetElement,event){var clickEvent,touch;if(document.activeElement&&document.activeElement!==targetElement){document.activeElement.blur()}touch=event.changedTouches[0];clickEvent=document.createEvent('MouseEvents');clickEvent.initMouseEvent(this.determineEventType(targetElement),true,true,window,1,touch.screenX,touch.screenY,touch.clientX,touch.clientY,false,false,false,false,0,null);clickEvent.forwardedTouchEvent=true;targetElement.dispatchEvent(clickEvent)};FastClick.prototype.determineEventType=function(targetElement){if(deviceIsAndroid&&targetElement.tagName.toLowerCase()==='select'){return'mousedown'}return'click'};FastClick.prototype.focus=function(targetElement){var length;if(deviceIsIOS&&targetElement.setSelectionRange&&targetElement.type.indexOf('date')!==0&&targetElement.type!=='time'&&targetElement.type!=='month'){length=targetElement.value.length;targetElement.setSelectionRange(length,length)}else{targetElement.focus()}};FastClick.prototype.updateScrollParent=function(targetElement){var scrollParent,parentElement;scrollParent=targetElement.fastClickScrollParent;if(!scrollParent||!scrollParent.contains(targetElement)){parentElement=targetElement;do{if(parentElement.scrollHeight>parentElement.offsetHeight){scrollParent=parentElement;targetElement.fastClickScrollParent=parentElement;break}parentElement=parentElement.parentElement}while(parentElement)}if(scrollParent){scrollParent.fastClickLastScrollTop=scrollParent.scrollTop}};FastClick.prototype.getTargetElementFromEventTarget=function(eventTarget){if(eventTarget.nodeType===Node.TEXT_NODE){return eventTarget.parentNode}return eventTarget};FastClick.prototype.onTouchStart=function(event){var targetElement,touch,selection;if(event.targetTouches.length>1){return true}targetElement=this.getTargetElementFromEventTarget(event.target);touch=event.targetTouches[0];if(deviceIsIOS){selection=window.getSelection();if(selection.rangeCount&&!selection.isCollapsed){return true}if(!deviceIsIOS4){if(touch.identifier&&touch.identifier===this.lastTouchIdentifier){event.preventDefault();return false}this.lastTouchIdentifier=touch.identifier;this.updateScrollParent(targetElement)}}this.trackingClick=true;this.trackingClickStart=event.timeStamp;this.targetElement=targetElement;this.touchStartX=touch.pageX;this.touchStartY=touch.pageY;if((event.timeStamp-this.lastClickTime)<this.tapDelay){event.preventDefault()}return true};FastClick.prototype.touchHasMoved=function(event){var touch=event.changedTouches[0],boundary=this.touchBoundary;if(Math.abs(touch.pageX-this.touchStartX)>boundary||Math.abs(touch.pageY-this.touchStartY)>boundary){return true}return false};FastClick.prototype.onTouchMove=function(event){if(!this.trackingClick){return true}if(this.targetElement!==this.getTargetElementFromEventTarget(event.target)||this.touchHasMoved(event)){this.trackingClick=false;this.targetElement=null}return true};FastClick.prototype.findControl=function(labelElement){if(labelElement.control!==undefined){return labelElement.control}if(labelElement.htmlFor){return document.getElementById(labelElement.htmlFor)}return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea')};FastClick.prototype.onTouchEnd=function(event){var forElement,trackingClickStart,targetTagName,scrollParent,touch,targetElement=this.targetElement;if(!this.trackingClick){return true}if((event.timeStamp-this.lastClickTime)<this.tapDelay){this.cancelNextClick=true;return true}if((event.timeStamp-this.trackingClickStart)>this.tapTimeout){return true}this.cancelNextClick=false;this.lastClickTime=event.timeStamp;trackingClickStart=this.trackingClickStart;this.trackingClick=false;this.trackingClickStart=0;if(deviceIsIOSWithBadTarget){touch=event.changedTouches[0];targetElement=document.elementFromPoint(touch.pageX-window.pageXOffset,touch.pageY-window.pageYOffset)||targetElement;targetElement.fastClickScrollParent=this.targetElement.fastClickScrollParent}targetTagName=targetElement.tagName.toLowerCase();if(targetTagName==='label'){forElement=this.findControl(targetElement);if(forElement){this.focus(targetElement);if(deviceIsAndroid){return false}targetElement=forElement}}else if(this.needsFocus(targetElement)){if((event.timeStamp-trackingClickStart)>100||(deviceIsIOS&&window.top!==window&&targetTagName==='input')){this.targetElement=null;return false}this.focus(targetElement);this.sendClick(targetElement,event);if(!deviceIsIOS||targetTagName!=='select'){this.targetElement=null;event.preventDefault()}return false}if(deviceIsIOS&&!deviceIsIOS4){scrollParent=targetElement.fastClickScrollParent;if(scrollParent&&scrollParent.fastClickLastScrollTop!==scrollParent.scrollTop){return true}}if(!this.needsClick(targetElement)){event.preventDefault();this.sendClick(targetElement,event)}return false};FastClick.prototype.onTouchCancel=function(){this.trackingClick=false;this.targetElement=null};FastClick.prototype.onMouse=function(event){if(!this.targetElement){return true}if(event.forwardedTouchEvent){return true}if(!event.cancelable){return true}if(!this.needsClick(this.targetElement)||this.cancelNextClick){if(event.stopImmediatePropagation){event.stopImmediatePropagation()}else{event.propagationStopped=true}event.stopPropagation();event.preventDefault();return false}return true};FastClick.prototype.onClick=function(event){var permitted;if(this.trackingClick){this.targetElement=null;this.trackingClick=false;return true}if(event.target.type==='submit'&&event.detail===0){return true}permitted=this.onMouse(event);if(!permitted){this.targetElement=null}return permitted};FastClick.prototype.destroy=function(){var layer=this.layer;if(deviceIsAndroid){layer.removeEventListener('mouseover',this.onMouse,true);layer.removeEventListener('mousedown',this.onMouse,true);layer.removeEventListener('mouseup',this.onMouse,true)}layer.removeEventListener('click',this.onClick,true);layer.removeEventListener('touchstart',this.onTouchStart,false);layer.removeEventListener('touchmove',this.onTouchMove,false);layer.removeEventListener('touchend',this.onTouchEnd,false);layer.removeEventListener('touchcancel',this.onTouchCancel,false)};FastClick.notNeeded=function(layer){var metaViewport;var chromeVersion;var blackberryVersion;if(typeof window.ontouchstart==='undefined'){return true}chromeVersion=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1];if(chromeVersion){if(deviceIsAndroid){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport){if(metaViewport.content.indexOf('user-scalable=no')!==-1){return true}if(chromeVersion>31&&document.documentElement.scrollWidth<=window.outerWidth){return true}}}else{return true}}if(deviceIsBlackBerry10){blackberryVersion=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);if(blackberryVersion[1]>=10&&blackberryVersion[2]>=3){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport){if(metaViewport.content.indexOf('user-scalable=no')!==-1){return true}if(document.documentElement.scrollWidth<=window.outerWidth){return true}}}}if(layer.style.msTouchAction==='none'){return true}if(layer.style.touchAction==='none'){return true}return false};FastClick.attach=function(layer,options){return new FastClick(layer,options)};window.FastClick = FastClick;
	})();

	/*
	* 新借款记录
	* key: w_loan_records
	* val: {loanid1: ts1, loanid2: ts2}
	**/
	var newLoanRecord = {
		getKey: function(uin){
			if(uin){
				return 'w_loan_records_' + uin;
			}
			return '';
		},
		clean: function(uin){
			var key = this.getKey(uin);
			if(key){
				CashLoanLib.storage.remove(key);
			}
		},
		remove: function(uin, loanId){
			var records = this.getAll(uin);

			if(loanId in records){
				delete records[loanId];

				var isEmpty = true

				for(var p in records){
					isEmpty = false
				}

				// 无记录，清除key
				if(isEmpty){
					this.clean(uin);
				}
				else{
					var key = this.getKey(uin);
					if(key){
						CashLoanLib.storage.set(key, JSON.stringify(records));
					}
				}
			}
		},
		getAll: function(uin){
			var key = this.getKey(uin);
			if(key){
				var records = CashLoanLib.storage.get(key);
				if(records){
					records = JSON.parse(records);
					return records;
				}
				return {};
			}
			return {};
		},
		/*
		* ts 借款时间
		* curTs 当前时间
		**/
		isOutdate: function(ts, curTs){
			var time = 24 * 60 * 60;	//24小时
			if( parseInt(curTs, 10) - parseInt(ts, 10) > time ){
				return true;
			}
			return false;
		},
		add: function(uin, record){

			var key = this.getKey(uin);

			var records = this.getAll(uin);

			// 新增记录前检查是否过期，过期清除
			for(var p in records){

				var ts = records[p];
				
				if(this.isOutdate(ts, record.ts)){
					delete records[p];
				}
			}

			// 增加记录
			records[record.loanId] = record.ts;

			CashLoanLib.storage.set(key, JSON.stringify(records));

		}
	};

	// publish newLoanRecord
	CashLoanLib.newLoanRecord = newLoanRecord;

	var Loading = (function(){
		var id = 'mqqLoading'
		var loadingIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAA3NCSVQICAjb4U/gAAAAD1BMVEX////////d3d27u7uZmZko4XLpAAAABXRSTlMA/////xzQJlIAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAACLUlEQVRoge2ZW3LCMAxF06AFNDtgsgJmvAF/eP9raiE01sN6GFPKdKKfJrHu8ZWcOFCm6d1jWcb0H8vyOWhg0MIBeAgwr2cdACW7gHVddUApxTewYgsUAN8Az8JTAKgGCihRQLVAABABTB7A07MaCCBkYBxAa8CAWAUbYLeAASUImC1AjgLOEhBbxGtYgIie1IAAYQPjAFxDBcQrIAtZAdFFvMasAXIP4EwB8UW8RgXsrzavBSkJC9PdwvZXGKC4U0qXNqDmUwDQ05QooQ2genKeGMEDAF/UxAgz2ZqF5U0vAaiR3ABtWhGAkyBYcddnfC11EIo00EVo6/ciLk0RCmgV0EFQ9UGCoY+1QWkAJRgWwNTLG1ID6AkxgD6+NdIDZANwI1jj/r528pbR0R9xxN9FwfFAOpAr2dPL9EKjy8At/R8Ahps4vIxHHPGO4bw93ZcrOPe397iB80B645P3RIPzCLpbAtgPsb+n/Owmpt5ropoDvgEzKaQ30oJ6PbF/U31U3861l0chZHkJX5AqI13cgiCaBPYXT26p3SSCkwBekgUQX76ZZT7cmIIX2VgUOiDuHXPJajagg/i7GCpgl4Gw4AGqF+7Kj6IBojWgyaqqowk4lR3m1wBwJgKEawALELFAZuLHEUCxAJEayERYE2wCTRMnuSF5MoBmEUCoBvAAngU2izyLAFAOBcArAOy3qCJOPT37IMcA/f9C6diGDsCvAaDjNwHNwpj+BfEFQjM+IjyfrPAAAAAASUVORK5CYII='
		var config = {
			tpl: '<div id="'+id+'" class="cpm-dialog-mod cpm-hide">\
						<div class="cpm-mask"><!-- 遮罩 --></div>\
						<!-- 美丽的菊花 -->\
						<i class="cpm-load-icon"></i>\
					</div>',
			style: '\
					.cpm-mask {\
					   position:fixed; top:0px; right:0px; bottom:0px; left:0px; z-index:96; width:100%; height:100%;\
					   background-color:rgba(0, 0, 0, 0.2);\
					}\
					.cpm-dialog-mod {\
					   position:fixed; top:0px; right:0px; bottom:0px; left:0px; z-index:11111; width:100%; height:100%;\
					   display:-webkit-box;\
					   display:-ms-flexbox;\
					   -webkit-box-orient:vertical;\
					   -webkit-box-pack:center;\
					   /*-webkit-box-align:center;*/\
					   -ms-flex-direction:column;\
					   -ms-flex-pack:center;\
					   /*-ms-flex-align:center;*/\
					}\
					.cpm-load-icon {\
					   position:fixed; z-index:11112; display:inline-block; top:50%; left:50%; width:40px; height:40px; margin-top:-20px; margin-left:-20px;\
					   background:url("'+loadingIcon+'") no-repeat; background-size:40px auto;\
					   -webkit-animation:dialogLoading 1s linear infinite;\
					}\
					@-webkit-keyframes dialogLoading {\
					   0% { -webkit-transform:rotate(0deg); }\
					   100% { -webkit-transform:rotate(360deg); }\
					}\
					.cpm-hide{\
					display: none!important;\
					}'
		}
	
		var show = function(){
			$('body').append(config.tpl)
			$('#' + id).removeClass('cpm-hide')
		}
	
		var addStyle = function(){
			var id = id + '_css'
			if($('#'+id).length){
				return
			}
			$('<style id="'+id+'" type="text/css">' + config.style + '</style>').appendTo('head')
		}
	
		var hide = function(){
			$('#' + id).remove()
		}
	
		addStyle()
	
		return {
			show: show,
			hide: hide
		}
	})();

	function init(){
		//全局按钮样式
		$('.btn').on('touchstart', function(e){
			$(this).not('.btn-disable').addClass('press')
			//return false
			//e.preventDefault()
		}).on('touchend', function(e){
			$(this).removeClass('press')
		})
		CashLoanLib.isOpenInMqq();
		CashLoanLib.isSupportVersion();
		mqq.ui.setWebViewBehavior({actionButton: 0});
	}
	
	init();
	
	window.cashLoanLib = CashLoanLib;
	window.loading = Loading;
})();