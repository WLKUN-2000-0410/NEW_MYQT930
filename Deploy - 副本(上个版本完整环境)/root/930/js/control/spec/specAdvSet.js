specAdv = new class{
    funcMap = new Map()

    //初始化
    initSpecAdv(){
        this.funcMap.set(1,this.systemInfo)
        this.funcMap.set(2,this.Peripherals)
        this.funcMap.set(3,this.mirrorAdv)
        this.funcMap.set(4,this.filterAdv)
        this.funcMap.set(5,this.slitAdv)
        this.funcMap.set(6,this.gratingParameter)
        this.funcMap.set(7,this.correctionFactor)
        this.funcMap.set(8,this.initialPosition)
        this.funcMap.set(9,this.gratingMovementControl)

        this.switchBtn(1)

    }
    //切换页面
    switchBtn(t){
        /*更新item*/
        $("#specAdv>div.specAdvItem[itemType="+t+"]").removeClass('d-none').addClass('d-flex')
        $("#specAdv>div.specAdvItem[itemType!="+t+"]").addClass('d-none').removeClass('d-flex')

        /*更新按钮状态*/
        $("#specAdv>div.btn-group button[btnType="+t+"]").addClass("activeBtn").prop('disabled',true)
        $("#specAdv>div.btn-group button[btnType!="+t+"]").removeClass("activeBtn").prop('disabled',false)

        this.updatePeripherals()
        this.funcMap.get(t)().init();

    }
    //系统信息
    systemInfo() {
        return new class {
            init() {
                websocket.send(funcCode.SpecGetVersion,{})
                main.setCallbacks(funcCode.SpecGetVersion,rev=>{
                    $("#advMaker").val(rev.getManufacture())
                    $("#advDevType").val(rev.getModel())
                    $("#advDevNum").val(rev.getSn())
                    $("#advMakeDate").val(rev.getDate())
                    $("#advVersion").val(rev.getVersion())
                })
            }
        }()
    }
    //外设
    Peripherals(){
        return new class {
            codeMap={
                1:funcCode.SetupFilter,
                2:funcCode.SetupMirror,
                3:funcCode.SetupSlit,
                4:funcCode.SetupShutter
            }

            init() {
                $("#isFilter").prop('checked',device.spec.filter.setup)

                $("#isMirrorEx").prop('checked',device.spec.mirror[0].setup)
                $("#isMirrorEN").prop('checked',device.spec.mirror[1].setup)

                $("#isSlitSideEN").prop('checked',device.spec.slit[0].setup)
                $("#isSlitSideEx").prop('checked',device.spec.slit[1].setup)
                $("#isSlitFrontEx").prop('checked',device.spec.slit[2].setup)
                $("#isSlitFrontEN").prop('checked',device.spec.slit[3].setup)

                $("#isShutter").prop('checked',device.spec.shutter[0].setup)
            }
            //设置外设按装状态
            setPeripheralsSetup(codeType,idx,dom){
                let setup = $(dom).prop('checked')
                switch (codeType){
                	case 1:
                		device.spec.filter.setup=setup
                		break;
                	case 2:
                		device.spec.mirror[idx].setup=setup
                		break;
                	case 3:
                		device.spec.slit[idx].setup=setup
                		break;
                	case 4:
                		device.spec.shutter[idx].setup=setup
                		break;
                	default:
                		break;
                }
                websocket.send(this.codeMap[codeType],{index:idx,setup:setup})
            }

        }()
    }
    //摆镜
    mirrorAdv(){
        return new class{
            init() {
                let mirrorBtn = $("#AdvMirrorBtn")
                mirrorBtn.prop('disabled',mirrorBtn.hasClass('activeBtn'))
                this.updateMirror()
            }
            /*摆镜归零*/
            mirrorHome(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('idx'))
                websocket.send(funcCode.setMirror,{idx:mirrorType,flag:true})
            }
            /*摆镜类型切换*/
            mirrorTypeSwitch(){
                this.mirrorHomePosRead()
                this.mirrorTotalStepRead()
                this.mirrorSpeedRead()
                this.mirrorTotalStepRead()
            }

            /*摆镜切换*/
            mirrorSwitch(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('idx'))
                let mirrorFlag = ($("#advMirrorDir").get(0).selectedIndex ===0)
                websocket.send(funcCode.setMirror,{idx:mirrorType,flag:mirrorFlag})
            }
            /*摆镜归零方向*/
            mirrorHomePosRead(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                websocket.send(funcCode.GetMotorHomeDir,{index:mirrorType})
                main.setCallbacks(funcCode.GetMotorHomeDir,rev=> {
                    $(rev.getDir() === 0 ? '#mirrorDirReverse' : '#mirrorDirPositive').prop('checked', true)
                    main.log(funcCode.GetMotorHomeDir+"-"+rev.getIndex(),rev.getBstatus())
                })
            }
            mirrorHomePosSet(dir){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                websocket.send(funcCode.SetMotorHomeDir,{index:mirrorType,dir:dir})
                main.getCallback(funcCode.SetMotorHomeDir+"-"+mirrorType,rev=>main.log(funcCode.SetMotorHomeDir+"-"+rev.getIndex(),rev.getBstatus()))
            }
            /*摆镜总步数*/
            mirrorTotalStepRead(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                websocket.send(funcCode.GetMotorTotalSteps,{index:mirrorType})
                main.setCallbacks(funcCode.GetMotorTotalSteps,rev=> {
                    $('#mirrorTotalSteps').val(rev.getTotal())
                    main.log(funcCode.GetMotorTotalSteps+"-"+rev.getIndex(),rev.getBstatus())
                })
            }
            mirrorTotalStepSet(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                let totals = parseInt($("#mirrorTotalSteps").val())
                websocket.send(funcCode.SetMotorTotalSteps,{index:mirrorType,total:totals})
                main.getCallback(funcCode.SetMotorTotalSteps+"-"+mirrorType,rev=>main.log(funcCode.SetMotorTotalSteps+"-"+rev.getIndex(),rev.getBstatus()))
            }
            /*摆镜速度*/
            mirrorSpeedRead(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                websocket.send(funcCode.GetMotorSpeed,{index:mirrorType})
                main.setCallbacks(funcCode.GetMotorSpeed,rev=> {
                    $('#mirrorSpeed').val(rev.getSpeed())
                    main.log(funcCode.GetMotorSpeed+"-"+rev.getIndex(),rev.getBstatus())
                })
            }
            mirrorSpeedSet(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                let speed = parseInt($("#mirrorSpeed").val())
                websocket.send(funcCode.SetMoveSpeed,{index:mirrorType,speed:speed})
                main.getCallback(funcCode.SetMoveSpeed+"-"+mirrorType,rev=>main.log(funcCode.SetMoveSpeed+"-"+rev.getIndex(),rev.getBstatus()))
            }
            /*摆镜位置*/
            mirrorPosRead(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                websocket.send(funcCode.GetMotorSteps,{index:mirrorType})
                main.setCallbacks(funcCode.GetMotorSteps,rev=> {
                    $('#mirrorSteps').val(rev.getSteps())
                    main.log(funcCode.GetMotorSteps+"-"+rev.getIndex(),rev.getBstatus())

                })
            }
            mirrorPosSet(){
                let mirrorType = parseInt($('#advMirrorType option:selected').attr('mirrorType'))
                let steps = parseInt($("#mirrorSteps").val())
                websocket.send(funcCode.SetMotorSteps,{index:mirrorType,steps:steps})
                main.getCallback(funcCode.SetMotorSteps+"-"+mirrorType,rev=>main.log(funcCode.SetMotorSteps+"-"+rev.getIndex(),rev.getBstatus()))
            }
            //更新摆镜类型和方向
            updateMirror(){
                $('#advMirrorType').empty()
                device.spec.mirror.forEach((cur,idx)=>{
                    let strS = ['出口摆镜','入口摆镜']
                    if (cur.setup) {
                        $('#advMirrorType').append('<option mirrorType='+(idx===0?3:8)+' idx='+idx+'>' + strS[idx])
                        $('#advMirrorDir').get(0).selectedIndex =(cur.port?0:1)
                    }
                })
                this.mirrorTypeSwitch()
            }

        }()

    }
    //滤光片轮
    filterAdv(){
        return new class{
            init(){
                let mirrorBtn = $("#AdvFilterBtn")
                mirrorBtn.prop('disabled',mirrorBtn.hasClass('activeBtn'))
                this.filterPosRead()
                this.filterModelRead()
                this.filterTotalStepsRead()
                this.filterLimitRead()
            }
            //归零
            filterHome(){
                websocket.send(funcCode.SetFilter,{index:2,which:1})
            }
            //位置
            filterPosRead(){
                websocket.send(funcCode.GetFilter,{index:2})
                main.setCallbacks(funcCode.GetFilter,rev=>{
                    let idx = rev.getIval()
                    $("#advFilterPos").val(idx)
                })
            }
            filterPosSet(){
                let which = parseInt($("#advFilterPos").val())
                websocket.send(funcCode.SetFilter,{index:2,which:which})
            }
            //型号
            filterModelRead(){
                websocket.send(funcCode.GetFilterModel,{})
                main.setCallbacks(funcCode.GetFilterModel,rev=>{
                    let model = rev.getTiptitle()
                    $("#advFilterMode").val(model)
                })
            }
            filterModelSet(){
                let model = $("#advFilterMode").val()
                websocket.send(funcCode.SetFilterModel,{model:model})
            }
            //总步数
            filterTotalStepsRead(){
                websocket.send(funcCode.GetMotorTotalSteps,{idx:2})
                main.setCallbacks(funcCode.GetMotorTotalSteps+"-"+2,rev=>{
                    let total = rev.getTotal()
                    $("#advFilterTotalSteps").val(total)
                    main.log(funcCode.GetMotorTotalSteps+"-"+rev.getIndex(),rev.getBstatus())

                })
            }
            filterTotalStepsSet(){
                let total = parseInt($("#advFilterTotalSteps").val())
                websocket.send(funcCode.SetMotorTotalSteps,{idx:2,total:total})
                main.getCallback(funcCode.SetMotorTotalSteps+"-"+2,rev=>main.log(funcCode.SetMotorTotalSteps+"-"+rev.getIndex(),rev.getBstatus()))

            }
            //波长范围
            filterLimitRead(){
                for (let i = 1; i <= 3; i++) {
                    for (let j =1; j <= 6; j++) {
                        websocket.send(funcCode.GetFilterLimit,{grating:i,which:j})
                        main.setCallbacks(funcCode.GetFilterLimit,rev=>{
                            let grating = rev.getGrarting()
                            let which = rev.getWhich()
                            let val = rev.getVal()
                            $("#advflG"+grating+"W"+which).val(val).attr('oldV',val)
                        })
                    }
                }
            }
            filterLimitSet(){
                $('#advFilterLimit input').each(function () {
                    let dom = $(this).attr('id')
                    let temp =  dom.split("advFLG")[1].split("W")
                    let grating = parseInt(temp[0]),filter = parseInt(temp[1])
                    let oldV = parseInt($(this).attr('oldV'))
                    let curV = parseInt($(this).val())
                    if(!isNaN(oldV)&&!isNaN(curV)) {
                        if (oldV !== curV) {
                            websocket.send(funcCode.SetFilterLimit, {grating: grating, which: filter, val: curV})
                            main.setCallbacks(funcCode.SetFilterLimit, rev => {
                                main.log(funcCode.SetFilterLimit, rev.getBstatus())
                                $("#" + dom).attr("oldV", curV)
                            })
                        }
                    }
                })
            }
        }()


    }
    //狭缝
    slitAdv(){
        return new class{
            init(){
                let mirrorBtn = $("#AdvSlitBtn")
                mirrorBtn.prop('disabled',mirrorBtn.hasClass('activeBtn'))
                this.updateSlitType()
            }
            //归零
            slitHome(){
                let slitType = parseInt($("#advSlitType option:selected").attr('idx'))
                websocket.send(funcCode.SetSlitHome,{index:slitType})
            }
            //狭缝切换
            slitSwitch(){
                this.slitModelRead()
                this.slitWidthRead()
                this.sliBandwidthRead()
                this.slitHomeDirRead()
                this.slitTotalStepsRead()
                this.slitSpeedRead()
                this.slitPosRead()
            }
            //狭缝类型
            slitModelRead(){
                let slitType = parseInt($("#advSlitType option:selected").attr('idx'))
                websocket.send(funcCode.GetSlitModel,{index:slitType})
                main.setCallbacks(funcCode.GetSlitModel,rev=>$("#advSlitModel").val(rev.getTiptitle()))
            }
            slitModelSet(){
                let slitType = parseInt($("#advSlitType option:selected").attr('idx'))
                let model= $("#advSlitModel").val()
                websocket.send(funcCode.SetSlitModel,{index:slitType,model:model})
            }
            //狭缝偏置
   /*         slitOffsetRead(){}
            slitOffsetSet(){}*/
            //狭缝宽度
            slitWidthRead(){
                let slitType = parseInt($("#advSlitType option:selected").attr('idx'))
                websocket.send(funcCode.getSlitWidth,{index:slitType})
                main.setCallbacks(funcCode.getSlitWidth,rev=>$("#advSlitWidth").val(rev.getIval()))
            }
            slitWidthSet(){
                let slitType = parseInt($("#advSlitType option:selected").attr('idx'))
                let width = parseInt($("#advSlitWidth").val())
                websocket.send(funcCode.autoSlitWidth,{index:slitType,width:width})
            }
            //狭缝带宽
            sliBandwidthRead(){
                let slitType = parseInt($("#advSlitType option:selected").attr('idx'))
                websocket.send(funcCode.GetSlitBandpass,{index:slitType})
                main.setCallbacks(funcCode.GetSlitBandpass,rev=>$("#advSlitBandWidth").val(rev.getFval()))
            }
            sliBandwidthSet(){
                let slitType = parseInt($("#advSlitType option:selected").attr('idx'))
                let bandWidth = parseInt($("#advSlitBandWidth").val())
                websocket.send(funcCode.SetSlitBandpass,{index:slitType,nm:bandWidth})
            }
            //狭缝归零方向
            slitHomeDirRead(){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                websocket.send(funcCode.GetMotorHomeDir,{index:idx})
                main.setCallbacks(funcCode.GetMotorHomeDir,rev=> {
                    $(rev.getDir() === 0 ? '#advSlitReverse' : '#advSlitPositive').prop('checked', true)
                    main.log(funcCode.GetMotorHomeDir+"-"+rev.getIndex(),rev.getBstatus())
                })
            }
            slitHomeDirSet(dir){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                websocket.send(funcCode.SetMotorHomeDir,{index:idx,dir:dir})
                main.getCallback(funcCode.SetMotorHomeDir+"-"+idx,rev=>main.log(funcCode.SetMotorHomeDir+"-"+rev.getIndex(),rev.getBstatus()))

            }
            //狭缝总步数
            slitTotalStepsRead(){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                websocket.send(funcCode.GetMotorTotalSteps,{index:idx})
                main.setCallbacks(funcCode.GetMotorTotalSteps,rev=> {
                    $('#advSlitTotalSteps').val(rev.getTotal())
                    main.log(funcCode.GetMotorTotalSteps+"-"+rev.getIndex(),rev.getBstatus())
                })
            }
            slitTotalStepsSet(){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                let total = parseInt($("#advSlitTotalSteps").val())
                websocket.send(funcCode.SetMotorHomeDir,{index:idx,total:total})
                main.getCallback(funcCode.SetMotorTotalSteps+"-"+idx,rev=>main.log(funcCode.SetMotorTotalSteps+"-"+rev.getIndex(),rev.getBstatus()))

            }
            //狭缝速度
            slitSpeedRead(){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                websocket.send(funcCode.GetMotorSpeed,{index:idx})
                main.setCallbacks(funcCode.GetMotorSpeed,rev=> {
                    $('#advSlitSpeed').val(rev.getSpeed())
                    main.log(funcCode.GetMotorSpeed+"-"+rev.getIndex(),rev.getBstatus())

                })
            }
            slitSpeedSet(){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                let speed = parseInt($("#advSlitSpeed").val())
                websocket.send(funcCode.SetMotorHomeDir,{index:idx,speed:speed})
                main.getCallback(funcCode.SetMoveSpeed+"-"+idx,rev=>main.log(funcCode.SetMoveSpeed+"-"+rev.getIndex(),rev.getBstatus()))

            }
            //狭缝位置
            slitPosRead(){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                websocket.send(funcCode.GetMotorSteps,{index:idx})
                main.setCallbacks(funcCode.GetMotorSteps,rev=> {
                    $('#advSlitPos').val(rev.getSteps())
                    main.log(funcCode.GetMotorSteps+"-"+rev.getIndex(),rev.getBstatus())
                })
            }
            slitPosSet(){
                let idx = parseInt($("#advSlitType option:selected").attr('slitType'))
                let pos = parseInt($("#advSlitPos").val())
                websocket.send(funcCode.SetMotorSteps,{index:idx,um:pos})
                main.getCallback(funcCode.SetMotorSteps+"-"+idx,rev=>main.log(funcCode.SetMotorSteps+"-"+rev.getIndex(),rev.getBstatus()))

            }

            //更新狭缝类型
            updateSlitType(){
                $('#advSlitType').empty()
                device.spec.slit.forEach((cur,idx)=>{
                    let strS = ['侧入狭缝','侧出狭缝','直出狭缝','直入狭缝'],typeArr=[4,5,6,7]
                    if (cur.setup) {
                        $('#advSlitType').append('<option slitType='+typeArr[idx]+' idx='+idx+'>' + strS[idx])
                    }
                })
                this.slitSwitch()
            }
        }()
    }
    //光栅参数
    gratingParameter(){
        return new class{

            init(){
                this.turretRead()
            }
            //塔台
            turretRead(){
                websocket.send(funcCode.GetTurret,{})
                main.setCallbacks(funcCode.GetTurret,rev=>$("#advTurret").val(rev.getIval()))
            }
            turretSet(){
                let turret = parseInt($("#advTurret").val())
                websocket.send(funcCode.SetTurret,{index:turret})
            }
            //初始波长
            initWaveRead(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    websocket.send(funcCode.GetInitWave,{grating:i})
                    main.setCallbacks(funcCode.GetInitWave+i,rev=>{$("#initWaveG"+i).val(rev.getVal())})
                }

            }
            initWaveSet(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    let wave = parseFloat($("#initWaveG"+i).val())
                    websocket.send(funcCode.SetInitWave,{grating:i,wave:wave})
                }
            }
            //刻线和闪耀波长
            grooveAndBlazeRead(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    websocket.send(funcCode.GetGratingInfo,{grating:i})
                    main.setCallbacks(funcCode.GetGratingInfo+i,rev=>{
                        let grating = rev.getGrating(),blaze=rev.getBlaze(),groove=rev.getGroove()
                        $('#grooveG'+grating).val(groove)
                        $('#blazeG'+grating).val(blaze)
                    })
                }

            }
            grooveAndBlazeSet() {
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    let groove = parseFloat($("#grooveG"+i).val())
                    let blaze = parseFloat($("#blazeG"+i).val())
                    websocket.send(funcCode.SetGratingInfo,{grating:i,groove:groove,blaze:blaze},false)
                }
            }
            //零点位置
            zeroPosRead(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    websocket.send(funcCode.GetZeroPos,{grating:i,mirror:0})
                    main.setCallbacks(funcCode.GetZeroPos+i,rev=>{
                        let grating = rev.getGrating(),zeroPos = rev.getStep()
                        $('#zeroPosG'+grating).val(zeroPos)
                    })
                }
            }
            zeroPosSet(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    let zeroPos = parseFloat($("#zeroPosG"+i).val())
                    websocket.send(funcCode.SetZeroPos,{grating:i,mirror:0,step:zeroPos},false)
                }
            }
            //校正系数
            correctFactorRead(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    websocket.send(funcCode.GetAdjustment,{grating:i})
                    main.setCallbacks(funcCode.GetAdjustment+i,rev=>{
                        let grating = rev.getGrating(), adjust= rev.getVal()
                        $('#CorrectCoffeG'+grating).val(adjust)
                    })
                }
            }
            correctFactorSet(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    let coffe = parseFloat($("#CorrectCoffeG"+i).val())
                    websocket.send(funcCode.SetAdjustment,{grating:i,val:coffe},false)
                }
            }
            //最大扫描范围
            maxScanRangeRead(){
                for (let i = 1; i <= device.spec.gratings.length; i++) {
                    websocket.send(funcCode.GetGratingMaxWave,{grating:i})
                    main.setCallbacks(funcCode.GetGratingMaxWave+i,rev=>{
                        let grating = rev.getGrating(),maxWave = rev.getVal()
                        $('#zeroPosG'+grating).val(maxWave)
                    })
                }
            }
        }()
    }
    //校正系数
    correctionFactor(){
        return new class{
            init(){
                $('#coeffGrating input[grating='+device.spec.grating+']').prop('checked',true)
                $("#currentWave").val(fConfig.centerwave)
                this.currentGratingRead()
                this.correctCoeffRead()
            }
            //读取当前光栅
            currentGratingRead(){
                websocket.send(funcCode.GetGrating,{})
                main.setCallbacks(funcCode.GetGrating,rev=> {
                    $('#coeffGrating input[grating=' + rev.getIval() + ']').prop('checked', true)
                    this.currentWaveRead()
                })
            }
            //读取当前波长
            currentWaveRead(){
                let grating= parseInt($("#coeffGrating input[name='fcGrating']:checked").attr('grating'))
                websocket.send(funcCode.GetCurWave,{grating:grating})
                main.setCallbacks(funcCode.GetCurWave,rev=>$("#currentWave").val(rev.getFval()))
            }
            /*计算校正系数*/
            calcCorrectCoeff(){
                let grating = parseInt($("#coeffGrating input[name='fcGrating']:checked").attr('grating'))
                let currentWave=parseFloat($("#currentWave").val())
                let standardWave = parseFloat($("#standardWave").val())
                websocket.send(funcCode.Adjusting,{grating:grating,wave_set:standardWave,wave_real:currentWave})
                main.setCallbacks(funcCode.Adjusting,rev=>$("#adjustResult").val(rev.getFval()))
            }
            /*校正系数*/
            correctCoeffRead(){
                let grating = parseInt($('#coeffGrating input[name="fcGrating"]:checked').attr("grating"))
                websocket.send(funcCode.GetAdjustment,{grating:grating})
                main.setCallbacks(funcCode.GetAdjustment+grating,rev=>{
                    let adjust= rev.getVal()
                    $('#correctCoeff').val(adjust)
                })
            }
            correctCoeffSet(){
                let grating = parseInt($('#coeffGrating input[name="fcGrating"]:checked').attr("grating"))
                let coffe = parseFloat($("#correctCoeff").val())
                websocket.send(funcCode.SetAdjustment,{grating:grating,val:coffe},false)
            }
            /*数据交换*/
            cmToNm(){
                let laserWave =0.0,grating = parseInt($('#coeffGrating input[name="fcGrating"]:checked').attr("grating"))
                fConfig.excwaveselect.forEach((cur)=>{
                    if(cur.name === fConfig.excwave){
                        laserWave=cur["grating"+grating];
                    }
                })
                let cm= parseFloat($("#coeffCM").val())
                websocket.send(funcCode.CmToNmParams,{laserWave:laserWave,array:[cm]})
                main.setCallbacks(funcCode.CmToNmParams,rev=>{$("#coeffNM").val(rev.getPdList()[0])})
            }
            nmToCm(){
                let laserWave =0.0,grating = parseInt($('#coeffGrating input[name="fcGrating"]:checked').attr("grating")),
                    nm=parseFloat($("#coeffNM").val())
                fConfig.excwaveselect.forEach((cur)=>{
                    if(cur.name === fConfig.excwave){
                        laserWave=cur["grating"+grating];
                    }
                })
                websocket.send(funcCode.NmToCmParams,{laserWave:laserWave,array:[nm]})
                main.setCallbacks(funcCode.NmToCmParams,rev=>{$("#coeffCM").val(rev.getPdList()[0])})
            }
            nmToStep(){
                let nm =parseFloat($("#coeffNM1").val())
                websocket.send(funcCode.nmToSteps,{input:nm})
                main.setCallbacks(funcCode.nmToSteps,rev=>$("#coeffStep").val(rev.getFval()))
            }
            eVToNm(){
                let ev =parseFloat($("#coeffEV").val())
                websocket.send(funcCode.eVToNm,{input:ev})
                main.setCallbacks(funcCode.eVToNm,rev=>$("#coeffNM2").val(rev.getFval()))
            }
            nmToEV(){
                let nm =parseFloat($("#coeffNM2").val())
                websocket.send(funcCode.nmToEv,{input:nm})
                main.setCallbacks(funcCode.nmToEv,rev=>$("#coeffEV").val(rev.getFval()))
            }
        }()
    }
    //初始位置
    initialPosition(){
        return new class{
            init(){this.gratingInitPosRead()}
            /*光栅位置*/
            gratingInitPosRead(){
                websocket.send(funcCode.GetInitGrating,{})
                main.setCallbacks(funcCode.GetInitGrating,rev=>$("#gratingInitPos input[gratingPos="+rev.getIval()+"]").prop('checked',true))
            }
            gratingInitPosSet(){
                let grating = parseInt($("#gratingInitPos input[name='gratingPos']:checked").attr('gratingPos'))
                websocket.send(funcCode.SetInitGrating,{grating:grating})
            }
        }()
    }
    //光栅移动控制
    gratingMovementControl(){
        return new class{
            init(){
                this.currentGratingGet()
                this.gratingSpeedRead()
                this.gratingTotalStepsRead()
            }
            //光栅归零
            gratingZero(){
                websocket.send(funcCode.SetGratingHome,{})
                main.setCallbacks(funcCode.SetGratingHome,rev=>main.log(funcCode.SetGratingHome,rev.getBstatus()))
            }
            //当前光栅读取
            currentGratingGet(){
                websocket.send(funcCode.GetGrating,{})
                main.setCallbacks(funcCode.GetGrating,rev=> {
                    $('#advGrating input[grating=' + rev.getIval() + ']').prop('checked', true)
                    this.currentWavelengthGet()
                })
            }
            //当前光栅设置
            currentGratingSet(){
                let grating = parseInt($("#advGrating input[name='grating']:checked").attr("grating"))
                websocket.send(funcCode.gs,{grating:grating,unit:fConfig.waveunit})
            }
            //当前波长
            currentWavelengthGet(){
                let grating= parseInt($("#advGrating input[name='grating']:checked").attr('grating'))
                websocket.send(funcCode.GetCurWave,{grating:grating})
                main.setCallbacks(funcCode.GetCurWave,rev=>$("#currentWavelength").val(rev.getFval()))
            }
            //波长相对移动
            waveRelativeMove(flag){
                let dom = $("#currentWavelength")
                let currentWave = parseFloat(dom.val())
                let wave = parseFloat($("#relativeWave").val())
                let wavelen = currentWave+flag*wave
                websocket.send(funcCode.cWS,{wavelen:wavelen,unit: fConfig.waveunit})
                main.setCallbacks(funcCode.cWS,rev=> {
                    dom.val(wavelen)
                    this.currentWavelengthGet()
                })
            }
            //波长绝对移动
            waveAbsoluteMove(){
                let wave = parseFloat($("#absoluteWave").val())
                websocket.send(funcCode.cWS,{wavelen:wave,unit:fConfig.waveunit})
                main.setCallbacks(funcCode.cWS,rev=>this.currentWavelengthGet())
            }
            //速度
            gratingSpeedRead(){
                let grating = parseInt($("#advGrating input[name='grating']:checked").attr('grating'))
                websocket.send(funcCode.GetMoveSpeed,{grating:grating})
                main.setCallbacks(funcCode.GetMoveSpeed,rev=>$("#gratingSpeed").val(rev.getIval()))
            }
            gratingSpeedSet(){
                let grating = parseInt($("#advGrating input[name='grating']:checked").attr('grating'))
                let speed = parseInt($('#gratingSpeed').val())
                websocket.send(funcCode.SetMoveSpeed,{grating:grating,speed:speed})
            }
            //总步数
            gratingTotalStepsRead(){
                websocket.send(funcCode.GetTotalSteps,{})
                main.setCallbacks(funcCode.GetTotalSteps,rev=>$("#gratingTotalSteps").val(rev.getIval()))
            }
            gratingTotalStepsSet(){
                let steps = parseInt($("#gratingTotalSteps").val())
                websocket.send(funcCode.SetTotalStep,{steps:steps})
            }

        }()
    }
    //更新外设可用状态
    updatePeripherals(){
        /*滤光片轮、摆镜、狭缝按钮是否可以点击*/
        $("#AdvFilterBtn").prop('disabled',!(device.spec.filter.setup))
        $("#AdvMirrorBtn").prop('disabled',((!device.spec.mirror[0].setup)&&(!device.spec.mirror[1].setup)))
        $("#AdvSlitBtn").prop('disabled',((!device.spec.slit[0].setup)&&(!device.spec.slit[1].setup)&&(!device.spec.slit[2].setup)&&(!device.spec.slit[3].setup)))
    }

}()