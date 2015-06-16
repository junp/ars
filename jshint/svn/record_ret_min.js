/**
 * Created by ronnyliang on 2015/1/16.
 * 借款记录、借据查看、还款记录 公共js
 *
 */
define(function(require, exports, module){
    var template = require('../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl
    //var moment = require('moment/moment').moment
    //var mqq = require('../../../lib/sea-modules/qqapi/qqapi')
    //var util = require('util/util')
    //var cashLoanLib = require('./cash_loan_lib.js')
    //var loading = require('../../../lib/sea-modules/ui/loading')

    var g_tk = cashLoanLib.getACSRFToken()
    var baseCgiPath = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/'
    var CONST_SCHEDULES_LIST_CGI = baseCgiPath + 'xjdloan_iou_repay_plan.cgi'

    function Record_ret(){
        this.pageParams = {}
        this.init()
    }
    Record_ret.prototype = {
        init: function(){
            var self = this
            this.listTpl = $('#recordTpl').html()
            this.schedulesTpl = $('#schedulesTpl').html()

            if(/javascript|script|iframe|<|>/.test(location.href)) {
                alert('数据异常，检查后访问')
                mqq.ui.popBack()
                return false
            }
            $('.container').on('click', function(e){
                var el = e.target || e.srcElement
                switch (true){
                    case $(el).is('.plan-more') || $(el).is('.plan-more-wrap') || $(el).is('.ico-arrow-more'):
                        $('.plan-more').toggleClass('plan-more-spread')
                        if($('.plan-more').hasClass('plan-more-spread')){
                            $('.table-wrap').removeClass('hide')
                            //$('.ico-arrow-more').css({
                            //            'transform': 'rotate(-180deg)',
                            //            '-webkit-transform': 'rotate(-180deg)',
                            //            'transition': 'transform 0.6s ease-in-out 0s',
                            //            '-webkit-transition': '-webkit-transform 0.2s ease-in-out 0s'
                            //        }).parent().css({
                            //            'border-bottom': '1px dashed #DFDFDF'
                            //        })
                        }else{
                            $('.table-wrap').addClass('hide')
                            //$('.ico-arrow-more').css({
                            //                'transform': 'rotate(0deg)',
                            //                '-webkit-transform': 'rotate(0deg)',
                            //                'transition': 'transform 0.6s ease-in-out 0s',
                            //                '-webkit-transition': '-webkit-transform 0.2s ease-in-out 0s'
                            //            }).parent().css({
                            //                'border-bottom': 'none'
                            //            })
                        }
                        //$('.plan-more').toggleClass('more-spread')
                        //if($('.plan-more').hasClass('more-spread')){
                        //    $('.repay-plan').css({
                        //        'height': $('.plan-more-wrap').height()
                        //    })
                        //    //折叠:计划表格收起后，箭头转上
                        //    $('.table-wrap').css({
                        //        //'height': '0px'
                        //        'transform': 'scaleY(0)',
                        //        '-webkit-transform': 'scaleY(0)'
                        //    })
                        //    //setTimeout(function(){
                        //        $('.ico-arrow-more').css({
                        //            'transform': 'rotate(0deg)',
                        //            '-webkit-transform': 'rotate(0deg)',
                        //            'transition': 'transform 0.6s ease-in-out 0s',
                        //            '-webkit-transition': '-webkit-transform 0.2s ease-in-out 0s'
                        //        }).parent().css({
                        //            'border-bottom': 'none'
                        //        })
                        //    //}, 500)
                        //
                        //}else{
                        //    var h2 = $('.plan-more-wrap').height() + $('.table-wrap').height()
                        //    $('.repay-plan').css({
                        //        'height': h2
                        //    })
                        //    //展开:箭头转下后，计划表格收起
                        //    $('.ico-arrow-more').css({
                        //        'transform': 'rotate(-180deg)',
                        //        '-webkit-transform': 'rotate(-180deg)',
                        //        'transition': 'transform 0.6s ease-in-out 0s',
                        //        '-webkit-transition': '-webkit-transform 0.2s ease-in-out 0s'
                        //    }).parent().css({
                        //        'border-bottom': '1px dashed #DFDFDF'
                        //    })
                        //    //setTimeout(function(){
                        //        $('.table-wrap').css({
                        //            //'height': $('table').height()
                        //            'transform': 'scaleY(1)',
                        //            '-webkit-transform': 'scaleY(1)'
                        //        })
                        //    //}, 500)
                        //
                        //}
                        return false
                        break
                    case $(el).is('#show_my_receipt') :
                        //location.href = 'debt_info.html?_bid=2061'
                        cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cashloan/v2/debt_info.html')
                        return false
                        break
                    case $(el).is('.more-wrap') || $(el).is('.more-arrow') :
                        //$('.info-wrap').toggleClass('more')
                        //折叠
                        //var h = $('.info-section').height()
                        //if(!!self.isMore){
                        //    self.isMore = false
                        //    $('.info-wrap').css({
                        //        //'height': h
                        //        'transform': 'scaleY(0)',
                        //        '-webkit-transform': 'scaleY(0)'
                        //    })
                        //    setTimeout(function(){
                        //        $('.more-arrow').css({
                        //            'transform': 'rotate(0deg)',
                        //            '-webkit-transform': 'rotate(0deg)',
                        //            '-moz-transform': 'rotate(0deg)',
                        //            '-ms-transform': 'rotate(0deg)',
                        //            '-o-transform': 'rotate(0deg)',
                        //        })
                        //        $('.first-section').css({
                        //            'border-bottom-width': '0px'
                        //        })
                        //    }, 650)
                        //}else{//展开
                        //    self.isMore = true
                        //    $('.first-section').css({
                        //        'border-bottom-width': '1px'
                        //    })
                        //    h = $('.info-section').height() * 4
                        //    $('.info-wrap').css({
                        //        //'height': h
                        //        'transform': 'scaleY(1)',
                        //        '-webkit-transform': 'scaleY(1)'
                        //    })
                        //    setTimeout(function(){
                        //        $('.more-arrow').css({
                        //            'transform': 'rotate(-180deg)',
                        //            '-webkit-transform': 'rotate(-180deg)',
                        //            '-moz-transform': 'rotate(-180deg)',
                        //            '-ms-transform': 'rotate(-180deg)',
                        //            '-o-transform': 'rotate(-180deg)',
                        //        })
                        //    }, 650)
                        //}
                        return false
                        break
                    case $(el).is('#go_mypage') :
                        //返回个人中心前，擦除数据。避免返回
                        cashLoanLib.cache.set('record_type', '')
                        cashLoanLib.cache.set('repay_ret', '')
                        //location.href = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155&_bid=2061'
                        cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi')
                        return false
                        break
                    default : return false
                        break
                }
            })
            var ret =cashLoanLib.cache.get('repay_ret') //decodeURI(util.getParameter('ret'))
            var receiptNo = cashLoanLib.cache.get('receipt_no')

            if(!ret || ret == 'null') {
                mqq.ui.popBack()
            }

            //var arr = ret.split(';')
            //var re = new RegExp("\\'","g");
            //ret = "{'loanAmt':'40000.00','loanTime':'2014/10/09','interestRate':'0.05%','currState':'2','remainFee':'34000.00','repayDate':'09','repayType':'按月还本付息','termTimes':'20','bankInfo':'招商银行(4332)','loanFrom':'微众银行','useFor':'日常消费','myName':'XXX','myId':'4525**************','myMobile':'1892******0'}"
            ret = ret.replace(/\'/g, '"');
            var record = JSON.parse(ret)
            //for(var i=0; i<arr.length; i++){
            //    var arr2 = arr[i].split(':')
            //    record[arr2[0]] = arr2[1]
            //}
            self.render(record)
            //如果是借款记录详情页面，加载还款分期计划表
            if(/borrow_record/.test(location.href)){
                if(receiptNo) self.receiptNo = receiptNo
                else mqq.ui.popBack()
                self.getSchedules(function(){
                    $('.container').css({'visibility':'visible'})
                    $('.repay-plan').css({
                        'height': $('.plan-more-wrap').height()
                    })
                })
            }else{
                $('.container').css({'visibility':'visible'})
            }
        },
        // 还款结果模板渲染
        render: function(data){
            var self = this

            var html = template(self.listTpl, {
                record: data
            })

            $('#my_record').append(html)

            //if($('.info-wrap').length > 0){
            //    $('.info-wrap').css({
            //        //'height': $('.info-section').height()
            //        'transform': 'scaleY(0.2)',
            //        '-webkit-transform': 'scaleY(0.2)'
            //    })
            //    $('.first-section').css({
            //        'border-bottom-width': '0px'
            //    })
            //}
        },
        /*
         * 格式化前端必要参数
         **/
        transSchData: function(data){
            var self = this
            var newData = []
            $(data.records).each(function(i,o){
                newData.push({
                    repayDate:  o['REPAY_DAY_' + i] || '',
                    principalAmt:  cashLoanLib.myParseFloat(o['PRINCIPAL_' + i]),
                    interestAmt:   cashLoanLib.myParseFloat(o['INTEREST_' + i]),
                    isDue:  o['IS_DUE_' + i] || '',
                    isPaid:  o['IS_PAID_' + i] || '',
                    isPayoff:  o['IS_PAYOFF_' + i]  || ''
                })
                //是否有还款状态
                if('N' == o['IS_DUE_' + i] && 'N' == o['IS_PAID_' + i] && 'N' == o['IS_PAYOFF_' + i]){
                    self.isPayState = true
                }else{
                    self.isPayState = false
                }
            })
            return newData
        },
        //还款计划列表
        renderMyReceipt: function(data){
            var self = this
            var records = self.transSchData(data)
            var html = template(self.schedulesTpl, {
                records: records
            })
            if(self.isPayState){
                $('.table-wrap').addClass('show-no-state')
            }
            $('tbody').append(html)
        },
        getSchedules: function(callback){
            var self = this
            var params = self.pageParams
            params.g_tk = g_tk
            params.iou = self.receiptNo
            params.sid = cashLoanLib.getParameter("sid")

            loading.show()

            cashLoanLib.loanHttp({
                rptid: '',
                url: CONST_SCHEDULES_LIST_CGI,
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
                    for(var i = 0; i < 10; i++){
                        var obj = {}
                        obj["REPAY_DAY_" + i]= "02/0" + i + 1
                        obj["PRINCIPAL_" + i]= 200000 + i
                        obj["INTEREST_" + i]= 2000 + i
                        obj["IS_DUE_" + i]= i%2 == 0 ? 'Y' : 'N'
                        obj["IS_PAID_" + i]= i%2 == 0 ? 'Y' : 'N'
                        obj["IS_PAYOFF_" + i]= i%2 == 0 ? 'Y' : 'N'
                        data.records.push(obj)
                    }
                     */

                    var retcode = data.retcode + ''
                    if(retcode === '0'){
                        self.renderMyReceipt(data)
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
        }
    }
    exports.init = function(){

        var record_ret = new Record_ret()

        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0})

        // 测速
        //setTimeout(function(){cashLoanLib.speedReport('7807-36-1', g_SPEED_TIME)}, 1000)

        // 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/repay/borrow_record.html')}, 1000)
    }
})