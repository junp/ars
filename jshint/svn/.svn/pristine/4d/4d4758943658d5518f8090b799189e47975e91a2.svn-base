/**
 * Created by ronnyliang on 2015/1/16.
 */
define(function(require, exports, module){
    var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl
    //var moment = require('moment/moment').moment
    var iScroll = require('../../../../lib/sea-modules/iScroll/iscroll-lite').iScroll
	//var bankTypeMap = require('../banktype_map')
    //var mqq = require('../../../lib/sea-modules/qqapi/qqapi')
    //var util = require('../../../lib/sea-modules/util/util')
    //var loading = require('../../../../lib/sea-modules/ui/loading')
    //var FastClick = require('../../../../lib/sea-modules/fastclick/fastclick')
    //var cashLoanLib = require('../cash_loan_lib.js')

    var baseCgiPath = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/'
    //银行列表
    var CONST_REPAY_BANK_CGI = baseCgiPath + 'xjdloan_query_bank.cgi'
    //拉密码验证前置信息
    var GET_PWD_SIGN_INFO_CGI = baseCgiPath + 'xjdloan_mqq_apply.cgi'
    //本期逾期下单
    var CONST_REPAY_THIS_INIT_CGI = baseCgiPath + 'xjdloan_repay_init.cgi'
    //提前结清下单
    var CONST_REPAY_CHOOSE_INIT_CGI = baseCgiPath + 'xjdloan_bills_payoff_init.cgi'
    //支付下单确认
    var CONST_REPAY_COMFIRM_INIT_CGI = baseCgiPath + 'xjdloan_pay_confirm.cgi'

    var g_tk = cashLoanLib.getACSRFToken();

	// 服务器/客户端时间差，由xjdloan_query_bank.cgi返回
	var g_ts_diff = 0

	// 判断时间范围
	var checkTimeRange = function(startTime, endTime, curTime){
		var startHms = startTime.split(':')
		var endHms = endTime.split(':')

		var newStartTime = new Date(curTime.getTime())
		var newEndTime = new Date(curTime.getTime())

		newStartTime.setHours(startHms[0])
		newStartTime.setMinutes(startHms[1])
		newStartTime.setSeconds(startHms[2])

		newEndTime.setHours(endHms[0])
		newEndTime.setMinutes(endHms[1])
		newEndTime.setSeconds(endHms[2])

		if(curTime.getTime() >= newStartTime.getTime() && curTime.getTime() <= newEndTime.getTime()){
			return true		
		}
		
		return false
	}

    function Repay_bank(){
        this.session_key = ''
		// 标记是否继续还款
		this.isContinuePay = false
        this.params = {
            g_tk: g_tk,
            bank_card_no: '',
            bank_type: '',
            bind_serialno: '',
            repay_type: '',
            sid : cashLoanLib.getParameter("sid")
        }
        var choose_bill = cashLoanLib.cache.get('choose_bill')
        //还款方式不同，参数不同
        //提前结清
        if(choose_bill && choose_bill == '1'){
            var amount = cashLoanLib.cache.get('amount')
            var repay_type = '3' //cashLoanLib.cache.get('repay_type')
            var receipt_count = cashLoanLib.cache.get('receipt_count')//util.getParameter('receipt_count')
            var receipt_no_list = cashLoanLib.cache.get('receipt_no_list')//util.getParameter('receipt_no_list')
            this.repayFrom_url = location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_choose.html'
            //参数没带过来
            if(!receipt_count|| parseInt(receipt_count, 10) == 0 || !receipt_no_list)
                mqq.ui.showDialog({title:'',text:'请选择需要提前还清的借款',needOkBtn:true,needCancelBtn:false,okBtnText:'知道了'}, function(){
                    //mqq.ui.popBack()
                    //location.href = 'repay_choose.html?_bid=2061'
                    cashLoanLib.openPage(this.repayFrom_url)
                })
            this.params['amount'] = amount
            this.params['repay_type'] = repay_type
            this.params['receipt_count'] = receipt_count
            this.params['receipt_no_list'] = receipt_no_list
            this.repay_cgi = CONST_REPAY_CHOOSE_INIT_CGI
            this.repayCGIRPTID = 21
        }else{ //本期逾期
            var repay_type = '1' //util.getParameter('repay_type')
            var amount = cashLoanLib.cache.get('amount') //util.getParameter('amount')
            this.repayFrom_url = location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_list_overdue.html'
            if(!repay_type || !amount || parseInt(amount, 10) == 0)
                mqq.ui.showDialog({title:'',text:'逾期还款流程错误，请从重新开始',needOkBtn:true,needCancelBtn:false,okBtnText:'知道了'}, function(){
                    //mqq.ui.popBack()
                    //location.href = 'repay_list_overdue.html?_bid=2061'
                    cashLoanLib.openPage(this.repayFrom_url)
                })
            this.params['repay_type'] = repay_type
            this.params['amount'] = amount
            this.repay_cgi = CONST_REPAY_THIS_INIT_CGI
            this.repayCGIRPTID = 20
        }
        this.init()
    }

    Repay_bank.prototype = {
        /*
         * 事件处理
         * */
        myEventHandle: function(e){
            var self = this
            var el = e.target || e.srcElement
            switch (true){
                case $(el).is('select') :
                        //zepto hack
                        var opt = $('option').not(function(){ return !this.selected })
                        if($(el).val() == 0){
                            //$(el)[0].options.selectedIndex = self.selectedBank
                            self.addNewCard()
                        }else{
                            //self.selectedBank = $(el)[0].options.selectedIndex
                            self.params['bank_card_no'] = $(opt).attr('ext-data1')
                            self.params['bank_type'] = $(opt).attr('ext-data2')
                            self.params['bind_serialno'] = $(opt).attr('ext-data4')
                            self.params['bank_name'] = $(opt).attr('ext-data5')
                        }
                    //console.log($('option').not(function(){if(!this.disabled) return this}))
                    //if(!self.selectedBank)  $(el)[0].options.selectedIndex = $('option').not(function(){if(this.disabled) return this}).index()
                    return false
                    break
                case $(el).is('#repay_imd') :
                    //$('#repay_imd').removeClass('btn-disable').addClass('press')
                    self.repay()
                    /**
                     * 直接跳转结果页面桩
                     * @type {{repayAmt: *, bankInfo: *, repayChannel: *, repayTime: (curr_repay.repay_time|*|borrow_money_obj.repay_time)}}

                    var pra = {
                        repayAmt: cashLoanLib.myParseFloat(8888),
                        bankInfo: '我的银行（8888）',
                        repayChannel: '主动还款',
                        repayTime: new Date()
                    }
                    pra = JSON.stringify(pra)
                    cashLoanLib.cache.set('repay_ret', pra)
                    location.href = 'repay_success.html'
                     */
                    //
                    return false
                    break
                case $(el).is('.show-enablebank') :
                    $('.poplayer').show()
                    return false
                    break
                case $(el).is('#close_pop') || $(el).is('.pop-btn-wrap') :
                    $('.poplayer').hide()
                    e.preventDefault()
                    return false
                    break
                default : return false
                    break
            }
        },
        init: function(){
            var self = this
            //zepto 绑多个事件异于jquery
            $('.container').on({'click':function(e){self.myEventHandle(e)},'change':function(e){self.myEventHandle(e)}})
            this.repayBankTpl = $('#repayBankTpl').html()
            this.getBankData()
        },
        /**
         * 拉起添加新卡页面
         * */
        addNewCard: function(){
            loading.show()
            mqq.tenpay.openTenpayView({
                userId : cashLoanLib.getCookieUin(),
                viewTag : 'bindNewCard',
                bargainor_id : cashLoanLib.bind_card_bargainor_id
            }, function(data){
                //console.log(data);
                if(data.resultCode == 0){//绑卡成功
                    location.reload(); //重刷页面
                }else{
                    //用户放弃绑卡，卡列表设置为初始状态
                    //可用的绑卡
                    var opt1 = $('option').not(function(){ return this.disabled  || this.value == '0' })
                    //所有绑卡，可用或不可用
                    //var opt2 = $('option').not(function(){ return this.value == '0' })
                    //console.log(opt1)
                    //var opt2 = $('option').not(function(){ return this.value != 'default' })
                    if(opt1.length == 0){
                        $('select').val(0)
                        //if( opt2.length<= 0)
                        //$('select').prepend('<option selected disabled="true" value="default">请选择您的银行卡</option>')
                        //else $('select')[0].options.selectedIndex = opt2.index()
                    } else if(opt1.length > 0){
                        $('select')[0].options.selectedIndex = opt1.index()
                    }
                        //$('select').val(opt1.value)
                }
                loading.hide()
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
        /**
         * 拉起密码验证页面
         * */
        _callPwdWidget : function(data, callBack){
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
            }, callBack);
        },
        myOnError: function(data, type){
            loading.hide()
            if(type && "abort" == type){
            	//不处理
            }else if(type && "timeout" == type){
            	cashLoanLib.requestTimeOut();
            }else{
            	cashLoanLib.systemBusy(data);
            }
            $('#repay_imd').removeClass('press')
            return false
        },
        payError: function(data){
            if(data && data.retcode){
                var msg = '错误码：' + data.retcode
            }
            var tx = '支付失败，请稍后再试。' + (msg ? msg : '')
            loading.hide()
            $('#repay_imd').removeClass('press')
            mqq.ui.showDialog({title:'',text:tx,needOkBtn:true,needCancelBtn:false,okBtnText:'确定'}, function(){
                //mqq.ui.popBack()
            })
            return false
        },
        writeObj: function (obj){
            var description = "";
            for(var i in obj){
                var property=obj[i];
                description+=i+" = "+property+"<br>";
            }
            return description
        },
    /**
         *  密码验证页面，成功后确认支付
         * */
        openIndentifyUI: function(payData){
            var self = this
            //self.handleRequest('', GET_PWD_SIGN_INFO_CGI, {uin : cashLoanLib.getCookieUin(), g_tk:g_tk}, function(data){
                if(0 == payData.retcode){
                    //调起密码界面
                    self._callPwdWidget(payData, function(retData){
                        if(retData && retData.resultCode == 0 && retData.data.pwd){
                            var mqq_code = retData.data.pwd
                        }else if(retData.resultCode == -1){   //用户主动放弃支付 隐藏菊花  不用提示
                            loading.hide()
                            $('#repay_imd').removeClass('press')
                            return false
                        }else{
                            self.payError(retData)
                            return false
                        }
                        //获取密码串后确认支付
                        self.handleRequest(22, CONST_REPAY_COMFIRM_INIT_CGI, {payinit_token:self.payinit_token,pay_passwd:mqq_code,session_key:self.session_key,g_tk:g_tk, sid : cashLoanLib.getParameter("sid")}, function(data){
                            //data = {
                            //    repay_no: '3523',
                            //    money: 18000,
                            //    bank_card_id: '招商银行(8888)',
                            //    bank_type: '112',
                            //    repay_time: '2015/01/29 09:09',
                            //}
                            if(0 == data.retcode){
                                var pra = {
                                    repayAmt: cashLoanLib.myParseFloat(data.money),
                                    bankInfo: data.bank_info,
                                    repayChannel: data.repay_channel,
                                    repayTime: data.repay_time
                                }
                                //if(mqq.dispatchEvent){
                                //    mqq.ui.openUrl({
                                //        url: 'repay_success.html',
                                //        target: 1,
                                //        style: 1,
                                //        animation: 0
                                //    });
                                    //mqq.dispatchEvent("open_seuccess", {repay_ret: pra})
                                //}
                                //else{
                                    pra = JSON.stringify(pra)
                                    cashLoanLib.cache.set('repay_ret', pra)
                                    //location.href = 'repay_success.html?ret=' + encodeURI(pra)
                                    //location.href = 'repay_success.html?_bid=2061'
                                    cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_success.html')
                                //}
                            }else if(cashLoanLib.CONST_ERR_CEP_PROCESSING == data.retcode){
                                mqq.ui.showDialog({title:'',text:'支付请求已提交，银行正在处理中，稍后将短信通知支付结果。',needOkBtn:true,needCancelBtn:false,okBtnText:'确定'},function(){
                                    cashLoanLib.cache.set('amount', '')
                                    //location.href = 'https://weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_bid=2061'
                                    cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155')
                                    return false
                                })
                            }else{
                                self.payError(data)
                            }
                            loading.hide()
                            return false
                        }, self.myOnError);
                        //loading.hide()
                        return false
                    });
                    //iOS叉掉验密没有回调 处理回调没关闭的情况
                    if(mqq.iOS){
                        setTimeout(function(){
                            loading.hide();
                            $('#repay_imd').removeClass('press')
                        }, 5000);
                    }
                }else if(cashLoanLib.CONST_RET_ERR_NOT_LOGIN == data.retcode){
                    cashLoanLib.notLogin()
                }else if(cashLoanLib.CONST_ERR_NOT_REPAY_TIME == data.retcode){
                    mqq.ui.showDialog({title:'',text:'每日凌晨0点至6点系统维护，无法进行还款，请您在其他时间操作。',needOkBtn:true,needCancelBtn:false,okBtnText:'知道了'},function(){})
                }else{
                    cashLoanLib.systemBusy();
                }
                //loading.hide()
                return false
            //}, self.myOnError);
        },

		/*
		银行限制
		<banks>
                <bank cft_banktype="4186" webank_banktype="103584099993" status="1">农业银行</bank>
                <bank cft_banktype="2126" webank_banktype="103584099993" status="1">农业银行</bank>
                <bank cft_banktype="2028" webank_banktype="104584000003" status="1">中国银行</bank>
                <bank cft_banktype="2029" webank_banktype="104584000003" status="1">中国银行</bank>
                <bank cft_banktype="2013" webank_banktype="105584000005" status="1">建设银行</bank>
                <bank cft_banktype="2019" webank_banktype="105584000005" status="1">建设银行</bank>
                <bank cft_banktype="2022" webank_banktype="105584000005" status="1">建设银行</bank>
                <bank cft_banktype="2041" webank_banktype="301584000016" status="1">交通银行</bank>
                <bank cft_banktype="2125" webank_banktype="302584043105" status="1">中信银行</bank>
                <bank cft_banktype="2014" webank_banktype="303584000004" status="1">光大银行</bank>
                <bank cft_banktype="2018" webank_banktype="304584040898" status="1">华夏银行</bank>
                <bank cft_banktype="2008" webank_banktype="305584000002" status="1">民生银行</bank>
                <bank cft_banktype="2016" webank_banktype="306584001261" status="1">广发银行</bank>
                <bank cft_banktype="2024" webank_banktype="307584007998" status="1">平安银行</bank>
                <bank cft_banktype="2011" webank_banktype="308584001016" status="1">招商银行</bank>
                <bank cft_banktype="2021" webank_banktype="309584000000" status="1">兴业银行</bank>
                <bank cft_banktype="2017" webank_banktype="310584000006" status="1">浦发银行</bank>
                <bank cft_banktype="2147" webank_banktype="313584005009" status="1">上海银行</bank>
                <bank cft_banktype="2172" webank_banktype="313584009000" status="1">东莞银行</bank>
                <bank cft_banktype="2023" webank_banktype="403584099005" status="1">邮储银行</bank>
        </banks>
		招行(2011)、中信(2125)、浦发(2017)、广发(2016)、农行(4186,2126)、民生银行卡(2008)在每天11：30~02：30时段发起还款
		* @return 1:23:30:00 - 23:59:59
		*		  2:00:00:00 - 02:30:00
		*		  0:非日切时间段
		*/
		checkBankLimit: function(bankType){
			
			if(-1 !== $.inArray(bankType, ['2011', '2125', '2017', '2016', '4186', '2126', '2008'])){

				var ts = new Date()
			
				// 校正时间
				ts = new Date(ts.getTime() - g_ts_diff)

				if( checkTimeRange('23:30:00', '23:59:59', ts) ){
					return 1
				}
				else if(checkTimeRange('00:00:00', '02:30:00', ts)){
					return 2;
				}
				else{
					return 0;
				}
			}

			return 0
		},
		
        repay: function(){
            var self = this

            if(!self.params['bank_card_no'] || !self.params['bank_type'] || !self.params['bind_serialno']){
                mqq.ui.showTips({text: "请选择还款卡。如未绑卡，请添加新的储蓄卡"});
                return false
            }


            if(self.params['amount'] > 5000000 && self.params['bank_type'] == '2011') {
                mqq.ui.showDialog({title:'',text:'招商银行卡单笔交易限额5万。请使用其他银行卡。',needOkBtn:true,needCancelBtn:false,okBtnText:'确认'},function(){})
                return false
            }
            if(self.params['amount'] > 15000000) {
                mqq.ui.showDialog({title:'',text:'银行卡单笔交易存在限额15万。请重新选择要还清的借款。（建议您逐笔还清，不要一次选择多笔借款）',needOkBtn:true,needCancelBtn:false,okBtnText:'确认'},function(){
                    cashLoanLib.openPage(self.repayFrom_url)
                })
                return false
            }

			/**
			*	【微粒贷513】日切还款时间调整
			*	
			*/ 
			var ret = self.checkBankLimit(self.params['bank_type'])

			if(ret === 1 || ret === 2){

				if(self.isContinuePay === false){
					var dayTips = ret === 1 ? '次日' : ''
					mqq.ui.showDialog({title:'',text:'对方银行正在进行账务处理，为确保您还款成功，建议'+dayTips+'凌晨3点之后再来还款。',needOkBtn:true,needCancelBtn:true,okBtnText:'继续还款', cancelBtnText: '稍后还款'},function(result){
						// 继续还款
						if(result.button === 0){
							self.isContinuePay = true
							self.repay()
						}
						else{
							self.isContinuePay = false
						}
					})

					return false
				}

			}

			// 初始化
			self.isContinuePay = false
			
            loading.show()

            //下单、调起支付密码界面、确认支付
            self.handleRequest(self.repayCGIRPTID , self.repay_cgi, self.params, function(data){
                if(0 == data.retcode){
                    self.session_key = data.session_key
                    self.payinit_token = data.payinit_token
                    self.openIndentifyUI(data)
                }else{
                    self.payError(data)
                }
                return false
            }, self.myOnError);

            return false
        },
        /*
         * 格式化前端必要参数
         **/
        transData: function(data){
            var self = this
            var newData = []
            $(data.records).each(function(i,o){
                newData.push({
                    bank_card_no:  o['bank_card_no_' + i] || '',
                    bank_type:  o['bank_type_' + i] || '',
                    bank_name:  o['bank_name_' + i] || '',
                    card_type:  o['card_type_' + i] || '',
                    bank_invalid:  o['bank_invalid_' + i] || '',
                    remark:  o['remark_' + i] || '',             //银行是否可用状态描述
                    bind_serialno:  o['bind_serialno_' + i]  || ''
                })
            })
            return newData
        },
        render: function(data){
            var self = this
            var records = self.transData(data)
            var html = template(self.repayBankTpl, {
                records: records
            })
            $('select').append(html).trigger('change')
            $('#repay_imd').removeClass('btn-disable')
        },
         /**
          *拉取银行卡
         **/
        getBankData: function(){
            var self = this
            var params = self.params
            params.g_tk = g_tk
            params.sid = cashLoanLib.getParameter("sid")
            loading.show()
            cashLoanLib.loanHttp({
                url: CONST_REPAY_BANK_CGI,
                data: params,
                type: 'POST',
                onSuccess: function(data){
                    /**
                     * 数据桩
                     *

                    data = {
                        bank_count: "2",
                        retcode: "0",
                        retmsg: "",
                        records: [

                        ]
                    }
                    for(var i = 0; i < 2; i++){
                        var obj = {}
                        obj["bank_card_no_" + i] = '888' + i
                        obj["bank_type_" + i] = '1234'
                        obj["bank_name_" + i] = i%2 == 0 ? '招商银行' : '工商银行'
                        obj["card_type_" + i] = i%2
                        obj["bank_invalid_" + i] = i%2
                        obj["bind_serialno_" + i] = '8000010046281236'
                        data.records.push(obj)
                    }
                     */
                    var retcode = data.retcode + ''
                    if(retcode === '0'){
						g_ts_diff = new Date().getTime() - parseInt(data.ts) * 1000
                        self.render(data)
                    }
                    else{
                        cashLoanLib.systemBusy(data)
                    }
                    loading.hide()
                },
                onError: function(data, type){
                    loading.hide()
                    if(type && "abort" == type){
                    	//不处理
                    }else if(type && "timeout" == type){
                    	cashLoanLib.requestTimeOut();
                    }else{
                    	cashLoanLib.systemBusy(data);
                    }
                }
            })
        }
    }

    exports.init = function(){


        var repay_bank = new Repay_bank()

        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0})
        //点击左上角关闭webview
        //mqq.ui.setOnCloseHandler(function(){
        //    mqq.ui.popBack()
        //})

        FastClick.attach(document.body)

        G_times[2] = (new Date()).getTime() - G_times[0]
        var srpt = new cashLoanLib.SpeedRPT()
        srpt.speedSend({rptid:14, sTimes:[G_times[1], G_times[2]], extraData: ['', '']})
        // 测速
        //setTimeout(function(){cashLoanLib.speedReport('7807-36-1', g_SPEED_TIME)}, 1000)

        // 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/repay/repay_bank.html')}, 1000)
    }
})