wavelength = new class{
    name = ''
    data={};
    nameSet = new Set()
    //初始化测试方案
    initTestPlan(){
        let arr = fConfig.specSchemes
        if (arr.length === 0) return
        for (let i = 0; i <arr.length; i++) {
            let str = '<div class="dropdown-item testPlan">' +
                '<button type="button"  class="btn btn-secondary btn-sm" onclick="dialog.showTestBox(false,this)" id=wavelengthTest'+i+'><img src="source/image/Spectrum.png" alt="">'+arr[i]+'</button>'+
                '<button type="button"  class="btn btn-secondary btn-sm" onclick="wavelength.removeTestPlan(this)"><img alt="" src="source/image/close_white.png"></button>'+
                '</div>'
            $("#wavelengthTest").next(".dropdown-menu").append(str)
        }
    }
    //接谱扫描开始
    startScan(){
        let fromDom = $("#waveFrom"),toDom = $('#waveTo')
        let excWave = $("#waveEW").val()
        let power = $("#wavePower").val()
        if (power === 'zero') power ='归零'
        let expTime = $("#waveExp").val()
        if(parseFloat(expTime)===0) return jeBox.msg($.i18n.prop('tips-scan-expZero'),{icon:1})
        let acc = fConfig.totalnum =  parseInt($("#waveTotalNum").val())
        let from =  fromDom.attr("nm")
        let to = toDom.attr("nm")

        let curFrom = fromDom.val()
        let curTo = toDom.val()
        if (curFrom === '') return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        if (curTo=== '') return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        if(Number(curFrom)>=Number(curTo))  return jeBox.msg($.i18n.prop('tips-range-seMsg1'),{icon:1})

        fConfig.spectrumfrom= fromDom.val()
        fConfig.spectrumto = toDom.val()

        let unit =  $($("span.showUnit").get(0)).text()
        let grating =$("#waveGrating").val()
        let gratingNum = $("#waveGrating").get(0).selectedIndex+1;
        let dLaserWave = 0.0;
        if (excWave===$.i18n.prop('main-test-null')||gratingNum===0) {
            dLaserWave=fConfig.excwaveselect[0].E;
        } else{
            fConfig.excwaveselect.forEach((cur)=>{
                if(cur.name === excWave){
                    dLaserWave=cur["grating"+gratingNum];
                }
            })
        }
        // if (excWave === $.i18n.prop('main-test-null')) return jeBox.msg($.i18n.prop('tips-scan-paramErr'),{icon:1})
        let data = {excWave:excWave,power:power,laserWaveLength:dLaserWave,expTime:expTime,acc:acc,from:from,to:to,unit:unit,clearBg:false,grating:grating}
        if (this.paramIsNaN(data)) return
        this.name = "L_w_"+new Date().getTime()

        websocket.send(funcCode.commandRunSpectrum,data)
        main.updateScanOption(true)
        $("#mainTools button[btnType='1']").prop('disabled',true) //禁用手动停止
        main.setCallbacks(funcCode.commandRunSpectrum,rev =>{ main.log(funcCode.commandRunSpectrum,rev.getBstatus())})
        main.setCallbacks(funcCode.commandStopSpectrum,rev=>{
            main.log(funcCode.commandStopSpectrum,rev.getBstatus())
            main.updateScanOption(false)
            $("#legendItem .legendItemBtn>button").prop('disabled',false)
            let info = this.updateNewInfoByTest();
            let x = main.chart.series(wavelength.name).get_data().x
            let y = main.chart.series(wavelength.name).get_data().y
            lineProcess.AddLineDataParams(info,x,y,true,1);
        })
    }
    //接谱扫描停止
    stopScan(){
        main.updateScanOption(false)
        websocket.send(funcCode.commandStopSpectrum,{})
        main.setCallbacks(funcCode.commandStopSpectrum,rev=>{
             main.log(funcCode.commandStopSpectrum,rev.getBstatus())
            let info = this.updateNewInfoByTest();
            let x = main.chart.series(wavelength.name).get_data().x
            let y = main.chart.series(wavelength.name).get_data().y
            lineProcess.AddLineDataParams(info,x,y,true,1);
            $("#legendItem .legendItemBtn>button").prop('disabled',false)
        })
    }

    //添加测试方案
    addTestPlan(i,name){
        if (this.nameSet.has(name)) {
            jeBox.msg($.i18n.prop('tips-testPlan-exists'),{icon:1})
            return false
        }
        this.nameSet.add(name)
        let str = '<div class="dropdown-item testPlan">' +
            '<button type="button"  class="btn btn-secondary btn-sm" onclick="dialog.showTestBox(false,this)" id=wavelengthTest'+i+'><img src="source/image/Spectrum.png" alt="">'+name+'</button>'+
            '<button type="button"  class="btn btn-secondary btn-sm" onclick="wavelength.removeTestPlan(this)"><img alt="" src="source/image/close_white.png"></button>'+
            '</div>'
        $("#wavelengthTest").next(".dropdown-menu").append(str)
        return true
    }
    //删除测试方案
    removeTestPlan(tag){
        let name = $(tag).prev('button').text()
        main.setCallbacks(funcCode.DeleteTestScheme,(rev)=>{
            $(tag).parent().remove()
            this.nameSet.delete(name)
        })
        websocket.send(funcCode.DeleteTestScheme,{"funnm":1,"schemeName":name})
    }
    //更新参数
    updateParam(){
        let [ewId,ew,pwId,from,to,pz] = [$("#waveEW"),'',$("#wavePower"),$("#waveFrom"),$("#waveTo"),$("#wavePZ")]
        ewId.empty()
        fConfig.excwaveselect.forEach(val=>{
            if(val.chooseDevice){ ewId.append("<option>"+(val.name==='空'?$.i18n.prop('main-test-null'):val.name))}
            ewId.val(fConfig.excwave==='空'?$.i18n.prop('main-test-null'):fConfig.excwave)
            ew = ewId.val()
            if(ew==='null') ew = '空'
            if (val.name === ew) {
                pwId.empty()
                pwId.append("<option>"+$.i18n.prop('main-test-zero'))
                Object.values(val.power).forEach((cur)=>{pwId.append("<option>"+cur)})
            }
            // if(val.name === "pinhole"){
            //     $("#wavePZ").empty()
            //     Object.values(val.M3COL).forEach((cur)=>{$("#wavePZ").append("<option>"+cur)})
            // }
        })
        pz.empty()
        device.pinholeMsg.forEach((cur)=>{pz.append("<option>"+cur)})
        pwId.val(fConfig.powervalue==='归零'?$.i18n.prop('main-test-zero'):fConfig.powervalue)
        $("#waveGrating").val(fConfig.grating)
        pz.val(fConfig.pinhole)
        $("#waveSlit").val(fConfig.slit)
        $("#waveExp").val(fConfig.expTime)
        
        $("#waveTotalNum").val(fConfig.totalnum===0?1:fConfig.totalnum)
        console.log(fConfig.waveunit)
        $("span.showUnit").text(fConfig.waveunit)
        
        let gratingNum = device.spec.grating =  fConfig.grating.split("-")[0];
    	let dLaserWave = 0.0;
    	console.log(fConfig);
    	console.log(fConfig.excwave+"/"+gratingNum);
        if (fConfig.excwave==="空"||gratingNum===0) {
            dLaserWave=fConfig.excwaveselect[0].E;
        } else{
            fConfig.excwaveselect.forEach((cur)=>{
                if(cur.name === fConfig.excwave){
                    dLaserWave=cur["grating"+gratingNum];
                }
            })
        }
    	let sendParam = {};
        sendParam.laserWave = dLaserWave;
        if(fConfig.spectrumUnit ==="cm-1"){
        	
        	sendParam.array = [fConfig.waveFrom,fConfig.waveTo];
        	websocket.send(funcCode.CmToNmParams,sendParam);
            main.setCallbacks(funcCode.CmToNmParams,rev =>{
                let selectW = rev.getPdList();
                if(fConfig.waveunit==="cm-1"){
	        		from.val(fConfig.waveFrom.toFixed(2))
        			to.val(fConfig.waveTo.toFixed(2))
		        	from.attr("nm",selectW[0])
        			to.attr("nm",selectW[1])
		        }else{
		        	from.val(selectW[0].toFixed(2))
        			to.val(selectW[1].toFixed(2))
		        	from.attr("nm",selectW[0])
        			to.attr("nm",selectW[1])
		        }
            })
        }else{
        	from.attr("nm",fConfig.waveFrom)
        	to.attr("nm",fConfig.waveTo)
        	if(fConfig.waveunit==="cm-1"){
	            sendParam.array = [fConfig.waveFrom,fConfig.waveTo];
	        	websocket.send(funcCode.NmToCmParams,sendParam);
	            main.setCallbacks(funcCode.NmToCmParams,rev =>{
	                let selectW = rev.getPdList();
	                inputRange.addOldValue([$("#waveSlit"),from,to])
	                from.val(selectW[0].toFixed(2))
	        		to.val(selectW[1].toFixed(2))
	            })
	        }else{
	        	console.log(fConfig);
	            from.val(fConfig.waveFrom.toFixed(2))
	            to.val(fConfig.waveTo.toFixed(2))
	        }
        }
        
        
        
        inputRange.addOldValue([$("#waveSlit"),from,to])
        from.attr("nm",fConfig.spectrumfrom)
        to.attr("nm",fConfig.spectrumto)
        from.attr('min',device.spec.minRangeNM)
        from.attr('max',device.spec.maxRangeNM)
        from.attr('maxCM',device.spec.maxRangeCM)
        from.attr('minCM',device.spec.minRangeCM)
        to.attr('min',device.spec.minRangeNM)
        to.attr('max',device.spec.maxRangeNM)
        to.attr('maxCM',device.spec.maxRangeCM)
        to.attr('minCM',device.spec.minRangeCM)
        this.updateState()
    }
    //更新状态
    updateState(){
        $("#waveEW").prop("disabled",!device.laser.isConnected)
        $("#wavePower").prop("disabled",!device.laser.isConnected)
        $("#wavePZ").prop("disabled",!device.rTOT.isConnected)
        $("#waveGrating").prop("disabled",((!device.spec.isConnected) ||(!device.ccd.isConnected)))
        $("#waveSlit").prop("disabled",!device.spec.isConnected)
        $("#waveExp").prop("disabled",!device.ccd.isConnected)
        this.updateGrating()
        this.updateSlitRange()
    }
    //更新光栅
    updateGrating(){
        let [t,arr] = [$("#waveGrating"),device.spec.gratings]
        t.empty()
        arr.forEach(cur=>{t.append("<option>"+cur)})
        if (t.get(0) === undefined) return
        t.get(0).selectedIndex = device.spec.grating-1//当前选择光栅
    }
    //狭缝可用范围
    updateSlitRange(){
        let [min,max,t]=[10,3000,$("#waveSlit")]
        switch (device.spec.slitType) {
            case 'SR-SLIT ':{
                min = 10
                max = 3000
            }break
            case 'SLIT-I24 ':{
                min = 10
                max = 24000
            }break
        }
        t.attr("min",min)
        t.attr("max",max)

    }
    //更新扫描结果
    updateScanResult(rev){
        let [idx,xy] = [rev.getRetsize(),rev.getRetxyList()]
        let [x,y] = [xy.slice(0,idx),xy.slice(idx,xy.length)]
        let line = main.chart.add_series(this.name, 0);
        line.add_array(x,y)
        main.legend.addLegend(line)
        $("#legendItem .legendItemBtn>button").prop('disabled',true)
    }
    
    updateInfoByTest(){
    	let info={};
    	let temp = $("#mainBodyLeft div").first().attr("id");
		let type= temp.slice(0,temp.indexOf("D"))
		info.name           = this.name;
	    info.laserW         =$("#"+type+"EW").val();
	    info.power          =$("#"+type+"Power").val();
	    info.pinhole        =Number($("#"+type+"PZ").val());
	    info.strgrating     =$("#"+type+"Grating").val();
	    info.slitWidth      =Number($("#"+type+"Slit").val());
	    info.time           =$("#"+type+"Exp").val();
	    info.cwl            =Number($("#"+type+"CW").val());
	    info.accNum         =Number($("#"+type+"TotalNum").val());
	    info.interCheck     =$("input#steadyInterval").prop("checked");
	    info.interTime      =0
	    info.interNum       =0
	    info.startWave      =Number($("#"+type+"From").val());
	    info.endWave        =Number($("#"+type+"To").val());
	    info.unit           =$("span.showUnit").text();
		let gratingNum      =$("#"+type+"Grating").get(0).selectedIndex+1;
		if (info.laserW ==="空") {
	        info.laserwavelength=fConfig.excwaveselect[0].E;
	    } else{
	        fConfig.excwaveselect.forEach((cur)=>{
	            if(cur.name === info.laserW){
	               info.laserwavelength=cur["grating"+gratingNum]
	            }
	        })
	    }
	    return info;
    }
    
    updateNewInfoByTest(){
    	let info={};
    	let temp = $("#mainBodyLeft div").first().attr("id");
		let type= temp.slice(0,temp.indexOf("D"))
		
		info.name           = this.name;
		info.strScanMode    =$.i18n.prop('main-wavelengthTest-title');
	    info.strWave        =$("#"+type+"EW").val();
	    info.powervalue     =$("#"+type+"Power").val();
	    info.pinhole        =Number($("#"+type+"PZ").val());
	    info.grating        =$("#"+type+"Grating").val();
	    info.slit           =Number($("#"+type+"Slit").val());
	    info.ExpTime        =$("#"+type+"Exp").val();
	    info.strCenterWave  =$("#"+type+"CW").val();
	    info.totalnum       =Number($("#"+type+"TotalNum").val());
	    info.strInterFlg    ="";
	    info.interTime      =0
	    info.interNum       =0
	    info.strStartWave   =$("#"+type+"From").val();
	    info.strEndWave     =$("#"+type+"To").val();
	    info.unit           =$($("span.showUnit").get(0)).text();
		let gratingNum      =$("#"+type+"Grating").get(0).selectedIndex+1;
		if (fConfig.excwave===$.i18n.prop('main-test-null')) {
	        info.laserWaveLength=fConfig.excwaveselect[0].E;
	    } else{
	        fConfig.excwaveselect.forEach((cur)=>{
	            if(cur.name === fConfig.excwave){
	               info.laserWaveLength=cur["grating"+gratingNum]
	            }
	        })
	    }
	    return info;
    }

    //参数非法值判断
    paramIsNaN(data){
        let flag = false
        for (let k of Object.keys(data)){
            let msg = 'tips-scan-paramErr'
            switch (k) {
                case 'excWave':{
                    if (data[k] === $.i18n.prop('main-test-null')) flag=true
                }break
                case 'expTime':
                case 'from':
                case 'to':{
                    if (data[k] === '')flag = true
                }break
                case 'acc':{
                    if (isNaN(data[k])) flag = true
                }break
            }
            if (flag) return jeBox.msg($.i18n.prop(msg),{icon:1});
        }
        return flag
    }
}()