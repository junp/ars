/**
 * Created by ronnyliang on 2015/1/16.
 */
define(function(require, exports, module){
    var template = require('../../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl
    //var moment = require('../../../lib/sea-modules/moment/moment').moment
    //var mqq = require('../../../lib/sea-modules/qqapi/qqapi')
    //var util = require('../../../lib/sea-modules/util/util')
    //var cashLoanLib = require('../cash_loan_lib.js')


    var g_tk = cashLoanLib.getACSRFToken();

    var repay_ret = ''


    function Record_ret(){
        this.init()
    }
    Record_ret.prototype = {
        init: function(){
            var self = this

            if(/javascript|script|iframe|<|>/.test(location.href)) {
                alert('数据异常，检查后访问')
                mqq.ui.popBack()
                return
            }

            $('a.btn').on('click', function(){
                //mqq.ui.popBack()
                cashLoanLib.cache.set('repay_ret', '')
                //location.href = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_bid=2061'
                cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155')
                return false
            })

            this.listTpl = $('#repaySuccTpl').html()
            //使用mqq.ui.dispatchEvent
            var ret = cashLoanLib.cache.get('repay_ret') // repay_ret && repay_ret.length > 0 ? repay_ret : cashLoanLib.cache.get('repay_ret') //decodeURI(util.getParameter('ret'))

            if(!ret || ret == 'null') {
                if(mqq.compare("5.4.0") == -1){
                    cashLoanLib.showDialog({text : '您的手机QQ版本较低。点击【确定】按钮去更新', callBack : function(){
                        if(0==ret.button){window.location.replace('http://im.qq.com/mobileqq/touch/index.html');}
                        else{
                            mqq.ui.popBack();
                        }
                    }});
                    return;
                }
                else {
                    //location.href = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_bid=2061'
                    cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155')
                }
                return
            }

            //var arr = JSON.parse(ret)//ret.split(';')
            var record = JSON.parse(ret)//{}
            //for(var i=0; i<arr.length; i++){
            //    var arr2 = arr[i].split(':')
            //    if(arr2[0] == 'repayTime') arr2[1] = arr2[1].replace('-',':')
            //    record[arr2[0]] = arr2[1]
            //}
            self.render(record)
        },
        // 模板渲染
        render: function(data){
            var self = this

            var html = template(self.listTpl, {
                record: data
            })

            $('#my_repay_rtl').prepend(html)
        },
    }
    exports.init = function(){

        //mqq.addEventListener("open_seuccess", function(data, source){
        //    repay_ret = data.repay_ret
        //    var record_ret = new Record_ret()
        //});
        var record_ret = new Record_ret()
        //关闭非当前view
        //mqq.ui.closeWebViews({mode: 0 })
        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0})

        G_times[2] = (new Date()).getTime() - G_times[0]
        var srpt = new cashLoanLib.SpeedRPT()
        srpt.speedSend({rptid:15, sTimes:[G_times[1], G_times[2]], extraData: ['', '']})

        mqq.ui.setOnCloseHandler(function(){
            //mqq.ui.popBack()
            cashLoanLib.cache.set('repay_ret', '')
            cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155')
        })
        // 测速
        //setTimeout(function(){cashLoanLib.speedReport('7807-36-1', g_SPEED_TIME)}, 1000)

        // 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/repay/repay_success.html')}, 1000)
    }
})