/**
 * Created by ronnyliang on 2015/1/16.
 */
define(function(require, exports, module){
    var template = require('../../../lib/sea-modules/template/txtpl_v1.1.js').txTpl
    //var moment = require('moment/moment').moment
    var iScroll = require('../../../lib/sea-modules/iScroll/iscroll-lite').iScroll
    //var mqq = require('../../lib/sea-modules/qqapi/qqapi')
    //var util = require('util/util')
    //var cashLoanLib = require('./cash_loan_lib.js')
    //var loading = require('../../../lib/sea-modules/ui/loading')
    //var FastClick = require('../../../lib/sea-modules/fastclick/fastclick')
    //每次请求最大数据条数
    var maxReqSize = 10

    var baseCgiPath = location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/'
    var CONST_BORROW_RECORDS_LIST_CGI = baseCgiPath + 'xjdloan_qry_loan_rcds.cgi'
    var CONST_REPAY_RECORDS_LIST_CGI = baseCgiPath + 'xjdloan_qry_repay_rcds.cgi'

    var g_tk = cashLoanLib.getACSRFToken();
	var g_uin = 0;

    function Page_params(){
        return {
            sign: '',
            pagesize: maxReqSize,      //请求数据条数
            last_row_type: '',
            last_row_key: 0,
            //last_row_value: '',
            //last_row_type2: '',
            //last_row_key2: 0,
            //last_row_value2: ''
        }
    }

    /**
     * 2个tab共用 一个iscroll实例
     * @constructor
     */
    function My_record(){
        this.myPageSize = 10
        //借款记录页参数
        this.page_bo = {
            'recordsData': [], //缓存返回的数据记录
            'curShowNum': 0, //当前显示到哪条数据
            'firstLoad': 0,
            'pageCgi': CONST_BORROW_RECORDS_LIST_CGI,
            'showResultURL': location.protocol + '//weloan.tenpay.com/cashloan/v2/borrow_record.html',
            'pageParams': new Page_params(),
            'nextpage_flg': true,
            'repayDate': '',
            'repayULList': $('#repay-list-bo'),
        }
        //还款记录页参数
        this.page_re = {
            'recordsData': [],
            'curShowNum': 0,
            'firstLoad': 0,
            'pageCgi': CONST_REPAY_RECORDS_LIST_CGI,
            'showResultURL': location.protocol + '//weloan.tenpay.com/cashloan/v2/repay_record.html',
            'pageParams': new Page_params(),
            'nextpage_flg': true,
            'repayULList': $('#repay-list-re'),
        }
        //初始化当前页面
        self.page = this.page_bo
        this.init()
    }
    My_record.prototype = {
        init: function(){
            var self = this
            $('a.tab-a').on('click', function(){
                self.showPage($(this))
                return false
            })

            $('ul').on('touchstart', 'li.list-li', function(e){
                $(this).addClass('press')
                //return false
                //e.preventDefault()
            }).on('touchend', 'li.list-li', function(e){
                $(this).removeClass('press')
            })
            $('ul').on('click', 'li.list-li', function(){
                $(this).removeClass('on')
                var url = self.page.showResultURL
                $(this).addClass('on')

                if(self.page == self.page_re){

                }
                cashLoanLib.cache.set('repay_ret', '{' + $(this).attr('ext-data') + '}')
                //借款记录
                if(self.page == self.page_bo){
					var _receipt_no = $(this).attr('ext-data2')
                    cashLoanLib.cache.set('receipt_no', _receipt_no)

					// 清除new 标记
					cashLoanLib.newLoanRecord.remove(g_uin, _receipt_no)
                }

                cashLoanLib.openPage(url)
    
            })
   
            self.page_bo.recordTpl = $('#repayTpl').html()
            self.page_re.recordTpl = $('#borrowTpl').html()
            var p = cashLoanLib.cache.get('myRecordPage')
            if('re' == p)   {
                $('a.tab-a').eq(1).trigger('click');
            }else{
                $('a.tab-a').first().trigger('click');
            }
        },
        showPage: function($obj){
            var self = this
            $obj.addClass('on')
            $('a.tab-a').not($obj).removeClass('on')

            loadMoreStyle.hide()

            if($obj.attr('t-brife') == 'bo'){

                self.page = self.page_bo
                self.page_re.repayULList.addClass('hide')
                cashLoanLib.cache.set('myRecordPage', 'bo')
            }else{
                self.page = self.page_re
                self.page_bo.repayULList.addClass('hide')
                cashLoanLib.cache.set('myRecordPage', 're')
            }
            self.page.repayULList.removeClass('hide')
            //去掉body的无记录的样式
            if($('body').hasClass('show-no-record'))
                $('body').removeClass('show-no-record')

            //每次切tab后检测到之前都没查出数据，再去拉
            if((self.page == self.page_re && $('li.re').length <= 0) || (self.page == self.page_bo && $('li.bo').length <= 0)){
                self.getPageData(function(){
                    $('.container').css({'visibility':'visible'})
                    self.resetScrollStyle()
                    //self.iscrollLoading()
                })
            }else{
                self.resetScrollStyle()
                // 有下一页
                if(self.page.nextpage_flg){
                    loadMoreStyle.normal()
                }
                else{
                    loadMoreStyle.hide()
                }
            }
        },
        /*
         * 更新下一次请求参数
         **/
        setPageParams: function(data){
            var self = this
            var page = self.page
            page.pageParams['sign'] = data['sign']
            page.pageParams['last_row_type'] = data['last_row_type']
            page.pageParams['last_row_key'] = data['last_row_key']
            // 是否有下一页
            page.nextpage_flg = data.nextpage_flg == 'Y' ? true : false
  
        },
        /*
         * 格式化前端必要参数
         **/
        transData: function(data){
            var self = this
            var newData = []
            var curShowNum = self.page.curShowNum
			
			var storageRecord = {}
			if(data.uin){
				storageRecord = cashLoanLib.newLoanRecord.getAll(data.uin)
			}
			var isNew = function(loanId){
				var time = 24 * 60 * 60;	//24小时

				// 当前时间
				var curTs = parseInt(data.ts, 10)
				// console.log(loanId, curTs)
				if( storageRecord[loanId] ){
					var ts = parseInt(storageRecord[loanId], 10)

					// 示过24小时
					if(isNaN(ts) === false && (curTs - ts < time)){
						return true
					}
					else{
						return false
					}
				}
				// 记录不存在
				else{
					return false
				}
			}
            $(data.records).each(function(i,o){
                if(self.page == self.page_bo){
                    newData.push({
                        receiptNo:  o['LOAN_RECEIPT_NBR_' + curShowNum] || '',
                        loanAmt:  cashLoanLib.myParseFloat(o['LOAN_PRIN_' + curShowNum]) || '',
                        loanTime:  o['REGISTER_DATE_TIME_' + curShowNum] || '',
                        currState:  o['CURR_STATUS_' + curShowNum] || '',
                        remainFee:  cashLoanLib.myParseFloat(o['REMAIN_UNPAY_PRIN_' + curShowNum]),
                        repayDate:  self.page.repayDate || '',
                        termTimes:  o['TERM_TIMES_' + curShowNum] || '',
                        interestRate:  o['INTEREST_RATE_' + curShowNum] || '',
                        bankInfo:  o['BANK_INFO_' + curShowNum] || '',
                        repayType:  o['REPAY_TYPE_' + curShowNum] || '',
                        loanFrom:  o['LOAN_GIVE_' + curShowNum] || '',
                        useFor:  o['LOAN_USE_' + curShowNum] || '',
                        beginDate : o['REGISTER_DATE_TIME_' + curShowNum] || '',
                        expireDate : o['EXPIRE_DATE_' + curShowNum] || '',
                        firstBillDate : o['FIRST_BILL_DATE_' + curShowNum] || '',
                        myName:  self.page.myName,
                        myId:  self.page.myId || '',
                        myMobile:  self.page.myMobile || '',
						isNew: isNew(o['LOAN_RECEIPT_NBR_' + curShowNum] || ''),
                        contractVer: o['CONTRACT_VER_' + curShowNum] || ''
                    })
                }else{
                    newData.push({
                        bankInfo:  o['BANK_INFO_' + curShowNum] || '',
                        repayRet:  o['REPAY_RET_' + curShowNum] || '',
                        repayTime:  o['REPAY_TIME_' + curShowNum] || '',
                        repayType:  o['REPAY_TYPE_' + curShowNum] || '',
                        repayAmt:  cashLoanLib.myParseFloat(o['TXN_AMT_' + curShowNum])
                    })
                }
                curShowNum ++
            })
            self.page.curShowNum = curShowNum
            return newData
        },
        // 模板渲染
        render: function(data){
            var self = this
            var page = self.page
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
                //从缓存中取到的数据
                tempData = data.records.slice(0,queryLength)
                //缓存剩余数据
                page.recordsData = data.records.slice(queryLength, cacheLength)
            }

            data.records = tempData


            var records = self.transData(data)
            var html = template(page.recordTpl, {
                records: records
            })

            page.repayULList.append(html)

            self.iscrollLoading(data)


            if(self.myScroll){
                self.myScroll.refresh()
            }
            else{
                self.iScrollInit()
            }
            if(page.firstLoad >= 1) { //非首次加载
                //没有数据渲染
                if((page == self.page_re && $('li.re').length <= 0) ||
                    (page == self.page_bo && $('li.bo').length <= 0)  )
                    $('body').addClass('show-no-record')
            }
            //返回render是否成功及数据条数
            return tempData.length
        },
        /*
         * 分页拉取账单
         **/
        getPageData: function(callback){
            var self = this
            var page = self.page
            page.pageParams['g_tk'] = g_tk
            page.pageParams['sid'] = cashLoanLib.getParameter("sid")

            //缓存中有数据
            if(self.render({records:page.recordsData})){
                return
            }
            // 没有下一页
            if(page.nextpage_flg == false){
                return
            }
            loading.show()
            cashLoanLib.loanHttp({
                rptid: '',
                url: page.pageCgi,
                data: page['pageParams'],
                type: 'POST',
                onSuccess: function(data){
                    //console.log('-------------request server')
                    /**
                     * 数据桩
                     *

                    data = {
                        retcode : '0',
						uin: 10000,
                        ts: 1432695408,
                        nextpage_flg: 'Y',
                        pagesize: '1',
                        last_row_type: 'last_row_type',
                        last_row_key: 'last_row_key',
                        last_row_value: 'last_row_value',
                        //last_row_type2: 'last_row_type2',
                        //last_row_key2: 'last_row_key2',
                        //last_row_value2: 'last_row_value2',
                        //pay_flag: 'N',
                        sign: 'sdjl234lsdf97fgd80gfd8',
                        record_amount: 10,
                        total: 25,
                        pmt_due_date: 18,
                        name: '李**',
                        id_no: '23443556****',
                        mobile: '1398888****',
                        records: [

                        ]
                    }

                    if(self.page == self.page_bo){
                        for(var i = 0; i < 11; i++){
                            var obj = {}

                            obj["LOAN_RECEIPT_NBR_" + i]= 'xc803434435435'+i
                            obj["LOAN_PRIN_" + i]= 12300 + i
                            obj["REGISTER_DATE_TIME_" + i]= "2015/01/01"
                            obj["CURR_STATUS_" + i]= i%3
                            obj["REMAIN_UNPAY_PRIN_" + i]= i + '0'
                            obj["TERM_TIMES_" + i]= "20"
                            obj["INTEREST_RATE_" + i]= '0.05%'
                            obj["BANK_INFO_" + i]= "招商银行(8888)"
                            obj["REPAY_TYPE_" + i]= "按月还本付息"
                            obj["LOAN_GIVE_" + i]= "微众银行"
                            obj["LOAN_USE_" + i]= "个人消费"
                            data.records.push(obj)
                        }
                    }else{
                        for(var i = 0; i < 11; i++){
                            var obj = {}
                            obj["BANK_INFO_" + i]= "招商银行(8888)"
                            obj["REPAY_RET_" + i]= (i+1)%5
                            obj["REPAY_TIME_" + i]= "2015/01/01"
                            obj["REPAY_TYPE_" + i]= i%2
                            obj["TXN_AMT_" + i]= 2300 + i
                            data.records.push(obj)
                        }
                    }
                    */


                    var retcode = data.retcode + ''

                    if(retcode === '0'){
						g_uin = data.uin

                        page.firstLoad += 1

                        if(data['pmt_due_date']) page.repayDate = data['pmt_due_date']
                        if(data['name']) page.myName = data['name']
                        if(data['id_no']) page.myId = data['id_no']
                        if(data['mobile']) page.myMobile = data['mobile']

                        // 更新下一页请求参数
                        self.setPageParams(data)
                        //缓存清零
                        page.curShowNum = 0
                        // 渲染
                        self.render(data)

                        if(callback && typeof callback == 'function') callback()
                    }
                    else{
                        if(self.page.nextpage_flg){
                            loadMoreStyle.normal()
                        }
                        else{
                            loadMoreStyle.hide()
                        }
                        cashLoanLib.systemBusy(data)
                    }
                    loading.hide()
                },
                onError: function(data, type){
                        //没有数据渲染
                    if((page == self.page_re && $('li.re').length <= 0) ||
                        (page == self.page_bo && $('li.bo').length <= 0)  )
                        $('body').addClass('show-no-record')
                    if(self.page.nextpage_flg){
                        loadMoreStyle.normal()
                    }
                    else{
                        loadMoreStyle.hide()
                    }
                    
                    if(type && "abort" == type){
                    	return;
                    }
                    
                    setTimeout(function(){
                        loading.hide()
                        //当前页面可见时才提示错误，否则在手q中返回到某页面后，还提示上一个页面的错误
                        mqq.ui.pageVisibility(function(r){
                            if(r) mqq.ui.showTips({text: "非常抱歉，服务繁忙，查询失败"})
                        })
                    }, 500)

                    //cashLoanLib.systemBusy(data)
                },
            })
        },
        iscrollLoading: function(data){
            var self = this
            //setTimeout(function(){
                // 有下一页
                if(data && data.records && data.records.length > 0 && (self.page.nextpage_flg || self.page.recordsData.length > 0)){
                    loadMoreStyle.normal()
                }
                else{
                    loadMoreStyle.hide()
                }
            //}, 500)
        },
        resetScrollStyle: function(){
            var self = this
            //==>解决webkit tranform的不是bug的bug：切换列表页后页面有元素不显示的问题
            var scroll_p = self.page.repayULList.parent().parent()
            var style_p = scroll_p.attr('style')
            //==>1、先去掉style
            scroll_p.removeAttr('style')

            //切换tab后重新刷新iscroll
            if(self.myScroll){
                self.myScroll.refresh()
            }

            //==>2、iscroll刷新完后设置为原来的style
            scroll_p.attr('style', style_p)
            //==>end
        },
        iScrollInit: function() {
            var self = this
            var pullUoffset = $('.pullUp').get(0).offsetHeight
            if(self.myScroll){
                return
            }
            self.myScroll = new iScroll('wrapper',{
                click: false,
                hScroll: false,
                hideScrollbar:true,
                fadeScrollbar:true,
                //useTransform: false,
                //useTransition:true,
                onScrollMove: function(){
                    //console.log(this.y , ', ', this.maxScrollY)
                    if($('.pullUp').parent().hasClass('hide')) return false
                    if (this.y < -10 && this.y < (this.maxScrollY - 10) && $('.pullUp').not('flip')) {
                        loadMoreStyle.up()
                        this.maxScrollY = this.maxScrollY;
                    } else if (this.y > (this.maxScrollY + 10) && $('.pullUp').hasClass('flip')) {
                        loadMoreStyle.normal()
                        this.maxScrollY = pullUoffset;
                    }
                },
                onScrollEnd: function () {
                    if ($('.pullUp').hasClass('flip')) {
                        loadMoreStyle.release()
                        self.getPageData( function(){
                            //self.iscrollLoading()
                            self.resetScrollStyle()
                        })
                    }
                }
            });
            $('#repay-list .push-hack').show();
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


        var repay_this_bill = new My_record()

        // 不显示右上角按钮
        mqq.ui.setWebViewBehavior({actionButton: 0})
        mqq.ui.setOnCloseHandler(function(){
            cashLoanLib.cache.remove('myRecordPage')
            cashLoanLib.openPage(location.protocol + '//weloan.tenpay.com/cgi-bin/xjdloan/index.cgi?_wv=2097155&_bid=2061')
        })
        FastClick.attach(document.body)

        // 测速
        //setTimeout(function(){cashLoanLib.speedReport('7807-36-1', g_SPEED_TIME)}, 1000)

        // 上报pv uv
        setTimeout(function(){cashLoanLib.reportPV('weloan.tenpay.com', '/cashloan/v2/my_record.html')}, 1000)
    }
})