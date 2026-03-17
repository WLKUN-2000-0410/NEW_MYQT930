function revJsonDispatch(code,data) {
    if (code === 4) return
    switch (code) {
        case funcCode.initSource:{
            if (typeof data[0] === 'number') {
                main.log(code,false)
                return;
            }
            console.log(data[0]);
            fConfig = data[0]
            console.log(fConfig.steadyUnit)
            if (fConfig.steadyUnit==undefined) {
            	fConfig.steadyUnit = fConfig.waveunit
	            fConfig.steadyCenter = parseFloat(fConfig.centerwave)
	            fConfig.spectrumUnit =  fConfig.waveunit
	            fConfig.waveFrom = parseFloat(fConfig.spectrumfrom)
	            fConfig.waveTo = parseFloat(fConfig.spectrumto)
            }

            main.checkFile()//检查文件
            //main.getDrivers()//获取系统驱动
            main.getCallback(code)
            main.log(code,true)
            main.busy(code,false)
        }break
    }
}