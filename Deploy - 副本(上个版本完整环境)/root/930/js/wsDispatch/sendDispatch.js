function sendDispatch(code, ser, data) {
    let msg = ''
    switch (code) {
        case funcCode.askSys: {
        }
            break;
        case funcCode.scSys: {
        }
            break;
        case funcCode.initSource: {
            msg = new proto.Inter930.LoadResoure();
            msg.setSystem(5)
        }
            break;
        case funcCode.unload: {
            msg = new proto.Inter930.UnloadResoure();
        }
            break;
        case funcCode.eWS: {
            msg = new proto.Inter930.SwitchWave();
            msg.setOldvalue(data.oldValue)
            msg.setNewvalue(data.newValue)
        }
            break;
        case funcCode.pS: {
            msg = new proto.Inter930.SetPower();
            msg.setExcwave(data.excWave)
            msg.setPowervalue(data.powerValue)
        }
            break;
        case funcCode.pSS: {
            msg = new proto.Inter930.SetPinhole();
            msg.setPinhole(data.pinhole)
        }
            break;
        case funcCode.gS: {
            msg = new proto.Inter930.SetGrating();
            msg.setGrating(data.grating)
            msg.setUnit(data.unit)
        }
            break;
        case funcCode.slitSet: {
            msg = new proto.Inter930.SetSlit();
            msg.setSlit(data.slit)
        }
            break;
        case funcCode.iTS: {
            msg = new proto.Inter930.SetExpTime();
            msg.setExptime(data.exp)
        }
            break;
        case funcCode.cWS: {
            msg = new proto.Inter930.SetCenterwave()
            msg.setGrating(data.grating)
            msg.setWavelen(data.cw)
            msg.setUnit(data.unit)
        }
            break;
        case funcCode.rI: {
            msg = new proto.Inter930.Rev_freshDev();
        }
            break;
        case funcCode.specC: {
            msg = new proto.Inter930.SpecConnectDev()
            msg.setDevsn(data.sn)
            msg.setWavelen(data.wavelen)
            msg.setUm(data.um)
        }
            break
        case funcCode.dcC:
        case funcCode.RTotC:
        case funcCode.dtC:
        case funcCode.laserC:
        case funcCode.cameraC: {
            msg = new proto.Inter930.ConnectDev();
            msg.setDevsn(data.sn)
        }
            break;
        case funcCode.specDisC:
        case funcCode.dcDisC:
        case funcCode.RTOtDisC:
        case funcCode.dtDisC:
        case funcCode.laserDisC:
        case funcCode.cameraDisC: {
            msg = new proto.Inter930.DisconnectDev();
        }
            break;
        case funcCode.setShutter: {
            msg = new proto.Inter930.Setshutter();
            msg.setShutternum(data.num)
            msg.setShutterflag(data.flag)
        }
            break;
        case funcCode.getShutter: {
            msg = new proto.Inter930.Getshutter()
            msg.setShutternum(data.num)
        }
            break;
        case funcCode.isMirror: {
            msg = new proto.Inter930.Ismirror()
            msg.setMirrorindex(data.idx)
        }
            break;
        case funcCode.isSlit: {
            msg = new proto.Inter930.Isslit()
            msg.setSlitindex(data.idx)
        }
            break;
        case funcCode.setMirror: {
            msg = new proto.Inter930.Setmirror()
            msg.setMirrorindex(data.idx)
            msg.setMirrorflag(data.flag)
        }
            break;
        case funcCode.readCCDSize: {
            msg = new proto.Inter930.ReadccdSize()
        }
            break;
        case funcCode.readCCDExpTime: {
            msg = new proto.Inter930.ReadccdExptime()
        }
            break;
        case funcCode.setCamGain: {
            msg = new proto.Inter930.SetCamGain()
            msg.setIndex(data.gain)
        }
            break;
        case funcCode.DataAcqOneShot: {
            msg = new proto.Inter930.DataAcqOneShot()
            msg.setNpixsize(data.idx)
        }
            break;
        case funcCode.TerminateData: {
            msg = new proto.Inter930.TerminateData()
        }
            break;
        case funcCode.SetCCDImageMirror: {
            msg = new proto.Inter930.SetCCDImageMirror()
            msg.setBhmirror(data.bHMirror)
        }
            break;
        case funcCode.MCEMotorInit: {
            msg = new proto.Inter930.MCEMotorInit()
            msg.setDevsn(data.devSn)
            msg.setInitflag(data.flag)
        }
            break;
        case funcCode.MCEGetPosition: {
            msg = new proto.Inter930.MCEGetPosition()
            msg.setIaxis(data.isAxis)
        }
            break;
        case funcCode.MCEMotorBackZero: {
            msg = new proto.Inter930.MCEMotorBackZero()
            msg.setIaxis(data.isAxis)
        }
            break;
        case funcCode.MCEMotorMove: {
            msg = new proto.Inter930.MCEMotorMove()
            msg.setIaxis(data.isAxis)
            msg.setDvalue(data.dValue)
        }
            break;
        case funcCode.MCEMotorMoveTo: {
            msg = new proto.Inter930.MCEMotorMoveTo()
            msg.setIaxis(data.isAxis)
            msg.setDvalue(data.dValue)
        }
            break
        case funcCode.MCESetVelocity: {
            msg = new proto.Inter930.MCESetvelocity()
            msg.setDtemp(data.dTemp)
        }
            break;
        case funcCode.MCESetAccVelocity: {
            msg = new proto.Inter930.MCESetAccVelocity()
            msg.setDtemp(data.dTemp)
        }
            break;
        case funcCode.MCEMotorStop: {
            msg = new proto.Inter930.MCEMotorStop()
        }
            break;
        case funcCode.MCESetJoyStick : {
            msg = new proto.Inter930.MCESetJoyStick()
        }
            break;
        case funcCode.SetScanMode:{
            msg = new proto.Inter930.SetScanMode()
            msg.setMode(data.mode)
        }break
        case funcCode.SetBinRange:{
            msg = new proto.Inter930.SetBinRange()
            msg.setBinmin(data.binMin)
            msg.setBinmax(data.binMax)
        }break
        case funcCode.StartAcqCcdImg:{
            msg = new proto.Inter930.StartAcqCcdImg()
            msg.setExptime(data.expTime)
        }break
        case funcCode.StopAcqCcdImg:{
            msg = new proto.Inter930.StopAcqCcdImg()
        }break
        case funcCode.SpecGetParams:{
            msg = new proto.Inter930.SpecGetParams()
            msg.setGratingindex(data.grating)
        }break
        case funcCode.SpecSetParams:{
            msg = new proto.Inter930.SpecSetParams()
            msg.setFoclen(data.FOCLEN)
            msg.setAngdev(data.ANGDEV)
            msg.setFoctlt(data.FOCTLT)
            msg.setPoly1(data.POLY1)
            msg.setPoly2(data.POLY2)
            msg.setPoly3(data.POLY3)
            msg.setPoly4(data.POLY4)
            msg.setPoly5(data.POLY5)
            msg.setSinamplitude(data.SINAMPLITUDE)
            msg.setSinphase(data.SINPHASE)
            msg.setSinfrequency(data.SINFREQUENCY)
            msg.setGratstart(data.GRATSTART)
            msg.setGratoffset(data.GRATOFFSET)
            msg.setGratlines(data.GRATLINES)
            msg.setGratblaze(data.GRATBLAZE)
            msg.setDetectoroffset1(data.DETECTOROFFSET1)
            msg.setDetectoroffset2(data.DETECTOROFFSET2)
            msg.setGratingindex(data.grating)

        }break
        case funcCode.GetMirrorBadpoints:{
            msg = new proto.Inter930.GetMirrorBadpoints()
        }break
        case funcCode.DevConnectAll:{
            msg = new proto.Inter930.DevConnectAll()
            msg.setSpecdevsn(data.specDevSN)
            msg.setCcddevsn(data.ccdDevSN)
            msg.setLaserdevsn(data.laserDevSN)
            msg.setMotordevsn(data.motorDevSN)
            msg.setTangodevsn(data.tangoDevSN)
            msg.setTangoinitflag(data.tangoFlag)
            msg.setCameradevsn(data.cameraDevSN)
        }break
        case funcCode.DevDisconnectAll:{
            msg = new proto.Inter930.DevDisconnectAll()
            msg.setDiscflagsList(data.discFlags)
        }break
        case funcCode.GetShowModeData:{
            msg = new proto.Inter930.GetShowModeData()
            msg.setNmode(data.nMode)
            msg.setDwave0(data.dWave0)
            msg.setDwave1(data.dWave1)
            msg.setFsize(data.fSize)
        }break
        case funcCode.CcdGetParam:{
            msg = new proto.Inter930.CcdGetParam()
        }break
        case funcCode.CcdSetParam:{
            msg = new proto.Inter930.CcdSetParam()
            msg.setNmode(data.mode)
            msg.setIndex(data.index)
            msg.setRate(data.rate)
        }break
        case funcCode.MathPeakDetect:{
            msg = new proto.Inter930.MathPeakDetect()
            msg.setPeakflag(data.peakFlag)
            msg.setPeakfrom(data.peakFrom)
            msg.setPeakto(data.peakTo)
        }break
        case funcCode.CcdCorrection:{
            msg = new proto.Inter930.CcdCorrection()
            msg.setFilesList(data.files)
        }break
        case funcCode.SpecGetVersion:{
            msg = new proto.Inter930.SpecGetVersion()
        }break
        case funcCode.GetMaxWavelen:{
            msg = new proto.Inter930.GetMaxWavelen()
        }break
        case funcCode.SaveAcqImgData:{
            msg = new proto.Inter930.SaveAcqImgData()
            msg.setFilepath(data.filePath)
        }break
        case funcCode.GetCamGain:{
            msg = new proto.Inter930.GetCamGain()
        }break
        case funcCode.ProCcdBadPoints:{
            msg = new proto.Inter930.ProCcdBadPoints()
            msg.setBadpointsList(data.badPoints)
            msg.setBhmirror(data.dir)
        }break
        case funcCode.MCEOpenWhiteLightImage: {
            msg = new proto.Inter930.MCEOpenWhiteLightImage()
            msg.setMode(data.mode)
        }
            break
        case funcCode.MCECloseWhiteLightImage: {
            msg = new proto.Inter930.MCECloseWhiteLightImage()
            msg.setMode(data.mode)
            msg.setPowervalue(data.power)
        }
            break
        case funcCode.MCECameraSetGamama: {
            msg = new proto.Inter930.MCECameraSetGamama()
            msg.setNgamama(data.gama)
        }
            break
        case funcCode.MCECameraSetRatio: {
            msg = new proto.Inter930.MCECameraSetRatio()
            msg.setNcontrast(data.contrast)
        }
            break
        case funcCode.MCECameraSetEnhanceColor: {
            msg = new proto.Inter930.MCECameraSetEnhanceColor()
            msg.setBenhancement(data.bEnhancement)
        }
            break
        case funcCode.MCECameraSetHoriaotalMirror: {
            msg = new proto.Inter930.MCECameraSetHoriaotalMirror()
            msg.setNpos(data.pos)
            msg.setBmirror(data.bMirror)
        }
            break
        case funcCode.MCECameraSetSaturation: {
            msg = new proto.Inter930.MCECameraSetSaturation()
            msg.setNsaturation(data.nSaturation)
        }
            break
        case funcCode.MCECameraSetAeState: {
            msg = new proto.Inter930.MCECameraSetAeState()
            msg.setBaestate(data.bAeState)
        }
            break
        case funcCode.MCECameraSetAnalogGain: {
            msg = new proto.Inter930.MCECameraSetAnalogGain()
            msg.setNanaloggain(data.nAnalogGain)
        }
            break
        case funcCode.MCECameraSetGain: {
            msg = new proto.Inter930.MCECameraSetGain()
            msg.setNr(data.nR)
            msg.setNg(data.nG)
            msg.setNb(data.nB)
        }
            break
        case funcCode.MCECameraSetAWBState: {
            msg = new proto.Inter930.MCECameraSetAWBState()
            msg.setBawbstate(data.bAWBState)
        }
            break
        case funcCode.MCECameraSetTime: {
            msg = new proto.Inter930.MCECameraSetTime()
            msg.setNtime(data.nTime)
        }break
        case funcCode.MCECameraGetParam:{
            msg = new proto.Inter930.MCECameraGetParam()
        }break
        case funcCode.MCECameraSetParam:{
            msg = new proto.Inter930.MCECameraSetParam()
        }break
        case funcCode.SaveTestScheme: {
            msg = new proto.Inter930.SaveTestScheme()
            msg.setFunnm(data.funnm)
            msg.setSchemename(data.name)
            msg.setExcwave(data.excWave)
            msg.setPowervalue(data.power)
            msg.setPinholenm(data.pinhole)
            msg.setGrating(data.grating)
            msg.setSlit(data.slit)
            msg.setExptime(data.expTime)
            msg.setCenterwave(data.centerWave)
            msg.setWaveunit(data.waveUnit)
            msg.setIntervalflag(data.interval)
            msg.setIntervaltime(data.intervalTime)
            msg.setIntervalnum(data.times)
            msg.setSpectrumfrom(data.from)
            msg.setSpectrumto(data.to)
            msg.setTotalnum(data.acc)
        }
            break;
        case funcCode.GetTestScheme: {
            msg = new proto.Inter930.GetTestScheme()
            msg.setFunnm(data.funnm);
            msg.setSchemename(data.name)
        }
            break
        case funcCode.EnableDevices: {
            msg = new proto.Inter930.EnableDevices()
            msg.setDevinexbufList(data.devInexBuf)
        }
            break
        case funcCode.DeleteTestScheme: {
            msg = new proto.Inter930.DeleteTestScheme()
            msg.setFunnm(data.funnm)
            msg.setSchemename(data.schemeName)
        }
            break;
        case funcCode.SetLensParams: {
            msg = new proto.Inter930.SetLensParams()
            msg.setName(data.name)
            msg.setScale(data.scale)
            msg.setSize(data.size)
        }
            break
        case funcCode.DeleteLensParams: {
            msg = new proto.Inter930.DeleteLensParams()
            msg.setName(data.name)
        }
            break
        case funcCode.GetDrivers:{
            msg = new proto.Inter930.GetDrivers()
        }break
        case funcCode.GetDirsFiles:{
            msg = new proto.Inter930.GetDirsFiles()
            msg.setPath(data.path)
            msg.setSuffixList(data.suffix)
        }break
        case funcCode.MakeDir:{
            msg = new proto.Inter930.MakeDir()
            msg.setPath(data.path)
        }break
        case funcCode.DevAutoConnect:{
            msg = new proto.Inter930.DevAutoConnect()
            msg.setFlagsList(data.flags)
        }break
        case funcCode.UseTestScheme:{
            msg = new proto.Inter930.UseTestScheme()
            msg.setFunnm(data.funNm)
            msg.setExcwave(data.excWave)
            msg.setPowervalue(data.powerValue)
            msg.setPinholenm(data.pinhole)
            msg.setGrating(data.grating)
            msg.setSlit(data.slit)
            msg.setExptime(data.expTime)
            msg.setCenterwave(data.centerWave)
            msg.setWaveunit(data.waveUnit)
            msg.setIntervalflag(data.intervalFlag)
            msg.setIntervaltime(data.intervalTime)
            msg.setIntervalnum(data.intervalNum)
            msg.setSpectrumfrom(data.spectrumFrom)
            msg.setSpectrumto(data.spectrumTo)
            msg.setTotalnum(data.totalNum)
        }break
        case funcCode.TestModeChange: {
            msg = new proto.Inter930.TestModeChange()
            msg.setFunnm(data.funNm)
        }
            break;
        case funcCode.commandRunWD: {
            msg = new proto.Inter930.commandRunWD()
            msg.setExptime(data.exp)
            msg.setTimes(data.acc)
            msg.setFlag(data.interval)
            msg.setIntervaltime(data.intervalTime)
            msg.setIntervalnm(data.num)
            msg.setExcwave(data.excWave)
            msg.setPowervalue(data.power)
            msg.setWavelen(data.cenWave)
            msg.setUnit(data.unit)
            msg.setLaserwavelength(data.laserWaveLength)
            msg.setGrating(data.grating)
        }
            break;
        case funcCode.commandStopWD: {
            msg = new proto.Inter930.commandStopWD()
        }
            break;
        case funcCode.commandRunSpectrum: {
            msg = new proto.Inter930.commandRunSpectrum()
            msg.setExcwave(data.excWave)
            msg.setPowervalue(data.power)
            msg.setExptime(data.expTime)
            msg.setTotalnum(data.acc)
            msg.setSpectrumfrom(data.from)
            msg.setSpectrumto(data.to)
            msg.setUnit(data.unit)
            msg.setClearbg(data.clearBg)
            msg.setGrating(data.grating)
            msg.setLaserwavelength(data.laserWaveLength)
        }
            break
        case funcCode.commandStopSpectrum: {
            msg = new proto.Inter930.commandStopSpectrum()
        }break
        case funcCode.FitParams:{
            msg = new proto.Inter930.FitParams()
            msg.setNum(data.value)
            msg.setSize(data.size)
            msg.setArrayList(data.arr)
        }break
        case funcCode.SmoothParams:{
            msg = new proto.Inter930.SmoothParams()
            msg.setFunnum(data.funNm)
            msg.setNum(data.value)
            msg.setSize(data.size)
            msg.setArrayList(data.arr)
        }break
        case funcCode.NormalizationMinParams:{
            msg = new proto.Inter930.NormalizationMinParams()
            msg.setSize(data.size)
            msg.setArrayList(data.arr)
        }break
        case funcCode.NormalizationParams:{
            msg = new proto.Inter930.NormalizationParams()
            msg.setSize(data.size)
            msg.setArrayList(data.arr)
        }break
        case funcCode.PeakDetectionParams:{
            msg = new proto.Inter930.PeakDetectionParams()
            msg.setAmpthreshold(data.peakI)
            msg.setPeakwidth(data.peakW)
            msg.setSlopethreshold(data.dB)
            msg.setPeakgroup(data.pof)
            msg.setSmoothtype(data.smoothT)
            msg.setSmoothwidth(data.smoothW)
            msg.setXsize(data.xSize)
            msg.setXarrayList(data.xArr)
            msg.setYsize(data.ySize)
            msg.setYarrayList(data.yArr)
        }break
        case funcCode.AreaParams:{
            msg = new proto.Inter930.AreaParams()
            msg.setSize(data.size)
            msg.setArrayList(data.data)
        }break
        case funcCode.FWHMParams:{
            msg = new proto.Inter930.FWHMParams()
            msg.setSize(data.size)
            msg.setArrayList(data.data)
        }break
        case funcCode.NmToCmParams:{
            msg = new  proto.Inter930.NmToCmParams()
            msg.setLaserwave(data.laserWave)
            msg.setArrayList(data.array)
        }break
        case funcCode.CmToNmParams:{
            msg = new  proto.Inter930.CmToNmParams()
            msg.setLaserwave(data.laserWave)
            msg.setArrayList(data.array)
        }break
        case funcCode.checkFile:{
            msg = new proto.Inter930.AuditFileParams()
        }break
        case funcCode.AddLineDataParams:{
            msg = new proto.Inter930.AddLineDataParams()
            msg.setLinename(data.lineName)
            msg.setStrscanmode(data.strScanMode)
            msg.setStrwave(data.strWave)
            msg.setPowervalue(data.powervalue)
            msg.setPinhole(data.pinhole)
            msg.setGrating(data.grating)
            msg.setSlit(data.slit)
            msg.setExptime(data.ExpTime)
            msg.setUnit(data.unit)
            msg.setStrcenterwave(data.strCenterWave)
            msg.setStrstartwave(data.strStartWave)
            msg.setStrendwave(data.strEndWave)
            msg.setTotalnum(data.totalnum)
            msg.setStrinterflg(data.strInterFlg)
			msg.setStrintervaltime(data.strIntervaltime)
			msg.setIntervalnum(data.intervalnum)
            msg.setPdxList(data.pdX)
            msg.setPdyList(data.pdY)
            msg.setHavetitle(data.haveTitle)
            msg.setDatafrom(data.dataFrom)
			msg.setLaserwavelength(data.laserWaveLength)
			msg.setNfuncnum(data.nFuncNum)
			msg.setPolarchoose(data.polarChoose)
			msg.setPolardege(data.polarDege)
			msg.setPolarstart(data.polarStart)
			msg.setPolarend(data.polarEnd)
			msg.setPolarstep(data.polarStep)
        }break
        case funcCode.UpdateLineNameParams:{
            msg = new proto.Inter930.UpdateLineNameParams()
            msg.setOldlinename(data.oldLineName)
            msg.setNewlinename(data.newLienName)
        }break
        case funcCode.DeleteLineDataParams:{
            msg = new proto.Inter930.DeleteLineDataParams()
            msg.setLinenameList(data.lineName)
        }break
        case funcCode.RestoreLineDataParams:{
            msg = new proto.Inter930.RestoreLineDataParams()
            msg.setLinenameList(data.lineName)
            msg.setUnit(data.unit)
        }break
        case funcCode.GetLineDataCMParams:{
            msg = new proto.Inter930.GetLineDataCMParams()
            msg.setLinenameList(data.lineName)
            msg.setLaserwave(data.laserWave)
            msg.setStrgrating(data.strGrating)
            msg.setLaserwavelength(data.laserWaveLength)
        }break
        case funcCode.GetLineDataNmParams:{
            msg = new proto.Inter930.GetLineDataNmParams()
            msg.setLinenameList(data.lineName)
        }break
        case funcCode.GetDeleteLineDatasParams:{
            msg = new proto.Inter930.GetDeleteLineDatasParams()
        }break
        case funcCode.GetChooseLineDatasParams:{
            msg = new proto.Inter930.GetChooseLineDatasParams()
        }break
        case funcCode.ClearDeleteLineDatasParams:{
            msg = new proto.Inter930.ClearDeleteLineDatasParams()
            msg.setType(data.type)
        }break
        case funcCode.updateYAxisParams:{
            msg = new proto.Inter930.updateYAxisParams()
            msg.setLinename(data.lineName)
            msg.setYaxisdataList(data.yAxisData)
        }break
        case funcCode.updateXYAxisParams:{
            msg = new proto.Inter930.updateXYAxisParams()
            msg.setLinename(data.lineName)
            msg.setXaxisdataList(data.xAxisData)
            msg.setYaxisdataList(data.yAxisData)
            msg.setUnit(data.unit)
        }break
        case funcCode.updatelaserWaveLengthParams:{
            msg = new proto.Inter930.updateLaserWaveLengthParams()
            msg.setExcwave(data.excWave)
            msg.setGratingnum(data.gratingNum)
            msg.setLaserwave(data.laserWave)
        }break
        case funcCode.saveImageFileByPath:{
            msg = new proto.Inter930.saveImageFileByPath()
            msg.setFilepathbyname(data.filePathByName)
            msg.setImagedata(data.imageData)
        }break
        case funcCode.OpenLineDataPram:{
            msg = new proto.Inter930.OpenLineDataPram()
            msg.setFilepath(data.path)
        }break
        case funcCode.SaveLineDataPram:{
            msg = new proto.Inter930.SaveLineDataPram()
            msg.setFilepath(data.path)
            msg.setFilecontent(data.content)
        }break
        case funcCode.getSavefilePathPram:{
            msg = new proto.Inter930.getSaveFilePathPram()
        }break
        case funcCode.setSaveFilePathPram:{
            msg = new proto.Inter930.setSaveFilePathPram()
            msg.setFilepath(data.path)
        }break
        case funcCode.SaveCm2NmStatus:{
            msg = new proto.Inter930.SaveCm2NmStatus()
            msg.setFlag(data.flag)
        }break
        case funcCode.getLineTitleByNames:
        case funcCode.OpenLineDatasPram:{
            msg = new proto.Inter930.OpenLineDatasPram()
            msg.setFilepathList(data.path)
        }break
        case funcCode.getLineTitleByName:{
            msg= new proto.Inter930.getLineTitleByName()
            msg.setLinename(data.lineName)
        }break
        case funcCode.openSyspMapping:
        case funcCode.openHdrRawMapping:
        case funcCode.saveSyspMapping:
        case funcCode.saveHdrRawMapping:{
            msg = new proto.Inter930.ActionMapFile()
            msg.setFilepath(data.path)
        }break
        case funcCode.commandRunAutoFocus:{
            msg = new proto.Inter930.commandRunAutoFocus()
            msg.setExptime(data.expTime)
            msg.setAccnum(data.accNum)
            msg.setStart(data.start)
            msg.setEnd(data.end)
            msg.setPeak(data.peak)
            msg.setStep(data.step)
            msg.setTangoMax(data.tango_max)
            msg.setTangoMin(data.tango_min)
        }break
        case funcCode.commandRunMap: {
            msg = new proto.Inter930.commandRunMap()
            msg.setWavelen(data.wavelen)
            msg.setUnit(data.unit)
            msg.setExptime(data.ExpTime)
            msg.setSlit(data.slit)
            msg.setTimes(data.times)
            msg.setStrmode(data.strmode)
            msg.setStrmode(data.strmode)
            msg.setDwave0(data.dWave0)
            msg.setDwave1(data.dWave1)
            msg.setXcenterpos(data.XCenterPos)
            msg.setYcenterpos(data.YCenterPos)
            msg.setZcenterpos(data.zCenterPos)
            msg.setXlength(data.XLength)
            msg.setYlength(data.YLength)
            msg.setZlength(data.zLength)
            msg.setXstep(data.xStep)
            msg.setYstep(data.yStep)
            msg.setZstep(data.zStep)
//          msg.setStep(data.step)
            msg.setPointnumx(data.PointNumX)
            msg.setPointnumy(data.PointNumY)
            msg.setPointnumz(data.PointNumZ)
            msg.setSetpmode(data.stepMode)
            console.log(data)
        }
            break
        case funcCode.commandStopMap: {
            msg = new proto.Inter930.commandStopMap()
        }
            break
        case funcCode.dbMappigGetXY: {
            msg = new proto.Inter930.dbMappigGetXY()
            msg.setXPos(data.x_pos)
            msg.setYPos(data.y_pos)
        }
            break
        case funcCode.addDataToDB:{
            msg = new proto.Inter930.addDataToDB()
            msg.setZhname(data.zhName)
            msg.setEnname(data.enName)
            msg.setStrsampleCode(data.strSample_Code)
            msg.setStrscanmode(data.strScanMode)
            msg.setStrwave(data.strwave)
            msg.setPowervalue(data.powerValue)
            msg.setGrating(data.grating)
            msg.setSlit(data.slit)
            msg.setExptime(data.expTime)
            msg.setUnit(data.unit)
            msg.setStrcenterwave(data.strCenterWave)
            msg.setStrstartwave(data.strStartWave)
            msg.setStrendwave(data.strEndWave)
            msg.setTotalnum(data.totalnum)
            msg.setStrinterflg(data.strInterFlg)
            msg.setStrintervaltime(data.intervaltime)
            msg.setIntervalnum(data.intervalnum)
            msg.setPdxList(data.pdX)
            msg.setPdyList(data.pdY)
        }break
        case funcCode.SelectToDB:{
            msg = new proto.Inter930.SelectToDB()
            msg.setDbmode(data.dbMode)
            msg.setStritemnm(data.stritemNm)
            msg.setPageindex(data.pageIndex)
        }break
        case funcCode.SelectToDBVague:{
            msg = new proto.Inter930.SelectToDBVague()
            msg.setDbmode(data.dbMode)
            msg.setStritemnm(data.stritemNm)
            msg.setPageindex(data.pageIndex)
            msg.setSearchstring(data.searchString)
            msg.setSampletypesList(data.sampleTypes)
        }break
        case funcCode.getSampleTypess:{
            msg = new proto.Inter930.getSampleTypess()
        }break
        case funcCode.Cal_DataToDB:{
            msg = new proto.Inter930.Cal_DataToDB()
            msg.setDbclasstype(data.dbClassType)
            msg.setCaltype(data.calType)
            msg.setPdxList(data.pdX)
            msg.setPdyList(data.pdY)
        }break
        case funcCode.DBView_Show:{
            msg = new proto.Inter930.DBView_Show()
            msg.setDbmode(data.dbMode)
            msg.setId(data.id)
        }break
        case funcCode.ErasingRay:{
            msg = new proto.Inter930.ErasingRay()
            msg.setIndex(data.index)
            msg.setYpdList(data.ypd)
        }break
        /*谱仪高级设置*/
        case funcCode.SetupSlit:{
            msg = new proto.Inter930.SetupSlit()
            msg.setIndex(data.index)
            msg.setSetup(data.setup)
        }break
        case funcCode.SetupMirror:{
            msg = new proto.Inter930.SetupMirror()
            msg.setIndex(data.index)
            msg.setSetup(data.setup)
        }break
        case funcCode.SetupShutter:{
            msg = new proto.Inter930.SetupShutter()
            msg.setIndex(data.index)
            msg.setSetup(data.setup)
        }break
        case funcCode.IsSetupFilter:{
            msg = new proto.Inter930.IsSetupFilter()
        }break
        case funcCode.SetupFilter:{
            msg = new proto.Inter930.SetupFilter()
            msg.setIndex(data.index)
            msg.setSetup(data.setup)
        }break

        case funcCode.GetMotorHomeDir:{
            msg = new proto.Inter930.GetMotorHomeDir()
            msg.setIndex(data.index)
        }break
        case funcCode.SetMotorHomeDir:{
            msg = new proto.Inter930.SetMotorHomeDir()
            msg.setIndex(data.index)
            msg.setDir(data.dir)
        }break
        case funcCode.GetMotorTotalSteps:{
            msg = new proto.Inter930.GetMotorTotalSteps()
            msg.setIndex(data.index)
        }break
        case funcCode.SetMotorTotalSteps:{
            msg = new proto.Inter930.SetMotorTotalSteps()
            msg.setIndex(data.index)
            msg.setTotal(data.total)
        }break
        case funcCode.GetMotorSpeed:{
            msg = new proto.Inter930.GetMotorSpeed()
            msg.setIndex(data.index)
        }break
        case funcCode.SetMotorSpeed:{
            msg = new proto.Inter930.SetMotorSpeed()
            msg.setIndex(data.index)
            msg.setSpeed(data.speed)
        }break
        case funcCode.GetMotorSteps:{
            msg = new proto.Inter930.GetMotorSteps()
            msg.setIndex(data.index)
        }break
        case funcCode.SetMotorSteps:{
            msg = new proto.Inter930.SetMotorSteps()
            msg.setIndex(data.index)
            msg.setSpeed(data.steps)
        }break
        case funcCode.GetSlitModel:{
            msg = new proto.Inter930.GetSlitModel()
            msg.setIndex(data.index)
        }break
        case funcCode.SetSlitModel:{
            msg = new proto.Inter930.SetSlitModel()
            msg.setIndex(data.index)
            msg.setModel(data.model)
        }break
        case funcCode.getSlitWidth:{
            msg = new proto.Inter930.Getslitwidth()
            msg.getSlitindex(data.index)
        }break
        case funcCode.GetSlitBandpass:{
            msg = new proto.Inter930.GetSlitBandpass()
            msg.setIndex(data.index)
        }break
        case funcCode.SetSlitBandpass:{
            msg = new proto.Inter930.SetSlitBandpass()
            msg.setIndex(data.index)
            msg.setNm(data.nm)
        }break
        case funcCode.GetFilter:{
            msg = new proto.Inter930.GetFilter()
            msg.setIndex(data.index)
        }break
        case funcCode.SetFilter:{
            msg = new proto.Inter930.SetFilter()
            msg.setIndex(data.index)
            msg.setWhich(data.which)
        }break
        case funcCode.GetFilterModel:{
            msg = new proto.Inter930.GetFilterModel()
        }break
        case funcCode.SetFilterModel:{
            msg = new proto.Inter930.SetFilterModel()
            msg.setModel(data.model)
        }break
        case funcCode.GetFilterLimit:{
            msg= new proto.Inter930.GetFilterLimit()
            msg.setGrating(data.grating)
            msg.setWhich(data.which)
        }break
        case funcCode.SetFilterLimit:{
            msg= new proto.Inter930.SetFilterLimit()
            msg.setGrating(data.grating)
            msg.setWhich(data.which)
            msg.setVal(data.val)
        }break
        case funcCode.SetSlitZeroPos:{
            msg = new proto.Inter930.SetSlitZeroPos()
            msg.setIndex(data.index)
            msg.setUm(data.um)
        }break
        case funcCode.GetSlitZeroPos:{
            msg = new proto.Inter930.GetSlitZeroPos()
            msg.setIndex(data.index)
        }break
        case funcCode.GetTurret:{
            msg = new proto.Inter930.GetTurret()
        }break
        case funcCode.SetTurret:{
            msg = new proto.Inter930.SetTurret()
            msg.setIndex(data.index)
        }break
        case funcCode.GetInitWave:{
            msg = new proto.Inter930.GetInitWave()
            msg.setGrarting(data.grating)
        }break
        case funcCode.SetInitWave:{
            msg = new proto.Inter930.SetInitWave()
            msg.setGrarting(data.grating)
            msg.setWave(data.wave)
        }break
        case funcCode.GetGratingInfo:{
            msg = new proto.Inter930.GetGratingInfo()
            msg.setGrating(data.grating)
        }break
        case funcCode.SetGratingInfo:{
            msg = new proto.Inter930.SetGratingInfo()
            msg.setGrating(data.grating)
            msg.setGroove(data.groove)
            msg.setBlaze(data.blaze)
        }break
        case funcCode.GetZeroPos:{
            msg = new proto.Inter930.GetZeroPos()
            msg.setGrating(data.grating)
            msg.setMirror(data.mirror)
        }break
        case funcCode.SetZeroPos:{
            msg = new proto.Inter930.SetZeroPos()
            msg.setGrating(data.grating)
            msg.setMirror(data.mirror)
            msg.setStep(data.step)
        }break
        case funcCode.GetAdjustment:{
            msg = new proto.Inter930.GetAdjustment()
            msg.setGrating(data.grating)
        }break
        case funcCode.SetAdjustment:{
            msg = new proto.Inter930.SetAdjustment()
            msg.setGrating(data.grating)
            msg.setVal(data.val)
        }break
        case funcCode.GetInitGrating:{
            msg = new proto.Inter930.GetInitGrating()
        }break
        case funcCode.SetInitGrating:{
            msg = new proto.Inter930.SetInitGrating()
            msg.setGrating(data.grating)
        }break
        case funcCode.GetMoveSpeed:{
            msg = new proto.Inter930.GetMoveSpeed()
            msg.setGrarting(data.grating)
        }break
        case funcCode.SetMoveSpeed:{
            msg = new proto.Inter930.SetMoveSpeed()
            msg.setGrarting(data.grating)
            msg.setSpeed(data.speed)
        }break
        case funcCode.GetTotalSteps:{
            msg = new proto.Inter930.GetTotalSteps()
        }break
        case funcCode.SetTotalStep:{
            msg = new proto.Inter930.SetTotalSteps()
            msg.setSteps(data.steps)
        }break
        case funcCode.GetGratingMaxWave:{
            msg = new proto.Inter930.GetGratingMaxWave()
            msg.setGrating(data.grating)
        }break
        case funcCode.Adjusting:{
            msg= new proto.Inter930.Adjusting()
            msg.setGrating(data.grating)
            msg.setWaveSet(data.wave_set)
            msg.setWaveReal(data.wave_real)
        }break
        case funcCode.nmToSteps:
        case funcCode.eVToNm:
        case funcCode.nmToEv:{
            msg= new proto.Inter930.WaveTrance()
            msg.setInput(data.input)
        }break
        case funcCode.GetGrating:{
            msg= new proto.Inter930.GetGrating()
        }break
        case funcCode.GetCurWave:{
            msg=new proto.Inter930.GetCurWave()
        }break
        case funcCode.SetGratingHome:{
            msg = new proto.Inter930.SetGratingHome()
        }break
        case funcCode.UpdateFileNames:{
            msg= new proto.Inter930.UpdateFileNames()
            msg.setLinenamesList(data.lineNames)
            msg.setPdxList(data.pdx)
        }break
        case funcCode.commandRunMapD: {
            msg = new proto.Inter930.commandRunMapD()
            msg.setWavelen(data.wavelen)
            msg.setUnit(data.unit)
            msg.setExptime(data.ExpTime)
            msg.setSlit(data.slit)
            msg.setTimes(data.times)
            msg.setStrmode(data.strmode)
            msg.setDwave0(data.dWave0)
            msg.setDwave1(data.dWave1)
            msg.setXcenterpos(data.XCenterPos)
            msg.setYcenterpos(data.YCenterPos)
            msg.setXlength(data.XLength)
            msg.setYlength(data.YLength)
            msg.setStep(data.step)
            msg.setPointnumx(data.PointNumX)
            msg.setPointnumy(data.PointNumY)
            msg.setSetpmode(data.stepMode)
            msg.setZcenterpos(data.zCenterPos)
            msg.setZlength(data.zLength)
            msg.setPointnumz(data.PointNumZ)
            msg.setSavefilepath(data.savePath3D)
            msg.setXstep(data.xStep)
            msg.setYstep(data.yStep)
            msg.setZstep(data.zStep) 
            console.log(msg);
        }
            break
        case funcCode.open3DMapping:{
            msg = new proto.Inter930.open3DMapping()
            msg.setMode(data.mode)
            msg.setDwave1(data.dWave1)
            msg.setDwave2(data.dWave2)
            msg.setFilepathname(data.filepath)
        }break
        case funcCode.showMode3DMapping:{
            msg = new proto.Inter930.showMode3DMapping()
            msg.setMode(data.mode)
            msg.setDwave1(data.dWave1)
            msg.setDwave2(data.dWave2)
        }break
        case funcCode.mapping3DXYZData:{
            msg = new proto.Inter930.mapping3DXYZData()
            msg.setX(data.x)
            msg.setY(data.y)
            msg.setZ(data.z)
        }break
        case funcCode.mapping3DCutPng:{
            msg = new proto.Inter930.mapping3DCutPng()
            msg.setXList(data.x)
            msg.setYList(data.y)
            msg.setZList(data.z)
            msg.setFilepath(data.filePath)
        }break
        case funcCode.save3DMapping:{
            msg = new proto.Inter930.save3DMapping()
            msg.setFilepath(data.filePath)
        }break
        case funcCode.exportAllCurves3D:{
            msg = new proto.Inter930.exportAllCurves3D()
            msg.setFilepath(data.filePath)
        }break
        case funcCode.exportAllCurves:{
            msg = new proto.Inter930.exportAllCurves()
            msg.setFilepath(data.filePath)
            msg.setX(data.x)
            msg.setY(data.y)
        }break
        case funcCode.exportAllCurvesPng:{
            msg = new proto.Inter930.exportAllCurvesPng()
            msg.setFilepath(data.filePath)
            msg.setXList(data.x)
            msg.setYList(data.y)
            msg.setZList(data.z)
        }break
        case funcCode.stopExportAllFile:{
            msg= new proto.Inter930.stopExportAllFile()
        }break
        case funcCode.getCurverSixPng:{
        	msg = new proto.Inter930.getCurvesSixPng();
        	msg.setXmin(data.xmin)
        	msg.setXmax(data.xmax)
        	msg.setYmin(data.ymin)
        	msg.setYmax(data.ymax)
        	msg.setZmin(data.zmin)
        	msg.setZmax(data.zmax)
        	msg.setNmode(data.nmode)
        	msg.setDwave1(data.dwave1)
        	msg.setDwave2(data.dwave2)
        	msg.setShowmode(data.showmode)
        }
        break;
        case funcCode.stimulateReadPos:{
        	msg = new proto.Inter930.stimulateReadPos();
        }break;
		case funcCode.stimulateZero:{
        	msg = new proto.Inter930.stimulateZero();
        }break;
		case funcCode.stimulateMoveTo:{
        	msg = new proto.Inter930.stimulateMoveTo();
        	msg.setDege(data.dege);
        }break;
		case funcCode.stimulateSettingLevel:{
        	msg = new proto.Inter930.stimulateSettingLevel();
        	msg.setDege(data.dege);
        }break;
		case funcCode.stimulateExit:{
        	msg = new proto.Inter930.stimulateExit();
        }break;
		case funcCode.launchReadPos:{
        	msg = new proto.Inter930.launchReadPos();
        }break;
		case funcCode.launchZero:{
        	msg = new proto.Inter930.launchZero();
        }break;
		case funcCode.launchMoveTo:{
        	msg = new proto.Inter930.launchMoveTo();
        	msg.setDege(data.dege);
        }break;
		case funcCode.launchSettingLevel:{
        	msg = new proto.Inter930.launchSettingLevel();
        	msg.setDege(data.dege);
        }break;
		case funcCode.launchExit:{
        	msg = new proto.Inter930.launchExit();
        }break;
		case funcCode.commandRunPolar:{
        	msg = new proto.Inter930.commandRunPolar();
        	msg.setExcwave(data.excwave)
        	msg.setPowervalue(data.powervalue)
        	msg.SetExpTime(data.exptime)
        	msg.setTimes(data.times)
        	msg.setWavelen(data.wavelen)
        	msg.setUnit(data.units)
        	msg.setLaserwavelength(data.laserWaveLength)
        	msg.setGrating(data.grating)
        	msg.setPolartype(data.polartype)
        	msg.setPolardeg(data.polardeg)
        	msg.setPolarstartdeg(data.polarstartdeg)
        	msg.setPolarenddeg(data.polarenddeg)
        	msg.setPolarstepdeg(data.polarstepdeg)
        }break;
		case funcCode.commandStopPolar:{
        	msg = new proto.Inter930.commandStopPolar();
        }break;
    }
    msg.setFuncode(code)
    msg.setSerialnm(ser);
    return msg.serializeBinary()
}