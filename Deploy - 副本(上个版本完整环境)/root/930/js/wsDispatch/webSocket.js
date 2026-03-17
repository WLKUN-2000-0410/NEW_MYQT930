if (!('WebSocket' in window)) alert('浏览器不支持');
const queue =[]
websocket = new class {
    socket = undefined;
    #SerialNm = 1

    open () {
        this.socket = new ReconnectingWebSocket('ws://' + '127.0.0.1' + ':' + '8082');
        //this.socket = new WebSocket('ws://' + '127.0.0.1' + ':' + '8082');
        //this.socket = new ReconnectingWebSocket('ws://' + '192.168.2.155' + ':' + '8081');
        this.socket.timeoutInterval = 100;
        this.socket.maxReconnectAttempts = 3
        this.socket.debug = true;
        this.socket.onopen = function () {
            main.busy(funcCode.initSource,true)
            setTimeout(function () {
                websocket.send(funcCode.initSource,{"system":5},false)
                main.setCallbacks(funcCode.initSource,[steady.initTestPlan,wavelength.initTestPlan,main.initScanPanel,main.showLight])
            },2000)
            // main.busy(false)
            // websocket.send(funcCode.initSource,{"system":5},false)
            // main.setCallbacks(funcCode.initSource,[steady.initTestPlan,wavelength.initTestPlan,main.initScanPanel,main.showLight])
        };
        this.socket.onclose = function () {
            main.addMsg($.i18n.prop("websocket-close"),false)
           // main.busy(true)
        };
        this.socket.onerror = function () {};
        this.socket.onmessage = function (event) {
            if (event.data instanceof Blob) {
                let blob = event.data;
                let reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = function () {
                    let buf = new Uint8Array(this.result);
                    let view = new DataView(buf.buffer);
                    let code =  view.getInt32(1, true);
                    if (code === 4) return
                    receiveDispatch(code,buf)
                    if(code === funcCode.closeMask){
                        queue.length = 0;
                        main.busy(code,queue.length > 0)
                    }
                };
            } else {
                let pkg = JSON.parse(event.data)
                revJsonDispatch(pkg.code,pkg.data)
            }
               // queue.shift();
               // main.busy(queue.length > 0);
        };
    };

    close () {
        this.send(funcCode.unload,{})
        this.socket.close();
        queue.length = 0;
    };
    //发送消息
    send (code,data,flag) {
        console.log(code,data)
        let msg = sendDispatch(code,this.#SerialNm,data)
        this.socket.send(msg);
        this.#SerialNm++;
        if (flag === undefined) {
            queue.push(code)
            main.busy(code,true)
        }
    };
}();
