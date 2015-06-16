/**
 * 异常页面处理脚本
 */
define(function(require, exports, module){
	
	function AnomalyHandler(){
		this.init();
	}
	
	AnomalyHandler.prototype = {
		default_tpl : '\
			<p class="text">您的账户有异常</p>\
			<p class="text">为保证安全，暂时不能继续借钱</p>\
			<p class="gray">如有疑问, 请致电客服<a href="tel:075589468888">0755-89468888</a></p>\
		',
		
		//财付通黑灰名单开户拒绝
		tpl_125910057 : '\
			<p class="text">您的财付通账户异常，无法查看额度。</p>\
			<p class="gray">如有疑问，请致电财付通客服<a href="tel:075586013860">0755-86013860</a></p>\
		',
		
		//QQ盗号等级过高开户拒绝
		tpl_125910058 : '\
			<p class="text">您的QQ帐号异常，无法查看额度。</p>\
			<p class="gray">请前往<a href="http://aq.qq.com/cn2/mobile_index">QQ安全中心</a>查看帐号状态。</p>\
		',
		
		//其他欺诈拒绝开户拒绝
		tpl_125910059 : '\
			<p class="text">您未满足微众银行审批条件</p>\
			<p class="text">无法查看额度</p>\
			<p class="gray">如有疑问, 请致电客服<a href="tel:075589468888">0755-89468888</a></p>\
		',
		
		//财付通黑灰名单借钱拒绝
		tpl_125910060 : '\
			<p class="text">您的财付通账户异常，无法借款。</p>\
			<p class="gray">如有疑问，请致电财付通客服<a href="tel:075586013860">0755-86013860</a></p>\
		',
		
		//QQ盗号等级过高借钱拒绝
		tpl_125910061 : '\
			<p class="text">您的QQ帐号异常，无法借款。</p>\
			<p class="gray">请前往<a href="http://aq.qq.com/cn2/mobile_index">QQ安全中心</a>查看帐号状态。</p>\
		',
			
		//其它欺诈借钱拒绝
		tpl_125910050 : '\
			<p class="text">您未满足微众银行审批条件，无法查看额度。</p>\
			<p class="gray">如有疑问, 请致电客服<a href="tel:075589468888">0755-89468888</a></p>\
		',
		
		init : function(){
			var code = cashLoanLib.getParameter("code");
			var html = this.getHtmlByCode(code);
			this.showTpl(html);
		},
		
		getHtmlByCode : function(code){
			var ret = Number(code);
			var tpl = "";
			switch (ret) {
				case 125910057 : //财付通黑灰名单开户拒绝
					tpl = this.tpl_125910057;
					break;
				case 125910058 ://QQ盗号等级过高开户拒绝
					tpl = this.tpl_125910058;
					break;
				case 125621113 :
				case 125621114 :
				case 125910059 : //其他欺诈拒绝开户拒绝
					tpl = this.tpl_125910059;
					break;
				case 125910060 :  //财付通黑灰名单借钱拒绝
					tpl = this.tpl_125910060;
					break;
				case 125910061 : //QQ盗号等级过高借钱拒绝
					tpl = this.tpl_125910061;
					break;
				case 125620089 :  //其他欺诈拒绝开户拒绝
				  tpl = this.tpl_125910059;
					break;
				default :
					$("div.main-txt-wrap").addClass("blue");
					tpl = this.default_tpl;
					break;
			}
			return tpl;
		},
		
		showTpl : function(msg){
			$("#msg_tpl").html(msg);
		}
	}
	
	exports.init = function(){
		new AnomalyHandler();
		// 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/anomaly.html');}, 1000);
	};
});