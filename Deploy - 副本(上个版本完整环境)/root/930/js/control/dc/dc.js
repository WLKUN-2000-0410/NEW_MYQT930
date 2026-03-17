dc = new class{
    initDC(){
        $("#dcMode").val(fConfig.ccdConf.mode)
        $("#dcExpTime").val(fConfig.ccdConf.expTime)
        $("#dcBinMin").val(fConfig.ccdConf.binMin)
        $("#dcBinMax").val(fConfig.ccdConf.binMax)
        $("#dcSet p").prop('hidden',!(fConfig.deviceAutoConn.ccdType ==='A2'))
        this.updateBinState()
        this.updateDcState(device.ccd.movieState)
        this.getGain()
        this.getSpeed()
    }
    //读取增益
    getGain(){
        websocket.send(funcCode.GetCamGain,{})
        main.setCallbacks(funcCode.GetCamGain,rev =>{
            let [dcGain,gainArr] = [$("#dcGain"),rev.getGainsList()]
            dcGain.empty()
            gainArr.forEach(cur=>{
                if ((fConfig.deviceAutoConn.ccdType === 'A4')) {
                    dcGain.append('<option>' +$.i18n.prop('popup-device-dc-A4Gain'+cur))
                }else {
                    dcGain.append('<option>' + cur)
                }
            })
            dcGain.get(0).selectedIndex = fConfig.ccdConf.gainNum
        })
    }
    //设置增益
    setGain(){
        let gain= $("#dcGain").get(0).selectedIndex
        websocket.send(funcCode.setCamGain,{gain:gain})
        fConfig.ccdConf.gainNum = gain
    }
    //获取读取速率和像素转移速率
    getSpeed(){
        if(!(fConfig.deviceAutoConn.ccdType ==='A2')) return
        websocket.send(funcCode.CcdGetParam,{})
        main.setCallbacks(funcCode.CcdGetParam,rev=>{
            let [rCount,tCount] = [rev.getRcount(),rev.getTcount()]
            let [rArr,tArr] = [rev.getReadoutrateList(),rev.getTransferrateList()]
            let [dcR,dcT] = [$("#dcReadSpeed"),$("#dcShiftSpeed")]
            rArr.forEach(cur=>{dcR.append("<option>"+cur)})
            tArr.forEach(cur=>{dcT.append("<option>"+cur)})
            if(fConfig.ccdConf.readoutRate!==''){
                dcR.val(fConfig.ccdConf.readoutRate)
            }
            if(fConfig.ccdConf.transferRate!==''){
                dcT.val(fConfig.ccdConf.transferRate)
            }
        })
    }
    setSpeed(m){
        let [dcR,dcT] = [$("#dcReadSpeed"),$("#dcShiftSpeed")]
        let data = {}
        data.mode = m;
        data.index = m===0?dcR.get(0).selectedIndex:dcT.get(0).selectedIndex
        data.rate = m===0?dcR.val():dcT.val()
        websocket.send(funcCode.CcdSetParam,data)
        main.setCallbacks(funcCode.CcdSetParam,rev=>{
            fConfig.ccdConf.readoutRate = dcR.val()
            fConfig.ccdConf.transferRate = dcT.val()
        })
    }

    //设置采集模式
    setScanMOde(){
        let mode = fConfig.ccdConf.mode = $("#dcMode").val();
        websocket.send(funcCode.SetScanMode, {mode:mode})
        this.updateBinState()
    }
    //设置积分时间
    setExpTime(){
        let expT =fConfig.ccdConf.expTime = $("#dcExpTime").val()
        websocket.send(funcCode.iTS,{"exp":expT})
    }

    //截取数据
    setBinRange(){
        let min = parseInt($("#dcBinMin").val())
        let max = parseInt($("#dcBinMax").val())
        if(isNaN(min)||isNaN(max)) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        fConfig.ccdConf.binMin = min
        fConfig.ccdConf.binMax = max
        websocket.send(funcCode.SetBinRange,{binMin:min,binMax:max})
    }
    //开始影像采集
    startMovie(){
        device.ccd.movieState = true
        this.updateDcState(true)
        let expTime =fConfig.ccdConf.expTime = $("#dcExpTime").val()
        websocket.send(funcCode.StartAcqCcdImg,{expTime:expTime})
        main.setCallbacks(funcCode.StartAcqCcdImg,rev=>{main.log(funcCode.StartAcqCcdImg,rev.getBstatus())})
    }
    //停止影像采集
    stopMovie(){
        device.ccd.movieState = false
        this.updateDcState(false)
        websocket.send(funcCode.StopAcqCcdImg,{})
    }
    //保存图片
    saveDataOrImg(t){
        let imgData= $("#dcImg").prop('src');

        if(t===0){
            let suc = function () {
                main.getSavefilePathPram()
                $("div .fileType select option[value='.hdr']").hide()
                $("div .fileType select option[value='.png']").hide()
                $("div .fileType select option[value='.jpg']").hide()
                $("div .fileType select option[value='.csv']").hide()
                $("div.fileType select").val(".txt");
                $("div.saveFilePathAndName button.chooseFilePaths").click(function(event){

                    event.stopPropagation();
                });
                $("div.saveFilePathAndName button").click(function(event){
                    let index = $(this).index("div.saveFilePathAndName button");
                    switch (index){
                        case 0:
                            //选取文件夹
                            break;
                        case 1:
                            //保存数据
                            let fileName = $("div.saveFilePathAndName input").get(0).value;
                            let filePath = $("div.saveFilePath")
                            break;
                    }
                    event.stopPropagation();
                });
            }
            let end = function(){
                if(main.isOpenChecked){
                    main.isOpenChecked = false
                    websocket.send(funcCode.SaveAcqImgData,{filePath:main.saveFilePath})
                    main.setCallbacks(funcCode.SaveAcqImgData,rev=>{
                        jeBox.msg($.i18n.prop(rev.getBstatus()?'tips-dc-saveSuccess':'tips-dc-saveFill'), {icon: rev.getBstatus()?2:3});
                    })
                }
            }
            main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
            main.saveFileByPath(suc,end)
        }else {
         downloadFile(new Date().getTime()+".png", imgData);
        }
    }
    //更新bin状态
    updateBinState(){
        let mode = $("#dcMode").get(0).selectedIndex
        $("#dcBinMin").prop("disabled",mode===0)
        $("#dcBinMax").prop("disabled",mode===0)
        $("#dcBinBtn").prop("disabled",mode===0)
    }
    //更新数采图像
    updateCCDImg(rev){
        let [w,h,data] = [rev.getXpixsize(),rev.getYpixsize(),rev.getImgdata()]
        movie.show(w,h,data)
    }
    //更新数采状态
    updateDcState(flag){
        $("#startMovie").prop('disabled',flag)
        $("#stopMovie").prop('disabled',!flag)
        $("#dcGain").prop('disabled',flag)
        $("#dcMode").prop('disabled',flag)
        $("#saveImg").prop('disabled',flag)
        $("#saveData").prop('disabled',flag)
        $("#dcExpTime").prop('disabled',flag)
        $("#dcAdvBtn").prop('disabled',flag)
    }
}()

