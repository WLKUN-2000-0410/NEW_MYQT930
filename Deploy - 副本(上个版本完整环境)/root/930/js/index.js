const main = new class {
    #show = true
    chart = '';
    polarChart='';
    polarLineChart='';
    legend = '';
    selectCamera=undefined;
    isOpenChecked = false;
    saveFilePath ="";
    openFilePath ="";
    num = 0;
    #callback = new Map();
    constructor() {
        websocket.open()
        this.chart = new chart_xy('chart')
        this.polarChart = new polar_chart('polarChart')
        this.polarLineChart = new chart_xy('polarLineChart')
        this.polarLineChart.legend_box().set_visible(true); //显示legend box
        this.legend = new legend()
        this.legend.initLegend('legend',this,this.chart)
        this.initTools()
        steady.initTestPlan()
        wavelength.initTestPlan()
        this.translate(undefined)
        this.scrollTop('#log_body')
    }
    //保持滚动条在底部
    scrollTop(dom){
        let target = dom.indexOf('#')!==(-1)?document.getElementById(dom.split('#')[1]):document.getElementsByClassName(dom.split('.')[1])[0]
        const config = {
            attributes: true,      // 监听目标节点的属性变化
            childList: true,       // 监听目标节点的子节点增加或删除变化
            characterData: true,   // 监听目标节点的文本内容或字符数据变化
            subtree: true          // 监听目标节点以及所有后代的变化
        }
        let observer = new MutationObserver(mutations => {
            mutations.forEach(mutation=>{
                if (mutation.type === 'childList') {
                    let tag = $(mutation.target)
                    tag.scrollTop(tag[0].scrollHeight);
                }
            })
        })
        observer.observe(target,config)
    }
    setCallbacks(c, f){
        if (!f) return;
        this.#callback.set(c, f)
    };
    getCallback(c, ...arg){
        let result = this.#callback.get(c);
        if (!result) return;

        if (result instanceof Array) {
            result.some((f) => {
                f(...arg);
            });
        } else {
            result(...arg);
        }
        this.#callback.delete(c);
    };
    //初始化工具栏
    initTools() {
        $('#mainTools').load('html/tools/tools.html?'+new Date().getTime(),function () {main.updateToolsTips()})
    }
    //初始化扫描信息
    initScanPanel(){
        let scanUrl = fConfig.funnm===0?'html/scan/steady.html?':fConfig.funnm===1?'html/scan/wavelength.html?':'html/scan/polarization.html?'
        $('#mainBodyLeft').load(scanUrl+new Date().getTime())
        $("#steadyScan").prop('disabled',fConfig.funnm===0)
        $("#waveScan").prop('disabled',fConfig.funnm===1)
        $("#mSteadyScan").prop('disabled',fConfig.funnm===0)
        $("#mWaveScan").prop('disabled',fConfig.funnm===1)
        $("#mainPolarChart").prop('hidden',fConfig.funnm!==2);
        $("#mainChart").prop('hidden',fConfig.funnm===2);
        //参数赋值
        device.laser.isChecked = fConfig.deviceChoose.chooseLaser
        device.rTOT.isChecked = fConfig.deviceChoose.chooseMotor
        device.dT.isChecked = fConfig.deviceChoose.chooseTango
        device.camera.isChecked = fConfig.deviceChoose.chooseCamera
        //自动连接赋值
        device.spec.auto = fConfig.deviceAutoConn.iSpecAutoC
        device.ccd.auto = fConfig.deviceAutoConn.isCcdAutoC
        device.laser.auto = fConfig.deviceAutoConn.isLaserAutoC
        device.rTOT.auto = fConfig.deviceAutoConn.isMotorAutoC
        device.dT.auto = fConfig.deviceAutoConn.isMovedAutoC
        device.camera.auto = fConfig.deviceAutoConn.isCameraAutoC
		setTimeout(function(){main.showToolsBox($.i18n.prop('main-tools-connect'),24)},200);
        
        main.updateChartUnit()
    }
    //显示&隐藏工具按钮
    isShowTools(show, idx) {
        $('#mainTools ul li').eq(idx)[show ? 'removeClass' : 'addClass']('je-hide')
    }

    //显示&隐藏信息窗口
    showMsg() {
        this.#show = !this.#show
        $('#mainMsg').css('height', this.#show ? '29.4%' : '42px');
        $('#mainMsg div').css('height', this.#show ? '82%' : '0')
        $('#mainChart').css('height', this.#show ? '70%' : '93.7%')
        $('#mainPolarChart').css('height', this.#show ? '70%' : '93.7%')
    }
    //中英文翻译
    translate(p){  //id&class

        let lang = localStorage.getItem('lg');
        if ([undefined,null].includes(lang)) {
            lang = navigator.language.slice(0, navigator.language.indexOf('-'));
        }
        localStorage.setItem('lg', lang);

        $.i18n.properties({
            name: 'strings', //属性文件名     命名格式： 文件名_国家代号.properties
            path: 'i18n/', //属性文件的所在文件夹
            mode: 'map',
            language: lang, //国家代号 name+language刚好组成属性文件名：strings+zh -> strings_zh.properties
            callback: function () {
                if (p === undefined) {
                    $('[data-locale]').each(function () {
                        try {
                            $(this).text($.i18n.prop($(this).data('locale')));
                        } catch (e) {
                            console.log($(this).attr('data-locale'))
                        }
                    });
                } else {
                    $(p + ' [data-locale]').each(function () {
                        try {
                            $(this).text($.i18n.prop($(this).data('locale')));
                        } catch (e) {
                            console.log($(this).attr('data-locale'))

                        }
                    });
                }
            }
        });
    };

    //信息窗口打印
    log(code,state,data){
        let info = "";
        let s =  state===""?"":$.i18n.prop("state-"+state)

        info = (data===undefined?($.i18n.prop("funCode-"+code)+s):($.i18n.prop("funCode-"+code)+data+s))
        this.addMsg(info,state)
    }
    //添加输出信息
    addMsg(info,state) {
        let date = new Date().Format('yyyy-MM-dd HH:mm:ss')
        let color = state?"#fff":"#ffc107"
        let str = '<span style=color:'+color+ '>' + date + '>>' + info + '</span>'
        $(str).appendTo('#log_body')
    }

    //等待服务响应遮罩层
    busy(code,busy){
        let arr = [funcCode.FitParams,funcCode.SmoothParams,funcCode.NormalizationMinParams,funcCode.NormalizationParams,funcCode.PeakDetectionParams,funcCode.AreaParams,funcCode.FWHMParams]
        let busyTxt = arr.includes(code)?$.i18n.prop('busy-dataProcess'):$.i18n.prop('busy-device')
        if (code === funcCode.initSource) busyTxt = $.i18n.prop('busy-system')
        $("#busy h1").text(busyTxt)
        $('#busy').prop("hidden",!busy)
    };
    
    addLineCMData(infos,datas,ind,dLaserWave){
    	let [name,xdata,ydata] = [infos[ind].name,datas[ind].x,datas[ind].y];
//		let gratingNum = 0;
//  	if($("#steadyGrating").length==1){
//  		gratingNum =$("#steadyGrating").get(0).selectedIndex+1;
//  	}else{
//  		gratingNum =$("#waveGrating").get(0).selectedIndex+1;
//  	}
//  	let [sEw,wEw] = [$("select#steadyEW"),$("select#waveEW")]
//  	let laserWaveVal = sEw.length===0?wEw.val():sEw.val();
//  	let dLaserWave = 0.0;
//      if (laserWaveVal==="空"||gratingNum==0) {
//          dLaserWave=fConfig.excwaveselect[0].E;
//      } else{
//          fConfig.excwaveselect.forEach((cur)=>{
//              if(cur.name === laserWaveVal){
//                  dLaserWave=cur["grating"+gratingNum];
//              }
//          })
//      }
		let sendParam = {};
        sendParam.laserWave = dLaserWave;
        sendParam.array = xdata;
		websocket.send(funcCode.NmToCmParams,sendParam);
        main.setCallbacks(funcCode.NmToCmParams,rev =>{
            let x = rev.getPdList();
            let line = main.chart.add_series(name, 0);
            line.add_array(x, ydata);
            main.legend.addLegend(line)
            lineProcess.AddLineDataParams(name,x,ydata,haveTitle,0);
            ind++;
            addLineCMData(infos,datas,ind,dLaserWave)
        })
    }
    
    //打开文件
    openFile(id) {
        let suc = function(){
            $("div .fileName select option[value='.bck']").hide()
            $("div .fileName select option[value='.hdr']").hide()
            $("div .fileName select option[value='.sysp']").hide()
            $("div .fileName select option[value='*.*']").hide()
            $("div .fileName select").val('.txt')
            main.getSavefilePathPram()
        }
        let endFun = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                let fileName123 = main.openFilePath.substr(main.openFilePath.lastIndexOf("\\")+1);
                let filePath = main.openFilePath.substring(0,main.openFilePath.lastIndexOf("\\")+1);
                let filePathNames = new Array();
                for (var i = 0; i < fileName123.split(",").length; i++) {
                    filePathNames.push(filePath+fileName123.split(",")[i]);
                }
                main.setSaveFilePathPram(filePath);
                websocket.send(funcCode.OpenLineDatasPram,{path:filePathNames},false)
				main.setCallbacks(funcCode.openFileOk,rev =>{
					setTimeout(function(){
						if ($($("span.showUnit").get(0)).html()=="nm") {
							lineProcess.GetLineDataNmParams(main.openLines);
						}else{
							lineProcess.GetLineDataCMParams(main.openLines);
						}
						main.openLines=new Array();
					},10)
				})
            }
        }
        this.openFileByPath(suc,endFun);
    };
    
    openLines = new Array();
    
    showLineData(filePath,fileC){
       
        if(fConfig.funnm === 2){
        	let temp =loadTxtOrData(fileC);
        	if (temp === undefined) return
        	let name = filePath.substring(filePath.lastIndexOf("\\")+1,filePath.lastIndexOf("."))
	        let haveTitle = true;
	        if (temp.info.length===0) {
	            if (name.indexOf(' ')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-empty'),{icon:1})
	            if (name.indexOf('.')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-point'),{icon:1})
	            for (var i = 0; i < temp.result.length; i++) {
	        		temp.info.push({"name":name+i});
	        	}
	            haveTitle = false;
	        }
			
	        let data =  temp.result
	        let line = ''
	        let unit = $($("span.polarUnit").get(0)).text();
	        
	
	        for (let i = 0; i < data.length; i++) {
	            //let name = file.name.substring(0, file.name.indexOf('.')) + '_' + i;
	            let [xdata,ydata] = [data[i].x, data[i].y]
	            if(xdata.length===0) return
	            if (temp.info[0].name.indexOf(' ')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-empty'),{icon:1})
	            if (temp.info[0].name.indexOf('.')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-point'),{icon:1})
	            let currDege = parseFloat($("#polarDegreesStart").val()) + parseFloat($("#polarDegreesStep").val())*i
	            temp.info[0].name = ""+i;
	            
	            main.openLines.push(temp.info[0].name);
	            line = main.polarLineChart.add_series(temp.info[0].name, 0);
	          	line.add_array(data[i].x, data[i].y);
	          	
	          	
	          	main.polarChart.addDataPoints(currDege,data[i].y[0]);
//	            main.legend.addLegend(line)
	            lineProcess.AddLineDataParams(temp.info[0],data[i].x,data[i].y,haveTitle,0);
	        }
	        main.polarLineChart.legend_box().set_visible(true);
        }else{
        	let temp =loadTxtOrData(fileC);
        	if (temp === undefined) return
        	let name = filePath.substring(filePath.lastIndexOf("\\")+1,filePath.lastIndexOf("."))
	        let haveTitle = true;
	        if (temp.info.length===0) {
	            if (name.indexOf(' ')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-empty'),{icon:1})
	            if (name.indexOf('.')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-point'),{icon:1})
	            for (var i = 0; i < temp.result.length; i++) {
	        		temp.info.push({"name":name+i});
	        	}
	            haveTitle = false;
	        }
			
	        let data =  temp.result
	        let line = ''
	        let unit = $($("span.showUnit").get(0)).text();
	
	        for (let i = 0; i < data.length; i++) {
	            //let name = file.name.substring(0, file.name.indexOf('.')) + '_' + i;
	            let [xdata,ydata] = [data[i].x, data[i].y]
	            if(xdata.length===0) return
	            if (temp.info[i].name.indexOf(' ')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-empty'),{icon:1})
	            if (temp.info[i].name.indexOf('.')!==(-1))return jeBox.msg($.i18n.prop('tips-openFile-point'),{icon:1})
	            main.openLines.push(temp.info[i].name);
	            line = main.chart.add_series(temp.info[i].name, 0);
	          	line.add_array(data[i].x, data[i].y);
	            main.legend.addLegend(line)
	            lineProcess.AddLineDataParams(temp.info[i],data[i].x,data[i].y,haveTitle,0);
	        }
        }
        
    }

    //保存文件 &多条
    saveFile() {
        let suc = function () {
            main.getSavefilePathPram()
            $("div.fileType select").val(".txt");
            $("div .fileType select option[value='.hdr']").hide()
            $("div .fileType select option[value='.png']").hide()
            $("div .fileType select option[value='.jpg']").hide()
            $("div .fileType select option[value='.csv']").hide()
            //默认路径
			$("input#filePathShow").val("C:\\");
			$("input#filePathShow").change();
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked = false;
                console.log(main.saveFilePath);

                let [saveData, MaxLen] = ["", 0];
                let lines = fConfig.funnm === 2? main.polarLineChart.active_series():main.chart.active_series();
                if (lines.length === 0) return;
                var lineNames = new Array();
                for (let i = 0; i <lines.length ; i++) {
                	lineNames.push(lines[i].name());
                	let lineData = lines[i];
                    MaxLen = Math.max(MaxLen, lineData.get_length())                   
                }

                for (var i = 0; i < MaxLen; i++) {
                	let strLine=""
                	for (var j = 0; j < lines.length; j++) {
                		let lineData = [lines[j]]
                		strLine+="\t"
                		strLine+=lineData[0].get_data().x[i]==undefined?"":lineData[0].get_data().x[i]
                		strLine+="\t"
                		strLine+=lineData[0].get_data().y[i]==undefined?"":lineData[0].get_data().y[i]
                	}
                	strLine=strLine.substr(1)
                	strLine+="\n"
                	saveData+=strLine;
                }
				websocket.send(funcCode.getLineTitleByNames,{path:lineNames},false)
				main.setCallbacks(funcCode.getLineTitleByNames,rev =>{
					let strInfos = rev.getTiptitle()
					let infos = JSON.parse(strInfos);
//					if(fConfig.funnm === 2) infos = infos.slice(0,1);
					for (var i = 0; i < infos.length; i++) {
						infos[i].unit =  $($("span.showUnit").get(0)).html();
					}
					console.log(infos);
					strInfos = JSON.stringify(infos);
					if (localStorage.getItem("lg")=="zh") {
						strInfos = getZHTitle(strInfos);
					}
					let filecd = "";
					filecd+="[Info]\n"
					filecd+=strInfos
					filecd+="\n"
					filecd+="[Data]\n"
					filecd+=saveData
                    websocket.send(funcCode.SaveLineDataPram, {path: main.saveFilePath, content: filecd}, false)
                	main.setSaveFilePathPram(main.saveFilePath.substring(0, main.saveFilePath.lastIndexOf("\\") + 1));				
				});
            }
        }
        this.saveFileByPath(suc,end);
    };

    //保存图片
    saveImage(imageData){
        let suc = function () {
            main.getSavefilePathPram()
            $("div.fileType select").val(".png");
            $("div .fileType select option[value='.hdr']").hide()
            $("div .fileType select option[value='.txt']").hide()
            $("div .fileType select option[value='.jpg']").hide()
            $("div .fileType select option[value='.csv']").hide()
            //默认路径
            $("input#filePathShow").val("C:\\");
            $("input#filePathShow").change();
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked = false;
                console.log(main.saveFilePath);
                websocket.send(funcCode.saveImageFileByPath,{filePathByName:main.saveFilePath,imageData:imageData},false)
            }
        }
        this.saveFileByPath(suc,end);
    }
    
    recycleBin(){
    	 $.get('html/file/recycleBin.html?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: ["回收站", {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [372, 592],
                zIndex: 1,
                content: str,
                success: function(){},
                endfun: function(){}
            })
        })
    }

    saveFileByPath(suc,end){
        $.get('html/file/saveFileByPath.html?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('popup-file-title2'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [972, 668],
                zIndex: 1,
                content: str,
                success: suc,
                endfun: end
            })
        })
    }

    openFileByPath(suc,end){
        $.get('html/file/openFileByPath.html?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('popup-file-title1'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: false, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [957, 645],
                zIndex: 1,
                content: str,
                success:suc,
                endfun:end
            })
        })
    }
    //导出文件
    exportFilePath(suc,end){
        $.get('html/file/openPath.html?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('popup-file-title1'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: false, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [957, 645],
                zIndex: 1,
                content: str,
                success:suc,
                endfun:end
            })
        })
    }

    //检查文件
    checkFile(){
        websocket.send(funcCode.checkFile,{},false)
        main.setCallbacks(funcCode.checkFile,rev=>{
            let str = rev.getTiptitle()
            if (str.length > 0) {
                return main.addMsg($.i18n.prop('funCode-'+funcCode.checkFile)+str,false)
            }
            deviceControl.openAuto()
            fConfig.peakFlag = false
            websocket.send(funcCode.MathPeakDetect,{peakFlag:false,peakFrom:fConfig.peakFrom,peakTo:fConfig.peakTo});//默认不实时谱峰检测
        })
    }
    
    printDataByTitle(rev){
    	let imgData = $("#chart canvas").get(0).toDataURL("image/png")
        let language = localStorage.getItem('lg');
    	let infos = JSON.parse(rev.getTiptitle());
		let iframe = document.getElementById("print-iframe");
		let f = fConfig.funnm ===0?
         "<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Central wave:":"中心波长:")+"</div>"
        +"<div style='margin-top: 5px;width: 35%;height: 26px; float: left;border-bottom: 1px solid #969896;'>"+infos.strCenterWave+" nm</div>"
        +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Interval:":"间隔:")+"</div>"
        +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+(infos.strInterFlg==""?"?":infos.strInterFlg)+" </div>"
        +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Interval time:":"间隔时间:")+"</div>"
        +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+(infos.strIntervaltime==""?"?":infos.strIntervaltime)+" s</div>"
        +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Frequency:":"次数:")+"</div>"
        +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+(infos.intervalnum==""?"?":infos.intervalnum)+" </div>"
        :"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Start:":"起始:")+"</div>"
        +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+(infos.strStartWave==""?"?":infos.strStartWave)+" s</div>"
        +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"End":"终止")+"</div>"
        +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+(infos.strInterFlg==""?"?":infos.strEndWave)+" </div>";
        if (iframe) {
            document.body.removeChild(iframe);
        }
        if(!iframe){
            iframe = document.createElement('iframe');
            let doc = null;
            iframe.setAttribute("id", "print-iframe");
            iframe.setAttribute('style', 'position:absolute;left:-9500px;top:-9500px;');
            document.body.appendChild(iframe);
            doc = iframe.contentWindow.document;
            //这里可以自定义样式
            doc.write("<meta charset='utf-8'/><title></title>");
            doc.write("<div style='margin-left: 5px;margin-right: 5px;'>"
                +"<h2 style='margin: 0;text-align: center;'>"+$("div.tesTitle").text()+"</h2>"
                +"<h3 style='margin: 0;'>"+(language==='en'?"Spectrogram":"谱图")+"</h3>"
                +"<img alt='' style='margin-top: 5px;margin-bottom: 5px; width: 800px; height: 600px;'  />"
                +"<h3 style='margin: 0;'>"+(language==='en'?"Testing conditions":"测试条件")+"</h3>"
                +"<h4 style='margin: 0;text-align: center;overflow: hidden;'>"
                +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Wavelength:":"激发波长:")+"</div>"
                +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+infos.strWave+" </div>"
                +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Power:":"功率:")+"</div>"
                +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+infos.powervalue+" mw</div>"
                +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Pinhole Size:":"针孔尺寸:")+" </div>"
                +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+infos.pinhole+" μm</div>"
                +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Grating:":"光栅:")+"</div>"
                +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+(infos.grating==""?"?":infos.grating)+" </div>"
                +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Slit:":"狭缝:")+" </div>"
                +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+infos.slit+" μm</div>"
                +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Integral time:":"积分时间:")+"</div>"
                +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+infos.ExpTime+" s</div>"
                +"<div style='margin-top: 5px;width: 15%;float: left;'>"+(language==='en'?"Cumulative:":"累计次数:")+"</div>"
                +"<div style='margin-top: 5px;width: 35%;height: 26px;float: left;border-bottom: 1px solid #969896;'>"+infos.totalnum+"</div>"
                +f
                +"</h4>"
                +"<br />");
            $(doc).find("img").attr("src", imgData);
            doc.close();
            setTimeout(function(){
            	iframe.contentWindow.focus();
	            iframe.contentWindow.print();
	            main.num = 0;
            },0);

        }else{
            this.printData(imgData);
        }
    }
    
    //打印数据
    printData(){
    	let lines = main.chart.active_series();
        if (lines.length === 0) return;
        main.num = 1;
        var lineNames = lines[lines.length-1].name();
    	websocket.send(funcCode.getLineTitleByName,{lineName:lineNames},false)
    }
    //保存测试方案
    saveTestPlan(){
        let data = {
            funnm:0,
            name:"",
            excWave: "空",
            power:0,
            pinhole:0,
            grating:"grating",
            slit:0,
            expTime:0,
            centerWave:0,
            waveUnit:"nm",
            interval:0,
            intervalTime:0,
            times:0,
            from:0,
            to:0,
            acc:0
        }
        let temp = $("#mainBodyLeft div").first().attr("id")
        data.name = $("#testPlanName").val()
        let type= temp.slice(0,temp.indexOf("D"))
        data.excWave = $("#"+type+"EW").val()
        data.power = $("#"+type+"Power").val()
        data.pinhole =Number($("#"+type+"PZ").val())
        data.grating = $("#"+type+"Grating").val()
        data.slit = Number($("#"+type+"Slit").val())
        data.expTime =$("#"+type+"Exp").val()
        data.acc = Number($("#"+type+"TotalNum").val())
        data.waveUnit = fConfig.waveunit
        if (type === 'steady') {
            data.funnm =0
            data.centerWave = Number($("#steadyCW").val())
            data.interval = $("#steadyInterval").prop("checked")
            data.intervalTime =Number($("#steadyIntervalTime").val())
            data.times = Number($('#steadyIntervalNum').val())
        }else {
            data.funnm = 1
            data.from =$("#waveFrom").val()
            data.to = $("#waveTo").val()
        }
        deviceControl.saveTestScheme(data)
        $(".jeBox-close").click()//关闭弹窗
    }
    //工具按钮弹窗
    showToolsBox(t, i) {
        let [w, h, url,maxBtn,pad,mask] = [260, 150, 'html/algorithm/',false,"5px",true];
        let arr = [10,11,12,13,14,15,17]
        switch (i) {
            case 2: {
                w = "auto"
                h = "51%"
                url = 'html/device/camera/camera.html'
            }
                break;
            case 5: {
                h = 200
                url += 'switchUnit.html'
            }
                break;
            case 8: {
                w =300
                h = 400
                url += 'autoFocus.html'
            }break
            case 9: {
                maxBtn = true
                pad = '0px'
                mask = false
                w ='15%'
                h = '0.5%'
                url = 'html/mapping/mapping.html'
            }
                break;
            case 10: {
                w = '80%'
                h = '80%'
                url += 'fit.html'
            }
                break;
            case 11: {
                w = '80%'
                h = '80%'
                url += 'smooth.html'
            }
                break;
            case 12: {
                w = '80%'
                h = '80%'
                url += 'normalization.html'
            }
                break;
            case 13: {
                w = '80%'
                h = '80%'
                url += 'dataInterception.html'
            }
                break;
            case 14: {
                w = '80%'
                h = '80%'
                url += 'spikeFix.html'
            }
                break;
            case 15: {
                w = '80%'
                h = '80%'
                url += 'detection.html'
            }
                break;
            case 16: {
                h = 160
                url += 'mathAlways.html'
            }
                break;
            case 17: {
                w = '80%'
                h = '80%'
                url += 'halfWAndPeakA.html'
            }
                break;
            case 18: {
                h = 100
                url = 'html/other/language.html'
            }
                break;
            case 19: {
                url += 'emptyMsg.html'
            }
                break;
            case 20: {
                url += 'deleteAll.html'
            }
                break
            case 21: {
                w=700
                h=500
                url += 'coordinates.html'
            }
                break
            case 22: {
                url += 'deleteChecked.html'
            }
                break;
            case 23: {
                h = 185
                url = 'html/device/control/deviceConfig.html'
            }
                break;
            case 24: {
                w = 550
                h = 340
                url = 'html/device/control/deviceConnect.html'
            }
                break;
            case 25: {
                w = 540
                h = 410//550
                url = 'html/device/spec/spec.html'
            }
                break;
            case 26: {
                w= 1019
                h= 500
                url = 'html/device/dc/dc.html'
            }
                break;
            case 27: {
                w=400
                h=600
                url = 'html/device/dt/displacementTable.html'
            }
                break;
            case 28: {
                w= 400
                h= 565
                url = 'html/device/motor/polarizationSetting.html'
            }
                break;
            case 29: {
                w = '80%'
                h = '82%'
                url = 'html/db/database.html'
            }
                break;
            case 30: {
                w = 320
                h = 400
                url = 'html/tools/toolsManger.html'
            }
                break;
        }
        if (arr.includes(i)) {
            let lineData = main.chart.active_series()
            if (lineData.length === 0) {jeBox.msg($.i18n.prop('tips-choseCur'),{icon:1}) ;return}
        }
        $.get(url+'?'+new Date().getTime(), function (str) {
            jeBox.open({
                cell:"showBox",
                title: [t, {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: mask, //是否遮罩
                maskClose: false,
                maxBtn:maxBtn,
                padding:pad,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [w, h],
                zIndex: 1,
                content: str,
                success:function(){
                    if(i=== 2){
                        device.camera.type = true
                        deviceControl.MCEOpenWhiteLightImage()
                    }
                    main.translate(undefined)
                },
                endfun:function () {
                    if (i === 23) {
                        deviceControl.configDevice()
                    }
                    if(i=== 2){
                        deviceControl.MCECloseWhiteLightImage()
                    }
                    if(i===24){
                        deviceControl.autoConnect()
                    }
                    if (i === 26) {
                        if (device.ccd.movieState){
                            device.ccd.movieState = false
                            websocket.send(funcCode.StopAcqCcdImg,{})
                        }
                    }
                },
            })
        })
    }
    //文件系统-获取系统所有驱动器
    getDrivers(){
        websocket.send(funcCode.GetDrivers,{},false)
        main.setCallbacks(funcCode.GetDrivers,rev=>{
            let  drivers = rev.getDrivers()
        })
    }
    //文件系统-获取指定路径下所有文件和文件夹
    getDirsFiles(path){
        websocket.send(funcCode.GetDirsFiles,{path:path},false)
    }
    //文件系统-新建文件夹	1109
    makeDir(){
        websocket.send(funcCode.MakeDir,{path:''},false)
    }
    //打开曲线文件数据1420
    OpenLineDataPram(){
        websocket.send(funcCode.OpenLineDataPram,{path:''},false)
        main.setCallbacks(funcCode.OpenLineDataPram,rev=>{
            console.log(rev.getTiptitle())
        })
    }
    //保存曲线文件数据1421
    SaveLineDataPram(){
        websocket.send(funcCode.SaveLineDataPram, {path:'',content:''})
    }
    //获取文件路径
    getSavefilePathPram(){
        websocket.send(funcCode.getSavefilePathPram,{},false)
        main.setCallbacks(funcCode.getSavefilePathPram,rev=>{
            $("input#filePathShow").val(rev.getTiptitle());
            $("input#filePathShow").change();
        })
    }
    //设置文件路径
    setSaveFilePathPram(path){
        websocket.send(funcCode.setSaveFilePathPram,{path:path},false)
    }
    //关于
    about() {
        $.get('html/other/about.html'+'?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('main-menu-about'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [300, 320],
                zIndex: 1,
                content: str,
                success: function () {
                    main.translate(undefined)
                }
            })
        })
    }
    //密码弹窗
    ask_password(cb){
        jeBox.open({
            title: $.i18n.prop('popup-password'),
            boxSize: ['140px', '130px'],
            content: '<input type="password" id="pwd" style="width:80%;margin-left: 10%;color:#fff" />',
            maskLock: true,
            btnAlign: 'center',
            button: [
                {
                    name: $.i18n.prop('popup-confirm'),
                    callback: function (index) {
                        let pwd = $('#pwd').val();

                        if (pwd.includes('zolix')) {
                            cb();
                            jeBox.close(index);
                        } else {
                            jeBox.msg($.i18n.prop('tips-password'), {icon: 3});
                        }
                    }
                }
            ]
        });
    };

    //显示&隐藏设备状态
    showLight(){
        $("#laserLight").prop("hidden",!fConfig.deviceChoose.chooseLaser)
        $("#rTOTtLight").prop("hidden",!fConfig.deviceChoose.chooseMotor)
        $("#dtLight").prop("hidden",!fConfig.deviceChoose.chooseTango)
        $("#cameraLight").prop("hidden",!fConfig.deviceChoose.chooseCamera)
    }
    //改变设备连接状态
    updateLight(){
        $("#dcLight div").css("background",device.ccd.isConnected?"#28a745":"#dc3545")
        $("#cameraLight div").css("background",device.camera.isConnected?"#28a745":"#dc3545")
        $("#dtLight div").css("background",device.dT.isConnected?"#28a745":"#dc3545")
        $("#specLight div").css("background",device.spec.isConnected?"#28a745":"#dc3545")
        $("#laserLight div").css("background",device.laser.isConnected?"#28a745":"#dc3545")
        $("#rTOTtLight div").css("background",device.rTOT.isConnected?"#28a745":"#dc3545")
    }
    //更新操作状态
    updateScanOption(flag){
        $("#mainTools button[btnType='0']").prop('disabled',flag)
        $("#mainTools button[btnType='1']").prop('disabled',!flag)
        $("#menuShadow").prop('hidden',!flag)
        $("#toolsShadow").prop('hidden',!flag)
        $("#leftShadow").prop('hidden',!flag)
        //$("#legendShadow").prop('hidden',!flag)
    }

    //更新温度
    updateTemperature(rev){
        $("#ccdTemp").text(rev.getIval()+"℃")
    }

    //更新工具栏提示信息
    updateToolsTips(){
        $("#tools li button").each(function () {
            let temp = $(this).attr('data-tips')
            if (temp===undefined) return
            $(this).attr('title',$.i18n.prop(temp))
        })
        $("#steadyEW option:first-child").text($.i18n.prop('main-test-null'))
        $("#waveEW option:first-child").text($.i18n.prop('main-test-null'))
        $("#steadyPower option:first-child").text($.i18n.prop('main-test-zero'))
        $("#wavePower option:first-child").text($.i18n.prop('main-test-zero'))
    }

    //更新图表单位
    updateChartUnit(){
        main.chart.set_axis_x_title($.i18n.prop('main-chart-xTitle'+(fConfig.waveunit==='nm'?1:2)))
        main.chart.set_axis_y_title($.i18n.prop('main-chart-yTitle'))
    }

}();
//监听窗口关闭事件，窗口关闭，断开webSocket
window.onunload = window.onbeforeunload = function () {
    websocket.close();
};

$('.dropdown-menu button').click(function () {
    let index = Number($(this).attr('btnType'))
    let title = $(this).text()
    switch (index) {
        case 6:
        case 7: 
        case 31:{
            let src = index ===6?"html/scan/steady.html":index ===7?"html/scan/wavelength.html":"html/scan/polarization.html"
            fConfig.funnm = index===6?0:index===7?1:2
            $("#steadyScan").prop('disabled',fConfig.funnm===0)
            $("#waveScan").prop('disabled',fConfig.funnm===1)
            $("#polarScan").prop('disabled',fConfig.funnm===2)
            $("#mSteadyScan").prop('disabled',fConfig.funnm===0)
            $("#mWaveScan").prop('disabled',fConfig.funnm===1)
            $("#mPolarScan").prop('disabled',fConfig.funnm===2)
            console.log(fConfig.funnm);
            if(fConfig.funnm===0){
            	fConfig.spectrumUnit = $("#waveFUnit").html();
            	if(fConfig.spectrumUnit=="nm"){
            		fConfig.waveFrom = parseFloat($("#waveFrom").attr("nm")) 
            		fConfig.waveTo = parseFloat($("#waveTo").attr("nm"))
            	}else{
	            	fConfig.waveFrom = parseFloat($("#waveFrom").val()) 
	            	fConfig.waveTo = parseFloat($("#waveTo").val())	
            	}
            	
            }else{
            	fConfig.steadyUnit = $("#steadyUnit").html();
            	if(fConfig.steadyUnit=="nm"){
            		fConfig.steadyCenter = parseFloat($("#steadyCW").attr("nm"));
            	}else{
	            	fConfig.steadyCenter = parseFloat($("#steadyCW").val());
            	}
            }
            websocket.send(funcCode.TestModeChange,{funNm:fConfig.funnm},false)
            $('#mainBodyLeft').load(src)
        }
            break;
        // case 9: {
        //     window.open('html/mapping/mapping.html', 'Mapping测试')
        //     localStorage.setItem("p",JSON.stringify(fConfig))
        // }
        //     break;
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 28:{
            main.showToolsBox(title, index)
        }
            break;
    }
})