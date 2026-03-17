/**
 * @param Txt文件导入 纯数据
 * @param {String} str
 */
function loadTxtData(str) {
	let strArray = str.split("\n");
	console.log(strArray)
	let result = [];
	
	let nIndex = 0;
	
	for (let i = 0; i < strArray.length; i++) {
		let strItem = strArray[i];
		let pat = new RegExp(/-?\d+.?\d?[\t ,]-?\d+.?\d?/i);
		if (pat.test(strItem)) {
			var letAraay = strItem.split(/[\t ,]/);
			if (nIndex==0) {
				nIndex = i;
			}
			if (letAraay.length%2==1) {
				letAraay = letAraay.splice(0,letAraay.length-1);
			}
			if (result.length==0) {
				for (var a = 0; a < letAraay.length/2; a++) {
					let arrXY = {x:[],y:[]};
					result.push(arrXY);
				}
			}
			for (let j =0;j<letAraay.length/2;j++) {
				if (!isNaN(parseFloat(letAraay[j*2+0]))) {
					result[j].x[i-nIndex]=(parseFloat(letAraay[j*2+0]));
					result[j].y[i-nIndex]=(parseFloat(letAraay[j*2+1]));
				}
			}
			
		}
	}
	
	return result;
}
/**
 * 
 * @param {String} strInfo //获取曲线信息字符串；
 * strFileC.substring(
 * 		strFileC.indexOf("[Infor]"),
 * 		strFileC.indexOf("[data]"));
 * @return {Array{曲线信息}}
 */
function readTxtTitle(strInfo){
	strInfo = strInfo.replace("[Infor]","").replace("[Info]","");
	strInfo = strInfo
		.replace(/累计次数/g,"totalnum")
		.replace(/激光/g,"laserWaveLength")
		.replace(/激发波长/g,"strWave")
		.replace(/曲线名称/g,"name")
		.replace(/单位/g,"unit")
		.replace(/针孔尺寸/g,"pinhole")
		.replace(/中心波长/g,"strCenterWave")
		.replace(/狭缝/g,"slit")
		.replace(/功率/g,"powervalue")
		.replace(/积分时间/g,"ExpTime")
		.replace(/扫描方法/g,"funcnum")
		.replace(/是否间隔/g,"strInterFlg")
		.replace(/间隔时间/g,"strIntervaltime")
		.replace(/间隔次数/g,"strIntervalnum")
		.replace(/光栅/g,"grating")
		.replace(/间隔次数/g,"intervalnum")
		.replace(/起始波长/g,"strStartWave")
		.replace(/终止波长/g,"strEndWave")
		.replace(/序号/g,"prentedIndex")
		.replace(/颜色/g,"color")
		.replace(/选择状态/g,"selected")
		.replace(/偏振选择/g,"polarChose")
		.replace(/偏振角度/g,"polarDege")
		.replace(/起始角度/g,"polarStart")
		.replace(/终止角度/g,"polarEnd")
		.replace(/步长/g,"polarStep")
		.replace(/采集方式/g,"strScanMode");
	return JSON.parse(strInfo);
}

/**
 * 
 * @param {String} strInfo //获取曲线信息字符串；
 * strFileC.substring(
 * 		strFileC.indexOf("[Infor]"),
 * 		strFileC.indexOf("[data]"));
 * @return {Array{曲线信息}}
 */
function getZHTitle(strInfo){
	strInfo = strInfo
		.replace(/totalnum/g,"累计次数")
		.replace(/laserWaveLength/g,"激光")
		.replace(/strWave/g,"激发波长")
		.replace(/name/g,"曲线名称")
		.replace(/unit/g,"单位")
		.replace(/pinhole/g,"针孔尺寸")
		.replace(/strCenterWave/g,"中心波长")
		.replace(/slit/g,"狭缝")
		.replace(/powervalue/g,"功率")
		.replace(/ExpTime/g,"积分时间")
		.replace(/funcnum/g,"扫描方法")
		.replace(/strInterFlg/g,"是否间隔")
		.replace(/strIntervaltime/g,"间隔时间")
		.replace(/strIntervalnum/g,"间隔次数")
		.replace(/grating/g,"光栅")
		.replace(/prentedIndex/g,"序号")
		.replace(/color/g,"颜色")
		.replace(/intervalnum/g,"间隔次数")
		.replace(/strStartWave/g,"起始波长")
		.replace(/strEndWave/g,"终止波长")
		.replace(/selected/g,"选择状态")
		.replace(/strScanMode/g,"采集方式")
		.replace(/polarChose/g,"偏振选择")
		.replace(/polarDege/g,"偏振角度")
		.replace(/polarStart/g,"起始角度")
		.replace(/polarEnd/g,"终止角度")
		.replace(/polarStep/g,"步长");
	return strInfo;
}
/**
 * 
 * @param {String} strFileC 曲线保存文件内容（可以兼容中文，多条曲线，无信息曲线）
 * @param {Array} lines 多条曲线数据和信息
 */
function loadTxtOrData(strFileC){
	if (strFileC.indexOf("[Info]")>=0) {
		//有线的信息
		let infoKey = "[Info]";
		let dataKey = "[Data]";
		let lineObjs = readTxtTitle(strFileC.substring(strFileC.indexOf(infoKey),strFileC.indexOf(dataKey)));
		let strDataXy = strFileC.substr(strFileC.indexOf(dataKey)+dataKey.length,strFileC.length);
		let datasXys = loadTxtData(strDataXy.replace("[Data]",""));
		return {
			info:lineObjs,
			result:datasXys
		}
	} else{
		let datasXy = loadTxtData(strFileC.replace("[Data]",""));
		return {
			info:[],
			result:datasXy
		}
		
	}
}

/**
 * @param Txt文件导入  info&data
 * @param {String} str
 */
function loadTxt(str){
	let result = []
	let arrXY = {x:[],y:[]}
	let lines = str.split("\r\n")
	let flag = lines[0].slice(1,lines[0].length-1)
	if(flag!=="Info") return
	let info =JSON.parse(lines[1].slice(1,lines[1].length-1))
	let data = lines.slice(3,lines.length-1).toString()
	data.split(',').reduce(function (p,v) {
		arrXY.x.push(parseFloat(v.split(' ')[0]))
		arrXY.y.push(parseFloat(v.split(' ')[1]))
	});
	result.push(arrXY)
	return {
		info:info,
		result:result
	}
}
//自定义时间格式
Date.prototype.Format =  function(fmt) {
	let o = {
		'M+': this.getMonth() + 1, //月份
		'd+': this.getDate(), //日
		'H+': this.getHours(), //小时
		'm+': this.getMinutes(), //分
		's+': this.getSeconds(), //秒
		'q+': Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
	for (let k in o) if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
	return fmt;
};

//下载Base64图片
function downloadFile(fileName, content) {
	let aLink = document.createElement('a');
	let blob = this.base64ToBlob(content); //new Blob([content]);
	let evt = document.createEvent("HTMLEvents");
	evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
	aLink.download = fileName;
	aLink.href = URL.createObjectURL(blob);
	// aLink.dispatchEvent(evt);
	aLink.click()
}
//base64转blob
function base64ToBlob(code) {
	let parts = code.split(';base64,');
	let contentType = parts[0].split(':')[1];
	let raw = window.atob(parts[1]);
	let rawLength = raw.length;

	let uInt8Array = new Uint8Array(rawLength);

	for (let i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}
	return new Blob([uInt8Array]);
}
// 将Base64字符串转换为Uint8Array类型的数组
function base64ToArray(base64) {
	var binaryString = atob(base64);
	var len = binaryString.length;
	var bytes = new Uint8Array(len);

	for (var i = 0; i < len; ++i) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	return bytes;
}

//保存数据处理
function dataProcess(org) {
	let arr = [];
	for (let i = 0; i < org.length; i++) {
		let temp = '';
		temp = temp + org[i] + '\t';
		arr.push(temp);
	}
	return arr;
}
