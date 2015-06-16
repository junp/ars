/**
 * Created by ronnyliang on 2015/1/16.
 */
define(function(require, exports, module){
    var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl
    //var iScroll = require('../../../../lib/sea-modules/iScroll/iscroll-lite').iScroll
    var iScroll = require('../../../../lib/sea-modules/iScroll/iscroll-lite-5.1.3-min').iScroll
    //var cashLoanLib = require('../cash_loan_lib.js')
    //var loading = require('../../../../lib/sea-modules/ui/loading')
    //var FastClick = require('../../../../lib/sea-modules/fastclick/fastclick')

    var baseCgiPath = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/'
    var CONST_THIS_BILL_LIST_CGI = baseCgiPath + 'xjdloan_whole_bills.cgi'

    var g_tk = cashLoanLib.getACSRFToken();
    var tt = 0;

    function Repay_this_bill(){
        this.t1 = null
        this.myPageSize = 80
        this.pageParams = {
            pagesize: this.myPageSize
        }
        this.recordsData = []
        this.init()
    }
    Repay_this_bill.prototype = {

        initPayChooseBill: function(el){
            var self = this

            self.billCount()
            return false
        },
        onSelectBill: function(el){
            var self = this
			var $el = $(el)

			// 当天的借款，需要明天才可提前还清
			if($el.data('allowpay') === 'N'){
				mqq.ui.showDialog({
					title: '温馨提示',
					text: '当天的借款，需要明天才可提前还清',
					needOkBtn: true,
					needCancelBtn: false,
					okBtnText: '确定'
				}, function(){})

				return false
			}
            
			$el.find('a.list-no').toggleClass('uncheck')   //
            self.billCount()
            return false
        },
        billCount:function(){
            var self = this
            var total = 0.00
            var sel_bills = $('a.list-no:not(.uncheck)')
            //逾期的木有 a.list-no
            if($('a.list-no').length <= 0){
                sel_bills = $('.list-item')   //如果为逾期，那么所有单据的欠款都要相加起来作为还款总金额
            }
            if(sel_bills.length > 0){
                $('#choose_bill_btn').removeClass('btn-disable')
                $(sel_bills).each(function(i,v){
                    try{
                        total += parseInt($(v).parent().attr('ext-data1'), 10)
                    }catch(e) {

                    }

                })
            }else{
                $('#choose_bill_btn').addClass('btn-disable')
            }

            //计算总金额
            $('.debt-all span').html(cashLoanLib.myParseFloat(total))
            self.amount = total
        },
        init: function(){
            var self = this
            $('.container').on('click', function(e){
                //某些Android机型诡异的点击：一次click触发2次事件,使用时间间隔处理
                //if (self.t1 == null){
                //    self.t1 = new Date().getTime();
                //}else{
                //    self.t2 = new Date().getTime();
                //    if(self.t2 - self.t1 < 500){
                //        self.t1 = self.t2;
                //        return false;
                //    }else{
                //        self.t1 = self.t2;
                //    }
                //}
                //$('.tips-info').html(e.type + tt++)
                var el = e.target || e.srcElement
                switch (true){
                    //选择还款
                    case $(el).parents('li.list-wrap').length > 0 :  //$(el).is('a.list-no')
                        self.onSelectBill($(el).parents('li.list-wrap')[0])
                        //e.stopPropagation()
                        //e.preventDefault()
                        return false
                        break
                    case $(el).is('#choose_bill_btn') || $(el).is('.btn-wrap'):
                        if($(el).hasClass('btn-disable')) return
                        //还款在途
                        var isPaying = cashLoanLib.cache.get('acrupay') //1表示代自动扣中，2表示还款中
                        if('2' === isPaying) {
                            mqq.ui.showDialog({title:'温馨提示',text:'您有一笔还款银行正在处理中，请稍后再来还款。',needOkBtn:true,needCancelBtn:false,okBtnText:'知道了'}, function(){})
                            return false
                            break
                        }else if('1' === isPaying){
                            mqq.ui.showDialog({title:'温馨提示',text:'银行正在处理自动还款相关业务，当前不能进行还款。',needOkBtn:true,needCancelBtn:false,okBtnText:'知道了'}, function(){})
                            return false
                            break
                        }
                        var sel_bills = $('a.list-no:not(.uncheck)')
                        //单条
                        if($('.list-wrap').length ==1 && !self.nextpage_flg){
                            sel_bills = $('a.list-no')
                        }
                        //逾期的情况
                        if($('a.list-no').length <= 0){
                            sel_bills = $('.list-item')   //如果为逾期，那么所有单据的欠款都要相加起来作为还款总金额
                        }
                        if(sel_bills.length > 0){
                            self.receipt_count = sel_bills.length
                            var ext_datas = []
                            $(sel_bills).each(function(i,v){
                                ext_datas.push($(v).parent().attr('ext-data2'))
                            });
                            self.receipt_no_list = ext_datas.join(';')
                        }else{
                            mqq.ui.showTips({text: "请选择要提前还清的借款"})
                        }
                        cashLoanLib.cache.set('repay_type', '3')  //提前结清
                        cashLoanLib.cache.set('receipt_count', self.receipt_count)
                        cashLoanLib.cache.set('receipt_no_list', self.receipt_no_list)
                        cashLoanLib.cache.set('amount', self.amount)
                        //location.href = 'repay_bank.html?_bid=2061'  //&receipt_count=' + self.receipt_count + '&receipt_no_list=' + self.receipt_no_list   + '&amount=' + self.amount
                        cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_bank.html')
                        return false
                        break
                    default :
                        return false
                        break

                }
                e.stopPropagation()
                e.preventDefault()
                e.cancel = true
                return false
            })
            this.repayListTpl = $('#chooseListTpl').html()
            this.getPageData(function(){
                self.initPayChooseBill()
                $('.container').css({'visibility':'visible'})
            })
            cashLoanLib.cache.set('choose_bill', '1')
        },
        /*
         * 格式化前端必要参数
         **/
        transData: function(data){
            var self = this
            var newData = []
            $(data.records).each(function(i,o){

                newData.push({
                    loanNbr:  o['RECEIPT_NBR_' + i] || '',
                    loanAmt: cashLoanLib.myParseFloat( o['TXN_AMT_' + i]),          //借款金额
                    //baseAmt:  cashLoanLib.myParseFloat(o['PRINCIPAL_' + i]),
                    remainAmt:  cashLoanLib.myParseFloat(o['REMAIN_TXN_AMT_' + i]), //未还本金
                    paybal:     o['PAY_BAL_' + i] || '0.00',                        //应还金额  分
                    paybal_y:     cashLoanLib.myParseFloat(o['PAY_BAL_' + i]),      //应还金额  元
                    overduedays:  o['OVERDUE_DAYS_' + i] || '',                 //逾期天数
                    interestAmt:  cashLoanLib.myParseFloat(o['REMAIN_INTEREST_' + i]), //利息
                    loanDate:  o['TXN_DATE_TIME_' + i] || '',                //
                    interestStartDate:  o['INTEREST_GEN_TIME_' + i] || '', //
                    interestEndDate:  o['INTEREST_END_TIME_' + i] || '',
                    penalty:  cashLoanLib.myParseFloat(o['PENALTY_' + i]), //罚息
                    penaltyStartDate:  o['PENALTY_START_DATE_' + i] || '',  //罚息开始时间
                    penaltyEndDate:  o['PENALTY_END_DATE_' + i] || '',  //罚息结束时间
					isAllowPay: o['IS_ALLOW_PAY_' + i]					// 是否允许提前结清 Y-是 N-否
                })
            })
            return newData
        },
        // 模板渲染
        render: function(data){
            var self = this

            //操作缓存
            var tempData = []
            if(data.records && data.records.length > 0){
                var cacheLength = data.records.length
                var queryLength = 0
                if(self.myPageSize > cacheLength){
                    queryLength = cacheLength
                }else{
                    queryLength = self.myPageSize
                }
                //缓存剩余数据
                self.recordsData = data.records.slice(queryLength, cacheLength)
                //从缓存中取到的数据
                tempData = data.records.slice(0,queryLength)
            }
            data.records = tempData

            var records = self.transData(data)
            var html = template(self.repayListTpl, {
                records: records
            })

            $('.list-main').append(html)

            // 无记录
            if(records && records.length <= 0){
                $('.container').removeClass('iscroll-wrap').removeClass('more-record').addClass('show-no-record')
            }
            // 单条
            if($('li.list-wrap').length == 1){
                $('#wrapper').removeClass('iscroll')
                $('.container').removeClass('iscroll-wrap').removeClass('more-record').addClass('show-list-one')
                $('#choose_bill_btn').removeClass('btn-disable')
            }
            //使用延迟加载iscroll，不然华为、小米等神机有问题
            setTimeout(function(){
                if(self.myScroll){
                    self.myScroll.refresh()
                }
                else{
                    self.iScrollInit()
                }
            }, 1000)

            //返回render是否成功及数据条数
            return tempData.length
        },
        /*
         * 分页拉取账单
         **/
        getPageData: function(callback){
            var self = this
            var params = self.pageParams
            params.g_tk = g_tk
            params.sid = cashLoanLib.getParameter("sid")

            //缓存中有数据
            //if(self.render({records:self.recordsData})){
            //    return
            //}

            // 没有下一页
            if(self.nextpage_flg == false){
                return
            }
            loading.show()
            cashLoanLib.loanHttp({
                rptid: '',
                url: CONST_THIS_BILL_LIST_CGI,
                data: params,
                type: 'POST',
                onSuccess: function(data){
                    /**
                     * 数据桩
                     *

                    data = {
                        retcode : '0',
                        now: new Date(),
                        records: [

                        ]
                    }
                    for(var i = 0; i < 5; i++){
                        var obj = {}
                        obj["RECEIPT_NBR_" + i]= 'XD090234808020234' + i
                        obj["TXN_AMT_" + i]= 200000 + i
                        obj["PRINCIPAL_" + i]= 10000 + i
                        obj["REMAIN_TXN_AMT_" + i]= 80000 + i
                        obj["OVERDUE_DAYS_" + i]= i
                        obj["INTEREST_" + i]= 2300 + i
                        obj["PAY_BAL_" + i]= obj["REMAIN_TXN_AMT_" + i] + obj["INTEREST_" + i]
                        obj["TXN_DATE_TIME_" + i]= "2015/01/01"
                        obj["INTEREST_GEN_TIME_" + i]= "2015/02/01"
                        obj["INTEREST_END_TIME_" + i]= "2015/08/01"
                        data.records.push(obj)
                    }
                     */
                    var retcode = data.retcode + ''
                    if(retcode === '0'){

                        //首次加载需要判断是否多条记录情况，模版渲染需要此字段
                        if(!self.isManyRows)
                            self.isManyRows = data.records && data.records.length > 1
                        // 渲染
                        self.render(data)

                        if(callback && typeof callback == 'function') callback()
                    }else if(cashLoanLib.CONST_RET_ERR_NOT_LOGIN == data.retcode){
                        cashLoanLib.notLogin()
                        //if(self.myScroll){
                        //    loadMoreStyle.normal()
                        //}
                    }else{
                        cashLoanLib.systemBusy(data);
                        //if(self.myScroll){
                        //    loadMoreStyle.normal()
                        //}
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
        },
        iScrollInit: function() {
            var self = this
            //var $pullUp = $('.pullUp')
            if(self.myScroll){
                return
            }
            self.iScrollClick = function (){
                if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) return false;
                if (/Chrome/i.test(navigator.userAgent)) return (/Android/i.test(navigator.userAgent));
                if (/Silk/i.test(navigator.userAgent)) return false;
                if (/Android/i.test(navigator.userAgent)) {
                    var s=navigator.userAgent.substr(navigator.userAgent.indexOf('Android')+8,3);
                    return parseFloat(s[0]+s[3]) < 44 ? false : true
                }
            }
            self.myScroll = new iScroll('#wrapper',{
                click: self.iScrollClick(),//$.os.android,  //Android需要设为true  坑爹
                hScroll: false,
                hideScrollbar:true,
                fadeScrollbar:true,
                //useTransition:true,
                //onBeforeScrollStart: function (e) {
                //    e.stopPropagation()
                //    e.preventDefault()
                //    return false
                //},
                //onScrollMove: function(){
                //    //console.log(this.y , ', ', this.maxScrollY)
                //    //if($('.pullUp').parent().hasClass('hide')) return false
                //    //if (this.y < -20 && this.y < (this.maxScrollY - 20) && $('.pullUp').not('flip') ) {
                //    //    loadMoreStyle.up()
                //    //    this.maxScrollY = this.maxScrollY;
                //    //} else if (this.y > (this.maxScrollY + 20) && $('.pullUp').hasClass('flip')) {
                //    //    loadMoreStyle.normal()
                //    //    this.maxScrollY = $('.pullUp').get(0).offsetHeight;
                //    //}
                //},
                //onScrollEnd: function (e) {
                //    //if ($('.pullUp').hasClass('flip')) {
                //    //    loadMoreStyle.release()
                //    //}
                //    return false
                //}
            });
            self.myScroll.on('beforeScrollStart', function(){
                //e.stopPropagation()
                //e.preventDefault()
                return false
            })
            //$('#repay-list .push-hack').show();
            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
        },
    }

    // iScroll加载样式
    var loadMoreStyle = {
        // 上拉
        up: function(){
            $('.pullUp').removeClass('loading').addClass('flip').parent().removeClass('hide')
            $('span.pullUpLabel').html('松开加载更多')
        },
        // 释放
        release:function(){
            $('.pullUp').removeClass('flip').addClass('loading')
            $('span.pullUpLabel').html('努力加载中……')
        },
        // 初始
        normal: function(){
            $('.pullUp').removeClass('loading').parent().removeClass('hide')
            $('span.pullUpLabel').html('上滑查看更多')
        },
        // 隐藏提示
        hide:function(){
            $('.pullUp').parent().addClass('hide');
        }
    }
    exports.init = function(){


        var repay_this_bill = new Repay_this_bill()

        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0})
        mqq.ui.setOnCloseHandler(function(){
            cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_detail.html')
        })
        FastClick.attach(document.body)

        G_times[2] = (new Date()).getTime() - G_times[0]
        var srpt = new cashLoanLib.SpeedRPT()
        srpt.speedSend({rptid:13, sTimes:[G_times[1], G_times[2]], extraData: ['', '']})
        // 测速
        //setTimeout(function(){cashLoanLib.speedReport('7807-36-1', g_SPEED_TIME)}, 1000)

        // 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/repay/repay_choose.html')}, 1000)
    }
})