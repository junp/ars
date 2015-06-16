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
    //分期列表
    var CONST_THIS_BILL_LIST_CGI = baseCgiPath + 'xjdloan_period_repay_plan_summary.cgi '
    //该期分期明细
    var CONST_THIS_BILL_DETAIL_CGI = baseCgiPath + 'xjdloan_period_repay_plan_detail.cgi'

    var g_tk = cashLoanLib.getACSRFToken();

    var curr_open_bill = null

    function Repay_this_bill(){
        this.bill_cgi = CONST_THIS_BILL_LIST_CGI
        this.pageParams = {}
        this.init()
    }
    Repay_this_bill.prototype = {
        init: function(){
            var self = this
            $('.container').on('click', function(e){
                var el = e.target || e.srcElement
                switch (true){
                    case $(el).parents('li.list-li').length > 0 :
                                curr_open_bill = $(el).parents('li.list-li').eq(0)
                                var state = curr_open_bill.attr('e-load')
                                //是否已经加载了分期明细
                                //加载中显示菊花
                                //if(state !== 'loaded'){
                                //    loading.show()
                                //    return false
                                //}
                                //如果当前已经拉取过明细，那么直接展示。减少重复的请求
                                if(state === 'loaded' || curr_open_bill.find('.list-info .record-cols-line').length > 0){
                                    //$('.list-li').removeClass('show-info')
                                    //curr_open_bill.addClass('show-info')
                                    self.showList()
                                    return false
                                }
                                //var repayDate = curr_open_bill.attr('ext-data')
                                self.getBillDetail(curr_open_bill,'')
                                return false
                                break
                    case $(el).is('.detail-more') || $(el).is('.ico-arrow-more'):
                                $('li.list-li').not(function(){ return $(this).attr('for-hide') != 'Y'}).toggleClass('hide')
                                if($('li.list-li').hasClass('hide')){
                                    $('.ico-arrow-more').css({
                                        'transform': 'rotate(0deg)',
                                        '-webkit-transform': 'rotate(0deg)',
                                        'transition': 'transform 0.6s ease-in-out 0s',
                                        '-webkit-transition': '-webkit-transform 0.2s ease-in-out 0s'
                                    })
                                    //收起所有展开的列表
                                    curr_open_bill.removeClass('show-info')
                                }else{
                                    $('.ico-arrow-more').css({
                                        'transform': 'rotate(-180deg)',
                                        '-webkit-transform': 'rotate(-180deg)',
                                        'transition': 'transform 0.6s ease-in-out 0s',
                                        '-webkit-transition': '-webkit-transform 0.2s ease-in-out 0s'
                                    })
                                }
                                return false
                                break
                    default : return false
                              break
                }
            })
            this.repayListTpl = $('#repayListTpl').html()
            this.repayDetailTpl = $('#repayDetailTpl').html()
            this.showTitleTip()
            this.getBillData(function(){
                $('.container').css({'visibility':'visible'})
                //self.preLoadBillDetail()
                //self.checkLoading()
                return false
            })
            return false
        },
        showTitleTip: function(){
            var self = this
            var curr_repay = cashLoanLib.cache.get('curr_repay')
            if(curr_repay){
                curr_repay = JSON.parse(curr_repay);
                //var ym = curr_repay['repay_time']
                //ym = ym.substr(4, 2) + '月' + ym.substr(6, 2) + '日凌晨'
                //$('span.announce-text').html(ym + '将从'
                //+ curr_repay['bank_name'] + '卡(尾号'+ curr_repay['card_no'] +')，自动扣款'
                //+ cashLoanLib.myParseFloat(curr_repay['repay_money']) + '元，请确保卡内余额充足。').parent().removeClass('hide')
                self.unpayAmt = curr_repay['repay_money']
                //console.log(curr_repay)
            }else{
                //location.href = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155'
                return false
            }
        },
        //显示本期明细列表
        showList: function(){
            var self = this
            //如果当前明细列表的父div已经显示，不再运行
            //if(curr_open_bill.find('.content-col').height() > 0) return false;
            //显示某个明细列表时，先收起其他的列表
            //$('.content-col').not(function(){
            //    console.log($(this).height())
            //    return $(this).height() > 0 || $(this).parent()[0] == curr_open_bill[0]
            //}).css({
            //    'height': 0
            //})
            //if(curr_open_bill.find('.content-col').height() <= 0) {
            //    var h = curr_open_bill.find('.list-info').height()
                //待所有列表收起后，展开当前的
                //setTimeout(function(){
                    //所有的列表的内距设为0，否则div元素的高度大于0
                    //$('.list-info').css({
                    //    //'padding': '0'
                    //})
                    //curr_open_bill.find('.content-col').css({
                    //    //'padding': '0.7rem 1.6rem',
                    //    'height': h
                    //})
                //}, 600)
            //}
            $('.list-li').not(function(){return $(this)[0] == curr_open_bill[0]}).removeClass('show-info')
            curr_open_bill.toggleClass('show-info')
            setTimeout(function(){
                //if(self.myScroll){
                //    self.myScroll.refresh()
                //}
                //else{
                //    self.iScrollInit()
                //}
                curr_open_bill.removeClass('show-loading')
                $('.page-mask').addClass('hide')
            }, 600)
        },
        /*
         * 格式化前端必要参数
         **/
        transBillData: function(data){
            var self = this
            var newData = []
            $(data.records).each(function(i,o){
                newData.push({
                    paybal:  cashLoanLib.myParseFloat(o['REPAY_AMOUNT_' + i]),
                    payDate:  o['REPAY_TIME_' + i]  || ''
                })
            })
            return newData
        },
        transBillDetail: function(data){
            var self = this
            var newData = []
            $(data && data.loansRecords).each(function(i,o){
                newData.push({
                    baseAmt:  cashLoanLib.myParseFloat(o['PRINCIPAL_' + i]),
                    interestAmt:  cashLoanLib.myParseFloat(o['INTEREST_' + i]),
                    interestFormTime:  o['START_DAY_' + i] || '',
                    interestToTime:  o['END_DAY_' + i]  || ''
                })
            })
            return newData
        },
        // 模板渲染
        renderBill: function(data){
            var self = this

            var records = self.transBillData(data)
            var html = template(self.repayListTpl, {
                records: records
            })

            $('#wrapper ul').append(html)
            if(data.loan_num)
                $('h2.title span').html(data.loan_num)
            //默认展示5条，大于5条使用更多箭头
            if(records && records.length > 5){
                $('.detail-more').removeClass('hide')
            }

            if(data.loansRecords && data.loansRecords.length > 0) {
                curr_open_bill = $('.list-li').eq(0)
                self.renderBillDetail(curr_open_bill, data)
            }
            //if(self.myScroll){
            //    self.myScroll.refresh()
            //}
            //else{
            //    self.iScrollInit()
            //}
        },
        // 模板渲染
        renderBillDetail: function(currBill, data){
            var self = this

            var records = self.transBillDetail(data)
            var html = template(self.repayDetailTpl, {
                records: records
            })

            currBill.find('.list-info').append(html)
            //currBill.attr('e-load', 'loaded')
            //if(currBill == curr_open_bill) {
            //    self.showList()
            //}
            curr_open_bill.addClass('show-info')
        },
        /*
         * 拉取分期账单摘要
         **/
        getBillData: function(callback){
            var self = this
            var params = self.pageParams
            params.g_tk = g_tk
            params.amount = self.unpayAmt

            loading.show()

            cashLoanLib.loanHttp({
                rptid: '',
                url: CONST_THIS_BILL_LIST_CGI,
             	data: params,
             	type: 'POST',
                onSuccess:function(data){
                    /**
                     * 数据桩
                     *
                     *\/
                     data = {
                        retcode : '0',
                        now: new Date(),
                        record_amount: 1,
                         loan_num: 10,
                        records: [],
                        loansRecords: []
                    }
                     for(var i = 0; i < 10; i++){
                        var obj = {}
                        obj["REPAY_TIME_" + i]= "20150101"
                        obj["REPAY_AMOUNT_" + i]= 200000 + i
                        data.records.push(obj)
                    }
                     for(var i = 0; i < 2; i++){
                        var obj = {}
                        obj["START_DAY_" + i]= "01/01"
                        obj["END_DAY_" + i]= "02/01"
                        obj["PRINCIPAL_" + i]= 200000 + i
                        obj["INTEREST_" + i]= 2000 + i * 80000
                        data.loansRecords.push(obj)
                    }
                     */

                    //
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
        /**
         * 获取本期账单列表
         * @param callback
         */
        getBillDetail: function(currBill,callback){
            var self = this
            var params = self.pageParams
            params.g_tk = g_tk
            params.repay_date = currBill.attr('ext-data')
            params.sid = cashLoanLib.getParameter("sid")

            if(!params.repay_date) return

            $('.list-li').removeClass('show-info')
            //loading.show()
            curr_open_bill.addClass('show-loading')
            $('.page-mask').removeClass('hide')

            cashLoanLib.loanHttp({
                rptid: '',
                url: CONST_THIS_BILL_DETAIL_CGI,
                data: params,
                type: 'POST',
                onSuccess:function(data){
                    /**
                     * 数据桩
                     *
                     *\/
                     data = {
                        retcode : '0',
                        now: new Date(),
                        record_amount: 1,
                        loansRecords: []
                    }
                    for(var i = 0; i < 10; i++){
                        var obj = {}
                        obj["START_DAY_" + i]= "01/01"
                        obj["END_DAY_" + i]= "02/01"
                        obj["PRINCIPAL_" + i]= 200000 + i
                        obj["INTEREST_" + i]= 2000 + i
                        data.loansRecords.push(obj)
                    }
                     //*/
                    var retcode = data.retcode + ''
                    if(retcode === '0'){
                        self.renderBillDetail(currBill, data)
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

                    //loading.hide()
                    curr_open_bill.removeClass('show-loading')
                    $('.page-mask').addClass('hide')
                },
                onError:function(data, type){
                    //if(self.myScroll){
                    //    loadMoreStyle.normal()
                    //}
                    //loading.hide()
                    curr_open_bill.removeClass('show-loading')
                    $('.page-mask').addClass('hide')
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
        //分期加载完成后，预加载分期明细
        preLoadBillDetail: function(){
            var self = this
            $('.record-list ul li').each(function(i, v){
                if(i > 0){
                    $(v).attr('e-load', 'loading')
                    self.getBillDetail($(v), function(){
                        //如果当前点击的li是当前加载中的明细，那么加载后显示
                        if($(v) == curr_open_bill) {
                            self.showList()
                        }
                    })
                }
            })
        },
        //检查还在loading状态的分期明细
        checkLoading: function(){
            var self = this
            setInterval(function(){
                $('.record-list ul li').each(function(i, v){
                    var state = $(v).attr('e-load')
                    if(state === 'loading'){
                        self.getBillDetail($(v), function(){
                            //如果当前点击的li是当前加载中的明细，那么加载后显示
                            if($(v) == curr_open_bill) {
                                self.showList()
                            }
                        })
                    }
                })
            }, 5000)

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


        var repay_this_bill = new Repay_this_bill()

        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0})
        mqq.ui.setOnCloseHandler(function(){
            cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/repay/repay_detail.html')
        })
        FastClick.attach(document.body)

        G_times[2] = (new Date()).getTime() - G_times[0]
        var srpt = new cashLoanLib.SpeedRPT()
        srpt.speedSend({rptid:11, sTimes:[G_times[1], G_times[2]], extraData: ['', '']})
        // 测速
        //setTimeout(function(){cashLoanLib.speedReport('7807-36-1', g_SPEED_TIME)}, 1000)

        // 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/repay/repay_list.html')}, 1000)
    }
})