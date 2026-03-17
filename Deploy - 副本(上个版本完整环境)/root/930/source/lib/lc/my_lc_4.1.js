// Extract required parts from LightningChartJS.
const {
    lightningChart,
    Themes,
    LegendBoxBuilders,
    MarkerBuilders,
    UIBackgrounds,
    UIDirections,
    UIOrigins,
    AutoCursorModes,
    UIElementBuilders,
    UIDraggingModes,
    SolidLine,
    PalettedFill,
    LUT,
    ColorRGBA,
    SolidFill,
    LinearGradientFill,
    RadialGradientFill,
    ColorHEX,
    ColorCSS,
    PointShape,
    AutoCursorBuilders,
    emptyLine,
    UIVisibilityModes,
    AxisTickStrategies,
    emptyFill,
    regularColorSteps,
    ColorShadingStyles,
    translatePoint,
    DashedLine,
    StipplePatterns,
    AxisScrollStrategies,
    synchronizeAxisIntervals,
    UILayoutBuilders,
    ImageFill
} = lcjs;

/**
 * @function Mapping模式下的三维XYZ图表
 * @description 包含热图、热图X和Y视角的XY图表和曲面图
 * @param {any} container 容器元素或容器id
 * @param {boolean} dim_4 是否使用4维模式
 */
class chart_xyz {
    #base = null;
    #db = null;
    #right = null;
    #right_chart = null;
    #right_flag = null;
    #bottom = null;
    #bottom_flag = null;
    #bottom_chart = null;
    #heatmap = null;
    #heatmap_chart = null;
    #heatmap_flag_x = null;
    #heatmap_flag_y = null;
    #surface = null;
    #suc = false;
    #rc  = false;
    #bc = false;
    #isLut = true
    #surface_chart = null;
    #color = null;
    #min = 0;
    #max = 0;
    #col = null;
    #row = null;
    #z = [];
    #cbk = null;
    #mode = 0; //0-移动模式, 1-点选模式
    constructor(container, suc, rc, bc) {
    	[this.#suc,this.#rc,this.#bc] = [suc,rc,bc];
        //创建chart对象
        this.#base = lightningChart({
            license: '0001-mb1ec0f5d189fc2a613d63ce3d49c7d9fe38ae4cfb3a3262f51f5fb01a4e4c5a8-00948e178801-3044022044e7a04938f6fe42052c546db7faacedf9a37a9f6da7d21f2368577312760e32022068326bd32e0bca7a00dc0057b7649b053fd978653c5c598c43a2ae4cf929fd60',
            licenseInformation: {
                appTitle: 'ZolixSoftware',
                company: 'Zolix instruments co., ltd'
            }
        });
        //创建db对象
        this.#db = this.#base.Dashboard({
            numberOfColumns: 1,
            numberOfRows: 1,
            theme: Themes.darkGold,
            container: container
        });
        //设置左侧和下侧图表的宽高比
		if (rc && bc) {
			this.#db.setColumnWidth(1, 0.3);
			this.#db.setRowHeight(1, 0.3);
		}
        if (rc) {
            //创建Y视角图表
            this.#right_chart = this.#db.createChartXY({
                columnIndex: 1,
                rowIndex: 0
            });
            this.#right_chart.setTitle(' ');
            //上对齐
            this.#right_chart.setPadding({
                top: 10
            });
            this.#right_chart.setMouseInteractions(false);
            this.#right_chart.getDefaultAxisY().setScrollStrategy(undefined).setMouseInteractions(false);
            this.#right_flag = this.#right_chart.getDefaultAxisY().addConstantLine(true);
            this.#right_flag.setStrokeStyle(
                new DashedLine({
                    thickness: 1,
                    fillStyle: new SolidFill({
                        color: ColorRGBA(255, 0, 0)
                    }),
                    pattern: StipplePatterns.Dashed,
                    patternScale: 4
                })
            );
            // Prevent users from moving constant line with mouse interactions.
            this.#right_flag.setMouseInteractions(false);
            //创建Y视角曲线
            this.#right = this.#right_chart.addLineSeries({
                dataPattern: {
                    pattern: 'ProgressiveY',
                    regularProgressiveStep: true
                }
            });
            this.#right.setCursorResultTableFormatter((tableBuilder, _, x, y) => tableBuilder.addRow('Y', y.toFixed(3)).addRow('Intensity', x.toFixed(3)));
            this.#right.setMouseInteractions(false);
            this.#right.setCursorSolveBasis('nearest-y'); //显示鼠标最近的Y的值
			this.#right_chart.getDefaultAxisX().setThickness(25);
        }
        if (bc) {
            //创建X视角图表
            this.#bottom_chart = this.#db.createChartXY({
                columnIndex: 0,
                rowIndex: 1
            });
            this.#bottom_chart.setTitle(' ');
            this.#bottom_chart.setMouseInteractions(false);
            this.#bottom_chart.getDefaultAxisX().setScrollStrategy(undefined).setMouseInteractions(false);
            this.#bottom_chart.getDefaultAxisY().setScrollStrategy(AxisScrollStrategies.expansion).setMouseInteractions(false);
            this.#bottom_flag = this.#bottom_chart.getDefaultAxisX().addConstantLine(true);
            this.#bottom_flag.setStrokeStyle(
                new DashedLine({
                    thickness: 1,
                    fillStyle: new SolidFill({
                        color: ColorRGBA(255, 0, 0)
                    }),
                    pattern: StipplePatterns.Dashed,
                    patternScale: 4
                })
            );
            // Prevent users from moving constant line with mouse interactions.
            this.#bottom_flag.setMouseInteractions(false);

			//创建X视角曲线
			this.#bottom = this.#bottom_chart.addLineSeries({
				dataPattern: {
					pattern: 'ProgressiveX',
					regularProgressiveStep: true
				}
			});
			this.#bottom.setCursorResultTableFormatter((tableBuilder, _, x, y) => tableBuilder.addRow('X', x.toFixed(3)).addRow('Intensity', y.toFixed(3)));
			this.#bottom.setMouseInteractions(false);
			this.#bottom_chart.getDefaultAxisY().setThickness(50);
        }
       	if(rc&&bc) {
			let panel = this.#db.createUIPanel({
				columnIndex: 1,
				rowIndex: 1,
			});
			let layout = panel.addUIElement(UILayoutBuilders.Column /*, this.#db.uiScale*/ )
				.setPosition({
					x: 10,
					y: 90
				})
				.setOrigin(UIOrigins.LeftTop)
				//.setMargin({
				//	bottom: 100,
				//	right: 0
				//})
				.setDraggingMode(UIDraggingModes.notDraggable);
			let move = layout.addElement(UIElementBuilders.CheckBox).setText('Move mode').setOn(true);
			move.onSwitch((_, select) => {
				if (select) {
					this.#mode = 0;
					this.#heatmap_flag_x.setVisible(false);
					this.#heatmap_flag_y.setVisible(false);
				}

				click.setOn(!select);
			});
			let click = layout.addElement(UIElementBuilders.CheckBox).setText('Click mode').setOn(false);
			click.onSwitch((_, select) => {
				if (select) {
					this.#mode = 1;
					this.#heatmap_flag_x.setVisible(true);
					this.#heatmap_flag_y.setVisible(true);
				}
				move.setOn(!select);
			});
		}
        //创建热图图表
        this.#heatmap_chart = this.#db.createChartXY({
            columnIndex: 0,
            rowIndex: 0
        });
        this.#heatmap_chart.setTitle(' ');
        // //红色十字标记 - x
        // this.#heatmap_flag_x = this.#heatmap_chart.getDefaultAxisX().addConstantLine(true);
        // this.#heatmap_flag_x.setStrokeStyle(
        //     new DashedLine({
        //         thickness: 1,
        //         fillStyle: new SolidFill({
        //             color: ColorRGBA(255, 0, 0)
        //         }),
        //         pattern: StipplePatterns.Dashed,
        //         patternScale: 4
        //     })
        // );
        // // Prevent users from moving constant line with mouse interactions.
        // this.#heatmap_flag_x.setMouseInteractions(false);
        // this.#heatmap_flag_x.setVisible(false);
        //红色十字标记 - y
        // this.#heatmap_flag_y = this.#heatmap_chart.getDefaultAxisY().addConstantLine(true);
        // this.#heatmap_flag_y.setStrokeStyle(
        //     new DashedLine({
        //         thickness: 1,
        //         fillStyle: new SolidFill({
        //             color: ColorRGBA(255, 0, 0)
        //         }),
        //         pattern: StipplePatterns.Dashed,
        //         patternScale: 4
        //     })
        // );
        // // Prevent users from moving constant line with mouse interactions.
        // this.#heatmap_flag_y.setMouseInteractions(false);
        // this.#heatmap_flag_y.setVisible(false);
        //不需要曲面
        if (suc) {

            //创建曲面图表
            this.#surface_chart = this.#db.createChart3D({
                columnIndex: 2,
                rowIndex: 0,
                columnSpan: 1, //列合并
                rowSpan: 2 //行合并
            });
            this.#surface_chart.setTitle(' ');
            this.#surface_chart.getDefaultAxisX().setTitle('X');
            this.#surface_chart.getDefaultAxisY().setTitle('Intensity'); //Y和Z显示是相反的，但数据是正确
            this.#surface_chart.getDefaultAxisZ().setTitle('Y');
        }
        //隐藏鼠标移动时,坐标轴上的数据标签
        Array(this.#right_chart, this.#bottom_chart, this.#heatmap_chart).map((s) => {
			if (s === null) return
			s.setAutoCursor((autoCursor) => autoCursor
					.setTickMarkerYVisible(false)
					.setTickMarkerXVisible(false)
					.setResultTableAutoTextStyle(true))
		});

        //坐标系对其
        this.#heatmap_chart.getDefaultAxisY().setThickness(50);
        this.#heatmap_chart.getDefaultAxisX().setThickness(25);

        //缩放同动
		if(this.#rc){
			synchronizeAxisIntervals(this.#heatmap_chart.getDefaultAxisY(), this.#right_chart.getDefaultAxisY());
		}
		if(this.#bc){
			synchronizeAxisIntervals(this.#heatmap_chart.getDefaultAxisX(), this.#bottom_chart.getDefaultAxisX());
		}
        //过渡色调
        this.#color = [ColorRGBA(128, 0, 128),ColorRGBA(0, 0, 255), ColorRGBA(0, 128, 0), ColorRGBA(255, 0, 0)];
        //数据更新回调
        let update_xy = (event) => {
            const pt = translatePoint(
                this.#heatmap_chart.engine.clientLocation2Engine(event.clientX, event.clientY),
                this.#heatmap_chart.engine.scale,
                this.#heatmap.scale
            );
            try {
                const col = Math.round((pt.x - this.#row.start - this.#row.step / 2) / this.#row.step);
                let data = this.#z[col].map((value, i) => ({
                    x: value,
                    y: this.#row.start + i * this.#row.step
                }));
                if(rc){
					this.#right.clear();
					this.#right.add(data);
					this.#right_flag.setValue(pt.y);
				}
                this.#heatmap_flag_y.setValue(pt.y);
            } catch (e) {
            }
            try {
                let data = [];
                const row = Math.round((pt.y - this.#col.start - this.#col.step / 2) / this.#col.step);
                for (let x = 0; x < this.#col.length(); x += 1) {
                    data[x] = {
                        x: this.#col.start + x * this.#col.step,
                        y: this.#z[x][row]
                    };
                }
                if(bc){
					this.#bottom.clear();
					this.#bottom.add(data);
					this.#bottom_flag.setValue(pt.x);
				}
                this.#heatmap_flag_x.setValue(pt.x);
            } catch (e) {
            }
        };
        //鼠标单击事件
        this.#heatmap_chart.onSeriesBackgroundMouseMove((_, event) => {
            if (!this.#heatmap || this.#mode !== 0) return;
            update_xy(event);
        });
        //鼠标移动事件
        this.#heatmap_chart.onSeriesBackgroundMouseClick((_, event) => {
            if (!this.#heatmap || this.#mode !== 1) return;
            update_xy(event);
        });
        //鼠标双击,触发回调
        this.#heatmap_chart.onSeriesBackgroundMouseDoubleClick((_, event) => {
            if (!this.#heatmap || !this.#cbk) return; //无回调
            const pt = translatePoint(
                this.#heatmap_chart.engine.clientLocation2Engine(event.clientX, event.clientY),
                this.#heatmap_chart.engine.scale,
                this.#heatmap.scale
            );
            if (pt.x < this.#col.start || pt.x > this.#col.end) return; //超出数据区
            if (pt.y < this.#row.start || pt.y > this.#row.end) return; //超出数据区
            const x = Math.round((pt.x - this.#col.start - this.#col.step / 2) / this.#col.step);
            const y = Math.round((pt.y - this.#row.start - this.#row.step / 2) / this.#row.step);
            this.#cbk(x, y); //有效
        });
    }

    //重置图表
    reset(col_start, col_end, col_step, row_start, row_end, row_step) {
        this.#min = 0;
        this.#max = 1;
        this.#col = {
            start: col_start,
            end: col_end,
            step: col_step,
            length: function () {
                return (this.end - this.start) / this.step;
            }
        };
        this.#row = {
            start: row_start,
            end: row_end,
            step: row_step,
            length: function () {
                return (this.end - this.start) / this.step;
            }
        };
        this.#z = Array.from({
            length: this.#col.length()
        }, () => new Array(this.#row.length()).fill(0));
        // //设置XY视角坐标显示范围
		if(this.#rc){
			this.#right_chart.getDefaultAxisY().setInterval({
				start: row_start,
				end: row_end,
				stopAxisAfter: false
			});

		}
        if(this.#bc){
			this.#bottom_chart.getDefaultAxisX().setInterval({
				start: col_start,
				end: col_end,
				stopAxisAfter: false
			});
		}
        //创建色卡
        if (this.#heatmap) this.#heatmap.dispose(); //重置
        //创建热图
        this.#heatmap = this.#heatmap_chart.addHeatmapGridSeries({
            columns: this.#col.length(),
            rows: this.#row.length(),
            start: {
                x: this.#col.start,
                y: this.#row.start
            },
            end: {
                x: this.#col.end,
                y: this.#row.end
            },
            step: {
                x: this.#col.step,
                y: this.#row.step
            }
        });

        this.#heatmap.setName('Heatmap'); //默认名称,显示色卡图例里面的
        this.#heatmap.setWireframeStyle(emptyLine);
        //热图响应鼠标事件
        this.#heatmap.setMouseInteractions(false);
        if(this.#isLut)
        {
			let lut = new LUT({
				interpolate: true,
				steps: regularColorSteps(this.#min, this.#max, this.#color),
				units: ' ' //色卡上的单位
			});
			this.#heatmap.setFillStyle(new PalettedFill({
				lut
			}));
			this.#heatmap_chart.addLegendBox(LegendBoxBuilders.HorizontalLegendBox).add(this.#heatmap_chart)
		}


        /*
        //鼠标在热图上时,标识框内数据显示格式
        //this.#heatmap.setCursorResultTableFormatter((builder, series, dataPoint) => builder
        //	.addRow(`X: ${dataPoint.x - (col_step / 2)}, Y: ${dataPoint.y - (row_step / 2)}`)
        //	.addRow(`Z: ${dataPoint.intensity}`)
        //);
        */
		if(this.#suc){
			if (this.#surface) this.#surface.dispose(); //重置
			//创建曲面
			this.#surface = this.#surface_chart.addSurfaceGridSeries({
				columns: this.#col.length(),
				rows: this.#row.length()
			});
			this.#surface.setName('Surface'); //默认名称,显示色卡图例里面的
			this.#surface.setWireframeStyle(emptyLine);
			this.#surface.setColorShadingStyle(new ColorShadingStyles.Phong()); //光线
		}
    }

    refresh(min, max) {
        if (min < this.#min || max > this.#max) {
            this.#min = Math.min(min, this.#min);
            this.#max = Math.max(max, this.#max);

            let lut = new LUT({
                interpolate: true,
                steps: regularColorSteps(this.#min, this.#max, this.#color),
                units: ' ' //色卡上的单位
            });
            this.#heatmap.setFillStyle(new PalettedFill({
                lut
            }));
            // this.#surface.setFillStyle(new PalettedFill({
            //     lut: lut, //根据色卡,填充颜色
            //     lookUpProperty: 'y' //视角为Y,不能改
            // }));
        }

        this.#heatmap.invalidateIntensityValues(this.#z);
      /*  this.#surface.invalidateHeightMap(this.#z);*/
    }

    add_point(x, y, z) {
        let r = (y - this.#row.start) / this.#row.step; //行
        let c = (x - this.#col.start) / this.#col.step; //列
        if (r >= this.#row.length() || c >= this.#col.length()) return; //坐标超限
        this.#z[r][c] = z;
        let min = Math.min(this.#min, z);
        let max = Math.max(this.#max, z);
        this.refresh(min, max);
    }

    add_col(col, data) {
        if (col >= this.#col.length()) return; //行数不能超限
        if (data.length < this.#row.length()) return; //数据无效
        this.#z[col] = data.slice(0, this.#row.length());
        let min = Math.min(this.#min, data.reduce((min, v) => min < v ? min : v, Infinity));
        let max = Math.max(this.#max, data.reduce((max, v) => max >= v ? max : v, -Infinity));
        this.refresh(min, max);
    }

    add_row(row, data) {
        if (row >= this.#row.length()) return; //列数不能超限
        if (data.length < this.#col.length()) return; //数据无效
        for (let i = 0; i < this.#col.length(); i++) {
            this.#z[i][row] = data[i];
        }
        let min = Math.min(this.#min, data.reduce((min, v) => min < v ? min : v, Infinity));
        let max = Math.max(this.#max, data.reduce((max, v) => max >= v ? max : v, -Infinity));
        this.refresh(min, max);
    }

    assign(data) {
        if (Array.isArray(data[0])) {
            if (data.length == this.#row.length() && data[0].length == this.#col.length()) {
                this.#z = data;

                let mins = [];
                let maxs = [];
                for (var i = 0; i < this.#row.length(); i++) {
                    mins[i] = this.#z[i].reduce((min, v) => min < v ? min : v, Infinity);
                    maxs[i] = this.#z[i].reduce((max, v) => max >= v ? max : v, -Infinity);
                }

                this.#min = mins.reduce((min, v) => min < v ? min : v, Infinity);
                this.#max = maxs.reduce((max, v) => max >= v ? max : v, -Infinity);

                this.refresh();
            }
        }
    }

    set_color(bg) {
        this.#db.setBackgroundFillStyle(new SolidFill({
            color: bg
        }));
    }

    get_heatmap(){
    	return this.#heatmap_chart
	}
    /**
     * @function 设置图表双击回调
     * @param {functuin} callback <point{x, y}>
     */
    set_dbclick_cbk(callback) {
        if (callback && typeof (callback) === 'function') {
            this.#cbk = callback;
        }
    }

    right_series() {
        return new series(this.#right_chart, this.#right);
    }
};

/**
 * @function 热力图
 * @param {Object} container 容器元素或容器id
 */
class heatmapXY {
    #base = null;
    #db = null;
    #heatmap_chart = null; //ChartXY
    #heatmap = null;
    #org = []
    #marks = [];
    #col = null;
    #row = null;
    #z = [];
    #lutPanel = {}
    #lut= {};
    #axisX = {}
    #axisY = {}
    #color = [ColorHEX('#482ff7'),ColorHEX('#2d6cdf'),ColorHEX("#46c3db"),ColorHEX('#a7ff83'),ColorHEX('#f3f169'),ColorHEX("#ff9f68"),ColorHEX('#ff304f')]//[ColorRGBA(128, 0, 128),ColorRGBA(0, 0, 255), ColorRGBA(0, 128, 0), ColorRGBA(255, 0, 0)];//色卡颜色
    data = {x:[],y:[]}
    #heatmapArr =new Map()
    constructor(container) {
        //创建框架
        this.#base = lightningChart({
            license: '0001-mb1ec0f5d189fc2a613d63ce3d49c7d9fe38ae4cfb3a3262f51f5fb01a4e4c5a8-00948e178801-3044022044e7a04938f6fe42052c546db7faacedf9a37a9f6da7d21f2368577312760e32022068326bd32e0bca7a00dc0057b7649b053fd978653c5c598c43a2ae4cf929fd60',
            licenseInformation: {
                appTitle: 'ZolixSoftware',
                company: 'Zolix instruments co., ltd'
            }
        });
        //创建画板对象
        this.#db = this.#base.Dashboard({
            numberOfColumns: 1, //一列
            numberOfRows: 1, //一行
            theme: Themes.darkGold,
            container: container
        })
           /* .setColumnWidth(0,5)
            .setColumnWidth(1,0)*/
            // .setWidth([100,550])
            // .setHeight([100,420])
        // this.#db.
        // this.#db.setHeight(400)
        //创建二维图表
        this.#heatmap_chart = this.#db.createChartXY({
            columnIndex: 0, //画板行
            rowIndex: 0 //画板列
        });
        this.#heatmap_chart.setTitle(' '); //默认无标题
        this.#heatmap_chart.setAutoCursor((autoCursor) => autoCursor
            .setTickMarkerYVisible(false) //隐藏Y轴标签
            .setTickMarkerXVisible(false) //隐藏X轴标签
            .setResultTableAutoTextStyle(true) //自动填充
        );
		this.minVal = Number.MAX_VALUE
        this.maxVal = Number.MIN_VALUE
        this.addDownloadBtn()
        // //创建色卡面板
        // this.#lutPanel = this.#db.createUIPanel({
        //     columnIndex: 1, //画板行
        //     rowIndex: 0 //画板列
        // }).setMinimumSize(100)
        // this.#lut = this.#lutPanel.addUIElement(UIElementBuilders.LUTRange.setAlignment('vertical'))

       // this.#heatmap_chart.setPadding({right:100})
        this.#axisX = this.#heatmap_chart.getDefaultAxisX()//.setTickStrategy( AxisTickStrategies.Empty )//.setMouseInteractions(false)
        this.#axisY = this.#heatmap_chart.getDefaultAxisY()//.setTickStrategy( AxisTickStrategies.Empty )//.setMouseInteractions(false)
        //二次封装对象
        //this.#lut = this.#heatmap_chart.addUIElement(UIElementBuilders.LUTRange.setAlignment('vertical'))//初始化自定义lut
         /*   //.setBackground(bg => {bg.setStrokeStyle(emptyLine).setFillStyle(emptyFill)});
        // this.#leg = this.#heatmap_chart.addLegendBox(LegendBoxBuilders.HorizontalLegendBox) //添加图例
        //     .add(this.#heatmap_chart)
        //     .setTitle('')
        //     .setPadding(0)
        //     .setMargin(4)
        //     // .setDraggingMode(1)
        //     .setPosition({ x:95,y:99})
        //     // .setAutoDispose({
        //     //     type: 'max-width',
        //     //     maxWidth: 0.3
        //     // })
        //    .setBackground(bg=>{bg.setStrokeStyle(emptyLine).setFillStyle(emptyFill)});

        //this.#leg = new legend_box(this.#heatmap_chart.addLegendBox().add(this.#heatmap_chart));
        // this.#heatmap_chart.onSeriesBackgroundMouseClick((event)=>{
        //     let nearest = event.solveNearest();
        //     if (nearest) {
        //         let x = nearest.location['x'];
        //         let y = nearest.location['y'];
        //         let col = Math.round((x - this.#heatmap.getXMin() - 1 / 2));
        //         let row = Math.round((y - this.#heatmap.getYMin() - 1 / 2));
        //         console.log(col,row);
        //         this.#org[col].map((value, i) => {
        //            this.data.x.push(value)
        //         });
        //         this.#org[row].map((value, i) => {
        //             this.data.y.push(value)
        //         });
        //     }
        // })*/
    }
    addDownloadBtn(){
        //保存图片按钮
        let dImage = new Image()
        dImage.src = './source/lib/lc/download.svg'
        const iconAspectRatio = dImage.height / dImage.width
        const iconWidthPx = 10
        this.#heatmap_chart.addUIElement(UIElementBuilders.TextBox).setText('').setDraggingMode(undefined)
            .setPosition({x:96,y:97})
            .setPadding({ left: iconWidthPx, top: iconWidthPx * iconAspectRatio })
            .setBackground((background) =>
                background.setStrokeStyle(emptyLine).setFillStyle(
                    new ImageFill({
                        source: dImage,
                    }),
                ))
            .onMouseClick(e=>{this.#heatmap_chart.saveToFile('heatmap')}
            )
    }
    base(){
        return this.#heatmap_chart
    }
    option(){
        return this.#heatmap
    }
    getOrg(){
        return this.#org
    }
    //初始化色卡
    initLut(container){
        //创建色卡
        this.#lutPanel = this.#base.Dashboard({
            numberOfColumns: 1, //一列
            numberOfRows: 1, //一行
            theme: Themes.darkGold,
            container: container
        })
        this.#lut = this.#lutPanel.addUIElement(UIElementBuilders.LUTRange.setAlignment('vertical'))
    }
    //添加热力图
    addHeatmap(col,row,name){
        this.#col = col
        this.#row = row
        this.minVal= Number.MAX_VALUE
        this.maxVal= Number.MIN_VALUE
        this.#z = Array.from({
            length: col
        }, () => new Array(row).fill(0));
        // this.#db.setRowHeight(1,row/col)
        //创建热力图
        // let cx = this.#heatmap_chart.getDefaultAxisX().addCustomTick(UIElementBuilders.AxisTickMajor)
        // this.#heatmap_chart.getDefaultAxisY().addCustomTick(UIElementBuilders.AxisTickMajor)
        this.#heatmap = this.#heatmap_chart.addHeatmapGridSeries({
            columns: col,
            rows: row,
            start: { x: 1, y: 1 },
            end: { x: col, y: row },
            dataOrder: 'columns',
        })
        this.#axisX.setTitle(name)
        this.#axisX.setInterval({start:1,end:col,stopAxisAfter:false})
        this.#axisY.setInterval({start:1,end:row,stopAxisAfter:false})

        // for (let x = 0; x <=col; x++) {
        //     this.#axisX.addCustomTick(UIElementBuilders.AxisTickMajor)
        //         .setValue(x)
        //         .setTextFormatter((value) => value.toFixed(0))
        //     this.#axisX.setNibLength(50)
        // }
        // this.#axisX.setInterval({start:0,end:col})
        // for (let y = 0; y <=row; y++) {
        //     this.#axisY.addCustomTick(UIElementBuilders.AxisTickMajor)
        //         .setValue(y)
        //         .setTextFormatter((value) => value.toFixed(0))
        // }
        // this.#axisY.setInterval({start:0,end:row})


        this.#heatmap.setName(name)
        this.#heatmap.setWireframeStyle(emptyLine)//禁用线框样式
        //this.addLut(0,1,true)
        this.#heatmap.setIntensityInterpolation('disabled') //禁用插值；按原样绘制数据。
        //热图响应鼠标事件
        this.#heatmap.setMouseInteractions(false);
        this.#heatmap.setCursorInterpolationEnabled(false) //true 内插强度值  false实际数据点
        this.#heatmapArr.set(name,this.#heatmap)
        //this.#heatmap.setCursorResultTableFormatter((tableBuilder, _, x, y) => tableBuilder.addRow('X', x.toFixed(0)).addRow('Y', y.toFixed(0))); //十字标显示
        this.#heatmap.setCursorResultTableFormatter((builder, series, dataPoint) =>
            builder
                .addRow(`X:        ${dataPoint.x.toFixed(0)}`)
                .addRow(`Y:        ${dataPoint.y.toFixed(0)}`)
                .addRow(`Intensity ${dataPoint.intensity.toFixed(0)}`),
        )
        // this.#leg.add(this.#heatmap)
        // this.#leg.set_visible(false)
        this.#heatmap.invalidateIntensityValues(this.#z)
    }
    updateLut(min,max,flag){
        // let lut = new LUT({
        //     interpolate: true,
        //     //percentageValues: true,
        //     steps: regularColorSteps(min,max, this.#color),
        //     units: ' ', //色卡上的单位
        //
        // });
        // this.#heatmap.setFillStyle(new PalettedFill({lut}));
        // this.#heatmap.setWireframeStyle(emptyLine)
        // this.#leg.dispose()
        // this.#leg.add(this.#heatmap_chart)
    }
    updateMinMax(){
    	this.minVal= Number.MAX_VALUE
        this.maxVal= Number.MIN_VALUE
    }
    //添加色卡
    addLut(min,max,flag){
        if (!flag)  return
        if (min === max) return;
        this.minVal=min<this.minVal?min:this.minVal
        this.maxVal=max>this.maxVal?max:this.maxVal
        let lut  = new LUT({
            interpolate: true,
            //percentageValues: true,
            steps: regularColorSteps(this.minVal,this.maxVal, this.#color),
            units: ' ', //色卡上的单位

        });
        this.#heatmap.setFillStyle(new PalettedFill({lut}));
        //this.#heatmap_chart.setPadding({ right: })//设置右侧边距    this.#heatmap_chart.setPadding({ right: 100})//设置右侧边距
        this.#lut.dispose()
        this.#lut = this.#lutPanel.addUIElement(UIElementBuilders.LUTRange.setAlignment('vertical'))
            .setOrigin({x: 0, y: 0})
            .setPosition({x: 50, y: 50})
            //.setLUTLength(400)
            .setLUTThickness(15)
            .setMargin(0)
            .setMouseInteractions(false)
            .setBackground(bg => {bg.setStrokeStyle(emptyLine).setFillStyle(emptyFill)})
            .setLUT(lut)

        // let entries = this.#leg.entries
        // for (let i = entries.length - 1; i >= 0; i--) {
        //     entries[i].entry.dispose();
        // }
        // entries.length = 0
        // this.#leg.add(this.#heatmap)
       // this.#heatmap.setWireframeStyle(emptyLine)
        // this.#leg = this.#heatmap_chart.addLegendBox(LegendBoxBuilders.VerticalLegendBox) //添加图例
        //     .add(this.#heatmap_chart)
        //     .setTitle('')
        //     .setPadding(0)
        //     .setMargin(4)
        //     // .setDraggingMode(1)
        //     .setPosition({ x:100,y:50});
        // //this.#lb.add(this.#heatmap)
    }
    //按行添加
    addCol(col,data){
        if (col >= this.#col)return; //列数不能超限
        //if (data.length < this.#row) return; //数据无效
        let min = Number.MAX_VALUE
        let max = Number.MIN_VALUE
        for (let i = 0; i < this.#row; i++) {
            this.#z[col][i] = data[i];
            min=min<data[i]?min:data[i]
            max=max>data[i]?max:data[i]
        }
        this.addLut(min,max,true)
        this.#heatmap.invalidateIntensityValues(this.#z)
    }
    //按列添加
    addRow(row,data){
        if (row >= this.#row)return; //列数不能超限
        //if (data.length < this.#col) return; //数据无效
        for (let i = 0; i < this.#col; i++) {
            this.#z[i][row] = data[i];
        }
        this.addLut(Math.min(...data),Math.max(...data),true)
        this.#heatmap.invalidateIntensityValues(this.#z)
        this.#org = this.#z
    }
    addData(data){
        
        this.#org = data
        this.#heatmap.invalidateIntensityValues(data)
    }
    //添加标记
    addMarks(x,y,c){
        // Create a builder for SeriesMarker to allow for full modification of its structure.
        // const builder = MarkerBuilders.XY.setPointMarker(UIBackgrounds.Diamond)
        //     .addStyler((marker) => marker
        //         .setPointMarker((point) => point.setSize({x: 10, y: 10}).setFillStyle(new SolidFill({color: ColorHEX(c)})))
        //     );
        const builder = MarkerBuilders.SeriesMarkerXY.setResultTableBackground(UIBackgrounds.Pointer).addStyler((marker) =>
            marker
                .setPointMarker(point=>point.setSize({x:10,y:10}).setShape(PointShape.Diamond).setFillStyle(new SolidFill({color: ColorHEX(c)})))
                // .setResultTable((table) =>
                //     table
                //         .setOrigin(UIOrigins.CenterBottom)
                //         .setMargin({ bottom: 0 })
                //         .setBackground((arrow) => arrow.setDirection(UIDirections.Down).setPointerAngle(80).setPointerLength(15))
                //         .setTextFillStyle(new SolidFill({color: ColorHEX(this.#color)}))
                // )
                // .setGridStrokeXCut(true)
                // .setAutoFitStrategy(undefined),
        )
        let mark = new marker(this.#heatmap.addMarker(builder));
        mark.set_position(x, y);
        mark.show_label(false, false);
        mark.show_grid(false, false);
        mark.show_caption(false)
        mark.base().setAutoFitStrategy(undefined) //禁用自动拟合
        mark.base().setMouseInteractions(false) //禁用鼠标事件
        this.#marks.push(mark);
        return mark;
    }
    //移除标记
    remove_mark(x, y) {
        for (let m of this.#marks) {
            let mx =Math.round(m.base().getPosition().x);
            let my = Math.round(m.base().getPosition().y);
            if (mx === x && my === y) {
                m.base().dispose();
                this.#marks.splice(this.#marks.indexOf(m), 1);
            }
        }
    };
    //移除所有标峰
    removeAllMarks() {
        for (let m of this.#marks) {
            m.base().dispose();
        }
        this.#marks.length = 0;
    };
    //显示或隐藏标记
    isVisible_mark(x, y,v) {
        for (let m of this.#marks) {
            let mx =Math.round(m.base().getPosition().x);
            let my = Math.round(m.base().getPosition().y);
            if (mx === x && my === y) {
               m.base().setVisible(v)
            }
        }
    };

    clearHeatmap(){
        for (let l of this.#heatmapArr.values()) {
            l.dispose();
        }
        this.#axisX.setTitle('')
        this.#lut.dispose()
        this.#heatmapArr.clear()
    }
}
/**
 * @function 常规模式下极坐标图表
 * @description 只包含一个图表
 * @param {any} container  容器元素或容器id
 */
class polar_chart{
	#base     = null;
	#db       = null;
	#polar    = null;
	#seriesBasic = null;
	#polarData= [];
	constructor(container){
		//创建框架
        this.#base = lightningChart({
            license: '0001-mb1ec0f5d189fc2a613d63ce3d49c7d9fe38ae4cfb3a3262f51f5fb01a4e4c5a8-00948e178801-3044022044e7a04938f6fe42052c546db7faacedf9a37a9f6da7d21f2368577312760e32022068326bd32e0bca7a00dc0057b7649b053fd978653c5c598c43a2ae4cf929fd60',
            licenseInformation: {
                appTitle: 'ZolixSoftware',
                company: 'Zolix instruments co., ltd'
            }
        });
        //创建画板对象
        this.#db = this.#base.Dashboard({
            numberOfColumns: 1, //一列
            numberOfRows: 1, //一行
            theme: Themes.darkGold,
            container: container
        });
        //创建polarChart图表
        this.#polar = this.#db.createPolarChart({
            columnIndex: 0, //画板行
            rowIndex: 0 //画板列
        });
        this.#polar.setTitle(' ');
        this.#seriesBasic = this.#polar.addPointLineSeries();
	}
	
	setData(xList,yList){
		for(var i =0;i<xList.length;i++){
			this.#polarData.push({
		        angle: xList[i],
		        amplitude: yList[i],
				value: ColorRGBA( 255, 0, 0 )
		    });
		}
		this.#seriesBasic.setData(this.#polarData);
		
	}
	
	updateData(xList,yList){
		for(var i =0;i<this.#polarData.length;i++){
			this.#polarData[i].angle=xList[i];
			this.#polarData[i].amplitude=yList[i];
		}
		this.#seriesBasic.setData(this.#polarData);
		this.#polar.getAmplitudeAxis().setInterval({ end: Math.max(...yList) });
	}
	
	addDataPoints(x,y){
		this.#polarData.push({
	        angle: x,
	        amplitude: y,
			value: ColorRGBA( 255, 0, 0 )
	    });
	    this.#seriesBasic.setData(this.#polarData);
	}
	clear(){
		this.#polarData=[];
		this.#seriesBasic.setData(this.#polarData);
	}
}

/**
 * @function 常规模式下二维XY图表
 * @description 只包含一个图表、一个legendbox
 * @param {any} container  容器元素或容器id
 */
class chart_xy {
    //私有变量
    #base = null;
    #db = null;
    #xy = null; //ChartXY
    #lb = null; //legendBox
    #lines = new Map();

    //构造函数
    constructor(container) {
        //创建框架
        this.#base = lightningChart({
            license: '0001-mb1ec0f5d189fc2a613d63ce3d49c7d9fe38ae4cfb3a3262f51f5fb01a4e4c5a8-00948e178801-3044022044e7a04938f6fe42052c546db7faacedf9a37a9f6da7d21f2368577312760e32022068326bd32e0bca7a00dc0057b7649b053fd978653c5c598c43a2ae4cf929fd60',
            licenseInformation: {
                appTitle: 'ZolixSoftware',
                company: 'Zolix instruments co., ltd'
            }
        });
        //创建画板对象
        this.#db = this.#base.Dashboard({
            numberOfColumns: 1, //一列
            numberOfRows: 1, //一行
            theme: Themes.darkGold,
            container: container
        });
        //创建二维图表
        this.#xy = this.#db.createChartXY({
            columnIndex: 0, //画板行
            rowIndex: 0 //画板列
        });
        this.#xy.setTitle(' '); //默认无标题
        this.#xy.setAutoCursor((autoCursor) => autoCursor
            .setTickMarkerYVisible(false) //隐藏Y轴标签
            .setTickMarkerXVisible(false) //隐藏X轴标签
            .setResultTableAutoTextStyle(true) //自动填充
        );
        this.#xy.setAnimationsEnabled(false); //关闭动画
        this.#xy.setPadding({
            right: 30, //右边距
            top:15
        });
        // this.#xy.setBackgroundFillStyle(emptyFill);//去除所有背景样式
        // this.#xy.setBackgroundFillStyle(new SolidFill({color: ColorRGBA(39, 52, 62, 255)}));//图表背景填充颜色
        // this.#xy.setSeriesBackgroundFillStyle(new SolidFill({color: ColorRGBA(22, 30, 38, 255)})); //系列背景填充颜色
        // this.#xy.setBackgroundStrokeStyle(new SolidLine({thickness: 0,fillStyle: new SolidFill({color: ColorRGBA(255, 0, 0, 100)})}));//系列背景描边(边框)颜色
        this.addDownloadBtn()
        this.#xy.setAutoCursorMode(AutoCursorModes.onHover) //自动游标只在序列上生效
        //手动移除曲线上的标记
        this.#xy.onSeriesBackgroundMouseClick((event) => {
            let nearest = event.solveNearest();
            if (nearest) {
                for (let l of this.#lines.values()) {
                    if (l.is_visible()) {
                        let x = nearest.location['x'];
                        let y = nearest.location['y'];
                        l.remove_mark(x.toFixed(3), y.toFixed(3));
                    }
                }
            }
        });
        //二次封装对象
        this.#lb = new legend_box(this.#xy.addLegendBox().add(this.#xy));
    };
    addDownloadBtn(){
        //保存图片按钮
        let dImage = new Image()
        dImage.src = './source/lib/lc/download.svg'
        const iconAspectRatio = dImage.height / dImage.width
        const iconWidthPx = 10
        this.#xy.addUIElement(UIElementBuilders.TextBox).setText('').setDraggingMode(undefined)
                .setPosition({x:96,y:97})
                .setPadding({ left: iconWidthPx, top: iconWidthPx * iconAspectRatio })
                .setBackground((background) =>
                    background.setStrokeStyle(emptyLine).setFillStyle(
                        new ImageFill({
                            source: dImage,
                        }),
                    ))
                .onMouseClick(e=>{this.#xy.saveToFile('chart')}
            )
    }

    set_title(title) {
        this.#xy.setTitle(title);
    };

    get_title() {
        this.#xy.getTitle();
    };

    //获取x轴
    axis_x() {
        return this.#xy.getDefaultAxisX();
    };

    set_axis_x_title (t) {
        this.#xy.getDefaultAxisX().setTitle(t);
    };

    //获取y轴
    axis_y() {
        return this.#xy.getDefaultAxisY();
    };

    set_axis_y_title(t) {
        this.#xy.getDefaultAxisY().setTitle(t);
    };

    /**
     * @function 添加曲线
     * @param {string} name 曲线名称
     * @param {number} type 0:line, 1:point
     * @return {object} series对象
     */
    add_series(name, type) {
        //如果有重名就返回原曲线
        if (this.#lines.has(name)) return this.#lines.get(name);
        let s = null;
        switch (type) {
            case 0:
                s = this.#xy.addLineSeries();
                s.setCursorInterpolationEnabled(true)
                break;
            case 1:
                s = this.#xy.addPointLineSeries({
                    pointShape: PointShape.Circle
                }).setPointSize(10);
                break;
            case 2:
                s = this.#xy.addPointSeries({
                    pointShape: PointShape.Circle
                }).setPointSize(8);
                break;
            case 3:
                s = this.#xy.addLineSeries()
                break;
            default:
                return null;
        }
        s.setName(name); //名称
        s.setEffect(false); //阴影效果
        s.setCursorResultTableFormatter((tableBuilder, _, x, y) => tableBuilder.addRow('X', x.toFixed(3)).addRow('Y', y.toFixed(3))); //十字标显示
        let line = new series(this, s); //二次封装曲线对象
        if (type !== 2) line.set_color('auto'); //自动分配颜色信息
        this.#lb.add(line); //legend box添加曲线
        this.#lb.set_visible(false); //显示legend box
        this.#lines.set(name, line); //存入map
        if (type === 3) {
            s.setStrokeStyle((stroke) =>
                new DashedLine({
                    fillStyle: stroke.getFillStyle(),
                    thickness: stroke.getThickness(),
                    pattern: StipplePatterns.Dashed,
                    patternScale: 2,
                }))
        }
        return line;
    };

    basic() {
        return this.base
    }

    base() {
        return this.#xy;
    }

    //获取图例
    legend_box() {
        return this.#lb;
    };

    //通过名称获取系列
    series(name) {
        return this.#lines.get(name);
    };

    //获取所有系列
    all_series() {
        return this.#lines;
    };

    //获取勾选的曲线
    active_series() {
        let retval = [];
        this.#lines.forEach(function (s, _) {
            if (s.is_visible()) {
                retval.push(s);
            }
        });

        return retval;
    };

    //通过名称删除，无高亮条件
    remove_line(name) {
        let line = this.#lines.get(name); //二次封装对象
        if (line !== undefined) {
            this.#lines.delete(name); //map缓存移除
            line.base().dispose(); //释放曲线原对象
            this.#lb.remove(line); //从图例移除
        }
    };

    //通过名称删除
    remove(name) {
        let line = this.#lines.get(name); //二次封装对象
        let highlight = line.base().getHighlight(); //高亮状态
        if (highlight === 1) {
            this.#lines.delete(name); //map缓存移除
            line.base().dispose(); //释放曲线原对象
            this.#lb.remove(line); //从图例移除
        }
    };

    //删除所有(曲线&图例)
    remove_all() {
        for (let l of this.#lines.values()) {
            l.base().dispose();
        }
        this.#lines.clear();
        this.#lb.remove_all();
    };

    //X轴添加自定义标记(计算分辨率时的竖线)
    add_custom_tick(txt) {
        let ct = this.axis_x().addCustomTick(UIElementBuilders.PointableTextBox);
        ct.setGridStrokeStyle((LineStyle) =>
            LineStyle.setFillStyle(
                new SolidFill({
                    color: ColorHEX('#ff0000')
                })
            ).setThickness(3)
        )
            .setTextFormatter((position, ct) => txt)
            .setMarker((tickMarker) =>
                tickMarker
                    // Style TickMarker.
                    .setTextFillStyle(new SolidFill({
                        color: ColorHEX('#ff0000')
                    }))
            )
            .setMouseInteractions(true)
            .onMouseDrag((_, event) => {
                const mouseLocationEngine = this.#xy.engine.clientLocation2Engine(event.clientX,event.clientY);
                const locationAxis = translatePoint(mouseLocationEngine,this.#xy.engine.scale,{x: this.#xy.getDefaultAxisX(),y: this.#xy.getDefaultAxisY()});
                ct.setValue(locationAxis.x);
            });

        return ct;
    };

    //设置背景颜色 RGBA
    set_color(bg) {
        //图表背景填充颜色
        this.#xy.setBackgroundFillStyle(
            new SolidFill({
                color: bg
            })
        );
        //曲线背景填充颜色
        //this.#xy.setSeriesBackgroundFillStyle(
        //	new SolidFill({
        //		color: bg
        //	})
        //);
    }
};

class series {
    #chart = null;
    #base = null;
    #marks = [];
    #x = [];
    #y = [];
    #color = null;

    constructor(chart, base) {
        this.#chart = chart;
        this.#base = base;
        /*this.#base.Mx[0].Jh.map(pt => {
            this.#x.push(pt.x);
            this.#y.push(pt.y);
        });*/
        //取消曲线悬浮高亮
        this.#base.setHighlightOnHover(false);
        //鼠标点击高亮显示事件
       // this.#base.onMouseClick(event => event.setHighlight(event.getHighlight() === 0));
        //游标配置为获取x和y最近的数据点
        this.#base.setCursorSolveBasis('nearest')
    }

    /**
     * @param {name} name 设置曲线名称
     */
    rename(name) {
        let map = this.#chart.all_series(); //获取全部曲线
        map.delete(this.name()); //删除原来的键值对
        map.set(name, this); //重新存储
        this.#base.setName(name); //改名
    };

    //获取曲线名称
    name() {
        return this.#base.getName();
    };

    //获取X轴数据最小值
    min_x() {
        return this.#base.getXMin()//this.#x.reduce((min, v) => min < v ? min : v, Infinity);
    };

    //获取X轴数据最大值
    max_x() {
        return this.#base.getXMax()//this.#x.reduce((max, v) => max > v ? max : v, -Infinity);
    };

    //获取Y轴数据最小值
    min_y() {
        return this.#base.getYMin()//this.#y.reduce((min, v) => min < v ? min : v, Infinity);
    };

    //获取Y轴数据最大值
    max_y() {
        return this.#base.getYMax()//this.#y.reduce((max, v) => max > v ? max : v, -Infinity);
    };

    //获取曲线的可见性
    is_visible() {
        return this.#base.getVisible();
    };

    //设置曲线可见性
    set_visible(show) {
        this.#base.setVisible(show);
    };

    //获取线属性
    base() {
        return this.#base;
    };

    //添加点
    add_point(x, y) {
        //默认不存在,添加点
        this.#base.add({
            x: x,
            y: y
        });
        this.#x.push(x);
        this.#y.push(y);
    };

    //根据顺序获取数据点
    get_point(index) {
        let len = this.get_length();
        if (len > 0 && index >= 0 && index < len) {
            return {
                x: this.#x[index],
                y: this.#y[index]
            };
        }
    };

    //根据顺序修改数据点
    set_point(index, x, y) {
        let len = this.get_length();
        if (len > 0 && index >= 0 && index < len) {
            this.#x[index] = x;
            this.#y[index] = y;
        }
    };

    //添加X和Y数组
    add_array(x, y) {
        this.#base.clear();
        this.#base.addArraysXY(x, y);
        this.#x = x;
        this.#y = y;
        // this.#chart.axis_x().setInterval({start:Math.min(...x),end:Math.max(...x),stopAxisAfter: false})
        // this.#chart.axis_y().setInterval({start:Math.min(...y),end:Math.max(...y),stopAxisAfter: false})

    };

    //添加y,自动填充x
    add_y(y) {
        let x = [];
        let len = this.get_length();
        if (len > 0) {
            len = Math.min(y.length, len);
            //this.#base.Mx[0].Jh.every(function (e, i) {
            this.get_data().x.every((e,i)=>{
                if (i < len) {
                    x.push(e);
                    return true;
                }
            })
            // this.#base.ZM[0].Xf.every(function(e, i) {
            //     if (i < len) {
            //         x.push(e.x);
            //         return true;
            //     }
            // });
        } else {
            x = Array.from(Array(y.length), (v, k) => k);
        }
        console.log(x,y)
        this.add_array(x, y);
    };

    //获取xy数据
    get_data() {
        return {
            x: this.#x,
            y: this.#y
        };
    };

    //获取数据长度
    get_length() {
        return this.#x.length;
    };

    get_color() {
        return this.#color;
    }

    //HEX设置颜色
    set_color(color) {
        if (color === 'auto') {
            let colors = ['DC143C','FF69B4','FF1493','FF00FF','00BFFF','00FFFF','00FA9A','00FF00','7FFF00','FFFF00','FFD700','FFA500','FF4500','FF0000']
            color = '#';
            let idx = Math.floor(Math.random() * colors.length);
            color+=colors[idx]
        }
        //series style 1,2
        this.#base.setStrokeStyle(new SolidLine({
            thickness: 3,
            fillStyle: new SolidFill({
                color: ColorHEX(color)
            })
        }));
        // if (this.#base.wc !== undefined && this.#base.wc.length > 0) {
        //     this.#base.wc[0].setButtonOnFillStyle(new SolidFill({
        //         color: ColorHEX(color)
        //     }));
        // }
        this.#chart.legend_box().set_color(color,this.#base)
        this.#color = color;
    };

    //获取标记
    get_marks() {
        return this.#marks;
    };

    //移除标记
    remove_mark(x, y) {
        for (let m of this.#marks) {
            let mx = parseFloat(m.base().getPosition().x.toFixed(3));
            let my = parseFloat(m.base().getPosition().y.toFixed(3));
            if (mx === Number(x) && my === Number(y)) {
                m.base().dispose();
                this.#marks.splice(this.#marks.indexOf(m), 1);
            }
        }
    };

    //添加标记
    add_mark(x, y) {
        // Create a builder for SeriesMarker to allow for full modification of its structure.
        // const builder = MarkerBuilders.XY.setPointMarker(UIBackgrounds.Circle)
        //     .setResultTableBackground(UIBackgrounds.Pointer)
        //     .addStyler((marker) => marker
        //         .setPointMarker((point) => point.setSize({x: 5, y: 5}))
        //         .setResultTable((table) => table
        //             .setOrigin(UIOrigins.CenterBottom)
        //             .setMargin({bottom: 0})
        //             .setBackground((arrow) => arrow.setDirection(UIDirections.Down).setPointerAngle(80).setPointerLength(20))
        //             .setTextFillStyle(new SolidFill({color: ColorHEX(this.#color)}))
        //         )
        //         .setGridStrokeXCut(true)
        //         .setAutoFitStrategy(undefined)
        //     );
        const builder = MarkerBuilders.SeriesMarkerXY.setResultTableBackground(UIBackgrounds.Pointer).addStyler((marker) =>
            marker
                .setPointMarker(point=>point.setSize({x:10,y:10}).setShape(PointShape.Circle).setFillStyle(new SolidFill({color: ColorHEX(this.#color)})))
                .setResultTable((table) =>
                    table
                        .setOrigin(UIOrigins.CenterBottom)
                        .setMargin({ bottom: 0 })
                        .setBackground((arrow) => arrow.setDirection(UIDirections.Down).setPointerAngle(80).setPointerLength(15))
                        .setTextFillStyle(new SolidFill({color: ColorHEX(this.#color)}))
                )
                .setGridStrokeXCut(true)
                .setAutoFitStrategy(undefined),
        )

        let mark = new marker(this.#base.addMarker(builder));
        mark.set_position(x, y);
        mark.show_label(false, false);
        mark.show_grid(false, false);

        this.#marks.push(mark);
        return mark;
    };

    //移除所有标峰
    remove_all_marks() {
        for (let m of this.#marks) {
            m.base().dispose();
        }
        this.#marks.length = 0;
    };
};

class legend_box {
    #lb = undefined;

    constructor(lb) {
        this.#lb = lb;
        //自动隐藏曲线名超界的部分
        this.#lb.setAutoDispose({
            type: 'max-width',
            maxWidth: 0.8
        });
        //默认无标题
        this.#lb.setTitle('');
        //默认隐藏
        this.#lb.setVisible(false);
        // this.#lb.setPadding(0);
        // this.#lb.setPosition({ x:100,y:50});
        // this.#lb.setMargin(4)
    }

    //设置图例标题
    set_title(t) {
        this.#lb.setTitle(t);
    };

    //获取图例标题
    get_title() {
        this.#lb.getTitle();
    };

    //添加图例组件
    add(s) {
        this.#lb.add(s.base());
    };

    remove(s) {
        let entries = this.#lb.entries;
        for (let i = entries.length - 1; i >= 0; i--) {
            let entry_name = entries[i].entry.getText();
            if (entry_name === s.name()) {
                entries[i].entry.dispose();
                entries.splice(i, 1);
            }
        }
        //this.#lb.setVisible(entries.length > 0);
    };

    remove_all() {
        let entries = this.#lb.entries;
        for (let i = entries.length - 1; i >= 0; i--) {
            entries[i].entry.dispose();
        }
        entries.length = 0;
        this.#lb.setVisible(false);
    };

    //隐藏图例
    set_visible(v) {
        this.#lb.setVisible(v);
    };

    //获取图例可见性
    is_visible() {
        return this.#lb.getVisible();
    };

    //设置图例按钮颜色
    set_color(color,line){
        this.#lb.setEntries((entry,component)=>{
            if(line===component){
                entry.setButtonOnFillStyle(new SolidFill({color: ColorHEX(color)}))
            }
        })
    }
}

class marker {
    #base = undefined;

    constructor(base) {
        this.#base = base;
    }

    base() {
        return this.#base;
    };

    set_caption(txt) {
        this.#base.setResultTable(
            (table) => table.setContent([
                [txt]
            ]).setMargin(0),
            (axis) => axis.addCustomTick(UIElementBuilders.PointableTextBox).setAllocatesAxisSpace(false)
        );
    };

    show_caption(show) {
        this.#base.setResultTableVisibility(show ? UIVisibilityModes.always : UIVisibilityModes.never);
    };

    show_point(show) {
        this.#base.setPointMarkerVisibility(show ? UIVisibilityModes.always : UIVisibilityModes.never);
    };
    set_position(x, y) {
        this.#base.setPosition({
            x: x,
            y: y
        });
    };

    get_position() {
        return this.#base.getPosition();
    };

    //显示坐标轴标签
    show_label(x, y) {
        this.#base.setTickMarkerXVisibility(x ? UIVisibilityModes.always : UIVisibilityModes.never);
        this.#base.setTickMarkerYVisibility(y ? UIVisibilityModes.always : UIVisibilityModes.never);
    };

    //显示坐标轴网格线
    show_grid(x, y) {
        this.#base.setGridStrokeXVisibility(x ? UIVisibilityModes.always : UIVisibilityModes.never);
        this.#base.setGridStrokeYVisibility(y ? UIVisibilityModes.always : UIVisibilityModes.never);
    };

    //坐标轴网格线颜色,粗细
    set_grid_prop(color, size) {
        this.#base.setGridStrokeXStyle((LineStyle) =>
            LineStyle.setFillStyle(new SolidFill({
                color: ColorHEX(color)
            })).setThickness(size)
        );
        this.#base.setGridStrokeYStyle((LineStyle) =>
            LineStyle.setFillStyle(new SolidFill({
                color: ColorHEX(color)
            })).setThickness(size)
        );
    };
}