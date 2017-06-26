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
        ],
        options2: [{
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
                {
                    'name': '便衣',
                    'type': 'p17',
                    'style': 'url("../popup_image/p17.png")',
                },
                {
                    'icon': '',
                    'name': '',
                },
            ]
        }, ],
        table: [{
            'title': '相似度',
            'list': [1, 2, 3, 4, 5, 6, 7, 8, 9]
        }, {
            'title': '相似度',
            'list': [1, 2, 3, 4, 5, 6, 7, 8, 9]
        }, {
            'title': '相似度',
            'list': [1, 2, 3, 4, 5, 6, 7, 8, 9]
        }]
    },
});