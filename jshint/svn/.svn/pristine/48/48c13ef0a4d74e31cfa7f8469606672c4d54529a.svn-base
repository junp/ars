/**
 * Created by ronnyliang on 2015/3/19.
 */
define(function(require, exports, module){
    var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl
    var iScroll = require('../../../../lib/sea-modules/iScroll/iscroll-lite').iScroll
    //var cashLoanLib = require('../cash_loan_lib.js')
    //var loading = require('../../../../lib/sea-modules/ui/loading')
    //var FastClick = require('../../../../lib/sea-modules/fastclick/fastclick')

    var baseCgiPath = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/'
    //本期
    var CONST_THIS_OVERDUE_LIST_CGI = baseCgiPath + 'xjdloan_overdue_bills.cgi '

    var g_tk = cashLoanLib.getACSRFToken();

    var curr_open_bill = null

    function Repay_this_overdue(){
        this.receipt_no_list = ''
        this.pageParams = {}
        this.init()
    }
    Repay_this_overdue.prototype = {
        init: function(){
            var self = this
            $('.container').on('click', function(e){
                var el = e.target || e.srcElement
                switch (true){
                    case $(el).is('#go_repay'):
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
                                cashLoanLib.cache.set('repay_type', '1')  //提前结清
                                cashLoanLib.cache.set('receipt_count', self.receipt_count)
                                cashLoanLib.cache.set('receipt_no_list', self.receipt_no_list)
                                cashLoanLib.cache.set('amount', self.amount)
                                cashLoanLib.cache.set('choose_bill', '')
                                cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_bank.html')
                                //location.href = 'repay_bank.html?_bid=2061'
                                return false
                                break
                    case $(el).is('.input-text-arr') || $(el).is('div.flex-align-center'):
                                //location.href = 'repay_choose_overdue.html?_bid=2061'
                                cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_choose_overdue.html')
                                return false
                                break
                    default : return false
                              break
                }
            })
            this.overduListTpl = $('#overduListTpl').html()
            this.getBillData(function(){
                $('.container').css({'visibility':'visible'})
            })
            return false
        },
        /*
         * 格式化前端必要参数
         **/
        transBillData: function(data){
            var self = this
            var newData = []
            self.amount = data.fee
            self.receipt_count = data.records.length
            $(data.records).each(function(i,o){
                self.receipt_no_list += o['RECEIPT_NBR_' + i] + (self.receipt_count > 1 && i < self.receipt_count - 1 ? ';' : '')
                newData.push({
                    loanNbr:  o['RECEIPT_NBR_' + i] || '',
                    overdueFromDay:  o['START_DATE_' + i] || '',
                    overdueToDay:  o['END_DATE_' + i] || '',
                    overdueDays:  o['OVERDUE_DAYS_' + i] || '',
                    baseAmt:  cashLoanLib.myParseFloat(o['PRINCIPAL_' + i]),
                    interestAmt:  cashLoanLib.myParseFloat(o['INTEREST_' + i]),
                    penaltyAmt:  cashLoanLib.myParseFloat(o['PENALTY_' + i])
                })
            })
            return newData
        },
        // 模板渲染
        renderBill: function(data){
            var self = this

            var records = self.transBillData(data)
            var html = template(self.overduListTpl, {
                records: records
            })

            if(data.count) $('span.overdue-un').html(data.count)
            if(data.fee) $('span.overdue-fee').html(cashLoanLib.myParseFloat(data.fee))
            if(data.records.length <= 2) {
                $('.container').removeClass('iscroll-wrap').addClass('show-list-less').find('.wrapper').removeClass('iscroll')
                //$('.bottom-fixed').show()
            }

            $('#wrapper ul').append(html)
            if(data.loansRecords && data.loansRecords.length > 0) {
                curr_open_bill = $('.list-li').eq(0)
                self.renderBillDetail(data)
            }
            if(self.myScroll){
                self.myScroll.refresh()
            }
            else{
                self.iScrollInit()
            }
        },
        /*
         * 拉取逾期账单
         **/
        getBillData: function(callback){
            var self = this
            var params = self.pageParams
            params.g_tk = g_tk
            params.sid = cashLoanLib.getParameter("sid")

            loading.show()

            cashLoanLib.loanHttp({
                rptid: '',
                url: CONST_THIS_OVERDUE_LIST_CGI,
             	data: params,
             	type: 'POST',
                onSuccess:function(data){
                    /**
                     * 数据桩
                     *

                     data = {
                        retcode : '0',
                        now: new Date(),
                        count: 1,
                        fee: 88888,
                        records: []
                    }
                     for(var i = 0; i < 15; i++){
                        var obj = {}
                         obj["START_DATE_" + i]= "01/01"
                         obj["END_DATE_" + i]= "02/01"
                         obj["OVERDUE_DAYS_" + i]= i + 1
                         obj["PRINCIPAL_" + i]= (200000/100) + i
                         obj["INTEREST_" + i]= (2000/100) + i
                         obj["PENALTY_" + i]= (1000/100) + i
                         obj["RECEIPT_NBR_" + i]= "100008888888"
                        data.records.push(obj)
                    }
                     */

                    var retcode = data.retcode + ''
                    if(retcode === '0'){
                        self.renderBill(data)
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
                onError:function(data, type){
                    //if(self.myScroll){
                    //    loadMoreStyle.normal()
                    //}
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
        iScrollInit: function() {
            var self = this
            //var $pullUp = $('.pullUp')
            if(self.myScroll){
                return
            }
            self.myScroll = new iScroll('wrapper',{
                click: false,
                hScroll: false,
                hideScrollbar:true,
                fadeScrollbar:true,
                //useTransition:true,
                onScrollMove: function(){
                    console.log(this.y , ', ', this.maxScrollY)
                    //if($('.pullUp').parent().hasClass('hide')) return false
                    //if (this.y < -15 && this.y < (this.maxScrollY - 15) && $pullUp.not('flip')) {
                    //    loadMoreStyle.up()
                    //    this.maxScrollY = this.maxScrollY;
                    //} else if (this.y > (this.maxScrollY + 15) && $('.pullUp').hasClass('flip')) {
                    //    loadMoreStyle.normal()
                    //    this.maxScrollY = $pullUp.get(0).offsetHeight;
                    //}
                },
                onScrollEnd: function () {
                    //if ($('.pullUp').hasClass('flip')) {
                    //    loadMoreStyle.release()
                    //}
                }
            });
            $('#repay-list .push-hack').show();
            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
        }
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


        var repay_this_bill = new Repay_this_overdue()

        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0})
        mqq.ui.setOnCloseHandler(function(){
            cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155&_bid=2061')
        })
        FastClick.attach(document.body)

        G_times[2] = (new Date()).getTime() - G_times[0]
        var srpt = new cashLoanLib.SpeedRPT()
        srpt.speedSend({rptid:12, sTimes:[G_times[1], G_times[2]], extraData: ['', '']})
        // 测速
        //setTimeout(function(){cashLoanLib.speedReport('7807-36-1', g_SPEED_TIME)}, 1000)

        // 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/repay/repay_list_overdue.html')}, 1000)
    }
})