// 模块加载
require([
    '../js/vue.min.js',
    "esri/config",
    "esri/layers/WebTileLayer",
    "esri/tasks/Locator",

    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/widgets/BasemapToggle",

    "esri/PopupTemplate",
    "esri/layers/FeatureLayer",

    'esri/geometry/Point',
    'esri/geometry/Polyline',
    'esri/geometry/Polygon',
    'esri/symbols/PointSymbol3D',

    "esri/symbols/SimpleMarkerSymbol",
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/PictureMarkerSymbol',
    'esri/Graphic',

    "dojo/domReady!",
], function(Vue, esriConfig,
    WebTileLayer, Locator,
    Map, MapView, SceneView,
    BasemapToggle,
    PopupTemplate, FeatureLayer,
    Point, Polyline, Polygon, PointSymbol3D,
    SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, PictureMarkerSymbol, Graphic) {

    esriConfig.request.corsEnabledServers.push("a.tile.openstreetmap.org",
        "b.tile.openstreetmap.org", "c.tile.openstreetmap.org", 'webapps-cdn.esri.com', 'api.mapbox.com');

    //===================================== 地图生成 ===============================//

    // 街道图层
    // var osmLayer = new OpenStreetMapLayer({
    //     opacity: .6
    // });
    var osmLayer = new WebTileLayer({
        urlTemplate: "https://api.mapbox.com/styles/v1/oyhw92/cj15up56f001b2sk8fqtnsmoc/tiles/256/{level}/{col}/{row}@2x?access_token=pk.eyJ1Ijoib3lodzkyIiwiYSI6ImNqMTV0dXo5OTAwMmoycXBmMnJnNWRpcHUifQ.dWgeV9El8tUNY-YM7_hKtA",
    });

    var map = new Map({
        basemap: "satellite",
        ground: "world-elevation",
        // layers: [osmLayer],
    });

    // 设定地图挂载处 默认坐标 缩放比例
    var view = new SceneView({
        container: "viewDiv",
        map: map,
        center: [114.165927, 22.697654],
        zoom: 12,
        // constraints: {
        //     minZoom: 13,
        //     maxZoom: 13,
        //     rotationEnabled: false
        // }
    });

    // 坐标获取
    // var locatorTask = new Locator({
    //     url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
    // });

    // 倾斜角度
    function viewInit() {
        view.then(function() {
                return view.goTo({
                    // tilt: 60,
                    // center: [114.165927, 22.667654],
                    // zoom: 13,
                });
            })
            // .then(pathInit)
            // .then(buildingInit)
            // .then(dataInit)
            .then(viewPointsInit);
    }

    // 缩写
    const v = view.graphics;

    function each(arr, fn) {
        var l = arr.length;
        if (l === 0) {
            return;
        }
        for (var i = 0; i < l; i++) {
            fn(arr[i]);
        }
    }

    //============================================== 数据 =============================================//

    // UI图标
    var pic_building = ['enterprise', 'monitor', 'Park'],
        pic_car = ['bus', 'car', 'truck', 'Dangerous'];

    //============================================== 绘图 ==============================================//

    function pathInit() {
        // 街道描线
        ajax({
            url: './json/jiedao.json',
            method: 'get',
            fn: function(data) {
                var jiedao = data;
                for (var i = 0; i < 11; i++) {
                    v.add(getActiveLine({
                        path: jiedao[i],
                        color: [0, 255, 0]
                    }));
                }
            }
        });
    }

    function buildingInit() {
        ajax({
            url: './json/lg.building.json',
            method: 'get',
            fn: function(data) {
                var lgData = [],
                    data = data,
                    len = data.length,
                    Dtype, Dcoordinates, l;
                for (var i = 0; i < len; i++) {
                    Dtype = data[i].geometry.type;
                    Dcoordinates = data[i].geometry.coordinates;
                    l = Dcoordinates.length;
                    if (Dtype === 'Polygon') {
                        if (l === 1) {
                            lgData.push(Dcoordinates[0]);
                        } else {
                            while (l--) {
                                lgData.push(Dcoordinates[l]);
                            }
                        }
                    }
                }
                k = lgData.length;

                function fps(data, cut, done, delay) {
                    var resolve = k < cut ? data.splice(0, k) : data.splice(0, cut);
                    done(resolve);
                    if (data.length > 0) {
                        setTimeout(fps, delay, lgData, 100, done, 1000);
                    }
                }

                function done(data) {
                    for (var i = 0, l = data.length; i < l; i++) {
                        getActive3DLine(lgData[i], r(18) + 5);
                    }
                }
                fps(lgData, 100, done, 1000);
            }
        });
    }

    //=====================================  特殊点 =========================================//

    const view_points_name = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16'],
        view_points = {
            p1: [],
            p2: [],
            p3: [],
            p4: [],
            p5: [],
            p6: [],
            p7: [],
            p8: [],
            p9: [],
            p10: [],
            p11: [],
            p12: [],
            p13: [],
            p14: [],
            p15: [],
            p16: [],
        },
        num = 20;

    Object.setPrototypeOf(view_points, null);

    function viewPointsInit() {
        ajax({
            url: './json/viewPoints.json',
            method: 'get',
            fn: function(data) {
                var pathCollection = data,
                    pathArr = [],
                    index = 0;
                each(view_points_name, function(el) {
                    pathArr[index++] = pathCollection.splice(0, num);
                });
                index = 0;
                each(pathArr, function(el) {
                    pushAlarmPic(el, view_points_name[index++]);
                });
            }
        });
    }

    //========================================= websocket数据接口 =======================================//

    function dataInit() {
        // 解除click限制
        // document.body.removeChild(mask);

        // 初始化接口
        var socket = new WebSocket('ws://qhdata.tk/DV_LG/wscHandler/SzBaiduNavCar');
        var pointsObj = Object.create(null), // 保存车辆信息
            uid = 0, // 车辆ID
            count = 0; // 已渲染车辆数量
        // carType,
        // total = {
        //     car: 0,
        //     bus: 0,
        //     truck: 0,
        //     Dangerous: 0
        // },
        // randomRemove = [],
        // randomNum = 0,
        // uids = [];

        // function updateTotal(type) {
        //     switch (type) {
        //         case 0:
        //             total.bus++;
        //             break;
        //         case 1:
        //             total.car++;
        //             break;
        //         case 2:
        //             total.truck++;
        //             break;
        //         case 3:
        //             total.Dangerous++;
        //             break;
        //     }
        // }

        // function removeTotal(type) {
        //     switch (type) {
        //         case 0:
        //             total.bus--;
        //             break;
        //         case 1:
        //             total.car--;
        //             break;
        //         case 2:
        //             total.truck--;
        //             break;
        //         case 3:
        //             total.Dangerous--;
        //             break;
        //     }
        // }

        // 最大渲染车辆数量
        const max_num = 1000;

        // 添加点
        function addPoint(uid, carType, data) {
            data.lng -= 0.005;
            data.lat += 0.002;

            // updateTotal(carType);

            var p = getActivePic({
                longitude: data.lng,
                latitude: data.lat,
                type: pic_car[carType]
            });

            pointsObj[uid] = p;
            v.add(p);
            count++;
        }

        // 移除点
        function removePoint(uid, carType) {
            // removeTotal(carType);
            v.remove(pointsObj[uid]);
            count--;
        }

        // 打开Socket
        socket.onopen = function(event) {
            // 监听消息
            socket.onmessage = function(event) {
                if (event.data.startsWith('{"r')) {
                    // hack
                    // randomNum = r(10);
                    // uids = Object.keys(pointsObj).splice(0, randomNum);
                    // var len = uids.length;
                    // while (len--) {
                    //     randomRemove.push(pointsObj[uids[len]]);
                    // };
                    // v.removeMany(randomRemove);
                    // count -= randomNum;
                    // randomRemove = [];

                    // 数据不可用
                    // var removeData = eval('(' + event.data + ')'),
                    //     removeArr = [];
                    // console.log(Object.keys(pointsObj).sort());
                    // for (var m in removeData.rMap) {
                    // Reflect.has(pointsObj, m);
                    //     if (m[1] > 5) {
                    //         console.log(m);
                    //     }
                    // points_arr[m] && removeArr.push(points_arr[m]);
                    // }
                    // socket.close();
                    // v.removeMany(removeArr);
                    // removeArr = [];
                } else {
                    var data = JSON.parse(event.data);
                    uid = data.vechid;
                    carType = uid[0] % 4;
                    var flag = uid[1];
                    if (flag > 5) {
                        if (Reflect.has(pointsObj, uid)) {
                            removePoint(uid, carType);
                            addPoint(uid, carType, data);
                        } else if (count < max_num) {
                            addPoint(uid, carType, data);
                        }
                    }
                    // console.log(total.bus, total.car, total.truck, total.Dangerous, count);
                }
            };

            // 监听Socket的关闭
            socket.onclose = function(event) {
                console.log('Client notified socket has closed', event);
            };

            // 关闭Socket.... 
            // socket.close();
        };
    }

    //===================================== 缓冲时间 =========================================//

    // 加载地球缓冲时间
    setTimeout(viewInit, 2000);

    //===================================== 模板渲染 =========================================//



    new Vue({
        el: '#popup_container',
        data: {
            type: ['消防', '危化品', '高危企业', '危险处', '城管'],
            options: [{
                    'class': 'select1',
                    'option': [{
                            'name': '隐患点',
                            'type': 'p1',
                            'style': 'url("../popup_image/p1.png")',
                        }, {
                            'name': '消防车',
                            'type': 'p2',
                            'style': 'url("../popup_image/p2.png")',
                        },
                        {
                            'name': '消防栓',
                            'type': 'p3',
                            'style': 'url("../popup_image/p3.png")',
                        },
                        {
                            'name': '关闭自动预警监测',
                        }
                    ]
                },
                {
                    'class': 'select2',
                    'option': [{
                            'name': '一类危化品',
                            'type': 'p4',
                            'style': 'url("../popup_image/p4.png")',
                        }, {
                            'name': '二类危化品',
                            'type': 'p5',
                            'style': 'url("../popup_image/p5.png")',
                        },
                        {
                            'name': '三类危化品',
                            'type': 'p6',
                            'style': 'url("../popup_image/p6.png")',
                        },
                        {
                            'name': '关闭自动预警监测',
                        }
                    ]
                },
                {
                    'class': 'select3',
                    'option': [{
                            'name': '一类',
                            'type': 'p7',
                            'style': 'url("../popup_image/p7.png")',
                        }, {
                            'name': '二类',
                            'type': 'p8',
                            'style': 'url("../popup_image/p8.png")',
                        },
                        {
                            'name': '三类',
                            'type': 'p9',
                            'style': 'url("../popup_image/p9.png")',
                        },
                        {
                            'name': '关闭自动预警监测',
                        }
                    ]
                },
                {
                    'class': 'select4',
                    'option': [{
                            'name': '消防隐患点',
                            'type': 'p10',
                            'style': 'url("../popup_image/p10.png")',
                        }, {
                            'name': '交通隐患点',
                            'type': 'p11',
                            'style': 'url("../popup_image/p11.png")',
                        },
                        {
                            'name': '三防隐患点',
                            'type': 'p12',
                            'style': 'url("../popup_image/p12.png")',
                        },
                        {
                            'name': '关闭自动预警监测',
                        }
                    ]
                },
                {
                    'class': 'select4',
                    'option': [{
                            'name': '协警',
                            'type': 'p13',
                            'style': 'url("../popup_image/p13.png")',
                        }, {
                            'name': '城管',
                            'type': 'p14',
                            'style': 'url("../popup_image/p14.png")',
                        },
                        {
                            'name': '公安',
                            'type': 'p15',
                            'style': 'url("../popup_image/p15.png")',
                        },
                        {
                            'name': '武警',
                            'type': 'p16',
                            'style': 'url("../popup_image/p16.png")',
                        },
                    ]
                },
            ],
            popupData: [{
                'table': [{
                    'title': '相似度',
                    'list': [0, 0, 0, 0, 0, 0, 0, 0, 0]
                }, {
                    'title': '相似度',
                    'list': [0, 0, 0, 0, 0, 0, 0, 0, 0]
                }, {
                    'title': '相似度',
                    'list': [0, 0, 0, 0, 0, 0, 0, 0, 0]
                }],
                'similar': {
                    'top': 'sTop',
                    'mid': 'sMid',
                    'bot': 'sBot'
                },
                'current': {
                    'top': 'cTop',
                    'bot': 'cBot'
                },
                'blank': {
                    'top': 'bTop',
                    'bLeft': 'bLeft',
                    'bRight': 'bRight'
                }
            }],
            // table: [{
            //     'title': '相似度',
            //     'list': []
            // }, {
            //     'title': '相似度',
            //     'list': []
            // }, {
            //     'title': '相似度',
            //     'list': []
            // }],
            view_points_selected: [],
            allCheckedbox: [],
        },
        computed: {
            allTarget: function() {
                return Array.from(select_option.getElementsByTagName('a'));
            },
            selectedTarget: function() {
                return this.allTarget.filter(function(el) {
                    return el.children[0];
                });
            },
            alarmTarget: function() {
                return this.allTarget.filter(function(el) {
                    return !el.children[0];
                });
            },
        },
        methods: {
            // 提交按钮
            submit: function() {
                event.preventDefault();
                clearMap();

                each(this.selectedTarget, el => {
                    if (el.className === 'on') {
                        this.allCheckedbox.push(el.children[0].innerHTML);
                    }
                });

                if (this.allCheckedbox.length === 0) {
                    select.style = 'transform:translate(-50%,-50%) scale(0);';
                    return;
                } else {
                    this.selectedPointShow(this.allCheckedbox);
                    select.style = 'transform:translate(-50%,-50%) scale(0);';
                    // this.selectHide();
                    this.view_points_selected.length = [];
                    this.allCheckedbox = [];
                }
            },
            selectedPointShow: function(arr) {
                each(arr, el => {
                    v.addMany(view_points[el]);
                });
            },
            // 显示选择框
            showSelect: function() {
                select.style = 'transform:translate(-50%,-50%) scale(1);';
            },
            // 清空按钮
            hideSelect: function() {
                each(this.allTarget, function(el) {
                    el.className = '';
                });
                select.style = 'transform:translate(-50%,-50%) scale(0);';
            },
            // 隐藏显示详情框
            showPopup: function(id) {
                var arr = new Array(9).fill(id);
                if (id < 300) {
                    popup.style = 'transform:scale(1)';
                    this.$set(this.popupData[0].table[0], 'list', arr);
                    this.$set(this.popupData[0].table[1], 'list', arr);
                    this.$set(this.popupData[0].table[2], 'list', arr);
                }
            },
            hidePopup: function() {
                popup.style = 'transform:scale(0)';
            },
        },
        mounted() {
            // 点击图标变色
            select_option.addEventListener('click', function() {
                var tar = event.target;
                // 处理预警图标
                if (tar.tagName === 'A') {
                    if (!tar.children[0]) {
                        if (tar.className === '') {
                            tar.className = 'on';
                            tar.innerHTML = '开启自动预警监测';
                        } else {
                            tar.className = '';
                            tar.innerHTML = '关闭自动预警监测';
                        }
                    } else {
                        tar.className = tar.className === '' ? 'on' : '';
                    }
                }
                // 点击图片处理
                if (tar.tagName === 'I') {
                    tar.parentNode.className = tar.parentNode.className === '' ? 'on' : '';
                }
            });

            // 监听全图点击
            view.on("click", (e) => {
                var screenPoint = {
                    x: e.x,
                    y: e.y
                };
                popup.style = 'transform:scale(0)';
                select.style = 'transform:translate(-50%,-50%) scale(0);';
                view.hitTest(screenPoint).then((response) => {
                    var result = response.results[0];
                    if (result) {
                        var lon = result.mapPoint.longitude;
                        var lat = result.mapPoint.latitude;
                        this.showPopup(result.graphic.uid);
                    }
                });
            });
        }
    });


    //========================================================= 绘图API ==================================================//

    // 内部使用
    function getInfo(el) {
        var arr = [];
        for (var i = 0, len = el.length; i < len; i++) {
            arr.push({
                fieldName: el[i]
            });
        }
        return arr;
    }

    // 自动填充区域
    function getFill(obj) {
        var {
            rings,
            color,
            o_color,
            width,
            info
        } = obj;
        var polygon = new Polygon({
                rings: rings
            }),
            fillSymbol = new SimpleFillSymbol({
                color: color,
                outline: {
                    color: o_color,
                    width: width
                }
            });
        return info ? v.add(new Graphic({
            geometry: polygon,
            symbol: fillSymbol,
            attributes: info,
            popupTemplate: {
                title: "{Name}",
                content: [{
                    type: "fields",
                    fieldInfos: getInfo(Object.keys(info))
                }]
            }
        })) : v.add(new Graphic({
            geometry: polygon,
            symbol: fillSymbol,
        }));
    }

    // 自定义点的工厂函数+简易动画
    function pointFactory(obj) {
        var {
            position_arr,
            color,
            size,
            o_color,
            width,
        } = obj,
        arr = [],
            markerSymbol = new SimpleMarkerSymbol({
                color: color,
                size: size,
                outline: {
                    color: o_color,
                    width: width
                }
            }),
            start = 0;
        for (var i = 0, len = position_arr.length; i < len; i++) {
            var point = new Point({
                longitude: position_arr[i][0],
                latitude: position_arr[i][1]
            });
            arr.push(new Graphic({
                geometry: point,
                symbol: markerSymbol,
            }));
        }

        var render = function() {
            v.remove(arr[start]);
            start++;
            v.add(arr[start]);
            if (start === arr.length) {
                v.remove(arr[start]);
                start = 0;
                v.add(arr[start]);
            }
        };

        // (function loop() {
        //     requestAnimationFrame(loop);
        //     render();
        // })();

        // return setInterval(render, 500);
    }

    // 动态添加点
    function getActivePoint(obj) {
        var {
            longitude,
            latitude,
            color,
            size,
            o_color,
            width,
            info
        } = obj;
        var point = new Point({
                longitude: longitude,
                latitude: latitude
            }),
            markerSymbol = new SimpleMarkerSymbol({
                color: color,
                size: size,
                outline: {
                    color: o_color,
                    width: width
                }
            });
        return info ? v.add(new Graphic({
            geometry: point,
            symbol: markerSymbol,
            attributes: info,
            popupTemplate: {
                title: "{Name}",
                content: [{
                    type: "fields",
                    fieldInfos: getInfo(Object.keys(info))
                }]
            }
        })) : v.add(new Graphic({
            geometry: point,
            symbol: markerSymbol,
        }));
    }

    // 动态添加图片
    function getActivePic(obj) {
        var {
            longitude,
            latitude,
            type,
        } = obj;
        width = obj.width || '40px';
        height = obj.height || '40px';
        yoffset = obj.yoffset || 0;
        xoffset = obj.xoffset || 0;
        angle = obj.angle || 0;
        var point = new Point({
                longitude: longitude,
                latitude: latitude
            }),
            symbol = new PictureMarkerSymbol({
                url: './images/' + type + '.png',
                width: width,
                height: height,
                yoffset: yoffset,
                xoffset: xoffset,
                angle: angle,
            });
        return new Graphic({
            geometry: point,
            symbol: symbol,
        });
    }

    // 批量添加点
    function getActivePointArr(obj) {
        var {
            pointArr,
            // color,
            size,
            // o_color,
            // width,
        } = obj,
        arr = [];
        for (var l = pointArr.length; l--;) {
            var point = new Point({
                    longitude: pointArr[l][0],
                    latitude: pointArr[l][1]
                }),
                markerSymbol = new SimpleMarkerSymbol({
                    color: [255, 255, 255, .3],
                    size: size,
                    // style: 'square',
                    // outline: {
                    //     color: o_color,
                    //     width: width
                    // }
                });
            arr.push(new Graphic({
                geometry: point,
                symbol: markerSymbol,
            }));
        }
        v.addMany(arr);
    }

    // 批量添加大头针
    function getActive3DArr(obj) {
        var {
            path,
        } = obj;
        for (var len = path.length; len--;) {
            var polyline = new Polyline([
                    [path[len][0], path[len][1], 0],
                    [path[len][0], path[len][1], 1500]
                ]),
                lineSymbol = new SimpleLineSymbol({
                    color: [255, 255, 255],
                    width: 1
                });
            var polylineGraphic = new Graphic({
                geometry: polyline,
                symbol: lineSymbol
            });

            var point = new Point({
                    x: path[len][0],
                    y: path[len][1],
                    z: 1500
                }),
                symbol = new PictureMarkerSymbol({
                    url: './images/' + pic_building[r(3)] + '.png',
                    width: '18px',
                    height: '18px'
                });

            var p = new Graphic({
                geometry: point,
                symbol: symbol
            });
            v.addMany([polylineGraphic, p]);
        }
    }

    // 自动描线
    function getActiveLine(obj) {
        var {
            path,
            // color
        } = obj;
        color = obj.color || [255, 0, 0];
        var polyline = new Polyline({
                paths: path,
            }),
            lineSymbol = new SimpleLineSymbol({
                color: color,
                width: 2,
            });
        return new Graphic({
            geometry: polyline,
            symbol: lineSymbol,
        });
    }

    // 动画函数
    function pathAnimate(obj) {
        var {
            path,
            color
        } = obj;
        pointFactory({
            position_arr: path,
            color: [255, 255, 255, .9],
            size: '10px',
            o_color: [255, 255, 255, 0],
            width: 0
        });
        getActiveLine(obj);
    }

    // 3D图形
    function getActive3DBuilding(obj) {
        var {
            longitude,
            latitude,
            height,
            // shape,
            // color,
            info
        } = obj;
        var point = new Point({
                longitude: longitude,
                latitude: latitude
            }),
            symbol = new PointSymbol3D({
                symbolLayers: [new ObjectSymbol3DLayer({
                    width: 40,
                    height: height,
                    depth: 40,
                    heading: 30,
                    resource: {
                        primitive: 'cube'
                    },
                    material: {
                        color: [255, 255, 255, .8]
                    }
                })]
            });
        return info ? v.add(new Graphic({
            geometry: point,
            symbol: symbol,
            attributes: info,
            popupTemplate: {
                title: "{Name}",
                content: [{
                    type: "fields",
                    fieldInfos: getInfo(Object.keys(info))
                }]
            }
        })) : v.add(new Graphic({
            geometry: point,
            symbol: symbol,
        }));
    }

    // 嵌套数组深拷贝
    function deepCopyArr(arr) {
        var res = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            res[i] = arr[i].slice();
        }
        return res;
    }

    // 3D立体线
    function getActive3DLine(path, layer) {
        // 会出现空数据
        if (!path) {
            return;
        }
        // 楼层高度
        const height = 50,
            lineWidth = 1,
            lineColor = [255, 255, 255, .5];

        var path = path,
            len = path.length,
            arr = [],
            lineSymbol = new SimpleLineSymbol({
                color: lineColor,
                width: lineWidth
            });
        for (var k = 0; k < len; k++) {
            path[k].push(1);
        }
        for (var j = 0; j < layer; j++) {
            var newLine = deepCopyArr(path);
            var polyline = new Polyline(newLine);
            arr.push(new Graphic({
                geometry: polyline,
                symbol: lineSymbol
            }));
            for (var i = 0; i < len; i++) {
                newLine[i][2] += height * j;
            }
        }
        v.addMany(arr);
    }

    // 清空地图
    function clearMap() {
        each(view_points_name, el => {
            v.removeMany(view_points[el]);
        });
    }

    // 地图特殊点渲染
    function getAlarmPic(obj) {
        var {
            position,
            type
        } = obj;
        var point = new Point({
                longitude: position[0],
                latitude: position[1]
            }),
            symbol = new PictureMarkerSymbol({
                url: './images/' + type + '.png',
                width: '30px',
                height: '30px'
            });
        return new Graphic({
            geometry: point,
            symbol: symbol,
        });
    }

    function pushAlarmPic(arr, type) {
        each(arr, el => {
            var position = el;
            view_points[type].push(getAlarmPic({
                position: position,
                type: type
            }));
        });
    }



    // ajax请求
    function ajax(obj) {
        function parseData(obj) {
            var finalData = '';
            for (var key in obj) {
                finalData += key + '=' + obj[key] + '&';
            }
            return finalData.slice(0, -1);
        };
        var url = obj.url,
            method = obj.method.toLowerCase(),
            fn = obj.fn,
            data = obj.data,
            Data = parseData(data);
        var xhr = new XMLHttpRequest();
        if (method === 'get') {
            url = url + '?' + Data;
            Data = null;
        }
        xhr.open(method, url);
        if (method = 'post') {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.send(Data);
        xhr.onreadystatechange = function() {
            if (xhr.status == 200 && xhr.readyState == 4) {
                var result = JSON.parse(xhr.responseText);
                fn(result);
            }
        }
    }

    // // 在线绘图API封装
    // var pathClick = [],
    //     pathLine = [],
    //     pathPoint;

    // view.on("click", function(event) {
    //     var lat = Math.round(event.mapPoint.latitude * 100000) / 100000;
    //     var lon = Math.round(event.mapPoint.longitude * 100000) / 100000;

    //     view.popup.open({
    //         title: "[" + lon + ", " + lat + "],",
    //         // location: event.mapPoint
    //     });

    //     pathClick.push([lon, lat]);
    //     pathPoint = getActiveLine({
    //         path: pathClick,
    //         color: [0, 255, 0]
    //     });

    //     pathLine.push(pathPoint);
    //     v.add(pathPoint);

    //     locatorTask.locationToAddress(event.mapPoint).then(function(
    //         response) {
    //         var address = response.address.Match_addr;
    //         view.popup.content = address;
    //     });
    // });

    // delAll.addEventListener('click', () => {
    //     v.removeMany(pathLine);
    //     pathClick = [];
    // });

    // del.addEventListener('click', () => {
    //     v.remove(pathLine.pop());
    //     pathClick.pop();
    // });

    // log.addEventListener('click', () => {
    //     console.log(JSON.stringify(pathClick));
    // });

    // // 边界线
    // ajax({
    //     url: './World_AL6.GeoJson',
    //     method: 'get',
    //     fn: function(data) {
    //         var path1 = data.features[0].geometry.coordinates[1];
    //         v.add(getActiveLine({
    //             path: path1
    //         }));
    //     }
    // });

    // ajax({
    //     url: './World_AL5.GeoJson',
    //     method: 'get',
    //     fn: function(data) {
    //         var path = data.features[0].geometry.coordinates;
    //         getActiveLine({
    //             path: path[0]
    //         });
    //         getActiveLine({
    //             path: path[1]
    //         });
    //     }
    // });

    // getActivePic({
    //     longitude: 114.204927,
    //     latitude: 22.706654,
    //     type: 'lgMap',
    //     width: '1940px',
    //     height: '1540px',
    //     yoffset: -10,
    //     xoffset: -5,
    //     angle: -1
    // });

    // 随机数生成
    const r = num => Math.floor(Math.random() * num);


    //============================================= 遮罩层 ============================================//

    // function maskInit() {
    //     getFill({
    //         rings: [
    //             [110, 24],
    //             [116, 24],
    //             [116, 21],
    //             [110, 21]
    //         ],
    //         color: [0, 0, 255, .3],
    //         width: 4,
    //     });
    // }
});