(function(undefined) {
    if (!window["edc7uo"]) {    // 热图开启状态，-1：全开启；[]：数组内页面开启；
        window["edc7uo"] = -1;
    }
    // 报文传输用URL设定
    var serverList = ["cjtest.ptmind.cn", "cjtest.ptmind.cn"];
    var serverNum = 0;  // 报文传输URL索引，默认使用第一个地址
    var protocol = ("https:" == location.protocol) ? "https://" : "http://",    // 协议类型
        toURL = protocol + serverList[serverNum],
        pnURL = toURL + "/pn", // 处理页面新访问的URL
        pvURL = toURL + "/pv", // 处理页面非新访问的URL
        ocURL = toURL + "/oc", // 处理点击事件的URL
        osURL = toURL + "/os", // 处理滚动事件的URL
        hbURL = toURL + "/hb", // 处理心跳事件的URL
        teURL = toURL + "/te"; // 处理用户自定义事件
    // cookies操作用
    var domainName = "", expiresDay = 1000;     // cookie中的域名及过期时间
    // 静态值
    //COOKIELENGTH = 3800;迁移到了createCookiesValue函数中，因为只有那一个函数用到
    var NVTIMES = 1000 * 60 * 3, // 距离最近的站点活动时间的最长时限为180秒，超过180秒便为新访次
        NATIVEDAYS = 1000 * 60 * 60 * 24, // 一天（暂未使用）
        HBTIMES = 1000 * 30, // 心跳时间
        SILENTTIMES = 1000 * 60 * 5, // 静默时间，超过该时间则访次结束
        CLICKINTERVAL = 3000, // 点击间隔时间
        SCROLLINTERVAL = 1000, // 滚动间隔时间
        DEFAULTSTAYTIMES = 1000, // 激活后的默认时间
        REFRESHTIMES = 1000 * 60 * 1; // 刷新默认时间
    // 布码参数
    var company = "",       // 公司名称
        URLTrimFlag = true, //保存真实URL，true去掉URL后面的斜杠"/",false不去掉URL后面的斜杠"/"
        crossDomainLink = false, //跨域手动标识，allManual为全手动，halfManual为半手动，false为自动
        funnelPage = false, //CV漏斗页面
        funnelRef = "", // CV漏斗ref值
        domainSet = [], // 多域名集
        multiDomainFlag = false, // 是否设置了多域监测
        urlMark = "", // url特殊标志
        vUrl = "", // 虚拟URL
        vTitle = "", // 虚拟title
        adParamFlag = false, //cellant广告参数专用的标志
        adParamStr = "", //cellant广告参数专用的字符串
        adParamAry = [], // cellant广告参数
        camParamAry = [],//广告参数，通用功能的，没有跟过去的cellant的混合在一起
        PT_trackEvent = false;//是否开启自定义事件
    // 自定义参数分析
    var sid = "", // 网站账号名
        uid = "", // 唯一用户ID
        useHttpCookie = true,   // 是否使用页面cookie
        customVarList = [],//自定义变量列表
        autoEventList = {},//智能事件开关
        iframeValue = [0, 0, ""],	//iframe的相关值数组，iframe元素的left，top和cssPath
        gParam = window["_pt_sp_2"] ? "_pt_sp_2" : "_pt_pe";    // 布码变量，这里主要是兼容旧版本的变量名

    //事件开个标签,判定 url 中是否含有这个字符串,标记打开设置事件功能
    var openEventLabel = "ptengine-event-explore=open";
    //异步自定义事件列表
    var asyncEventList = [];
    var testSID = { // 测试sid
        "12345678": "87654321" // test
    };
    //徽章标记
    window["badgeSign"] = 0;
    //徽章JS调用
    if (badgeSign > 0) {
        //0 is close, 1 is jp2.0, 2 is en2.0, 3 is cn2.0
        var badgeAry = ["https://report.ptengine.jp","https://report.ptengine.com","https://report.ptengine.cn"];
        var badgeScript = document.createElement("script");
        badgeScript.type="text/javascript";
        badgeScript.async=!0;
        badgeScript.charset = "utf-8";
        badgeScript.src = badgeAry[badgeSign-1] + "/js/badge/badge.js";
        document.body.appendChild(badgeScript);
    }
    //判断是否开启弹出热图功能
    if (location.href.indexOf("ptengine=") > -1) {
        var pro = location.href.split("ptengine=");
        var uArray = {
            "0":"https://report.ptengine.jp/js/popup/ptpopupheatmap.js",
            "1":"https://reportv3.ptengine.jp/components/pagescene/overlay/overlay.js",
            "2":"https://report.ptengine.com/js/popup/ptpopupheatmap.js",
            "3":"https://reportv3.ptengine.com/components/pagescene/overlay/overlay.js",
            "4":"https://demo.ptengine.jp/components/pagescene/heatmap/js/popup/ptpopupheatmap_jp.js",
            "5":"https://demo.ptengine.com/components/pagescene/heatmap/js/popup/ptpopupheatmap_en.js",
            "6":"http://reportv3test.ptengine.jp/components/pagescene/overlay/overlay.js",
            "7":"http://reportv3test.ptengine.com/components/pagescene/overlay/overlay.js",
            "8":"https://testreportv3.ptengine.jp/components/pagescene/overlay/overlay.js",
            "9":"https://testreportv3.ptengine.com/components/pagescene/overlay/overlay.js",
            "A":"http://localhost:3100/components/pagescene/overlay/overlay.js",
            "B":"http://localhost:3000/components/pagescene/overlay/overlay.js"
        };
        var urlHead = uArray[pro[1].substring(0,1)];
        if (!urlHead) return;
        var jumpScript = document.createElement("script");
        jumpScript.type="text/javascript";
        jumpScript.async=!0;
        jumpScript.charset = "utf-8";
        jumpScript.src = urlHead;
        document.body.appendChild(jumpScript);
        return;
    }
    if (!window[gParam] || (window[gParam].join("").indexOf("setAccount") < 0 && window[gParam].join("").indexOf("setSID") < 0) || window[gParam].join("").indexOf("setDomain") < 0) {
        //console.log("ptmind_debug:  "+"Custom parameter is incorrect");
        return; // 自定义参数不正确，不进行采集
    } else {
    	// 修正初始布码的setPVTag为setVPV
    	for(var i = 0; i < window[gParam].length; i++){
    		if(/setpvtag/i.test(window[gParam][i])){
    			window[gParam][i] = window[gParam][i].replace(/setpvtag/i, "setVPV");
    		}
    	}
        if (!definePrc(window[gParam])) { //如果自定义参数解析失败，则不进行采集
            //console.log("ptmind_debug:  "+"Failed to parse custom parameters");
            return;
        }
    }
    if(domainName==""){ // 域名为空，不进行采集
        return;
    }
    /* cookie保存名称*/
    var COOKIESNAME = "pt_" + sid,
        SESSIONCOOKIESNAME = "pt_s_" + sid,
        CLICKCOOKIESNAME = "pt_t_" + sid,       //记录点击事件
        TECOOKIESNAME = "pt_e_" + sid,          //记录自定义事件
        VIDCOOKIESNAME = "pt_v_" + sid,         //记录用户的sid
        SOURCECOOKIESNAME = "pt_sc_" + sid;     //记录用户登录ptmind官网的来源
    // 这里关于sid的对应是针对一家digitalone账户的网站，直到这家网站不用我们代码
    if(sid == "3ed9846f"){
        COOKIESNAME = COOKIESNAME + "1024";
        SESSIONCOOKIESNAME = SESSIONCOOKIESNAME + "1024";
        CLICKCOOKIESNAME = CLICKCOOKIESNAME + "1024";
        TECOOKIESNAME = TECOOKIESNAME + "1024";
    }
    if(sid == "5354cf3a"){  //特殊对应，发送指定包
        (new Image()).src = protocol + "collect.ptengine.jp/tmp?sid=5354cf3a&ts="+(new Date()).getTime();
    }
    // sid特殊对应
    switch (sid) {
        case "23279dc3":
            _pt_sp_2.push('setCustomVar,def15,svid,value,' + location.href.split("?")[0] + ',0');
            break;
        case "7ba4a69b":
        case "4d4ffefb":
            return;
            break;
        case "19fca91d":
        case "5648a0b7":
        case "2345678":
            company = "oisix";
            break;
        case "2ab0afd3":
            company = "oisix_gochimaru";
            break;
        case "34c69a28":
            company = "oisix_hk";
            break;
        case "4e1abfde":
        case "12306c80":
        case "296e135b":
        case "329c67cb":
            company = "commercelink";
            break;
        case "5354cf3a":
            company = "digitalone";
            break;
        case "6c75a350":
            company = "rakuten-sec"; //乐天证券
        default:
            break;
    }
    /*变量定义*/
    // 类对象定义
    var ptq = "", // 参数串
        na = navigator,
        doc = document,
        win = window,
        loc = location,
        objBrowserInfo = new CLSBrowserInfo, // 浏览器信息类对象
        objCommon = new CLSCommon, // 通用类对象
        cookieOfPt = new CookieOfPt,// cookie相关
        objHttpCookies = new CLSCookies, // http cookies类对象
        objPt = new CLSPt, // Pt专用类对象
    //系统信息
        ref = objBrowserInfo.getRef(), // 获取页面ref
        initialScale = objBrowserInfo.getInitialScale(),    // 获取页面初始缩放值
        terminalType = objBrowserInfo.getTerminalType(), // 判断终端类型 0:不可识别 1:手机 2:PC 3:PC模拟的手机 4:平板
        rotationFlag = ((win.orientation == undefined || win.orientation == 0) ? 1 : -1), // 横屏标志 (竖直:0 左斜:90 右斜:-90) 竖屏时为1，横屏时为-1
    // 访次相关信息
        isNV = "0", // 新访次
        visitID = "", // 访次事件ID
        visitNum = 0, // 访次顺序
        pvNum = 0, // pv的顺序
        profileID = sid + "_/", // profileID
        date = new Date(),
        visitTimeDate = date.getTime() + "-" + date.getDate(), // 访问时间和日期
        visitRef = "", // 访次ref信息，创建pn时写入到cookie里，pv从cookie里读取，跨域时需要带过去
    // 用户信息
        isNID = "0", // 是否新用户
    // 页面相关信息
        page = "",  //当前页面URL
        initPage = "",//page的初始值，默认情况下等同于page，但是由于加了vpv功能，page会被重写，所以保留一个初始的page的值，用来记录
        pageID = "",    //页面ID
        title = objBrowserInfo.getTitle(), // 页面标题
        pvEventID = "", // 页面访问事件ID
        pageList = "", // 访次访问的页面列表
    // cookie相关信息
        hasHttpCookies = objHttpCookies.isEnabled(), // http cookies是否可用
        sessionCookiesValue = "", // session cookies值
    // 浏览事件
        mouseCoo = "", // 点击坐标
        srcElement = "", // 点击元素
        srcElementAbsLeft = 0, // 元素坐标
        srcElementAbsTop = 0, // 元素坐标
        yMax = objBrowserInfo.getYMax(), // 取得阅读线的绝对值
        yMaxP = (rotationFlag == 1) ? yMax : 0, //竖屏时阅读线位置
        yMaxM = (rotationFlag != 1) ? yMax : 0, //横屏时阅读线位置
        hbCount = 0, // 心跳包计数
    // 更新时间
        visitTime = date.getTime(), // 访问时间
        pageAccessTime, // 页面访问开始时间
        siteActionTime, // 全站最近操作时间
        pageActionTime, // 本页最近操作时间
        clickActionTime, // 记录点击的时间
    // 标志位
        multiLinkTag = "", // 跨域标志
        touchmoveFlag = false, // 拖动标志
    //是否开启抽样率
        sampleRate = "", // 开启后的抽样率 --dennis
    //mousemoveFlag = false, // 鼠标移动激活标志（仅适用于PC)，只有心跳包能触发它
        sessionCookieFlag = 0, // session标志位（0：关闭浏览器，1：存在，-1：http cookies不可用）
        activeFlag = true, // 页面活动标志
        toFlag = 0, // 静默超时
        heatmapFlag = false, // 是否开启热图功能的标志位
        op = "",	//AB测试参数保存
        optFlag = false,	//AB测试标志
        openIframe = false;		//iframe布码标识
    //自定义事件的冷却锁
    var trackEventToken = {
        lastTime:(new Date()).getTime()-10000,
        AddTime:function(){
            var tempNow = (new Date()).getTime();
            if(this.lastTime+1000 > tempNow){
                return false;
            }else if(tempNow - this.lastTime>10000){
                this.lastTime = tempNow-9000;
                return true;
            }else{
                this.lastTime+=1000;
                return true;
            }
        }
    };
    //验证此终端的createID方法是否和极大多数浏览器兼容，如果不兼容，则生成的所有id都是错的（目前主要有老版本的山寨机）
    if(objCommon.createID("ptmind")!="VjjxITmt45nXMldop676zQ"){return;}
    //重写了js原生的方法，把定时去拉的策略，改为了实时推的策略，因为te包需要在a标签点击的时候，进行触发，根本等不到100毫秒以后。
    window[gParam].push = function (str) {
        var tmpParam = str.split(",");
        switch (tmpParam[0]) {
            case "setPVTag":    // 虚拟PV
                try {
                    if (tmpParam[2] == "replace") {
                        page = tmpParam[1];
                    } else {
                        var vPVMark = tmpParam[1] ? tmpParam[1] : "";
                        page = initPage + "#" +vPVMark; // 页面
                    }
                    pageID = objCommon.createID(page); // 页面ID
                    revisitPrc("vpv",page,pageID);
                } catch (ex) {
                }
                break;
            case "setTrackEvent":   // 自定义事件
                try{
                    if(PT_trackEvent==false){
                        return;
                    }
                    if(typeof(tmpParam[6])=="string"){//判断当前页面是否符合事件设置
                        if (sid == "39073cb0" && loc.href.match(new RegExp(tmpParam[6].replace(/^\//,"").replace(/\/$/,"")))) {
                            //FB-156问题，特殊对应
                        } else if(!loc.href.replace(/\/$/,"").match(new RegExp(tmpParam[6].replace(/^\//,"").replace(/\/$/,"")))){
                            return;
                        }
                    }
                    if(typeof(tmpParam[3])=="undefined"){tmpParam[3]="";}
                    if(typeof(tmpParam[4])=="undefined"){tmpParam[4]="0";}
                    tmpParam[4] = tmpParam[4].replace(/\./g,"e"); // 因为.是采集包的分隔符，所以此处要转换成字符e
                    //对几个字段进行解码
                    for(var i=1;i<5;i++){
                        tmpParam[i] = objCommon.decode(tmpParam[i]);
                    }
                    //长度限制
                    tmpParam[1] = tmpParam[1].substr(0,200);
                    tmpParam[2] = tmpParam[2].substr(0,200);
                    tmpParam[3] = tmpParam[3].substr(0,500);
                    tmpParam[4] = tmpParam[4].substr(0,10);
                    //对几个字段进行编码
                    for(var i=1;i<5;i++){
                        tmpParam[i] = objCommon.encode(tmpParam[i]).replace(/\./g,"%2E");
                        //http://jira.ptmind.com/browse/FB-589，增加判断字段中存在（.），则进行二次替换————zhaopengjun 2015-03-24
                        if (tmpParam[i].indexOf(".") > -1) {
                            var tmpAry = tmpParam[i].split(".");
                            tmpParam[i] = tmpAry.join("%2E");
                        }
                    }
                    if(typeof(tmpParam[7])=="string"){
                    	// 将通过事件界面设置的事件的元素放入事件数组里，等待元素被操作时触发
                        asyncEventList.push(tmpParam);
                    }else{
                        if(uid==""||visitID==""||pageID==""||pvEventID==""){
                        	// 如果必要的字段没有的话，就返回
                            return;
                        }
                        if(!trackEventToken.AddTime()){
                        	// 如果还没冷却，就不采集事件
                            return;
                        }
                        pvNum = +pvNum + 1;
                        cookieOfPt.writeCookies();
                        var sentData = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
                            + "&stat="+ tmpParam.slice(1,5).join(".")
                            + (tmpParam[5] ? "&eid=" + tmpParam[5] : "")  //如果有 eid 则发送,否则不发送该字段
                            + "&ptif=" + terminalType
                            + "&pvn=" + pvNum;
                        //发送te包
                        objPt.sendMsgByScript(teURL+sentData);
                    }
                }catch(ex){
                }
                break;
            case "setCustomVar":	//自定义变量的解析，从原来的解决入口移到这里，从而达到实时发送数据的目的
                (function(){
                    var type = tmpParam[3];
                    var customVar;
                    if (type == "cookie"){
                        customVar = tmpParam[4];
                    } else if (type == "globalVar"){
                        customVar = window[tmpParam[4]];
                    } else if (type == "domId"){
                        if (doc.getElementById(tmpParam[4])) {
                            customVar = doc.getElementById(tmpParam[4]).innerHTML;
                        }
                    } else if (type == "value"){
                        customVar = tmpParam[4];
                    }
                    if (customVar){
                        if (tmpParam[2] == "ptselfSource") {
                            customVarList.push(['def01',objHttpCookies.getValue(SOURCECOOKIESNAME),tmpParam[3]]);
                            //customVar += "|" + objHttpCookies.getValue(SOURCECOOKIESNAME);
                        }
                        customVarList.push([tmpParam[1],customVar,tmpParam[3]]) ;
                    }
                    if (tmpParam[2] == "ptself" || tmpParam[2] == "ptselfSource") {	//ptmind 内部使用标识
                        revisitPrc("vpv");
                        if (tmpParam[2] == "ptselfSource") {
                            customVarList.pop();
                        }
                        customVarList.pop();		//虚拟pv发出后，删除自定义变量列表中手动添加的值，保证在下次执行时，不会存在重复值
                        if (tmpParam[2] == "ptselfSource") {
                            objHttpCookies.setValue(SOURCECOOKIESNAME, "", {
                                expires: ""
                            });
                        }
                    }
                })();
                break;
            case "setFunnelStep":   // 设置漏斗转化
                try {
                    funnelPage = tmpParam[1] == "true";
                    funnelRef = tmpParam.length == 3 ? tmpParam[2] : "";
                } catch(ex) {
                }
                break;
            case "useURLTrim":      // 保留URL末尾斜杠
                try {
                    URLTrimFlag = tmpParam[1] == "false" ? "tmpUrlAPI" : true;
                } catch(ex) {
                }
                break;
            case "setCrossDomainLink":      // 设置跨域链接
                try {
                    crossDomainLink = tmpParam[1] == "allManual" ? "allManual" : tmpParam[1] == "halfManual" ? "halfManual" : false;
                } catch(ex) {
                }
                break;
            case "setOptimizely":       // 设置A/B测试
                try {
                    optFlag = tmpParam[1] == "true";
                } catch (ex) {
                }
                break;
            case "setIframe":       //页面嵌入iframe设置
                openIframe = tmpParam[1] == "true";
                break;
            case "RecordSource":    //记录用户来源，写入cookie，使用_pt_sp_2.push('RecordSource');调用
                var vidCookieValue = objHttpCookies.getValue(VIDCOOKIESNAME);
                if (vidCookieValue == visitID) {
                    return;
                }
                var tmpVref;
                if (location.search.indexOf('utm_') > -1) {
                    tmpVref = location.href;
                } else {
                    tmpVref = visitRef ? visitRef.split('://')[1].split('/')[0] : "";
                }
                var sourceData = objCommon.encode(tmpVref, false) || "no referrer";
                var cookiesData = objHttpCookies.getValue(SOURCECOOKIESNAME);
                sourceData = cookiesData ? (cookiesData + "," + sourceData) : sourceData;
                objHttpCookies.setValue(SOURCECOOKIESNAME, sourceData, {
                    expires: expiresDay
                });
                objHttpCookies.setValue(VIDCOOKIESNAME, visitID, {
                    expires: expiresDay
                });
                break;
            case "ClearSource":     // 清除用户来源
                objHttpCookies.setValue(SOURCECOOKIESNAME, "", {
                    expires: ""
                });
                break;

            case "setSampleRate":    // 抽样率 --dennis
                try {
                    sampleRate = tmpParam[1];
                } catch (ex) {
                }
                break;
            default:
                break;
        }
    };
    if (window[gParam].length > 0) {    // 加载PT接口，采集文件顶部，通过push设置的接口。
        var window_gParam = window[gParam];
        for (var i = 0; i < window_gParam.length; i++) {
            window[gParam].push(window_gParam[i]);
        }
    }
    if(sid=="308fd851" || sid=="633fdbe6"){//308fd851和633fdbe6网站心跳改为60秒
        HBTIMES=1000*60;
    }
    callBack();
    // 所有程序都放在callBack()里
    function callBack() {
        // 不以http://或者https://开头，带了特定字符的为非法URL
        if (!loc.href.match(/^https?:\/\/.*/) || (loc.href.indexOf("#_pt_capture") > -1)) {//console.log("ptmind_debug:  "+"url not begin with http or https");
            return false;
        }
        // 如果不是产品布码页面，且位于产品(包括测试环境)热图的iframe中，或者从系统跳出来的，则不发报文
        /*
         中国线上：
         [report、analytics].ptmind.com
         [report].ptengine.cn
         日本线上：
         [report、reportv2].ptengine.jp
         海外线上：
         [report、reportv2].ptengine.com
         中国测试区:
         [tztest、tztest1、tztest2].ptmind.com
         [tztest3、tztest4、tztest5、tztest6].ptmind.cn
         [cntest1].ptengine.cn
         日本测试区:
         [test、test1、test2、test3、test4].ptengine.jp
         [fbt].ptengine.com

         目前，除中国测试区，其他都已经屏蔽
         */
        if (sid != "14311cf1" && sid != "4ea10743" && sid!="4d304c7a" && sid!="46635348" && sid!="31aee115") {
            if (loc.href.match(/^https?:\/\/report\.miapex\.com.*/) || loc.href.match(/^https?:\/\/test[1234]?\.ptengine\.jp.*/) || loc.href.match(/^https?:\/\/fbt\.ptengine\.com.*/) || loc.href.match(/^https?:\/\/report(v3)?\.ptengine\.[jp|com].*/) || loc.href.match(/^https?:\/\/[report|analytics]\.ptmind\.com.*/) || loc.href.match(/^https?:\/\/report\.ptengine\.cn.*/) || doc.referrer.match(/^https?:\/\/report\.miapex\.com.*/) || doc.referrer.match(/^https?:\/\/report(v3)?\.ptengine\.[jp|com].*/) || doc.referrer.match(/^https?:\/\/test[1234]?\.ptengine\.jp.*/) || doc.referrer.match(/^https?:\/\/fbt\.ptengine\.com.*/)){
                //console.log("ptmind_debug:  "+"url is in \"ptengine.jp\" not collect");
                return false;
            }
        }
        // 判断该url是否开启了热图功能
        if (objPt.valFunction("heatmap", window["edc7uo"])) {
            heatmapFlag = true;
        }
        // 根据访问终端的类型来调整页面静默时间
        switch (terminalType) {
            // 如果是pc或者模拟器，调整为30分钟
            case 2:
            case 3:
                SILENTTIMES = 1000 * 60 * 30;
                break;
            default:
                break;
        }
        // 如果是cellant的sid的话，不采集非移动终端的数据
        if (company == "cellant") {
            if (terminalType == 2 || terminalType == 3) {
                //console.log("ptmind_debug:  "+"\"cellant\"web not collect PC");
                return false;
            }
        }
        page = objBrowserInfo.getPage(); // 页面URL
        initPage = page;    //页面URL备份
        pageID = objCommon.createID(page); // 页面ID
        objHttpCookies.clearOtherCookie();//临时添加的方法
        cookieOfPt.readCookies();
        funnelPage = (cookieOfPt.cookiesValue && funnelPage) ? true : false;
        if (funnelPage) {
            //zpj:CV流程监测 特殊对应
            NVTIMES = 1000 * 60 * 60 * 24;
            ref = objBrowserInfo.getRef();
            preVID = cookieOfPt.getValueFromCookies("vid");
        }
        //cookie迁移到新的地方
        //全部删除过去的cookie(cookie的name带有pt_sid_path的全部删除)
        (function(){
            function deleteCookie(name){
                function deleteCookieTemp(name,domain,path){
                    var date = new Date();
                    date.setTime(date.getTime() - 10000);
                    document.cookie = name+"='';expires="+date.toGMTString()+";domain="+domain+";path="+path+";"
                    document.cookie = name+"='';expires="+date.toGMTString()+";domain="+domain+";path="+path+"/;"
                }
                deleteCookieTemp(name,"","");
                var tempDomain = document.location.hostname.split(".");
                var tempPath   = document.location.pathname.split("/");
                for(var i=0;i<tempDomain.length;i++){
                    for(var j=0;j<tempPath.length;j++){
                        deleteCookieTemp(name,tempDomain.slice(i).join("."),tempPath.slice(0,parseInt(j)+1).join("/"))
                    }
                }
            }
            var allCookie=doc.cookie.split(";");
            for(var i=0;i<allCookie.length;i++){
                allCookie[i] = allCookie[i].split("=");
                if(allCookie[i][0].indexOf(COOKIESNAME)>-1){
                    cookieOfPt.cookiesValue = allCookie[i].slice(1).join("=");
                    deleteCookie(allCookie[i][0]);//将过去旧的cookie位置删除，3.5需求中把过去的cookie全部删除，并且把cookie位置，迁移到主域的根目录
                }else if(allCookie[i][0].indexOf(SESSIONCOOKIESNAME)>-1){
                    var sessionValueTemp = SESSIONCOOKIESNAME+"="+allCookie[i].slice(1).join("=")+";domain="+domainName+";path=/;";
                    //alert(sessionValueTemp);
                    deleteCookie(allCookie[i][0]);//将过去旧的cookie位置删除，3.5需求中把过去的cookie全部删除，并且把cookie位置，迁移到主域的根目录
                }
            }
            if(sessionValueTemp){
                document.cookie = sessionValueTemp;
            }
        })();
        /**************cookies处理开始**************************************/
        /*合并成URL传参时用的信息串*/
        function isHasSearchInUrl(list){//如果包含特殊参数，则切断访次
            if(location.href.match(/(utm_campaign|utm_source|utm_medium|utm_term|utm_content)/)){
                return true;
            }
            for(var i=0;i<list.length;i++){
                if(location.search.match(new RegExp("[?/&]("+list[i]+")="))){
                    return true;
                }
            }
            return false;
        }
        function isFromSearchEngine(){  // 搜索引擎
            var all = ["(wap|www|m|m5).baidu.com",
                "www.baidu.jp",
                "(hao|so).360.cn",
                "www.360(soso|sou).com",
                "(www|m).so.com",
                "www.google.",
                "(blogsearch|books|images|news|scholar).google.com",
                "bing.com",
                "(search|tw.search).yahoo.com",
                "www.yahoo.cn",
                "search.yahoo.co.jp",
                //日本特有
                "(www|jp).ask.com",
                "(cn|jp).indeed.com",
                "search.biglobe.ne.jp",
                "search.(goo|smt.docomo).ne.jp",
                "search.nifty.com",
                "websearch.rakuten.co.jp",
                "www.so-net.ne.jp"];
            for(var i=0;i<all.length;i++){
                if(doc.referrer.match(new RegExp(all[i]))){
                    return true;
                }
            }
            return false;
        }
        if (objCommon.isNull(cookieOfPt.cookiesValue) || !cookieOfPt.checkCookiesValue()) {
            objHttpCookies.setValue(SESSIONCOOKIESNAME, visitTime, {
                expires: ""
            });
            // 如cookie没有，或者cookies不完整，则生成指纹
            cookieOfPt.cookiesValue = ""; // 对应cookies不完整的情况
            /*************指纹采集结束****************************************/
            uid = objCommon.createID(objBrowserInfo.getUidStr());
            if (!uid) { // 判断uid是否为空，如果为空，通过时间和随机数重新创建uid
                uid = objCommon.createID((new Date()).getTime()+""+Math.random());
            }
            isNID = "1"; // 新访客
            visitNum = 0; // 访次重新计数
            if (multiLinkTag) {
                // 如果是多域访问过来的
                var tmpLinkTagAry = multiLinkTag.split(".");
                uid = tmpLinkTagAry[0];
                isNID = tmpLinkTagAry[1];
                visitID = tmpLinkTagAry[2];
                siteActionTime = tmpLinkTagAry[3];
                visitNum = tmpLinkTagAry[4];
                pvNum = tmpLinkTagAry[5];
                visitRef = tmpLinkTagAry[6].replace(/\*\_\*/g, ".").replace(/\*\_wh\_\*/g, "?");
                isNV = "0"; // 不计为新访次
            } else {
                isNV = "1"; // 计为新访次
                visitRef = ref["referrer"];
            }
        }else if(isHasSearchInUrl(camParamAry) || isFromSearchEngine()) {
            if (multiLinkTag) {
                // 如果是多域访问过来的
                var tmpLinkTagAry = multiLinkTag.split(".");
                uid = tmpLinkTagAry[0];
                isNID = tmpLinkTagAry[1];
                visitID = tmpLinkTagAry[2];
                siteActionTime = tmpLinkTagAry[3];
                visitNum = tmpLinkTagAry[4];
                pvNum = tmpLinkTagAry[5];
                visitRef = tmpLinkTagAry[6].replace(/\*\_\*/g, ".").replace(/\*\_wh\_\*/g, "?");
                isNV = "0"; // 不计为新访次
            } else {
                // 如果不是新用户，且不是多域过来的，则获得uid，visitNum，NID，NV
                uid = cookieOfPt.getValueFromCookies("uid");
                if (!uid) {     // 判断uid是否为空，如果为空，通过时间和随机数重新创建uid
                    uid = objCommon.createID((new Date()).getTime()+""+Math.random());
                }
                isNID = cookieOfPt.getIsNID();
                visitNum = cookieOfPt.getValueFromCookies("vn");
                isNV = "1"; // 计为新访次
                visitRef = ref["referrer"];
            }
        }else {
            // 获取sessionCookie
            sessionCookiesValue = objHttpCookies.getValue(SESSIONCOOKIESNAME);
            if(hasHttpCookies){
                if(sessionCookiesValue){
                    sessionCookieFlag = 1;
                }else{
                    sessionCookieFlag = 0;
                }
            }else{
                sessionCookieFlag = -1;
            }
            //if (multiLinkTag && (sessionCookieFlag == 0)) {
            if (multiLinkTag) {
                // 如果是多域访问过来的，且没有sessionCookie，（如果有sessionCookie的则说明是刷新了）:uid，isNID，visitID，siteActionTime进行统一
                tmpLinkTagAry = multiLinkTag.split(".");
                uid = tmpLinkTagAry[0];
                isNID = tmpLinkTagAry[1];
                visitID = tmpLinkTagAry[2];
                siteActionTime = tmpLinkTagAry[3];
                visitNum = tmpLinkTagAry[4];
                pvNum = tmpLinkTagAry[5];
                visitRef = tmpLinkTagAry[6].replace(/\*\_\*/g, ".").replace(/\*\_wh\_\*/g, "?");
                pageList = "";
                isNV = "0"; // 不计为新访次
                // 多域过来的也需要设置session
                objHttpCookies.setValue(SESSIONCOOKIESNAME, visitTime, {
                    expires: ""
                });
            } else {
                // 如果不是新用户，且不是多域过来的，则获得uid，visitNum，NID，NV
                uid = cookieOfPt.getValueFromCookies("uid");
                if (!uid) {     // 判断uid是否为空，如果为空，通过时间和随机数重新创建uid
                    uid = objCommon.createID((new Date()).getTime()+""+Math.random());
                }
                isNID = cookieOfPt.getIsNID();
                if (cookieOfPt.getIsRefresh(visitTime) == 1) {
                    // 如果是刷新的话，则不进行更新ref
                    ref = {
                        "flag": 0,
                        "referrer": ""
                    };
                }
                isNV = (ref["flag"] == 1) ? "1" : cookieOfPt.getIsNV(visitTime);
                if (company == "cellant" && adParamFlag) {
                    // 如果是cellant系统，而且广告参数存在，则判定为新访次
                    isNV = "1";
                }
                if (company == "cellant" && sessionCookieFlag && !adParamStr) {
                    adParamStr = sessionCookiesValue.split("cad" + "=")[1];
                    if (adParamStr) {
                        adParamStr = adParamStr.split("&")[0]
                    }
                }
                visitNum = cookieOfPt.getValueFromCookies("vn");
                var tmpPvNum = cookieOfPt.getValueFromCookies("pvn");
                pvNum = (isNV == "1") ? 0 : (tmpPvNum ? tmpPvNum : 1);
                pageList = (isNV == "1") ? "" : cookieOfPt.getValueFromCookies("pl");
                //visitRef = (isNV == "1") ? ref["referrer"] : cookieOfPt.getValueFromCookies("vr");
                visitRef = (isNV == "1") ? ref["referrer"] : ( (win.localStorage && (typeof(win.localStorage.removeItem)=="function")) ? win.localStorage.getItem(profileID) : "");
                if (isNV == "1") {
                    // 如果此时为新访次
                    objHttpCookies.setValue(SESSIONCOOKIESNAME, visitTime, {
                        expires: ""
                    });
                }
            }
        }
        //验证10万次，看能否随机抽样出600次符合标准的uid。
        /*
         var linshiCount = 0;
         for(var iii=0;iii<500000;iii++){
         uid = "adfd"+iii+"25893ab"+iii;
         if(objCommon.MD5(uid).substr(uid.length-3,3) > "019"){
         }
         else{
         linshiCount++;
         }
         }
         */
        if (sid == "whrwhrwhrwhrwhr") {//这个给日本的每日5000万pv的网站准备的，到时候替换了if里面的sid的值，就ok了。
            if (objCommon.MD5(uid).substr(uid.length - 3, 3) > "019") {
                return;
            }
        }
        if (sampleRate) {//开启抽样率API--dennis
            //抽样率必须是数字
            if(/^\d+$/.test(sampleRate)){
                var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/";
                //从uid中取出8个base64的字符
                var shortUid= uid.substr(1,2)
                    +uid.substr(5,1)+uid.substr(8,1)+
                    uid.substr(10,1)+ uid.substr(13,1)+ uid.substr(15,1)+uid.substr(19,1);
                var index = 0;
                var number = 0;
                //将8个base64的字符转换为数字
                while (index < 8) {
                    var c = shortUid.charAt(7 - index);
                    var n = base64EncodeChars.indexOf(c);
                    number += n*Math.pow(64,index);
                    index++;
                }
                if(number % sampleRate != 0) return;
            }
        }
        // 各状态变量的赋值
        pageAccessTime = visitTime; // 页面初访时间（pat)
        siteActionTime = (multiLinkTag) ? siteActionTime : visitTime; // 登录网站最近操作时间（包括此次的加载代码）(sact)，多域访问的话，则继承
        pageActionTime = visitTime; // 本页最近操作时间
        visitID = (multiLinkTag) ? visitID : ((isNV == "1") ? objCommon.createID(uid + page + siteActionTime + "v") : cookieOfPt.getValueFromCookies("vid")); // 访次事件ID
        if (funnelPage && preVID) {
            //zpj:CV流程监测 特殊对应
            if (visitID != preVID) {
                visitID = preVID;
            }
        }
        visitNum = (isNV == "1") ? +visitNum + 1 : ((+visitNum == 0) ? 1 : +visitNum); // 如果是新访的话，
        pvNum = +pvNum + 1;
        pvEventID = objCommon.createID(uid + visitID + page + pageAccessTime + "v"); // 页面访问ID
        pageList = cookieOfPt.plPrc(pageID); // 登录当前页面
        // 更新cookies
        cookieOfPt.writeCookies();
        //=======================对当前的iframe传递进入hash值========================
        (function(){
            if(openIframe || sid == "7f21ceb9"){
                var allIframe = document.getElementsByTagName("iframe");
                for (var i=0; i<allIframe.length; i++) {
                    allIframe[i].onload = (function(i) {
                        return function(objEvent_){
                            this.contentWindow.document.onclick = function(objEvent_) {
                                iframeValue[0] = objBrowserInfo.getAbsLeft(allIframe[i]);
                                iframeValue[1] = objBrowserInfo.getAbsTop(allIframe[i]);
                                iframeValue[2] = encodeURIComponent(objPt.getCssPath(allIframe[i]));
                                clickPrc(objEvent_);
                            };
                        }
                    })(i);
                }
            }
        })();
        // 网站ID+用户ID+页面+访次ID+页面访问ID
        var loadTime = ((window["_pt_lt"] != -1) ? (new Date().getTime() - window["_pt_lt"]) : 0);
        if(loadTime<0){
            loadTime = 0;
        }
        ptq = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
            + "&stat=" + ((isNV == "1") ? visitNum : pvNum) + "." + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
            + "." + yMax * rotationFlag + "." + objBrowserInfo.getViewHeight() + "." + loadTime
            + "." + ((isNV == "1") ? ref["flag"] : objBrowserInfo.getRefType(visitRef))
            + ((isNV == "1") ? "" : ("." + visitNum))
            + "&ref=" + objCommon.encode(ref["referrer"].replace(/&/g, "*&*").replace(/\+/g, "*+*"), false)
            + ((isNV != "1") ? ("&vref=" + objCommon.encode(visitRef, false)) : "")
            + "&p=" + objCommon.encode(page.replace(/&/g, "*&*"), false) + "&tl=" + title
            + (adParamStr ? ("&cad=" + adParamStr) : "")
            + "&ptif=" + terminalType;
        ptq += objBrowserInfo.getSysInfo();
        if (optFlag && typeof(optimizely) == "object") {//用户开启AB测试，且optimizely为true时，发包增加以下字段
            var tmpOpStr = "";
            var tpidAry = optimizely["activeExperiments"];
            if (tpidAry && tpidAry.length > 0) {
                for (var d=0; d<tpidAry.length; d++) {
                    tmpOpStr += d == 0 ? "" : "|o|";
                    tmpOpStr += tpidAry[d]+"|p|"+optimizely["data"]["experiments"][tpidAry[d]].name.substr(0,100)+"|p|"+optimizely["variationIdsMap"][tpidAry[d]][0]+"|p|"+optimizely["variationNamesMap"][tpidAry[d]].substr(0,100);
                }
            }
            ptq += "&op="+objCommon.encode(tmpOpStr, false);
        }
        for(var i=0;i<customVarList.length;i++){//增加用户自定义变量
            if(customVarList[i][2]=="cookie"){
                var cookieOfCustomVar = objHttpCookies.getValue(customVarList[i][1]);
                if( company == 'rakuten-sec' ){
                    /**
                     * 乐天证券-cookie值作为过滤器-自定义变量 (http://jira.ptmind.com/browse/FB-26)
                     * 没有cookie→未登录(返回串为0)
                     * 有Cookie，第6字节开始的5个字节是00000→正在申请账户(返回串为1)
                     * 有Cookie，第6字节开始的5个字节是00000以外的→账户开设成功(返回串为2)
                     */
                    if(cookieOfCustomVar){
                        if( cookieOfCustomVar.slice(5, 10) == '00000' ){
                            ptq += "&"+customVarList[i][0]+"=1";
                        } else {
                            ptq += "&"+customVarList[i][0]+"=2";
                        }
                    } else {
                        ptq += "&"+customVarList[i][0]+"=0";
                    }
                } else if(cookieOfCustomVar){
                    ptq += "&"+customVarList[i][0]+"="+objCommon.encode(cookieOfCustomVar,false);
                }
            }else{
                ptq += "&"+customVarList[i][0]+"="+objCommon.encode(customVarList[i][1],false);
            }
        }
        if(isNV == "1"){
            function compareHrefToRef(href, ref) {	//http://jira.ptmind.com/browse/FB-679|比较两个链接是否在不同域名下，是：返回1，否：返回0[zhaopengjun 2015-05-04]
                for (var i=0; i<domainSet.length; i++) {
                    if (href.indexOf(domainSet[i]) > -1 && ref["referrer"].indexOf(domainSet[i]) > -1) {
                        return 0;
                    }
                }
                return 1;
            }
            if (multiDomainFlag && crossDomainLink != "allManual" && ref["referrer"] != "" && compareHrefToRef(loc.href, ref) && objBrowserInfo.getRefType(ref["referrer"]) == 0 && !loc.href.match(/[\#|\?|\&]_pt_link=[^#|^&]*/)) { 	//http://jira.ptmind.com/browse/FB-601|增加sid=4feafb6a的跨域处理[zhaopengjun 2015-03-26]
                //跨域失败后，手动发送pn包
                pageID = objCommon.createID(ref["referrer"]);
                pvEventID = objCommon.createID(uid + visitID + ref["referrer"] + pageAccessTime + "v");
                ptq = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
                    + "&stat=" + ((isNV == "1") ? visitNum : pvNum) + "." + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
                    + "." + yMax * rotationFlag + "." + objBrowserInfo.getViewHeight() + "." + loadTime
                    + ".0"
                    + "&ref="
                    + "&p=" + objCommon.encode(ref["referrer"].replace(/&/g, "*&*"), false) + "&tl=" + title
                    + (adParamStr ? ("&cad=" + adParamStr) : "")
                    + "&ptif=" + terminalType;
                ptq += objBrowserInfo.getSysInfo();
                objPt.sendMsg(pnURL+ptq);
                (function() {
                    //跨域失败后，手动发送pv包
                    pageID = objCommon.createID(page);
                    pvEventID = objCommon.createID(uid + visitID + page + pageAccessTime + "v");
                    pvNum = +pvNum + 1;
                    ptq = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
                        + "&stat=" + pvNum + "." + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
                        + "." + yMax * rotationFlag + "." + objBrowserInfo.getViewHeight() + "." + loadTime
                        + "." + objBrowserInfo.getRefType(visitRef)
                        + ("." + visitNum)
                        + "&ref=" + objCommon.encode(ref["referrer"].replace(/&/g, "*&*").replace(/\+/g, "*+*"), false)
                        + "&vref="
                        + "&p=" + objCommon.encode(page.replace(/&/g, "*&*"), false) + "&tl=" + title
                        + (adParamStr ? ("&cad=" + adParamStr) : "")
                        + "&ptif=" + terminalType;
                    ptq += objBrowserInfo.getSysInfo();
                    objPt.sendMsg(pvURL+ptq);
                })();
            } else {
                objPt.sendMsg(pnURL+ptq);
            }
        }else{
            objPt.sendMsg(pvURL+ptq);
        }
        // 将访次的信息放在session cookie里
        var sessionMsg = "vt=" + visitTime + "&cad=" + adParamStr;
        objHttpCookies.setValue(SESSIONCOOKIESNAME, sessionMsg, {
            expires: ""
        });
        // 如果是新访，将访次的vref放在localstorage里
        if ((isNV == "1") && win.localStorage && (typeof(win.localStorage.removeItem)=="function")){
            win.localStorage.removeItem(profileID);
            win.localStorage.setItem(profileID,visitRef);
        }
        // 多域处理
        if (multiDomainFlag) {	//http://jira.ptmind.com/browse/FB-601|增加sid=4feafb6a的跨域处理[zhaopengjun 2015-03-26]
            if (doc.readyState == "complete") {
                whandler();
            } else {
                var oldWindowHandler = win.onload;
                win.onload = function() {
                    if (!!oldWindowHandler) {
                        oldWindowHandler();
                    }
                    whandler();
                };
            }
        }
        /*
         * 添加事件
         * target: 组件(可以是一个数据)
         * type: 事件类型-前头不带'on'
         * func: 函数-函数名或者整个匿名函数
         */
        function addEvent(target, type, func) {
            //将target 转化成数组 来循环绑定
            var targets=[];
            if(Object.prototype.toString.call(target)!=="[object Array]"){
                targets=[target];
            }else{
                targets=target;
            }
            for(var i=0;i<targets.length;i++){
                target = targets[i];
                if (target.addEventListener) {
                    target.addEventListener(type, func, true);
                } else if (target.attachEvent) {
                    target.attachEvent("on" + type, func);
                }
                //else target["on" + type] = func; // 防止覆盖原有设定
            }

        }
        /*********************可输入框的焦点触发事件设置开始**********************************/
        var allFocusType=["input","textarea","select"];//所有会触发focus的对象
    	for(var j=0;j<allFocusType.length;j++){
        	var allFormInput = document.getElementsByTagName(allFocusType[j]);
        	for(var i=0;i<allFormInput.length;i++){
            	addEvent(allFormInput[i], "focus", function(objEvent_){
                	srcElement = objBrowserInfo.getSrcElement(objEvent_);
                	var jqueryCssString = objPt.getCssPath(srcElement);
                	if(asyncEventList.length>0){
                    	for(var i=0;i<asyncEventList.length;i++){
                        	if((typeof(jQuery)=="function"&&jQuery(asyncEventList[i][7])[0]==srcElement)||(typeof(jQuery)!="function"&&asyncEventList[i][7]==jqueryCssString)){
                            	_pt_sp_2.push('setTrackEvent,'+asyncEventList[i].slice(1,5).join(",")+ "," +asyncEventList[i].slice(6,8).join(","));
                        	}
                    	}
                	}
            	});
        	}
    	}
        /*********************可输入框的焦点触发事件设置结束**********************************/
        /*********************鼠标移动触发事件设置开始**********************************/
        //addEvent(win, "mousemove", mousemovePrc);
        /*
         function mousemovePrc(objEvent_) {
         if (!activeFlag) {
         // 当页面处于非激活状态
         // 判断当前访次是否超时(用to_flag和sact一起判断）
         var recentTime = new Date().getTime();
         cookieOfPt.readCookies();
         // 根据to_flag标志位以及操作时间判断之前的访次是否已经结束
         if (cookieOfPt.getValueFromCookies("to_flag") == 1 || (+recentTime - +cookieOfPt.getValueFromCookies("sact") > +SILENTTIMES)) {
         // 已经结束
         revisitPrc("pn");
         return;
         } else if (cookieOfPt.isNewVisit(visitID, recentTime)) {
         // 如果当前已经开始一个新的访次
         revisitPrc("pv");
         return;
         } else {
         // 仍然在当前访次，而且访次还没有结束
         // 更新访次及页面活动时间及pvn
         pageActionTime = recentTime;
         siteActionTime = recentTime;
         pvNum = cookieOfPt.getValueFromCookies("pvn");
         // 激活当前页面
         pageList = cookieOfPt.plPrc(pageID); // 更新当前页面
         // 更新cookies
         cookieOfPt.writeCookies();
         // 激活当页的心跳
         clearInterval(window["_pt_hb_interval"]);
         window["_pt_hb_interval"] = setInterval(function() {
         heartBeatPrc();
         }, HBTIMES);
         // 置页面激活标志位
         activeFlag = true;
         }
         } else if (mousemoveFlag) {
         // 页面处于激活状态，也就是一直保持在该页面，并且此时鼠标移动事件属于激活状态，此时只更新页面活动时间
         pageActionTime = new Date().getTime();
         mousemoveFlag = false;
         }
         }
         */
        /*********************鼠标移动触发事件设置结束**********************************/
        /*********************横屏触发事件设置开始**********************************/
        addEvent(win, "onorientationchange", function(objEvent_){
            rotationFlag = ((win.orientation == undefined || win.orientation == 0) ? 1 : -1);
        });
        /*********************横屏触发事件设置结束**********************************/

        /*********************拖动触发事件设置开始**********************************/
        // 设置拖动标志
        addEvent(doc, "touchmove", function(objEvent_){
            touchmoveFlag = true;
        });
        /*********************拖动触发事件设置结束**********************************/
        /*********************点击开始触发事件设置开始**********************************/
        // 在点击开始后获取点击坐标
        addEvent(doc, "touchstart", function(objEvent_){
            // IE的event是全局变量，但w3c标准里需要由触发事件的对象来调用event
            objEvent_ = objEvent_ || win.event;
            srcElement = objBrowserInfo.getSrcElement(objEvent_);
            // 取得点击的相对坐标
            //mouseCoo = (osID == 0) ? objBrowserInfo.getMouseRC(objEvent_) : objBrowserInfo.getMouseAC(objEvent_);
            mouseCoo = objBrowserInfo.getMouseRC(objEvent_);
        });
        
        /*********************点击开始触发事件设置结束**********************************/
        /*********************点击事件设置开始*********************************/
        addEvent(doc, "click", clickPrc);
        function clickPrc(objEvent_){
            var tmpStayTime = 0;
            // IE的event是全局变量，但w3c标准里需要由触发事件的对象来调用event
            objEvent_ = objEvent_ || win.event;

            // 取得点击的相对坐标
            mouseCoo = objBrowserInfo.getMouseRC1(objEvent_);
            // 超出页面内容范围，不计统计
            if(objBrowserInfo.getPageHeight()>0){
                if (mouseCoo.x <= 0 || mouseCoo.y <= 0 || mouseCoo.x > +objBrowserInfo.getPageWidth() || mouseCoo.y > +objBrowserInfo.getPageHeight())
                    return;
            }
            // 获取触发事件的dom元素对象  eventTarget 触发事件的目标元素
            var eventTarget = srcElement = objBrowserInfo.getSrcElement(objEvent_);
            if(srcElement==null){return;}
            //父节点是A的元素(如果本身是A标签,那就是自己)
            var parentAOfThisDom = objPt.parentA(srcElement);
            if(typeof(parentAOfThisDom)=="object"){
            	// 如果父节点里有A，则把点击记在A节点上
                srcElement = parentAOfThisDom;
            }
            //获取元素的绝对横坐标
            srcElementAbsLeft = objBrowserInfo.getAbsLeft(srcElement);
            //获取元素的绝对纵坐标
            srcElementAbsTop = objBrowserInfo.getAbsTop(srcElement);
            //获取css 选择器路径
            var jqueryCssString = objPt.getCssPath(srcElement);
            var domNodeName = srcElement.nodeName.toLowerCase();
            // 如果没过点击冷却时间，则不计该次点击
            var recentTime = new Date().getTime();
            if ((recentTime - clickActionTime) < CLICKINTERVAL && domNodeName != "a") {
                return;
            }
            // 通过onclick方法部署的pt高级监测代码如果被覆盖了，则在点击时触发原来的方法
            var domOnclickContent = srcElement.getAttribute("onclick");
            // 节点里有onclick属性且onclick的静态代码里有pt的监测方法且被其他js动态覆盖
            if (domOnclickContent && domOnclickContent.indexOf("_pt_sp_2") > -1 && srcElement.onclick && srcElement.onclick.toString().indexOf("_pt_sp_2") == -1) {
            	var onclickAry = domOnclickContent.split(";");
            	for(var i = 0; i < onclickAry.length; i++){
            		// 处理setPVTag方法
                    if(onclickAry[i].indexOf("setPVTag") > -1){
                        // 需要注意第一个参数前面会带着_pt_sp_2.push('，第三个参数末尾会带着')符号
                        _pt_sp_2.push(onclickAry[i].replace("_pt_sp_2.push('","").replace('_pt_sp_2.push("','').replace("')","").replace('")',''));
                    }
                    if(onclickAry[i].indexOf("setTrackEvent") > -1){
                        var onclickEventAry = onclickAry[i].split(",");
                        if(onclickEventAry.length == 8){
                            onclickEventAry.pop();
                        }
                        // 需要注意第一个参数前面会带着_pt_sp_2.push('，第三个参数末尾会带着')符号
                        _pt_sp_2.push(onclickEventAry.join("").replace("_pt_sp_2.push('","").replace('_pt_sp_2.push("','').replace("')","").replace('")',''));
                    }
            	}
            }
            
            //智能事件 - 开始，检测三种特殊的点击
            if(domNodeName == "a"){//编码后比较合适
                var setAutoEventString = "";
                var sendHref = objCommon.encode(srcElement.href,false).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E");
                if(srcElement.href==""){
                //href为空，或者PT_trackEvent没有打开的话不走智能事件
                }else if(srcElement.href.match(/mailto:/)){
                    if(autoEventList["mailSendings"]=="true"){
                        setAutoEventString = "Mail,Mailto,"+sendHref.toLowerCase()+",0";
                    }
                }else if(srcElement.href.toLowerCase().match(/\.(msi|pdf|apk|ipa|jar|umd|jad|epub|mobi|iso|tar|zip|rar|gzip|gz|dmg|doc|docx|xls|xlsx|csv|ppt|pptx|exe|txt|pdf|key|numbers|pages)/)){
                    if(autoEventList["fileDownloads"]=="true"){
                        var fileType = srcElement.href.toLowerCase().match(/\.(msi|pdf|apk|ipa|jar|umd|jad|epub|mobi|iso|tar|zip|rar|gzip|gz|dmg|doc|docx|xls|xlsx|csv|ppt|pptx|exe|txt|pdf|key|numbers|pages)/)[1];
                        sendHref = sendHref.replace(/(^https?:\/\/)([^/]+)/i,function(word){
                            return word.toLowerCase();
                        });
                        setAutoEventString = "Downloads,"+fileType+","+sendHref+",0";
                    }
                }else if(srcElement.href.toLowerCase().indexOf("http")==0){
                    if(autoEventList["outboundLinks"]=="true"){
                        var isOutBoundLink = true;
                        for(var i=0;i<domainSet.length;i++){
                            if(srcElement.href.toLowerCase().indexOf(domainSet[i])>0){
                                isOutBoundLink = false;
                                break;
                            }
                        }
                        if(isOutBoundLink){
                            sendHref = sendHref.replace(/(^https?:\/\/)([^/]+)/i,function(word){
                                return word.toLowerCase();
                            });
                            setAutoEventString = "Outbound%20Links,Exit,"+sendHref+",0";
                        }
                    }
                }
                if(setAutoEventString!="" && PT_trackEvent){
                	// 在生成事件包的内容后，将其放入setTrackEvent的API里发送出去
                    _pt_sp_2.push('setTrackEvent,'+setAutoEventString+',false');
                }
            }
            //智能事件 - 结束
            // 自定义事件处理 - 开始
            (function(){
                var elems; //缓存的元素数组
                for(var j=0;j<allFocusType.length;j++){
                    if(allFocusType[j]==domNodeName){
                        return;
                    }
                }
                //此处 应该加一个 srcElement 的缓存对象 来提升效率节约内存!!!
                if(asyncEventList.length>0){
                    for(var i=0;i<asyncEventList.length;i++){
                        if(asyncEventList[i].length >=10){
                            //新版事件

                            //获取选择器元素 asyncEventList[i][9] 是用户设定的 text, 只有text 符合这个值的元素才会发送事件
                            elems = _queryElements(asyncEventList[i][7], asyncEventList[i][9]);

                            for(var j = 0, tempLength = elems.length; j <tempLength; j ++){
                                if(eventTarget === elems[j]){
                                    //发送事件  asyncEventList[i][8] = eid
                                    _pt_sp_2.push("setTrackEvent," + asyncEventList[i].slice(1,5).join(",") + "," +  asyncEventList[i][8]);
                                }
                            }

                        }else if((typeof(jQuery)=="function"&&jQuery(asyncEventList[i][7])[0]==srcElement)||(typeof(jQuery)!="function"&&asyncEventList[i][7]==jqueryCssString)){
                            var tempEventStr = asyncEventList[i];
                            _pt_sp_2.push('setTrackEvent,'+tempEventStr.slice(1,5).join(","));
                        }
                    }
                }
            })();
            // 自定义事件处理 - 结束
            var oneOrTwoForSent = 0; // 该变量是用来标识交互元素-1、子节点-2、其他类型节点-0
            if (domNodeName == "a" || domNodeName == "input" || domNodeName == "select" || domNodeName == "embed" || domNodeName == "object" || domNodeName == "textarea" || domNodeName == "button") {
                oneOrTwoForSent=1;
            }
            else if(srcElement.onclick){
                oneOrTwoForSent=1;
            }
            else if((srcElement.childNodes.length==0)||(srcElement.childNodes.length==1 && srcElement.childNodes[0].nodeType!=1 )){
                oneOrTwoForSent=2;
            }
            else {
                oneOrTwoForSent=0;
            }
            var nodeId = oneOrTwoForSent + iframeValue[2] + objCommon.encode(jqueryCssString, false).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E");
            // 重新读取cookies，因为可能被其他的页面更新
            cookieOfPt.readCookies();
            // 判断当前页面是否为激活页面
            if ((cookieOfPt.getValueFromCookies("to_flag") == 1) || !cookieOfPt.isActive()) {
                // 不是激活页面
                if (cookieOfPt.getValueFromCookies("to_flag") == 1 || (+recentTime - +cookieOfPt.getValueFromCookies("sact") > +SILENTTIMES)) {
                    // 如果访次已经结束
                    revisitPrc("pn");
                    return;
                } else if (cookieOfPt.isNewVisit(visitID, recentTime)) {
                    // 已经换了一个访次
                    revisitPrc("pv");
                    return;
                } else {
                    // 还在当前访次，且还没有结束，则激活该页面
                    activeFlag = true;
                    tmpStayTime = DEFAULTSTAYTIMES; // 由于是刚激活的页面，则计为默认时间
                }
            } else {
                // 当前为激活页面，则直接更新sact，pact，并计算停留时间
                tmpStayTime = recentTime - pageActionTime - (hbCount * HBTIMES);
                if (tmpStayTime < 0 || tmpStayTime > HBTIMES * 1.5) {
                    tmpStayTime = HBTIMES;
                }
            }
            // 更新当前页面
            pageList = cookieOfPt.plPrc(pageID);
            // 更新当前页面及网站的最近操作时间，及点击操作时间
            siteActionTime = recentTime;
            pageActionTime = recentTime; // 本页最近操作时间
            clickActionTime = recentTime;
            pvNum = cookieOfPt.getValueFromCookies("pvn");
            // 重置心跳事件
            if (heatmapFlag) {
                // 如果开启了热图功能
                clearInterval(window["_pt_hb_interval"]);
                window["_pt_hb_interval"] = setInterval(function() {
                    heartBeatPrc();
                }, HBTIMES);
                hbCount = 0;
            }
            // 更新cookies
            cookieOfPt.writeCookies();
            // 阅读线
            var tmpYMax = objBrowserInfo.getYMax();
            rotationFlag = ((win.orientation == undefined || win.orientation == 0) ? 1 : -1)
            if ((rotationFlag == 1) && (tmpYMax > yMaxP)) {
                yMaxP = tmpYMax;
            } else if ((rotationFlag != 1) && (tmpYMax > yMaxM)) {
                yMaxM = tmpYMax;
            }
            if (heatmapFlag) {
                if(sid=="308fd851" || sid=="633fdbe6"){//308fd851和633fdbe6网站oc包只保留10%
                    var randomNumber=parseInt(Math.random()*100);
                    if(randomNumber>10){
                        return;
                    }
                }
                // 发送报文
                var tmpMsg = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
                    + "&stat=" + (mouseCoo.x + iframeValue[0]) * rotationFlag + "." + Math.ceil((mouseCoo.y + iframeValue[1]) * rotationFlag * initialScale)
                    + "." + objBrowserInfo.getViewWidth() + "." + objBrowserInfo.getViewHeight()
                    + "." + nodeId + ".0"
                    + "." + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
                    + "." + ((rotationFlag == 1) ? yMaxP : yMaxM * -1)
                    + "." + tmpStayTime
                    + "." + (srcElementAbsLeft + iframeValue[0]) + "." + (srcElementAbsTop + iframeValue[1])
                    + "&ptif=" + terminalType;
                // 清空元素坐标
                srcElementAbsLeft = 0;
                srcElementAbsTop = 0;
                iframeValue = [0, 0, ""];
                // 发送oc包
                objPt.sendMsgByScript(ocURL + tmpMsg);
            }
        }
        addEvent(doc, "touchend", function(objEvent_){
            var tmpStayTime = 0;// 定义页面停留时间
            // 如果是拖动的话，不做点击处理
            if (touchmoveFlag) {
                touchmoveFlag = false;
                return;
            }
            // 不合法的坐标，则不处理
            if (mouseCoo.x <= 0 || mouseCoo.y <= 0)
                return;
            // 超出页面内容范围，不计统计
            if ((mouseCoo.x == 0 && mouseCoo.y == 0) || (mouseCoo.x < 0 || mouseCoo.x > objBrowserInfo.getPageWidth() || mouseCoo.y > objBrowserInfo.getPageHeight()))
                return;
            var recentTime = new Date().getTime();
            // 重新读取cookies
            cookieOfPt.readCookies();
            // 判断当前页面是否为激活页面
            if ((cookieOfPt.getValueFromCookies("to_flag") == 1) || !cookieOfPt.isActive()) {
                // 不是激活页面
                if (cookieOfPt.getValueFromCookies("to_flag") == 1 || (+recentTime - +cookieOfPt.getValueFromCookies("sact") > +SILENTTIMES)) {
                    // 如果访次已经结束
                    revisitPrc("pn");
                    return;
                } else if (cookieOfPt.isNewVisit(visitID, recentTime)) {
                    // 已经换了一个访次
                    revisitPrc("pv");
                    return;
                } else {
                    // 还在当前访次，且还没有结束，则激活该页面
                    activeFlag = true;
                    tmpStayTime = DEFAULTSTAYTIMES; // 由于是刚激活的页面，则计为默认时间
                }
            } else {
                // 当前为激活页面，则直接更新sact，pact，并计算停留时间
                tmpStayTime = recentTime - pageActionTime - (hbCount * HBTIMES);
                if (tmpStayTime < 0 || tmpStayTime > HBTIMES * 1.5) {
                    tmpStayTime = HBTIMES;
                }
            }
            // 获取点击元素的id
            if(srcElement==null){return;}
            var parentAOfThisDom = objPt.parentA(srcElement);
            if(typeof(parentAOfThisDom)=="object"){
                srcElement = parentAOfThisDom;
            }
            srcElementAbsLeft = objBrowserInfo.getAbsLeft(srcElement);
            srcElementAbsTop = objBrowserInfo.getAbsTop(srcElement);
            var jqueryCssString = objPt.getCssPath(srcElement);
            var domNodeName = srcElement.nodeName.toLowerCase();
            // 如果没过点击冷却时间，则不计该次点击
            if ((recentTime - +clickActionTime) < +CLICKINTERVAL && domNodeName != "a") {
                return;
            }
            
            // 通过onclick方法部署的pt高级监测代码如果被覆盖了，则在点击时触发原来的方法
            // 暂时只针对固定sid
            var domOnclickContent = srcElement.getAttribute("onclick");
            // 节点里有onclick属性且onclick的静态代码里有pt的监测方法且被其他js动态覆盖
            if (domOnclickContent && domOnclickContent.indexOf("_pt_sp_2") > -1 && srcElement.onclick && srcElement.onclick.toString().indexOf("_pt_sp_2") == -1) {
            	var onclickAry = domOnclickContent.split(";");
            	for(var i = 0; i < onclickAry.length; i++){
            		// 处理setPVTag方法
                    if(onclickAry[i].indexOf("setPVTag") > -1){
                        // 需要注意第一个参数前面会带着_pt_sp_2.push('，第三个参数末尾会带着')符号
                        _pt_sp_2.push(onclickAry[i].replace("_pt_sp_2.push('","").replace('_pt_sp_2.push("','').replace("')","").replace('")',''));
                    }
                    if(onclickAry[i].indexOf("setTrackEvent") > -1){
                        var onclickEventAry = onclickAry[i].split(",");
                        if(onclickEventAry.length == 8){
                            onclickEventAry.pop();
                        }
                        // 需要注意第一个参数前面会带着_pt_sp_2.push('，第三个参数末尾会带着')符号
                        _pt_sp_2.push(onclickEventAry.join("").replace("_pt_sp_2.push('","").replace('_pt_sp_2.push("','').replace("')","").replace('")',''));
                    }
            	}
            }
            
            //智能事件，检测三种特殊的点击
            if(domNodeName == "a"){//编码后比较合适
                var setAutoEventString = "";
                var sendHref = objCommon.encode(srcElement.href,false).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E")
                if(srcElement.href==""){
                //href为空，或者PT_trackEvent没有打开的话不走智能事件
                }else if(srcElement.href.match(/mailto:/)){
                    if(autoEventList["mailSendings"]=="true"){
                        setAutoEventString = "Mail,Mailto,"+sendHref.toLowerCase()+",0";
                    }
                }else if(srcElement.href.toLowerCase().match(/\.(msi|pdf|apk|ipa|jar|umd|jad|epub|mobi|iso|tar|zip|rar|gzip|gz|dmg|doc|docx|xls|xlsx|csv|ppt|pptx|exe|txt|pdf|key|numbers|pages)/)){
                    if(autoEventList["fileDownloads"]=="true"){
                        var fileType = srcElement.href.match(/\.(msi|pdf|apk|ipa|jar|umd|jad|epub|mobi|iso|tar|zip|rar|gzip|gz|dmg|doc|docx|xls|xlsx|csv|ppt|pptx|exe|txt|pdf|key|numbers|pages)/)[1];
                        setAutoEventString = "Downloads,"+fileType+","+sendHref+",0";
                    }
                }else if(srcElement.href.toLowerCase().indexOf("http")==0){
                    if(autoEventList["outboundLinks"]=="true"){
                        var isOutBoundLink = true;
                        for(var i=0;i<domainSet.length;i++){
                            if(srcElement.href.toLowerCase().indexOf(domainSet[i])>0){
                                isOutBoundLink = false;
                                break;
                            }
                        }
                        if(isOutBoundLink){
                            sendHref = sendHref.replace(/(^https?:\/\/)([^/]+)/i,function(word){
                                return word.toLowerCase();
                            });
                            setAutoEventString = "Outbound%20Links,Exit,"+sendHref+",0";
                        }
                    }
                }
                if(setAutoEventString!="" && PT_trackEvent){
                    _pt_sp_2.push('setTrackEvent,'+setAutoEventString+',false');
                }
            }
            (function(){
                for(var j=0;j<allFocusType.length;j++){
                    if(allFocusType[j]==domNodeName){
                        return;
                    }
                }
                if(asyncEventList.length>0){
                    for(var i=0;i<asyncEventList.length;i++){
                        if((typeof(jQuery)=="function"&&jQuery(asyncEventList[i][7])[0]==srcElement)||(typeof(jQuery)!="function"&&asyncEventList[i][7]==jqueryCssString)){
                            var tempEventStr = asyncEventList[i];
                            _pt_sp_2.push('setTrackEvent,'+tempEventStr.slice(1,5).join(","));
                        }
                    }
                }
            })();
            var oneOrTwoForSent = 0;
            if (domNodeName == "a" || domNodeName == "input" || domNodeName == "select" || domNodeName == "embed" || domNodeName == "object" || domNodeName == "textarea" || domNodeName == "button") {
                oneOrTwoForSent=1;
            }
            else if(srcElement.onclick){
                oneOrTwoForSent=1;
            }
            else if((srcElement.childNodes.length==0)||(srcElement.childNodes.length==1 && srcElement.childNodes[0].nodeType!=1 )){
                oneOrTwoForSent=2;
            }
            else {
                oneOrTwoForSent=0;
            }
            var nodeId = oneOrTwoForSent + objCommon.encode(jqueryCssString, false).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E");
            // 更新当前页面
            pageList = cookieOfPt.plPrc(pageID);
            // 更新当前页面及网站的最近操作时间，及点击操作时间
            siteActionTime = recentTime;
            pageActionTime = recentTime; // 本页最近操作时间
            clickActionTime = recentTime;
            pvNum = cookieOfPt.getValueFromCookies("pvn");
            // 重置心跳事件
            if (heatmapFlag) {
                clearInterval(window["_pt_hb_interval"]);
                window["_pt_hb_interval"] = setInterval(function() {
                    heartBeatPrc();
                }, HBTIMES);
                hbCount = 0;
            }
            // 更新cookies
            cookieOfPt.writeCookies();
            // 阅读线
            var tmpYMax = objBrowserInfo.getYMax();
            rotationFlag = ((win.orientation == undefined || win.orientation == 0) ? 1 : -1)
            if ((rotationFlag == 1) && (tmpYMax > yMaxP)) {
                yMaxP = tmpYMax;
            } else if ((rotationFlag != 1) && (tmpYMax > yMaxM)) {
                yMaxM = tmpYMax;
            }
            if (heatmapFlag) {
                var tmp = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
                    + "&stat=" + mouseCoo.x * rotationFlag + "." + Math.ceil(mouseCoo.y * rotationFlag * initialScale)
                    + "." + objBrowserInfo.getViewWidth() + "." + objBrowserInfo.getViewHeight()
                    + "." + nodeId + ".0"
                    + "." + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
                    + "." + ((rotationFlag == 1) ? yMaxP : yMaxM * -1)
                    + "." + tmpStayTime
                    + "." + srcElementAbsLeft + "." + srcElementAbsTop
                    + "&ptif=" + terminalType;
                var tmpMsg = tmp + "&v=1.3&ts=" + (new Date()).getTime();
                // 清空元素坐标
                srcElementAbsLeft = 0;
                srcElementAbsTop = 0;
                if(sid=="308fd851" || sid=="633fdbe6"){//308fd851和633fdbe6网站oc包只保留10%
                    var randomNumber=parseInt(Math.random()*100);
                    if(randomNumber>10){
                        return;
                    }
                }
                // 发送oc包
                objPt.sendMsgByScript(ocURL + tmpMsg);
            }
        });
        /*********************滚动事件设置开始*********************************/
        // 初始化当前时间，当前滚动条位置以及当前滚动记录串
        var timeB = visitTime, timeN, tmpTime = 0;
        addEvent([win,doc.body], "scroll", function(objEvent_){
            // 先判断滚动事件的合法性
            var recentTime = new Date().getTime();
            // 取得当前时间
            timeN = recentTime;
            // 取得停留时间段
            tmpTime = timeN - timeB;
            // 停留时间不到规定时间不计, 但需要保存当前位置和当前时间
            if (tmpTime < +SCROLLINTERVAL) {
                // 保存当前时间
                timeB = timeN;
                return;
            }
            var tmpStayTime = "";
            // 重新读取cookies，因为可能被其他的页面更新
            cookieOfPt.readCookies();
            // 判断当前页面是否为激活页面
            if ((cookieOfPt.getValueFromCookies("to_flag") == 1) || !cookieOfPt.isActive()) {
                // 不是激活页面
                if (cookieOfPt.getValueFromCookies("to_flag") == 1 || (+recentTime - +cookieOfPt.getValueFromCookies("sact") > +SILENTTIMES)) {
                    //if (cookieOfPt.getValueFromCookies("to_flag") == 1) {
                    // 如果访次已经结束
                    revisitPrc("pn");
                    return;
                } else if (cookieOfPt.isNewVisit(visitID, recentTime)) {
                    // 已经换了一个访次
                    revisitPrc("pv");
                    return;
                } else {
                    // 还在当前访次，且还没有结束，则激活该页面
                    activeFlag = true;
                    tmpStayTime = DEFAULTSTAYTIMES; // 由于是刚激活的页面，则计为默认时间
                }
            } else {
                // 当前为激活页面，则直接更新sact，pact，并计算停留时间
                tmpStayTime = recentTime - pageActionTime - (hbCount * HBTIMES);
                if (tmpStayTime < 0 || tmpStayTime > HBTIMES * 1.5) {
                    tmpStayTime = HBTIMES;
                }
            }
            // 更新当前页面
            pageList = cookieOfPt.plPrc(pageID);
            // 更新当前页面及网站的最近操作时间
            siteActionTime = recentTime;
            pageActionTime = recentTime; // 本页最近操作时间
            pvNum = cookieOfPt.getValueFromCookies("pvn");
            // 重置心跳事件
            if (heatmapFlag) {
                clearInterval(window["_pt_hb_interval"]);
                window["_pt_hb_interval"] = setInterval(function() {
                    heartBeatPrc();
                }, HBTIMES);
                hbCount = 0;
            }
            // 更新cookies
            cookieOfPt.writeCookies();
            // 阅读线
            var tmpYMax = objBrowserInfo.getYMax();
            rotationFlag = ((win.orientation == undefined || win.orientation == 0) ? 1 : -1)
            if ((rotationFlag == 1) && (tmpYMax > yMaxP)) {
                yMaxP = tmpYMax;
            } else if ((rotationFlag != 1) && (tmpYMax > yMaxM)) {
                yMaxM = tmpYMax;
            }
            //滚动到头和尾的时候不发送包（禅道TASK 241）
            if(objBrowserInfo.getScrollY()<=1){//有的浏览器在顶部的时候此值为1
                //滚到顶部
            }
            else if(doc.body.clientHeight>0 && objBrowserInfo.getScrollY()+objBrowserInfo.getBrowserHeight()+1>=doc.body.clientHeight){
                //滚到底部
            }
            else{
                // 发送报文
                if (heatmapFlag) {
                    //objBrowserInfo.getViewHeight()值大于1500时，取1500（sid=4255b04a的客户，部分os包中，vh值大于6000，FB-246）
                    var tmp = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
                        + "&stat=" + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
                        + "." + ((rotationFlag == 1) ? yMaxP : yMaxM * -1)
                        + "." + (objBrowserInfo.getViewHeight() > 1500 ? 1500 : objBrowserInfo.getViewHeight()) + "." + tmpStayTime
                        + "&ptif=" + terminalType;
                    // 如果开启了热图功能
                    if(sid=="308fd851"||sid=="633fdbe6"){//308fd851和633fdbe6网站os包只保留10%
                        var randomNumber=parseInt(Math.random()*100);
                        if(randomNumber<=10){
                            objPt.sendMsg(osURL+tmp);
                        }
                    }else{
                        objPt.sendMsg(osURL+tmp);
                    }
                }
            }
            // 保存当前时间
            timeB = timeN;
        });
        /*********************心跳事件设置开始**********************/
        //跨域页面超时后，重置a标签链接，删除私有字段，恢复为原页面的链接
        function resetLinkUrl() {
            var links = doc.getElementsByTagName("a");
            var pt_str = "", pt_tmpHref, tmpUrl;
            for (var l=0; l<links.length; l++) {
                pt_tmpHref = links[l].getAttribute("href");
                pt_str = pt_tmpHref.match(/[\#|\?|\&]_pt_link=[^#|^&]*/);
                if (pt_str) {
                    pt_tmpHref = pt_tmpHref.split(pt_str);
                    tmpUrl = pt_tmpHref[0] + (pt_tmpHref[1] ? pt_tmpHref[1] : "");
                    links[l].setAttribute("href",tmpUrl);
                }
            }
        }
        window["_pt_hb_interval"] = setInterval(function() {
            heartBeatPrc();
        }, HBTIMES);
        // 发送心跳包
        function heartBeatPrc() {
            // 重新读取cookies，因为可能被其他的页面更新
            cookieOfPt.readCookies();
            // 如果当前页面为非激活页面，则不做任何操作
            if (!cookieOfPt.isActive()) {
                activeFlag = false;
                return;
            }
            var recentTime = new Date().getTime();
            // 判断当前页面是否超时，如果静默时间超过一定时间，则判断该访问结束，并将最后五分钟去掉
            if (recentTime - pageActionTime > (SILENTTIMES + +HBTIMES)) {
                // 超时
                if (multiDomainFlag) {	//http://jira.ptmind.com/browse/FB-601|增加sid=4feafb6a的跨域处理[zhaopengjun 2015-03-26]
                    resetLinkUrl();
                }
                clearInterval(window["_pt_hb_interval"]);
                toFlag = 1;
                activeFlag = false;
                // 更新cookies
                cookieOfPt.writeCookies();
                if ((hbCount + 5) * +HBTIMES < SILENTTIMES) {
                    // 如果hbCount没有被执行过，也就是heartBeatPrc没有被执行，但是仍然超时的话
                    return;
                }
            }
            hbCount++;// 心跳包计数自增
            // 阅读线
            var tmpYMax = objBrowserInfo.getYMax();
            rotationFlag = ((win.orientation == undefined || win.orientation == 0) ? 1 : -1)
            if ((rotationFlag == 1) && (tmpYMax > yMaxP)) {
                yMaxP = tmpYMax;
            } else if ((rotationFlag != 1) && (tmpYMax > yMaxM)) {
                yMaxM = tmpYMax;
            }
            // 发送报文
            var tmp = "?id=" + sid + "." + uid + "." + visitID + "." + pageID + "." + pvEventID
                + "&stat=" + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
                + "." + ((rotationFlag == 1) ? yMaxP : (yMaxM * -1))
                + "." + objBrowserInfo.getViewHeight() + "." + ((toFlag == 1) ? (-1 * SILENTTIMES + 1) : HBTIMES)
                + "&ptif=" + terminalType;
            objPt.sendMsg(hbURL+tmp);
        }
        /********************滚动事件(计停留时长)设置结束**************************/
        return false;
    }
    //跨域操作时，修改a标签的链接
    function whandler() {
        var links = doc.getElementsByTagName("a");
        var tmpHref = "";
        if (crossDomainLink == "allManual") {
            for (var x = 0; x < links.length; x++) {
                tmpHref = links[x].getAttribute('href');
                if (tmpHref && links[x].getAttribute("onclick") && links[x].getAttribute("onclick").indexOf("pt_domain") > -1) {
                    //全手动模式：满足条件1、包含onclick属性且值中有pt_domain字段；
                    var lowerCaseHref = tmpHref.toLowerCase();
                    for (var y = 0; y < domainSet.length; y++) {
                        if (lowerCaseHref.indexOf(domainSet[y]) > -1 && (tmpHref.indexOf(location.hostname) < 0 || tmpHref.indexOf(location.hostname) > lowerCaseHref.indexOf(domainSet[y]))) {
                            // 如果当前的href包含在跨域域名集内，并且不包含当前主机名或当前主机名在跨域域名的后面[zhaopengjun 2015-03-26]
                            links[x].setAttribute('href',createLinkUrl(tmpHref));
                            break;
                        }
                    }
                }
            }
        } else if (crossDomainLink == "halfManual") {
            for (var x = 0; x < links.length; x++) {
                tmpHref = links[x].getAttribute('href');
                if (tmpHref && tmpHref.match(/^https?:\/\//) && tmpHref.length < 900) {
                    //半手动模式：满足条件1、href值以http开头；2、href值长度小于900。
                    var lowerCaseHref = tmpHref.toLowerCase();
                    for (var y = 0; y < domainSet.length; y++) {
                        if (lowerCaseHref.indexOf(domainSet[y]) > -1 && (tmpHref.indexOf(location.hostname) < 0 || tmpHref.indexOf(location.hostname) > lowerCaseHref.indexOf(domainSet[y]))) {
                            // 如果当前的href包含在跨域域名集内，并且不包含当前主机名或当前主机名在跨域域名的后面[zhaopengjun 2015-03-26]
                            links[x].setAttribute('href',createLinkUrl(tmpHref));
                            break;
                        }
                    }
                }
            }
        }
    }
    // 跨域访问创建新的URL地址
    function createLinkUrl(targetUrl) {
        var n = targetUrl.split("#");
        cookieOfPt.readCookies();
        if (cookieOfPt.cookiesValue) {
            var linkTag = cookieOfPt.getValueFromCookies("uid") + "."
                + cookieOfPt.getValueFromCookies("nid") + "."
                + cookieOfPt.getValueFromCookies("vid") + "."
                + cookieOfPt.getValueFromCookies("sact") + "."
                + cookieOfPt.getValueFromCookies("vn") + "."
                + cookieOfPt.getValueFromCookies("pvn") + "."
                    //+ cookieOfPt.getValueFromCookies("vr").replace(/\./g, "*_*");
                + (  (win.localStorage && (typeof(win.localStorage.removeItem)=="function") && win.localStorage.getItem(profileID)) ? win.localStorage.getItem(profileID).replace(/\./g, "*_*").replace(/\?/g, "*_wh_*") : "");
            if (n.length == 1) {
                // 后面没有锚点，则直接加上锚点参数
                targetUrl += "#_pt_link=" + linkTag;
            } else if (crossDomainLink == "allManual" || crossDomainLink == "halfManual") {
                // 后面有锚点，则在锚点前加入参数（用?或者&）
                targetUrl = n[0] + ((targetUrl.indexOf("?") == -1) ? "?" : "&") + "_pt_link=" + linkTag + "#" + n[1];
            }
        }
        return targetUrl;
    }
    /*********************模拟重登录处理开始**********************************/
    function revisitPrc(type,sentPage,sentPageID) {
        var pageID_ = sentPageID ? sentPageID : pageID;
        var page_ = sentPage ? sentPage: page;
        var recent = new Date(), recentTime = recent.getTime();//定义的recentTimeDate变量没有用到，所以给删除掉了
        if (type != "vpv") {
            if (recentTime - pageActionTime < 10000) {
                return;
            }
        }
        // 重新读取cookies
        cookieOfPt.readCookies();
        // 需要重置一些值
        yMax = objBrowserInfo.getYMax();
        toFlag = 0;
        activeFlag = 1;
        // uid,page,pageID都可以重用，pageList重置
        pageAccessTime = recentTime; // 页面初访时间
        siteActionTime = recentTime; // 登录网站最近操作时间（包括此次的加载代码）
        pageActionTime = recentTime; // 本页最近操作时间
        if (type == "pn") {
            // 作为一个新访次
            isNV = "1";
            visitNum = cookieOfPt.getValueFromCookies("vn");
            isNID = cookieOfPt.getIsNID();
            pageList = "";
            visitID = objCommon.createID(uid + page_ + siteActionTime + "v"); // 访次事件ID
            visitNum = +visitNum + 1; //
            pvNum = 1;
        } else {
            // 作为已经开始的访次的新pv
            pageList = cookieOfPt.getValueFromCookies("pl");
            visitID = cookieOfPt.getValueFromCookies("vid");
            pvNum = cookieOfPt.getValueFromCookies("pvn");
            pvNum = pvNum ? (+pvNum + 1) : 1;
        }
        pvEventID = objCommon.createID(uid + visitID + page_ + pageAccessTime + "v"); // 页面访问ID
        pageList = cookieOfPt.plPrc(pageID); // 登录当前页面，不停止原有的激活状态
        // 更新cookies
        cookieOfPt.writeCookies();
        //======================cookies处理结束==========================================
        //生成URL传参串
        // 网站ID+用户ID+页面+访次ID+页面访问ID
        ptq = "?id=" + sid + "." + uid + "." + visitID + "." + pageID_ + "." + pvEventID
            + "&stat=" + ((type == "pn") ? ((+visitNum == 0) ? 1 : +visitNum) : pvNum) + "." + ((rotationFlag == 1) ? objBrowserInfo.getScrollY() : ((objBrowserInfo.getScrollY() + 1) * rotationFlag))
            + "." + yMax * rotationFlag + "." + objBrowserInfo.getViewHeight()
            + "." + 0
            + "." + 0
            + ((type == "pn") ? "" : ("." + visitNum))
            + "&ref="
            + ((type == "pn") ? "" : ("&vref=" + objCommon.encode(visitRef, false)))
            + "&p=" + objCommon.encode(page_.replace(/&/g, "*&*"), false) + "&tl=" + title
            + (adParamStr ? ("&cad=" + adParamStr) : "")
            + "&ptif=" + terminalType;
        ptq += objBrowserInfo.getSysInfo();
        if (optFlag && typeof(optimizely) == "object") {//用户开启AB测试，且optimizely为true时，发包增加以下字段
            var tmpOpStr = "";
            var tpidAry = optimizely["activeExperiments"];
            if (tpidAry && tpidAry.length > 0) {
                for (var d=0; d<tpidAry.length; d++) {
                    tmpOpStr += d == 0 ? "" : "|o|";
                    tmpOpStr += tpidAry[d]+"|p|"+optimizely["data"]["experiments"][tpidAry[d]].name.substr(0,100)+"|p|"+optimizely["variationIdsMap"][tpidAry[d]][0]+"|p|"+optimizely["variationNamesMap"][tpidAry[d]].substr(0,100);
                }
            }
            ptq += "&op="+objCommon.encode(tmpOpStr, false);
        }
        for(var i=0;i<customVarList.length;i++){
            if(customVarList[i][2]=="cookie"){
                var cookieOfCustomVar = objHttpCookies.getValue(customVarList[i][1]);
                if(cookieOfCustomVar){
                    ptq += "&"+customVarList[i][0]+"="+objCommon.encode(cookieOfCustomVar,false);
                }
            }else{
                ptq += "&"+customVarList[i][0]+"="+objCommon.encode(customVarList[i][1],false);
            }
        }
        //}
        objPt.sendMsg(((type == "pn") ? pnURL : pvURL)+ptq);
        toFlag = 0;
        if (multiDomainFlag && type != "vpv") {	//http://jira.ptmind.com/browse/FB-601|增加sid=4feafb6a的跨域处理[zhaopengjun 2015-03-26]
            whandler();
        }
    }
    /*********************模拟重登录处理结束**********************************/
    /****************************************************************************************************************************************************************************/
    function definePrc(ary) {
        //try {
        var length = ary.length, d, tmpIndex = 0;
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                tmpIndex = ary[i].indexOf(",");
                //2016.3.25凌晨3点多发现一个莫名recordsource，放到了ary里，得先注释掉下面的判断
                //if (tmpIndex < 0){
                    //console.log("ptmind_debug:  "+"function definePrc tmpIndex<0");
                    //return false;
                //}
                if (!execPrc(ary[i].slice(0, tmpIndex), ary[i].slice(tmpIndex + 1)))
                    return false;
            }
        }
        return true;
        //} catch (ex) {
        //    return false;
        //}
    }
    function execPrc(functionStr, paraStr) {
        if (!paraStr){        // 如果参数为空则报错退出
            //console.log("ptmind_debug:  "+"Parameter is empty");
            return false;
        }
        switch (functionStr) {
            case "setServer":
                serverNum = paraStr ? +paraStr : 0;

                //重新生成发送地址
                toURL = (sid == '6c75a350') ? (protocol + 'rtcollect.ptengine.jp') : (protocol + serverList[serverNum]), //针对乐天证券sid迁移至rtcollect.ptengine.jp [2014-08-05] http://jira.ptmind.com/browse/FB-116
                    pnURL = toURL + "/pn", // 处理页面新访问的URL
                    pvURL = toURL + "/pv", // 处理页面非新访问的URL
                    ocURL = toURL + "/oc", // 处理点击事件的URL
                    osURL = toURL + "/os", // 处理滚动事件的URL
                    hbURL = toURL + "/hb", // 处理心跳事件的URL
                    teURL = toURL + "/te"; // 处理用户自定义事件
                break;
            // 设定广告参数
            case "setAdParam":
                company = "cellant";
                paraStr = paraStr.replace(/^\|*/, "").replace(/\|*$/, "");
                adParamAry = paraStr ? paraStr.split("|") : "";
                break;
            //设置广告参数（上面哪个不是通用的广告参数，而是特殊对应）
            case "setCamParam":
                camParamAry = paraStr.split(",");
                break;
            // 设定URL虚拟参数
            case "setURL":
                urlMark = paraStr;
                break;
            // 设定虚拟url
            case "setVPV":
                vUrl = initPage + "#" + paraStr.toLowerCase().split(",")[0];
                if (paraStr.toLowerCase().split(",").length > 1 && paraStr.toLowerCase().split(",")[1] == "replace") {
                    vUrl = paraStr.toLowerCase().split(",")[0];
                }
                break;
            // 设定虚拟url
            case "setVPT":
                vTitle = paraStr;
                break;
            // 设定账户名
            case "setAccount":
                sid = paraStr.toLowerCase();
                break;
            // 设定账户名
            case "setSID":
                sid = paraStr.toLowerCase();
                break;
            //是否是测试网站
            case "isTestWeb":
                if(paraStr == "true" && sid!=""){
                    testSID[sid] = true;
                }
                break;
            // 设定域设置
            case "useHttpCookie":
                useHttpCookie = paraStr.toLowerCase()=="false"? false : true;
                break;
            case "setDomain":
                return (function() {
                    domainName = "";
                    /*
                     // http://tamahome.mobile-cp.jp/
                     if (sid == "76588543" && loc.href.toLowerCase().indexOf("tamahome.mobile-cp.jp") > -1) {
                     paraStr = "tamahome.mobile-cp.jp";
                     }
                     // http://www.porcovino.com/
                     if (sid == "3ed9846f") {
                     paraStr = "porcovino.com";
                     }
                     */
                    var temp = paraStr.split(',');
                    multiDomainFlag = (temp.length > 1);
                    //http://jira.ptmind.com/browse/FB-629|对域名进行排序，使domainName值按长度排序，避免abc.com和abc.com.cn的错误[zhaopengjun 2015-04-07]
                    temp.sort(function(a,b){return a.replace(/^https?:\/\//,"").length>b.replace(/^https?:\/\//,"").length?1:-1});
                    for(var i=0;i<temp.length;i++){
                        domainSet.push(temp[i].replace(/^https?:\/\//,""));
                        if(temp[i].match(/https?:\/\//) && temp[i].match(/https?:\/\//)[0]!=location.protocol+"//"){
                            continue;
                        }// 设定的域名只兼容某一种协议
                        if(location.hostname.match(temp[i].replace(/^https?:\/\//,""))) {
                            domainName = temp[i].replace(/^https?:\/\//,"");
                        }
                    }
                    if(!domainName){
                        //return false;
                    }
                    if (paraStr == "default" || location.href.slice(0, 4) != "http"){// 兼容原ptengine的代码
                        domainName = location.href.toLowerCase().split("://")[1].split("?")[0].split("/")[0];
                        domainSet.push(domainName);
                    }
                    return true;
                })();
                break;
            case "setAutoEvent":
                if(paraStr.split(",").length==2){
                    autoEventList[paraStr.split(",")[0]] = paraStr.split(",")[1];
                }
                break;
            case "setEventReport":
                PT_trackEvent = paraStr=="true"?true:false;
                break;
            default:
                break;
        }
        return true;
    }
    /*
     * 下面列了三种存储方式userData，LocalStorageState，httpCookie三种存储策略
     * 上层调用地方可以在三种之间可以随意替换策略，而无需任何其他修改
     */
    function Ie6to8State(httpCookieState){
        var userData = null;
        this.init = function(){
            if(!userData){
                try{
                    userData = doc.createElement('input');
                    userData.type = "hidden";
                    userData.addBehavior ("#default#userData");
                    doc.body.appendChild(userData);
                }catch(e){return false;}
            };
            return true;
        }
        this.isEnabled = function() {return true;}
        this.clearOtherCookie=function(){
            var tmpCookie = new HttpCookieState();
            if(tmpCookie.getValue(COOKIESNAME)){
                tmpCookie.setValue(COOKIESNAME,"",{expires: ""});
                tmpCookie.setValue(CLICKCOOKIESNAME,"",{expires: ""});
            }
        }
        this.setValue = function(name, value, options) {
            if( name == SESSIONCOOKIESNAME ){httpCookieState.setValue(name, value, options);return;}
            try{
                if(this.init()){
                    var o = userData;
                    o.load(name);
                    if(value) o.setAttribute("code", value);
                    var d = new Date(), e = 30;
                    d.setDate(d.getDate()+e);
                    o.expires = d.toUTCString();
                    o.save(name);
                }
            }catch (ex){}
        }
        this.getValue = function(name) {
            if( name == SESSIONCOOKIESNAME ){return httpCookieState.getValue(name);}
            if(this.init()){
                try{
                    var o = userData;
                    o.load(name);
                    return o.getAttribute("code");
                }catch (ex){return null;}
            }
        }
    }
    function LocalStorageState(){
        this.isEnabled = function() {
            return win.localStorage && (typeof(win.localStorage.removeItem)=="function");
        }
        this.clearOtherCookie=function(){
            var tmpCookie = new HttpCookieState();
            if(tmpCookie.getValue(COOKIESNAME)){
                tmpCookie.setValue(COOKIESNAME,"",{expires: ""});
                tmpCookie.setValue(CLICKCOOKIESNAME,"",{expires: ""});
            }
        }
        this.getValue = function(name){
            return win.sessionStorage.getItem(name) || win.localStorage.getItem(name);
        }
        this.setValue = function(name, value, options) {
            if(options.expires ==""){
                win.sessionStorage.setItem(name,value);
                win.localStorage.removeItem(name);
            }
            else{win.localStorage.setItem(name,value);}
        }
    }
    function HttpCookieState(){
        this.isEnabled = function() { return na.cookieEnabled}
        this.clearOtherCookie=function(){}
        this.getValue = function(name) {
            var cookieValue = "";
            if (!this.isEnabled()) {
                hasHttpCookies = false;
            }
            if (doc.cookie && doc.cookie != '') {
                var cookies = doc.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = objCommon.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        if ((name != COOKIESNAME) || ((name == COOKIESNAME) && (cookie.indexOf("pt1pt") < 0) && (cookie.indexOf("pt0pt") < 0) )) {// 不是主cookie，或者如果是主cookie的话，必须满足规则
                            cookieValue = cookie.substring(name.length + 1);
                            break;
                        }
                    }
                }
            }return cookieValue;
        }
        this.setValue = function(name, value, options) {
            if (!this.isEnabled()) {
                hasHttpCookies = false;
                return;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                }
                else {date = options.expires;}
                expires = '; expires=' + date.toUTCString();
            }
            //var domain = options.domain ? '; domain=' + (options.domain) : '';
            //var secure = options.secure ? '; secure' : '';
            //var path = options.path ? '; path=' + (options.path) : '';
            //doc.cookie = [name, '=', value, expires, path, domain, secure].join('');
            doc.cookie = name+'='+value+expires+'; path=/; domain='+domainName;
        }
    };
    // cookies操作模块
    function CLSCookies() {
        var isGiveup = false;
        //策略模式，配置不同的存储策略
        this.localDataType = "";
        if(!useHttpCookie && na.userAgent.toLowerCase().match(/msie\s([2-8]+?\.[\d]+)/ig)) {//userData
            this.localDataType = new Ie6to8State(new HttpCookieState());
        }else if(!useHttpCookie && win.localStorage && win.sessionStorage && typeof(win.localStorage.removeItem)=="function" && typeof(win.sessionStorage.removeItem)=="function"){//用localStorage
            var k="pt_test";
            //写入两个storage值
            win.sessionStorage.setItem(k+"sk",k+"sv");
            win.localStorage.setItem(k+"lk",k+"lv");
            if(win.sessionStorage.getItem(k+"sk")==k+"sv" && win.localStorage.getItem(k+"lk")==k+"lv"){
                //只有可以读取刚才存取的值的，才会改为使用storage方式作为存储
                this.localDataType = new LocalStorageState();
            }else{
                var isGiveup = true;
                //this.localDataType = new HttpCookieState();
            }
            //销毁刚才生成的storage值
            win.sessionStorage.removeItem(k+"sk");
            win.localStorage.removeItem(k+"lk");
        }else if(!useHttpCookie){
            var isGiveup = true;
        }else{
            this.localDataType = new HttpCookieState();
        }
        if(isGiveup){
            this.clearOtherCookie = function(){}
            this.isEnabled = function() { return false;}
            this.setValue = function(name, value, options) {}
            this.getValue = function(name) {return "";}
        }else{
            this.clearOtherCookie = function(){
                this.localDataType.clearOtherCookie();
            }
            this.isEnabled = function() {
                return this.localDataType.isEnabled();
            }
            this.setValue = function(name, value, options) {
                this.localDataType.setValue(name, value, options);
            }
            this.getValue = function(name) {
                return this.localDataType.getValue(name);
            }
        }
    }
    // 访客信息采集模块
    function CLSBrowserInfo() {
        this.getSysInfo = function(){
            var sysInfo = []; // UID字符组
            //当宽度大于高度的时候，
            if(this.getTerminalType() == 1 || this.getTerminalType() == 4) {
                //对于手机和平板，数值小的就是宽度，数值大的就是高度。永远统计竖屏状态
                sysInfo.push("." + [this.getViewWidth(),this.getScreenHeight()].sort()[0]);// 屏幕宽度
                sysInfo.push("." + [this.getViewWidth(),this.getScreenHeight()].sort()[1]);// 屏幕高度
            }else{
                sysInfo.push("." + this.getViewWidth());// 屏幕宽度
                sysInfo.push("." + this.getScreenHeight());// 屏幕高度
            }
            sysInfo.push("." + (win.screen.colorDepth||0));        // 屏幕色深，取得屏幕信息（width*length*color）
            sysInfo.push("." + this.getTimezone().replace(/\./g, "_"));  // 时区, 将小数点替换成_是为了不合信息串中的小数点冲突
            sysInfo.push("." + (na.platform||"").replace(/\./g, "_").toLowerCase());                     // 取得系统平台
            sysInfo.push("." + (na.language||na.browserLanguage||"").replace(/\./g, "_").toLowerCase()); // 取得浏览器语言
            sysInfo.push("." + (doc.characterSet || doc.charset ||"").replace(/\./g, "_").toLowerCase());// 取得浏览器字符集
            /*合并成URL传参时用的信息串*/
            return sysInfo.join("");//paraStr
        }
        this.getUidStr = function(){
            try {
                var uidStr = [this.getSysInfo()]; // UID字符组
                // 取得UA
                uidStr.push("&ua=" + objCommon.encode((na.userAgent || ""), false));
                // 浏览器宽度
                uidStr.push("&bw=" + (doc.documentElement.clientWidth || doc.body.clientWidth || 0));
                // 浏览器高度
                uidStr.push("&bh=" + objBrowserInfo.getBrowserHeight());
                // 通用插件信息
                uidStr.push("&pi=" + objBrowserInfo.getPlugins());
                // 当次访问时间
                uidStr.push("&ts=" + visitTimeDate);
                var str = uidStr.join("");
                if (!str) {     // 判断uid是否为空，如果为空，通过时间和随机数重新创建uid
                    str = (new Date()).getTime() + "" + Math.random();
                }
                return str;
            } catch (ex) {
                return (new Date()).getTime() + "" + Math.random();
            }
        }
        // 取得title
        this.getTitle = function() {
            try {
                var tmpTitle = (doc.getElementsByTagName("title")[0] && doc.getElementsByTagName("title")[0].innerHTML) || doc.title;
                tmpTitle = objCommon.trim(tmpTitle.split("#")[0]);
                // 设置虚拟标题
                if(vTitle){
                    tmpTitle = vTitle;
                }
                return objCommon.encode(tmpTitle, false);
            } catch (ex) {
                return "";
            }
        }
        // 判断ref的类型
        this.getRefType = function(ref) {
            if (!ref) {
                return 0;
            } else {
                var tmpHost = ref.split("?")[0].toLowerCase();
                for (var i = 0; i < domainSet.length; i++) {
                    var hrefProcl = tmpHost.split("://")[0];
                    if (!domainSet[i].match(/^https?:\/\/.*/) && tmpHost.indexOf(domainSet[i]) > -1) {
                        // 设定的域名兼容两种协议且域名合法
                        return 0;
                    } else {
                        // 设定的域名只支持一种协议
                        var domainProcl = domainSet[i].split("://")[0];
                        if (hrefProcl == domainProcl && tmpHost.indexOf(domainSet[i].split("://")[1]) > -1) {
                            // 协议相同，则再进行域名的包含验证，域名合法时
                            return 0;
                        }
                    }
                }
                return 1;
            }
        }
        // 取得流量来源
        // 返回 {"flag":0, "referrer":""}; 0:直接来源或者站内 | 1:外链
        this.getRef = function() {
            try {
                var tmpRef = {
                    "flag": 0,
                    "referrer": ""
                };
                //if (doc.referrer) {
                //zpj:FB-148 CV流程监测问题的特殊对应
                var tmpReferrer = doc.referrer;
                if (tmpReferrer || (funnelPage && funnelRef)) {
                    if (funnelPage) {
                        tmpReferrer = funnelRef ? funnelRef : "*"+tmpReferrer+"*";
                    }
                    var tempRefArray = tmpReferrer.match(/^(\S+:\/\/)?([^\/|\?|\#]+)(\S*)/);
                    if(sid=="5555e192" || sid=="41307454" || sid=="6075c852"){
                        tmpRef["referrer"] = tmpReferrer.toLowerCase();
                    }else{
                        tmpRef["referrer"] = tempRefArray[1].toLowerCase()+tempRefArray[2].toLowerCase()+tempRefArray[3];
                    }
                    if (tmpRef["referrer"]) {
                        tmpRef["referrer"] = tmpRef["referrer"].split("#")[0].replace(/(^\s*)/g, "").replace(/(\s*$)/g, "");
                        if (tmpRef["referrer"].indexOf("?_randomTest") > -1) {
                            // 删除测试后缀
                            tmpRef["referrer"] = tmpRef["referrer"].split("?_randomTest")[0];
                        }
                        // 删除最后的/号，或者以//开始的字符串
                        if(sid!="7f21ceb9" && sid!="2934b1d1" && sid!="2161b761" && sid!="2f120b77"){
                            tmpRef["referrer"] = tmpRef["referrer"].replace(/\/*$/, "");
                        }
                        if(sid=="67a379c7"){
                            tmpRef["referrer"] = tmpRef["referrer"].replace(/\/([\?|#])/,"$1");
                        }
                        var tmpHost = tmpRef["referrer"].split("?")[0].toLowerCase();
                        // 判断是ref是否在域名范围内
                        for (var i = 0; i < domainSet.length; i++) {
                            var hrefProcl = tmpHost.split("://")[0];
                            if (!domainSet[i].match(/^https?:\/\/.*/) && tmpHost.indexOf(domainSet[i]) > -1) {
                                // 设定的域名兼容两种协议且域名合法
                                //tmpRef["referrer"] = "";
                                return tmpRef;
                            } else {
                                // 设定的域名只支持一种协议
                                var domainProcl = domainSet[i].split("://")[0];
                                if (hrefProcl == domainProcl && tmpHost.indexOf(domainSet[i].split("://")[1]) > -1) {
                                    // 协议相同，则再进行域名的包含验证，域名合法时
                                    //tmpRef["referrer"] = "";
                                    return tmpRef;
                                }
                            }
                        }
                        // 如果没有直接返回结果，说明这是个外部来源，则要创建新的访次
                        if (!funnelPage) {
                            tmpRef["flag"] = 1;
                        }
                    }
                }
                // 直接输入来源不影响当前的访次
                return tmpRef;
            } catch (ex) {
                return tmpRef;
            }
        }
        // 获得插件信息
        this.getPlugins = function() {
            var tmp = "";
            var np = na.plugins;
            if (np.length != 0) {
                var plist = new Array();
                for (var i = 0; i < np.length; i++) {
                    plist[i] = np[i].name + ";" + np[i].description + ";" + np[i].filename + ";";
                    for (var n = 0; n < np[i].length; n++) {
                        plist[i] += "(" + np[i][n].description + ";" + np[i][n].type + ";" + np[i][n].suffixes + ")";
                    }
                    plist[i] += ".";
                }
                tmp = plist.sort().join("");
            }
            return tmp;
        }
        //设置URL合并
        this.setURLMerger = function(urlStr) {
            var allPageInfo = window['allPageInfo']||[];
            /*将window['allPageInfo']替换成一个二维数组，替换完成后，每一个域名三个参数的顺序依次是1、去除锚点。2、去除www。3、去除默认网址。4、默认网址文件名称。5、去除URL末尾斜杠
             例如
             var allPageInfo = [
             ["whr.com",true,false,false,'index.html',false]
             ];
             */
            //用域名长度排序一下
            /*allPageInfo = allPageInfo.sort(function(a,b){	//注释掉：主域合并后，这段排序已经不需要了——zpj_2014.12.11
             return a[0].length<b[0].length;
             });*/

            function isTrueMatch(url, domainName) {	//判断当前URL和客户设置的域名是否匹配
                var protocol=domainName.match(/^https?:\/\//);
                return protocol ? (url.indexOf(protocol[0]) == 0 && url.indexOf(domainName.substring(protocol[0].length)) > -1) : (url.indexOf(domainName) > -1);
            }
            var tmp = urlStr;
            for(var i=0;i<allPageInfo.length;i++){
                if(isTrueMatch(urlStr, allPageInfo[i][0])){
                    if(allPageInfo[i][1]){
                        tmp = tmp.replace(/\#[^#|\$|\?]*/g,"");
                    }
                    if(allPageInfo[i][2]){
                        tmp = tmp.replace(/^(http:\/\/|https:\/\/)?www./,"$1");
                    }
                    if(allPageInfo[i][3]){
                        tmp = tmp.replace(new RegExp("([^\#|\$|\?]*)"+allPageInfo[i][4]+"(\S*)"),"$1$2");
                    }
                    URLTrimFlag = (URLTrimFlag == "tmpUrlAPI") ? "tmpUrlAPI" : (allPageInfo[i][5] == false) ? false : true;
                    break;
                }
            }
            return tmp;
        }
        //取得当前路径
        this.getPage = function() {    //作为一个get开头的函数，居然里面有赋值操作(给title赋值)。必须找机会分离
            //try {
            var i, tmpArray = [], tmpValue = "";
            //var tmp = loc.href;
            if(sid=="5555e192" || sid=="41307454" || sid=="6075c852"){
                var tmp = (loc.href).toLowerCase();
            }else{
                var tmp = (loc.protocol+"//"+loc.host).toLowerCase()+loc["pathname"]+loc["search"]+loc["hash"];
            }
            //var tmp = (loc.protocol+"//"+loc.host).toLowerCase()+loc["pathname"]+loc["search"]+loc["hash"];
            if(!tmp){return "";}
            
            // 多域名处理(带着#_pt_link=或?/&_pt_link=）
            if (domainSet.length>1) {
                var reg1 = new RegExp(/(\?|\&|\#)_pt_link=([^\&|\#]*)(\&|\#)?/);
                if(tmp.match(reg1)){
                    multiLinkTag = tmp.match(reg1)[2];
                    if(tmp.match(reg1)[3]=="&"){
                        tmp = tmp.replace(reg1,"$1");
                    }else{
                        tmp = tmp.replace(reg1,"$3");
                    }
                }
            }
            tmp =    sid =="56fbce4e"    ?     tmp.replace(/(\?|\&)__SID=\S*/,"")      :tmp;
            tmp =    true                ?     tmp.replace(/\?_randomTest=\S*/,"")     :tmp;

            // 设置虚拟URL
            if(vUrl){
                tmp = vUrl;
            }

            tmp = this.setURLMerger(tmp);	//网址合并，修改传入的参数，原参数为loc.href，改为tmp[zhaopengjun 2015-04-28]

            // 判断公司
            switch (company) {
                case "digitalone":
                    // 去除尾部的#
                    tmp = tmp.split("#")[0];
                    if (!tmp) {
                        tmp = "";
                    } else if (tmp.match(/.+www\.cleansui\.com\/shop($|\/$|\/\?.+)/)) {
                        title = objCommon.encode("【公式】家庭用浄水器の三菱レイヨン・クリンスイ通販サイト", false);
                    }
                    break;
                case "commercelink"://329c67cb
                    var titleAry = ["レディースファッション", "メンズファッション", "カジュアル", "バッグ", "靴", "ベビー・キッズ・マタニティ", "スポーツ・アウトドア", "生活・インテリア", "フード", "ドリンク", "ヘルス・ビューティー", "パソコン・モバイル", "ホビー・ペット・コレクション", "家電＆AV"];
                    var paramAry = ["cat=0101", "cat=0102", "cat=0103", "cat=0104", "cat=0107", "cat=0112", "cat=06", "cat=03", "cat=04", "cat=02", "cat=09", "cat=11", "cat=10"];
                    // 去除尾部的#
                    tmp = tmp.split("#")[0];
                    if (!tmp.match(/[?&]+tmp\=[^\&]/) && tmp.match(/[?&]+dtp\=0/)) {
                        // url里必须没有指定值或者没有tmp值时
                        var queryFlag = "";
                        for (i = 0; i < paramAry.length; i++) {
                            queryFlag = (tmp.indexOf("?" + paramAry[i]) > -1) ? "?" : ((tmp.indexOf("&" + paramAry[i]) > -1) ? "&" : "");
                            if (queryFlag) {
                                // url含有指定参数
                                title = objCommon.encode(titleAry[i], false);
                                tmp = tmp.split("?")[0] + "?" + paramAry[i] + ((i <= 5) ? "000000" : "00000000") + "&dtp=0";
                                // 删除最后的?号和&号
                                tmp = tmp.replace(/\?*$/, "").replace(/\&*$/, "");
                                break;
                            }
                        }
                    }
                    if (tmp.indexOf("/key_") > -1 && (objCommon.encode(tmp, false).indexOf("%EF%BF") > -1 || tmp.indexOf("???") > -1)) {
                        // 如果是目录型的url，为了防止key出现乱码，需要特殊对应
                        var tmpKey = "";
                        try {
                            tmpKey = title.split(" - ")[1].split(" (")[0];
                        } catch (ex) {
                        }
                        if (tmpKey) {
                            tmp = tmp.split("/key_")[0] + "/key_" + objCommon.encode(tmpKey, false);
                        }
                    }

                    break;
                case "cellant":
                    if (adParamAry) {
                        // 去除尾部的#
                        tmp = tmp.split("#")[0];
                        // 有广告参数时
                        var headChar = "";
                        for (i = 0; i < adParamAry.length; i++) {
                            headChar = "";
                            if (tmp.indexOf("?" + adParamAry[i] + "=") > -1) {
                                headChar = "?";
                            } else if (tmp.indexOf("&" + adParamAry[i] + "=") > -1) {
                                headChar = "&";
                            }
                            if (headChar) {
                                adParamFlag = true;
                                if (adParamStr)
                                    adParamStr += ",";
                                tmpArray = tmp.split(headChar + adParamAry[i] + "=");
                                tmpValue = tmpArray[1] ? tmpArray[1].split("&")[0] : "";
                                adParamStr += adParamAry[i] + ":" + tmpValue;
                                tmp = tmpArray[0] + headChar + tmpArray[1].slice(tmpValue.length + 1);
                            }
                        }
                        // 删除最后的?号和&号
                        tmp = tmp.replace(/\?*$/, "").replace(/\&*$/, "");
                    }
                    break;
                case "oisix":
                case "oisix_hk":
                case "oisix_gochimaru":
                    var paramAry = [];
                    if (company == "oisix") {
                        paramAry = ["utm_referrer", "utm_source", "utm_medium", "utm_term", "utm_content", "utm_campaign", "sessionid", "urlserverid", "SESSIONISNEW", "k", "tk", "KAKUNINJIKAN", "screenmode", "OVRAW", "OVKEY", "OVMTC", "OVADID", "OVKWID", "OVCAMPGID", "OVADGRPID", "SESSIONISNEW", "jid", "KENSAKUMOZIFLG", "KENSAKUMOZIJOUKEN", "searchValue", "param", "faqSearchKeyword", "startNum", "maxDisplayNum", "detail", "mi2", "roadid", "cart", "ref", "hosid", "utm_expid"];
                    } else if (company == "oisix_hk") {
                        paramAry = ["lcs_id", "tsuka_conv", "offset", "a", "x", "y", "mi2"];
                    } else if (company == "oisix_gochimaru") {
                        paramAry = ["vos", "utm_referrer", "utm_source", "utm_medium", "utm_term", "utm_content", "utm_campaign", "sessionid", "urlserverid", "SESSIONISNEW", "k", "tk", "KAKUNINJIKAN", "screenmode", "OVRAW", "OVKEY", "OVMTC", "OVADID", "OVKWID", "OVCAMPGID", "OVADGRPID", "SESSIONISNEW", "jid", "KENSAKUMOZIFLG", "KENSAKUMOZIJOUKEN", "searchValue", "param", "faqSearchKeyword", "startNum", "maxDisplayNum", "detail", "mi2", "roadid", "cart", "ref", "hosid", "utm_expid"];
                    }
                    var headChar = "";
                    for (i = 0; i < paramAry.length; i++) {
                        headChar = "";
                        if (tmp.indexOf("?" + paramAry[i] + "=") > -1) {
                            headChar = "?";
                        } else if (tmp.indexOf("&" + paramAry[i] + "=") > -1) {
                            headChar = "&";
                        }
                        if (headChar) {
                            tmpArray = tmp.split(headChar + paramAry[i] + "=");
                            tmpValue = tmpArray[1] ? tmpArray[1].split("&")[0] : "";
                            tmp = tmpArray[0] + headChar + tmpArray[1].slice(tmpValue.length + 1);
                        }
                    }
                    tmp = tmp.replace(/\?*$/, "").replace(/\&*$/, "");
                    break;
                case "rakuten-sec":
                    //特殊对应乐天证券(http://jira.ptmind.com/browse/FB-27);
                    // tmp = tmp.replace(/;BV_SessionID.+\?/g, '?');
                    tmp = tmp.replace(/;BV_SessionID.{42}/g, '');

                    //特殊对应乐天证券(http://jira.ptmind.com/browse/FB-45);
                    tmp = tmp.replace(/www\.rakuten-sec\.co\.jp\/smartphone\/\?c2\=.+/g, 'www.rakuten-sec.co.jp/smartphone');
                    break;

            }
            if (urlMark) {
                tmp += "#" + urlMark;
            }
            // 删除最后的/号，或者以//开始的字符串
            if(sid!="7f21ceb9" && sid!="2934b1d1" && sid!="2161b761" && sid!="2f120b77" && URLTrimFlag != "tmpUrlAPI" && URLTrimFlag){
                tmp = tmp.replace(/\/*$/, "");
            }
            if(sid=="67a379c7"){
                tmp = tmp.replace(/\/([\?|#])/,"$1");
            } else if (sid=="6c75a350" && URLTrimFlag){	//http://jira.ptmind.com/browse/FB-499 ,特殊对应乐天证券，所有url末尾加斜杠
                if (tmp.indexOf("#") == -1 && tmp.indexOf("?") == -1) {
                    tmp = tmp.substr(-1) != "/" ? (tmp + "/") : tmp;
                }
            }
            //tmp = tmp.replace(/\/([\?|#])/,"$1");
            return tmp;
        }

        this.isPCByPlat = function() {
            var platForm = na.platform.toLowerCase();
            if (platForm.indexOf("win") > -1){return true;}
            var listIn = ["mac68k","macppc","macintosh","macintel"];
            for(var i=0;i<listIn.length;i++){
                if(platForm==listIn[i]){return true;}
            }
            return false;
        }
        this.isPCByOSList = function(uaArg) {
            var pcOS = ["AIX", "Amiga", "BeOS", "DragonFly", "FreeBSD", "GNU", "Haiku", "HP-UX", "IRIX", "Joli", "Java", "Macintosh", "Minix", "MorphOS", "NetBSD", "OpenBSD", "PClinuxOS", "QNX x86pc", "SunOS", "Ubuntu", "Mint", "Red Hat", "Slackware", "SUSE", "PCLinuxOS", "Debian", "Fedora", "CentOS", "Vine", "Arch Linux", "Gentoo", "Kanotix", "Mandriva"];
            for (var i = 0; i < pcOS.length; i++) {
                if (uaArg.indexOf(pcOS[i]) > -1) {return true;}
            }
            return false;
        }
        this.isMobileByOSList = function(uaArg) {
            var mobilephoneOS = ["Android", "AROS", "Bada", "BlackBerry", "Chromium", "CrOS", "Danger Hiptop", "Inferno", "iPhone", "iPad", "iPod", "Nintendo DS", "Nintendo Wii", "Palm OS", "PLAYSTATION", "Syllable", "SymbOS", "Symbian", "Tizen", "webOS", "WebTV", "Windows CE", "Windows Mobile", "Windows Phone", "Xbox"];
            for (var i = 0; i < mobilephoneOS.length; i++) {
                if (uaArg.indexOf(mobilephoneOS[i]) > -1) {return true;}
            }
            return false;
        }
        // 取得终端类型  0:不可识别 1:手机 2:PC 3:PC模拟的手机 4:平板
        // 1、通过platform及PC OS列表来判断是否是pc
        this.getTerminalType = function() {
            try {
                var ua = na.userAgent;
                if (!ua) {
                    // 如果ua不存在，直接返回0
                    return 0;
                }
                if (this.isPCByPlat() || this.isPCByOSList(ua)) {
                    // 判断为PC
                    if (this.isMobileByOSList(ua)) {
                        // 如果在移动终端列表里的话，则判断为模拟器
                        return 3;
                    } else {
                        if (ua.match(/.*MSIE.*Windows NT 6\.2;.*Touch\).*/)) {
                            // 专门针对window surface的UA判断
                            return 4;
                        }
                        // 否则为真正的pc
                        return 2;
                    }
                } else {
                    // 为移动终端
                    if (ua.indexOf("iPad") > -1 || Math.min(objBrowserInfo.getScreenWidth(),win.screen.height) >= 1000) {
                        // 如果是apple的平板,或者横竖分辨率最小的值大于等于1000，则判定为平板
                        return 4;
                    } else {
                        // 真正的手机
                        return 1;
                    }
                }
            } catch (ex) {
                return 0;
            }
        }
        // 取得分辨率宽度
        this.getScreenWidth = function() {
            try {
                var tmp = win.screen.width;
                return tmp ? isNaN(parseInt(tmp,10)) ? 0 : parseInt(tmp,10) : 0;
            } catch (ex) {
                return 0;
            }
        }
        // 取得分辨率高度
        this.getScreenHeight = function() {
            try {
                var tmp = win.screen.height;
                if((this.getTerminalType() == 1 && tmp > 2000)||(this.getTerminalType() == 4 && tmp > 3000)){
                    tmp = this.getViewHeight();
                }
                return tmp ? isNaN(parseInt(tmp,10)) ? 0 : parseInt(tmp,10) : 0;
            } catch (ex) {
                return 0;
            }
        }
        // 取得浏览器高度
        this.getBrowserHeight = function() {
            try {
                //var tmp = win.innerHeight ? win.innerHeight : doc.body.clientHeight;
                var tmp = doc.documentElement.clientHeight ? doc.documentElement.clientHeight : doc.body.clientHeight;
                return tmp ? isNaN(parseInt(tmp,10)) ? 0 : parseInt(tmp,10) : 0;
            } catch (ex) {
                return 0;
            }
        }
        // 取得滚动条的位置
        this.getScrollY = function() {
            var y = 0;
            try {
                y = doc.documentElement.scrollTop || doc.body.scrollTop || win.pageYOffset;
                y = isNaN(y) ? 0 : y;
            } catch (ex) {
                y = 0;
            }
            return parseInt(y,10);
        }
        // 取得yMax的位置
        this.getYMax = function() {
            var value = +(this.getScrollY()) + +(this.getBrowserHeight());
            value = isNaN(value) ? 0 : parseInt(value, 10);
            return value;
        }
        // 取得滚动条的位置
        this.getScrollX = function() {
            var x = doc.documentElement.scrollLeft || win.pageXOffset;
            x = isNaN(x) ? 0 : x;
            return parseInt(x,10);
        }
        // 取得时区
        this.getTimezone = function() {
            try {
                var tmp = (new Date).getTimezoneOffset();
                return (tmp || tmp == 0) ? ("GMT" + (tmp <= 0 ? "+" : "") + (tmp / 60 * -1)) : "";
            } catch (ex) {
                return "";
            }
        }
        // 取得点击的来源tag
        this.getSrcElement = function(e) {
            var src = e.target || win.event.srcElement;
            return src;
        }
        //获取元素的绝对纵坐标
        this.getAbsTop = function(e) {
            var offset = e.offsetTop;
            if (e.offsetParent != null) {
                offset += this.getAbsTop(e.offsetParent);
            }
            if (offset < 0)
                offset = 0;
            offset = isNaN(offset) ? 0 : parseInt(offset,10);
            return offset;
        }
        //获取元素的绝对横坐标
        this.getAbsLeft = function(e) {
            var offset = e.offsetLeft;
            if (e.offsetParent != null) {
                offset += this.getAbsLeft(e.offsetParent);
            }
            if (offset < 0)
                offset = 0;
            offset = isNaN(offset) ? 0 : parseInt(offset,10);
            return offset;
        }
        // 获取相对于页面内容的点击坐标
        this.getMouseRC = function(objEvent_) {
            var tmp = {x: 0,y: 0};
            try {
                tmp.x = objEvent_.touches[0].pageX ? objEvent_.touches[0].pageX : objEvent_.clientX;
                tmp.y = objEvent_.touches[0].pageY ? objEvent_.touches[0].pageY : objEvent_.clientY;
                switch (sid) {
                    case "7ba4a69b":
                        if (objEvent_.touches[0].clientY <= 110)
                            tmp.y = objEvent_.touches[0].clientY;
                        break;
                }
                if (!tmp.x)
                    tmp.x = 0;
                if (!tmp.y)
                    tmp.y = 0;
            } catch (ex) {
            }
            tmp.x = isNaN(tmp.x) ? 0 : parseInt(tmp.x,10);
            tmp.y = isNaN(tmp.y) ? 0 : parseInt(tmp.y,10);
            return tmp;
        }
        // 获取相对于页面内容的点击坐标
        this.getMouseRC1 = function(objEvent_) {
            var xValue = parseInt(+objEvent_.clientX + +this.getScrollX(),10);
            var yValue = parseInt(+objEvent_.clientY + +this.getScrollY(),10);
            xValue = isNaN(xValue) ? 0 : xValue;
            yValue = isNaN(yValue) ? 0 : yValue;
            return {
                x: xValue,
                y: yValue
            };
        }
        //取得页面内容实际宽度
        this.getPageWidth = function() {
            var value = parseInt(doc.body.scrollWidth,10);
            value = isNaN(value) ? 0 : value;
            return value;
        }
        // 取得页面内容实际高度
        this.getPageHeight = function() {
            var value = parseInt(doc.body.scrollHeight,10);
            value = isNaN(value) ? 0 : value;
            return value;
        }
        //取得页面可视宽度
        this.getViewWidth = function() {
            var value = self.innerWidth || doc.body.clientWidth;
            value = isNaN(value) ? 0 : parseInt(value,10);
            return value;
        }
        // 取得页面可视高度
        this.getViewHeight = function() {
            try {
                var value = self.innerHeight || doc.body.clientHeight;
                value = isNaN(value) ? 0 : parseInt(value,10);
                return value;
            } catch (ex) {
                return 0;
            }
        }
        // 获取初始缩放值
        this.getInitialScale = function() {
            try {
                var viewportContent = doc.getElementsByName("viewport")[0].content;
                if (viewportContent) {
                    return viewportContent.match("initial-scale=\\d.\\d+").toString().split("=")[1];
                } else {
                    return 1;
                }
            } catch (ex) {
                return 1;
            }
        }
    }
    // Pt专用类模块
    function CLSPt() {
        // 判断功能是否开放
        this.valFunction = function(type, arg) {
            var tmp = "";
            try {
                switch (type) {
                    case "heatmap":
                        if (arg == -1) {
                            // 如果热图的值是-1，则对所有页面开放热图功能
                            return true;
                        } else if (!arg) {
                            // 如果热图页面为空，则关闭所有页面的热图功能
                            return false;
                        } else {
                            // 删除最后的/
                            var href = objBrowserInfo.setURLMerger(loc.href).replace(/\/*$/, "");
                            // FB-968
                            var minHref = href.split("?")[0].replace(/\/*$/, "") == href ? (href.split("#")[0].replace(/\/*$/, "") == href ? null : href.split("#")[0].replace(/\/*$/, "")) : href.split("?")[0].replace(/\/*$/, "");
                            for (var i = 0; i < arg.length; i++) {
                                tmp = arg[i];
                                // 如果匹配页面最后有/，则删除/
                                if (tmp) {
                                    tmp = objBrowserInfo.setURLMerger(tmp).replace(/\/*$/, "");
                                    tmp = tmp.split("?")[0].replace(/\/*$/, "") == tmp ? (tmp.split("#")[0].replace(/\/*$/, "") == tmp ? tmp : tmp.split("#")[0].replace(/\/*$/, "")) : tmp.split("?")[0].replace(/\/*$/, "");
                                }
                                if (href == tmp || minHref == tmp) {
                                    // 如果当前页面在开启热图功能的范围内
                                    return true;
                                }
                            }
                            return false;
                        }
                        break;
                    default:
                        break;
                }
            } catch (ex) {
            }
        }
        // 发送报文 如果times参数有值，则延时发送，如果没有则直接发送
        this.sendMsgByScript = function(targetURL) {
            if (pvNum > 99) {
                return;
            }
            if (sid == "53942d99") {	//http://jira.ptmind.com/browse/FB-458 ,http地址替换为https[zhaopengjun 2015-03-25]
                targetURL = targetURL.replace(/^http:/,"https:");
            }
            //传统的跨域请求 开始
            var url = targetURL + "&v=1.3&ts=" + (new Date()).getTime();
            var script = document.createElement('script');
            script.setAttribute('src', url);
            document.getElementsByTagName('head')[0].appendChild(script);
            //传统的跨域请求 结束

            if (testSID[sid]) {
                //传统的跨域请求 开始
                var url = targetURL.replace(/collect.ptengine.jp/, "tzcj.ptmind.com") + "&v=1.3&ts=" + (new Date()).getTime();
                var script = document.createElement('script');
                script.setAttribute('src', url);
                document.getElementsByTagName('head')[0].appendChild(script);
            }
        }
        // 发送报文 如果times参数有值，则延时发送，如果没有则直接发送
        this.sendMsg = function(targetURL) {
            if (pvNum > 99) {
                return;
            }
            if (sid == "53942d99") {	//http://jira.ptmind.com/browse/FB-458 ,http地址替换为https[zhaopengjun 2015-03-25]
                targetURL = targetURL.replace(/^http:/,"https:");
            }
            var tempImg = new Image();
            tempImg.src = targetURL + "&v=1.3&ts=" + (new Date()).getTime();
            if (testSID[sid]) {
                (new Image()).src = targetURL.replace(/collect.ptengine.jp/, "tzcj.ptmind.com") + "&v=1.3&ts=" + (new Date()).getTime();
            }
        }
        // css路径转化
        this.getCssPath = function(dom) {
            try {
                var domNodeName = dom.nodeName.toLowerCase();
                if (domNodeName == "body" || domNodeName == "html") {
                    return "body";
                }
                else if (dom.getAttribute("id")) {
                    return "#" + dom.getAttribute("id");
                }
                else {
                    var parentNode = dom.parentNode;
                    var emptyDomCount = 0;
                    ///如果爷爷节点和父节点类型相同，爷爷当父节点。网上倒
                    while (domNodeName == parentNode.nodeName.toLowerCase()) {
                        if (parentNode.getAttribute("id")) {//如果本身有id就不往上倒了
                            break;
                        }
                        parentNode = parentNode.parentNode;
                    }
                    var allChilds = parentNode.getElementsByTagName(domNodeName);
                    //如果父节点只有一个同类型的子节点，接着往上倒
                    while (allChilds.length == 1) {
                        if (parentNode.getAttribute("id") || parentNode.nodeName.toLowerCase() == "body") {//如果本身有id就不往上倒了
                            break;
                        }
                        parentNode = parentNode.parentNode;
                        allChilds = parentNode.getElementsByTagName(domNodeName);
                    }
                    for (var i = 0; i < allChilds.length; i++) {
                        if (allChilds[i] == dom) {
                            if (domNodeName == "input" || domNodeName == "select" || domNodeName == "textarea" || domNodeName == "button") {
                                if (dom.getAttribute("name")) {
                                    return this.getCssPath(parentNode) + " " + domNodeName + ":input[name='" + dom.getAttribute("name") + "']";
                                }
                            }
                            return this.getCssPath(parentNode) + " " + domNodeName + ":eq(" + (i - emptyDomCount) + ")";
                            break;
                        }
                    }
                }
            }
            catch (ex) {
            }
        }
        // 找到是A的父节点
        this.parentA =function(dom){
            while(dom.nodeName.toLowerCase()!="body") {
                if(dom.nodeName.toLowerCase()=="a"){
                    return dom;
                }
                else{
                    dom = dom.parentNode;
                }
            }
            return false;
        }
    }
    function CookieOfPt() {
        this.cookiesValue="";
        this.writeCookies = function(){
            if (hasHttpCookies) {
                this.cookiesValue = this.createCookiesValue();
                objHttpCookies.setValue(COOKIESNAME, this.cookiesValue, {
                    expires: expiresDay
                });
            }
            this.readCookies();
        }
        this.readCookies = function(){
            if (hasHttpCookies) {
                this.cookiesValue = objHttpCookies.getValue(COOKIESNAME);
            }
        }
        // 判断是否是刷新的页面
        this.getIsRefresh = function(visitTime) {
            if ((this.cookiesValue.indexOf(pageID) > -1) && !objCommon.timeCompare_M(this.getValueFromCookies("sact"), visitTime, REFRESHTIMES)) {
                // 如果页面相同并且当前时间距离上次活动时间不到指定时间的话，则判断为刷新
                return 1;
            } else {
                return 0;
            }
        }
        // 判断该访次的属性：0为非新访次，1为新访次
        this.getIsNV = function(visitTime) {
            if (sessionCookieFlag == 0 && !funnelPage) {
                // http cookies启用，并且sessionCookie不存在，则判断为新访次
                return 1;
            }
            if (objCommon.timeCompare_M(this.getValueFromCookies("sact"), visitTime, NVTIMES) && !funnelPage) {
                // 如果当前时间距离上次活动时间超过指定时间的话，则判断为新访次
                return 1;
            }
            if (this.getValueFromCookies("to_flag") == 1 && !funnelPage) {
                // 上一次访次因为静默超时被关闭了，则判断为新访次
                return 1;
            }

            return 0;
        }
        // 判断新旧访者
        this.getIsNID = function() {
            // 取得当前NID值
            var tmp = this.getValueFromCookies("nid");
            if (tmp == "1") {
                tmp = 0;
            }
            return tmp;
        }
        // 判断当前页面是否激活
        this.isActive = function() {
            return this.getValueFromCookies("pl") == pageID + "*pt*" + pageAccessTime;
        }
        // 判断当前页面是否激活
        this.isNewVisit = function(oldVID, recentTime) {
            return (this.getValueFromCookies("vid") != oldVID) && (+recentTime >= +this.getValueFromCookies("sact"));
        }
        // 创建cookie
        this.createCookiesValue = function() {
            var cookieNum = Math.floor(pageList.length / 3800);
            var value = "uid=" + uid
                + "&nid=" + isNID
                + "&vid=" + visitID
                + "&vn=" + visitNum
                + "&pvn=" + pvNum
                + "&sact=" + siteActionTime
                + "&to_flag=" + toFlag
                + ((+cookieNum > 0) ? ("&cn=" + cookieNum) : "")
                + "&pl=" + pageList;

            return value;
        }
        // 确认cookie的完整性
        this.checkCookiesValue = function() {
            var cookieTag = ["uid","nid","vid","vn","sact","to_flag","pl"];
            for(var i=0;i<cookieTag.length;i++){
                if(this.cookiesValue.indexOf(cookieTag[i])<0){return false;}
            }
            return true;
        }
        // 根据参数名，从cookies里取得参数值
        this.getValueFromCookies = function(arg) {
            try {
                if (arg == "pl") {
                    return (this.cookiesValue.indexOf(arg) != -1) ? this.cookiesValue.split(arg + "=")[1] : "";
                } else {
                    var str =  (this.cookiesValue.indexOf(arg) != -1) ? this.cookiesValue.split(arg + "=")[1].split("&")[0] : "";
                    if (arg == "pvn") {
                        str = isNaN(str) ? 0 : str;
                    }
                    return str;
                }
            } catch (ex) {
                return "";
            }
        }
        // 记录当前激活页面
        this.plPrc = function(page_id) {
            var page_now = page_id + "*pt*" + pageAccessTime;
            return page_now;
        }
    }
    // 通用模块
    function CLSCommon() {
        this.addLoadEvent = function(iframe,func) {
            var oldonload = iframe.onload;//得到上一个onload事件的函数
            if (typeof iframe.onload != 'function') {//判断类型是否为'function',注意typeof返回的是字符串
                iframe.onload = func;
            } else {
                iframe.onload = function(){
                    oldonload();//调用之前覆盖的onload事件的函数---->由于我对js了解不多,这里我暂时理解为通过覆盖onload事件的函数来实现加载多个函数
                    func();//调用当前事件函数
                }
            }
        }
        // 判断行为：大于某个时间长度
        this.timeCompare_M = function(prevTime, visitTime, times) {
            return +visitTime - +prevTime > +times;
        }
        // URI加密 如果f为true,用encodeURI, false的话用encodeURIComponent 如果不支持前两者,用escape
        this.encode = function(i, f) {
            return encodeURIComponent instanceof Function ? (f ? encodeURI(i) : encodeURIComponent(i)) : escape(i)
        }
        // URI解密
        this.decode = function(i, f) {
            var tmp = "";
            i = i.split("+").join(" ");
            if (decodeURIComponent instanceof Function)
                try {
                    tmp = f ? decodeURI(i) : decodeURIComponent(i)
                } catch (ex) {
                    tmp = unescape(i)
                }
            else
                tmp = unescape(i);
            return tmp;
        }
        // 判断是否为空
        this.isNull = function(i) {
            return undefined == i || "null" == i || -1 == i || "" == i;
        }
        // 前后去空白
        this.trim = function(value) {
            return value.replace(/(^\s*)/g, "").replace(/(\s*$)/g, "");
        }
        // 将二进制字符串进行BASE64编码
        //1、Url进行md5，得到一个128位的二进制串A
        //2、对A进行base64编码得到24个字符长的B
        //3、删除字符B最后的二个"="，得到22个字符长度的C
        this.base64encodeForBin = function(binStr) {
            var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/";
            var out = "", i = 0;
            while (i < binStr.length / 6 - 1) {
                out += base64EncodeChars.charAt(parseInt(binStr.slice(i * 6, (i + 1) * 6), 2).toString(10));
                i++;
            }
            var tail = binStr.slice(i * 6, (i + 1) * 6)
            if (tail) {
                var len = tail.length;
                for (i = 0; i < (6 - len); i++) {
                    tail += "0";
                }
                out += base64EncodeChars.charAt(parseInt(tail, 2).toString(10));
            }
            //return out.replace(/\//g, "-");
            return out;
        }
        // 将十六进制的字符串转成二进制的字符串
        this.Hex2Bin = function(hex) {
            var bin = "", tmp = "", len = 0, tmpLength = hex.length;
            for (var i = 0; i < tmpLength; i++) {
                tmp = parseInt(hex.charAt(i), 16).toString(2);
                len = tmp.length;
                for (var j = 0; j < (4 - len); j++) {
                    tmp = "0" + tmp;
                }
                bin += tmp;
            }
            return bin;
        }
        // 输入Pt特有的ID串
        this.createID = function(message) {
            return this.base64encodeForBin(this.Hex2Bin(this.MD5(message)));
        }
        //md5模块-开始
        this.MD5 = function(sMessage) {
            var type = 32;//md5长度，这个值只被这一个函数使用，所以没必要放在外层作用域里面
            var jsMD5_Typ = type;
            function RotateLeft(lValue, iShiftBits) {
                return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
            }
            function AddUnsigned(lX, lY) {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = (lX & 0x80000000);
                lY8 = (lY & 0x80000000);
                lX4 = (lX & 0x40000000);
                lY4 = (lY & 0x40000000);
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4)
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                if (lX4 | lY4) {
                    if (lResult & 0x40000000)
                        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    else
                        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                } else
                    return (lResult ^ lX8 ^ lY8);
            }
            function F(x, y, z) {return (x & y) | ((~x) & z);}
            function G(x, y, z) {return (x & z) | (y & (~z));}
            function H(x, y, z) {return (x ^ y ^ z);}
            function I(x, y, z) {return (y ^ (x | (~z)));}
            function FF(a, b, c, d, x, s, ac) {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            }
            function GG(a, b, c, d, x, s, ac) {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            }
            function HH(a, b, c, d, x, s, ac) {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            }
            function II(a, b, c, d, x, s, ac) {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            }
            function ConvertToWordArray(sMessage) {
                var lWordCount;
                var lMessageLength = sMessage.length;
                var lNumberOfWords_temp1 = lMessageLength + 8;
                var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                var lWordArray = Array(lNumberOfWords - 1);
                var lBytePosition = 0;
                var lByteCount = 0;
                while (lByteCount < lMessageLength) {
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount) << lBytePosition));
                    lByteCount++;
                }
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;

                return lWordArray;
            }
            function WordToHex(lValue) {
                var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount++) {
                    lByte = (lValue >>> (lCount * 8)) & 255;
                    WordToHexValue_temp = "0" + lByte.toString(16);
                    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                }
                return WordToHexValue;
            }
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d
            var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
            var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            // Steps 1 and 2. Append padding bits and length and convert to words
            x = ConvertToWordArray(sMessage);
            // Step 3. Initialise
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;
            // Step 4. Process the message in 16-word blocks
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = AddUnsigned(a, AA);
                b = AddUnsigned(b, BB);
                c = AddUnsigned(c, CC);
                d = AddUnsigned(d, DD);
            }
            var TypNN;
            if (jsMD5_Typ == '16'){TypNN = WordToHex(b) + WordToHex(c);}
            if (jsMD5_Typ == '32'){TypNN = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);}
            return TypNN;
        }
    }

    //新版事件新增方法 开始

    //拉取事件文件
    (function () {
         //eventJSPath 有值 拉取
        var referrer = document.referrer || "",
            ptDomain = localStorage["ptengineDomain"];

        //url 含有开启事件的标签 referrer 是来自 ptengine,开启事件
        if(loc.href.indexOf(openEventLabel) > -1 && /^https?:\/\/(report.*\.ptengine.(com|cn|jp)|localhost).*/gim.test(referrer)){
            //储存 domain
            localStorage["ptengineDomain"] = ptDomain = referrer.match(/https?:\/\/([^\/]+)/i)[0];
            //加载 js
            _loadJS();
        }else if(opener && ptDomain){
            //如果 是被父页面打开的,并且有localStorage 里面有储存我们的domain, 拉取 js
            _loadJS();
        }

        /**
        * 加载 js
        * @private
        */
        function _loadJS(){
            //拉取event js
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = ptDomain + "/components/event/foreign/dest/event.js";
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(script, s);
        }
     })();

    /**
     * 根据选择器与text内容获取对应的元素,返回一个数组
     * @param selector
     * @param text
     * @returns {Array}
     * @private
     */
    function _queryElements( selector, text){
        //获取选择器的元素
        var elementArray = document.querySelectorAll ? document.querySelectorAll(selector) : _querySelectorAll(selector);

        var elements = [],
            elem;
        //筛选 符合text属性
        if(text === undefined || text === ""){
            //不要求筛选 text ,直接返回整个数组
            elements = elementArray;
        }else{
            for(var i = 0, arrLength = elementArray.length; i < arrLength; i++) {
                elem = elementArray[i];
                MD5(elem.text) === text ? elements.push(elem) : "";
            }
        }

        return elements;
    }

    /**
     * 实现 IE7,IE6下的document.querySelectorAll 方法
     *
     * 这个算法需要再次优化下,在 IE6,7里面兼容不怎样,容易丢失元素
     *
     *
     * @param selector
     * @returns {Array}
     * @private
     */
    function _querySelectorAll(selector) {
        var style = document.createElement('style'),
            elements = [],
            element;
        document.documentElement.firstChild.appendChild(style);
        document._ptqsa = [];

        style.styleSheet.cssText = selector + '{x-qsa:expression(document._ptqsa && document._ptqsa.push(this))}';
        window.scrollBy(0, 0);
        style.parentNode.removeChild(style);

        while (document._ptqsa.length) {
            element = document._ptqsa.shift();
            element.style.removeAttribute('x-qsa');
            elements.push(element);
        }
        document._ptqsa = null;
        return elements;
    }
    //新版事件新增方法 结束
})();