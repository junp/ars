/**
 * Created by junpzheng on 2015/5/7.
 */
define(function(require, exports, module){
    var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl

    var baseCgiPath = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/';

	//分期列表
    var CONST_THIS_BILL_LIST_CGI = baseCgiPath + 'xjdloan_period_repay_plan_summary.cgi';

	var CONST_THIS_BILL_DETAIL_CGI = baseCgiPath + 'xjdloan_period_repay_plan_detail.cgi'

    var g_tk = cashLoanLib.getACSRFToken();

	var fenToYuan = function(num, decimals){
		var yuan = num / 100;

		var tmp = (yuan + '').split('.');

		var len = tmp.length;

		switch (len)
		{
			case 1:
				return yuan + '.00';
			case 2:
				var tail = tmp[1] + ''
				if(tail.length ===0){
					return yuan + '.00';
				}
				else if(tail.length === 1){
					return yuan + '0';
				}
				else{
					return yuan;
				}
			default:
				return yuan;
		}
	};

	function RepayDetail(){
		this.init();
	}
	RepayDetail.prototype = {
		init: function(){
			loading.show();
			this.render();
			this.bindEvent();
		},
		/*
		* 更新利息，本金
		**/
		update: function(data, unpayAmt){
			if(data['loansRecords'] && data['loansRecords'].length){
				var records = data['loansRecords'];

				var principal = 0, interest = 0;

				$(records).each(function(i, o){
					principal += parseInt(o['PRINCIPAL_' + i], 10);
					interest += parseInt(o['INTEREST_' + i], 10);
				})

				// 验证还款金额=本金+利息
				if(principal + interest === parseInt(unpayAmt, 10)){
					$('#principal').html('&yen;' + fenToYuan(principal));
					$('#interest').html('&yen;' + fenToYuan(interest));
				}
				
				if(!isNaN(data.loan_num)){
					$('#loanNum').html(data.loan_num).parent().removeClass('hide');
				}
			}
		},
		getBillData: function(curr_repay){
            var self = this
            var params = {
				g_tk : g_tk,
				amount : curr_repay.overdue_unpay,
				sid: cashLoanLib.getParameter("sid")
			}

            cashLoanLib.loanHttp({
                rptid: '',
                url: CONST_THIS_BILL_LIST_CGI,
             	data: params,
             	type: 'POST',
                onSuccess:function(data){
                    var retcode = data.retcode + ''
                    if(retcode === '0'){
                        self.update(data, curr_repay.repay_money);
                    }else if(cashLoanLib.CONST_RET_ERR_NOT_LOGIN == data.retcode){
                        cashLoanLib.notLogin();
                    }else{
                        cashLoanLib.systemBusy(data);
                    }

                    loading.hide()
                },
                onError:function(data, type){
                    loading.hide();
                    if(type && "abort" == type){
                    	//不处理
                    }else if(type && "timeout" == type){
                    	cashLoanLib.requestTimeOut();
                    }else{
                    	cashLoanLib.systemBusy(data);
                    }
                }
            })
        },
		/*
		* 先显示session数据显示页面，再异步	
		**/
		render: function(){
			var self = this;

			// 1、从sesstion取个人中心还款信息
			var curr_repay = cashLoanLib.cache.get('curr_repay');

			if(curr_repay){
				curr_repay = JSON.parse(curr_repay);

				//分-》元，小数位补0
				curr_repay.fenToYuan = fenToYuan;
				
				//yyyyMMdd转yyyy/MM/dd
				var repay_time = curr_repay.repay_time + '';
				if(repay_time.length === 8){
					curr_repay.repay_time = repay_time.substring(0, 4) + '/' + repay_time.substring(4, 6)+ '/' + repay_time.substring(6, 8);
				}

				var tpl = $('#tplDetail').html();

				var html = template(tpl, curr_repay);
				
				$('#container').html(html);

				self.getBillData(curr_repay);
			}
			else{
				loading.hide();
				cashLoanLib.showDialog({text : '系统繁忙，请稍后再试。', callBack: function(){
					mqq.ui.popBack();
				}});
			}
		},
		
		bindEvent: function(){
			// 提前还清 
			$('#btnRepayAll').on('click', function(){
				cashLoanLib.openPage('/cashloan/v2/repay/repay_choose.html');
				return false;
			})

			// 完整还款计划
			$('#btnFullList').on('click', function(){
				cashLoanLib.openPage('/cashloan/v2/repay/repay_list.html');
				return false;
			})
		}
	}


    exports.init = function(){

		new RepayDetail();

		FastClick.attach(document.body);

        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0});

		mqq.ui.setOnCloseHandler(function(){
			cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155');
        })
		// 上报pv uv
		setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/repay/repay_detail.html')}, 1000)
    };
})