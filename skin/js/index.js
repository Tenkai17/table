//遥感数据
"use strict";

define(function() {

    var binding = function () {
        var thisFn = this;

        alert("123")
        // 初始數據加載
        //thisFn.getData("", "", "", 1, 10);
    };


    var getHtmlOne = function (data) {
        var oTbody = document.getElementById("main-tbody"),
            json = null,
            htmlArray = [],
            html;

        var oTemp = "<tr class='list__click'>" +
            "<td>{$id}</td>" +
            "<td>{$pm10}</td>" +
            "<td>{$pm25}</td>" +
            "<td>{$so2}</td>" +
            "<td><span class='main-showBtn' data-id='{$id}'>[详细]</span></td>" +
            "</tr>";

        for (var a = 0, len = data.length; a < len; a++) {
            json = data[a];

            html = oTemp.replace("{$id}", filterModule.empty(json.id));
            html = html.replace("{$pm10}", filterModule.empty(json.pm10));
            html = html.replace("{$pm25}", filterModule.empty(json.pm25));
            html = html.replace("{$so2}", filterModule.empty(json.so2));
            html = html.replace("{$id}", filterModule.empty(json.id));
            htmlArray[a] = html;
        }
        oTbody.innerHTML = htmlArray.join("");
    };

    var getHtmlTwo = function (data) {
        var oTbody = document.getElementById("main-tbody"),
            oTemp = document.getElementById("temp"),
            json = null,
            htmlArray = [],
            html;

        for (var a = 0, len = data.length; a < len; a++) {
            json = data[a];

            html = oTemp.innerHTML.split("{$id}").join(filterModule.empty(json.id));
            html = html.split("{$pm10}").join(filterModule.empty(json.pm10));
            html = html.split("{$pm25}").join(filterModule.empty(json.pm25));
            html = html.split("{$so2}").join(filterModule.empty(json.so2));
            html = html.split("{$id}").join(filterModule.empty(json.id));
            htmlArray[a] = html;
        }
        oTbody.innerHTML = htmlArray.join("");
    };



    // 数据获取
    var getData = function (province, city, area, num, pageSize) {
        var thisFn = this;

        popupModule.loadShow();
        var moreBtn = document.getElementsByClassName("js-main-moreBtn")[0];
        var oTbody = document.getElementById("main-tbody");
        if(num && num === 1){oTbody.innerHTML = "";}
        moreBtn.innerText = "加载更多";

        ajaxModule.data({
            method: 'GET',
            url: "../skin/airData--airQualityPageQuery.json",
            type: 'JSON',
            data: {
                provinceId: province,
                cityId: city,
                countyId: area,
                pageNum: num,
                pageSize: pageSize
            },
            success: function (data) {
                popupModule.loadHide();
                var list = data.content.list;
                if(list){
                    thisFn.getHtmlOne(list);
                    // or
                    //thisFn.getHtmlTwo(list);


                    //下拉加载更多
                    if(num+1 > data.content.pages){
                        moreBtn.innerText = "没有更多";
                    }
                    moreBtn.onclick = function () {
                        if(num+1 > data.content.pages){
                            moreBtn.innerText = "没有更多";
                        }else{
                            num += 1;
                            thisFn.getData(province, city, area, num, 10);
                        }
                    }

                    //详细信息
                    setTimeout(function () {
                        var showBtn = document.getElementsByClassName("main-showBtn"),
                            dataId,
                            time,
                            smoke;
                        for(var a = 0, len = showBtn.length; a < len; a++){
                            showBtn[a].onclick = function () {
                                dataId = this.getAttribute("data-id");
                                smoke = this.getAttribute("data-smoke");
                                time = this.getAttribute("data-time");
                                thisFn.defShow(dataId);
                                thisFn.getDetData(dataId, smoke, time);
                            }
                        }
                    },200);
                }else{
                    setTimeout(function () {
                        popupModule.error("网络错误", function () {});
                    },1000);
                    return false;
                }
            },
            error: function () {
                setTimeout(function () {
                    popupModule.error("网络错误", function () {});
                },500);
                return false;
            }
        });
    };

    // 弹出详细页
    var defShow = function () {
        var hideBtn = document.getElementById("det-hideBtn"),
            detPanel = document.getElementById("det-panel");

        //显示详细页
        detPanel.setAttribute("target-display","block");
        setTimeout(function () {
            detPanel.style.bottom = "0";
        },100);

        //隐藏详细页
        hideBtn.onclick = function () {
            detPanel.style.bottom = "1000px";
            setTimeout(function () {
                detPanel.setAttribute("target-display","none");
            },200);
        }
    };

    // 详细页数据获取
    var getDetData = function (id, smoke, time) {
        var thisFn = this;

        popupModule.loadShow();

        ajaxModule.data({
            method: 'GET',
            url: "/api/v1/rsStandardByLicense",
            type: 'JSON',
            data: {
                license: id,
                smoke: smoke,
                date: time,
                pageNum: 1,
                pageSize: 10
            },
            success: function (data) {
                popupModule.loadHide();
                var list = data.content.list,
                    page = 1;
                if(list){
                    var title = document.getElementById("det-header-title");
                    title.innerText = id;
                    thisFn.getDetHtml(list);
                }else{
                    setTimeout(function () {
                        popupModule.error("网络错误", function () {});
                    },1000);
                    return false;
                }
            },
            error: function () {
                setTimeout(function () {
                    popupModule.error("网络错误", function () {});
                },500);
                return false;
            }
        });
    }

    // 详细页数据处理
    var getDetHtml = function (json) {
        var oTbody = document.getElementById("det-tbody"),
            oTemp = document.getElementById("dte-temp"),
            htmlArray = [],
            html;

        for (var a = 0, len = json.length; a < len; a++) {
            html = oTemp.innerHTML.split("{$rowno}").join((a+1) === undefined ? "--" : (a+1));
            html = html.split("{$name}").join(json[a].name === undefined ? "--" : json[a].name);
            html = html.split("{$time}").join(json[a].monitorTimeStr === undefined ? "--" : json[a].monitorTimeStr);
            html = html.split("{$smoke}").join(json[a].smoke === undefined ? "--" : json[a].smoke);
            htmlArray[a] = html;
        }
        oTbody.innerHTML = htmlArray.join("");
    };

    return {
        binding: binding,
        defShow: defShow,
        getData: getData,
        getHtmlOne: getHtmlOne,
        getHtmlTwo: getHtmlTwo,
        getDetData: getDetData,
        getDetHtml: getDetHtml
    }

});

require(['index'], function(me){
        me.binding();
});