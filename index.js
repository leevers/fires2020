
var global = {
    view: null,
    map: null
}

require(["esri/Map", "esri/Basemap", "esri/WebMap",
    "esri/views/SceneView", "esri/views/MapView",
    "esri/widgets/Search", "esri/widgets/Expand", "esri/widgets/LayerList", "esri/widgets/BasemapToggle", "esri/widgets/Popup",
    "esri/layers/GeoJSONLayer", "esri/layers/KMLLayer", "esri/layers/MapImageLayer", "esri/layers/BaseElevationLayer","esri/layers/ElevationLayer", 
    "esri/layers/FeatureLayer", "esri/layers/GeoRSSLayer", "esri/layers/WMSLayer", "esri/layers/GraphicsLayer", "esri/layers/GroupLayer",
    "esri/Graphic", "esri/geometry/Point", "esri/geometry/Extent", "esri/renderers/smartMapping/creators/relationship",
    "esri/geometry/SpatialReference", "esri/geometry/coordinateFormatter", "esri/geometry/projection", "esri/request", "esri/core/watchUtils", "esri/config",
    "./plugins/RasterLayer.js"],
 function (Map, Basemap, WebMap,
    SceneView, MapView,
    Search, Expand, LayerList, BasemapToggle, Popup,
    GeoJSONLayer, KMLLayer, MapImageLayer, BaseElevationLayer, ElevationLayer, 
    FeatureLayer, GeoRSSLayer, WMSLayer, GraphicsLayer, GroupLayer,
    Graphic, Point, Extent, relationshipRendererCreator,
    SpatialReference, coordinateFormatter, projection, esriRequest, watchUtils, esriConfig,
    RasterLayer)
{
    // esriConfig.request.proxyUrl = "http://localhost:8888/viewer/proxy/proxy.ashx?";

    //  var ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
    //      properties: {
    //          // exaggerates the actual elevations by 100x
    //          exaggeration: 3
    //      },

    //      load: function ()
    //      {
    //          this._elevation = new ElevationLayer({
    //              url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
    //          });

    //          // wait for the elevation layer to load before resolving load()
    //          this.addResolvingPromise(this._elevation.load());
    //      },

    //      // Fetches the tile(s) visible in the view
    //      fetchTile: function (level, row, col, options)
    //      {
    //          return this._elevation.fetchTile(level, row, col, options).then(
    //              function (data)
    //              {
    //                  var exaggeration = this.exaggeration;
    //                  for (var i = 0; i < data.values.length; i++)
    //                  {
    //                      data.values[i] = data.values[i] * exaggeration;
    //                  }

    //                  return data;
    //              }.bind(this)
    //          );
    //      }
    //  });

    // var basemapLayer1 = new WMSLayer({
    //     title: "neowms",
    //     url: "http://neowms.sci.gsfc.nasa.gov/wms/wms"
    // });
    // var basemapLayer2 = new WMSLayer({
    //     title: "meteeye",
    //     url: "http://wvs1.bom.gov.au/mapcache/meteye"
    // });
    // var customBasemap = new Basemap({
    //     baseLayers: [basemapLayer1, basemapLayer2]
    // });

    global.map = new Map({
        // basemap: customBasemap,
        basemap: "topo-vector",
        // ground: "world-elevation"
        // ground: {
        //     layers: [new ExaggeratedElevationLayer()]
        // }
        // spatialReference: SpatialReference.WGS84
    });

    // global.map = new WebMap({
    //     portalItem: { // autocasts as new PortalItem()
    //         id: "2168b5162d61432c8b3499818a2d60df"
    //     }
    // });

    global.view = new MapView({
        container: "viewDiv",
        map: global.map,
        zoom: 12,
        center: [150.5, -34.5], // longitude, latitude
        // spatialReference: SpatialReference.WGS84
    });

    // global.view.popup.autoOpenEnabled = true;

    var layerList = new LayerList({
        view: global.view,
        container: document.createElement("div"),
        listItemCreatedFunction: function (event)
        {
            var item = event.item;
            if (item.layer.type != "group")
            {
                var actionSections = [
                    [
                        // {
                        //     title: "Layer information",
                        //     className: "esri-icon-description",
                        //     id: "information"
                        // },
                        {
                            title: "Increase opacity",
                            className: "esri-icon-up",
                            id: "increase-opacity"
                        },
                        {
                            title: "Decrease opacity",
                            className: "esri-icon-down",
                            id: "decrease-opacity"
                        }
                    ]
                ];

                if(item.layer.fullExtent)
                {
                    actionSections[0].push({
                        title: "Go to full extent",
                        className: "esri-icon-zoom-out-fixed",
                        id: "full-extent"
                    });
                }

                item.actionsSections = actionSections;

                if (item.layer.legendEnabled)
                {
                    item.panel = {
                        content: "legend",
                        open: false
                    };
                }
            }
        }
    });
    
    layerListExpand = new Expand({
      expandIconClass: "esri-icon-layer-list",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
      // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
      view: global.view,
      content: layerList.domNode,
      label: "Layers",
      container: "layersDiv"
    });

    // global.view.ui.add(layerList, {
    //     position: "top-right"
    // });

    layerList.on("trigger-action", function (event)
    {
        // The layer visible in the view at the time of the trigger.
        var layer = event.item.layer;

        // Capture the action id.
        var id = event.action.id;

        if (id === "full-extent")
        {
            // If the full-extent action is triggered then navigate
            // to the full extent of the visible layer.
            if(layer.fullExtent)
            {
                this.view.goTo(layer.fullExtent);
            }
        }
        else if (id === "increase-opacity")
        {
            // If the increase-opacity action is triggered, then
            // increase the opacity of the GroupLayer by 0.25.

            if (layer.opacity < 1)
            {
                layer.opacity += 0.1;
            }
            if (layer.opacity > 1)
            {
                layer.opacity = 1;
            }
        }
        else if (id === "decrease-opacity")
        {
            // If the decrease-opacity action is triggered, then
            // decrease the opacity of the GroupLayer by 0.25.

            if (layer.opacity > 0)
            {
                layer.opacity -= 0.1;
            }
            if (layer.opacity < 0)
            {
                layer.opacity = 0;
            }
        }
        // else if (id === "information")
        // {
        //     // If the information action is triggered, then
        //     // open the item details page of the service layer.
        //     window.open(layer.url);
        // }
    });

     const searchWidget = new Search({
         view: global.view
     });
     global.view.ui.add(searchWidget, {
         position: "top-right"
     });

    var basemapToggle = new BasemapToggle({
        view: global.view,
        nextBasemap: "hybrid"
    });

    global.view.ui.add(basemapToggle, {
        position: "bottom-right"
    });

    global.view.when(function (viewWhen)
    {
/*
        projection.load().then( function(loadData)
        {
            try
            {
                var rasterLayer = new RasterLayer(null, {
                    opacity: 0.55
                });
                rasterLayer._setView(global.view, "windyDiv");
                rasterLayer.title = "Windy";

                global.view.on("drag", redraw);
                global.view.on("resize", function () { });
                // global.view.on("zoom-start", redraw);
                // global.view.on("pan-start", redraw);

                var layersRequest = esriRequest('./plugins/gfs.json', {
                    // content: {},
                    responseType: "json"
                });
                layersRequest.then(function (response)
                {
                    global.map.add(rasterLayer);
                    windy = new Windy({ canvas: rasterLayer._element, data: response.data });
                    redraw();
                }, function (error)
                {
                    console.log("Error: ", error.message);
                });

                function redraw()
                {
                    rasterLayer._element.width = global.view.width;
                    rasterLayer._element.height = global.view.height;

                    windy.stop();

                    var extent = projection.project(global.view.extent, SpatialReference.WGS84);
                    setTimeout(function ()
                    {
                        windy.start(
                            [[0, 0], [global.view.width, global.view.height]],
                            global.view.width,
                            global.view.height,
                            [[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]]
                        );
                    }, 500);
                }
            }
            catch(ex)
            {
                console.log(ex,ex.stack);
            }
        });
*/

        var imageryLayer = new WMSLayer({
            title: "Latest Imagery (Himawari8)",
            url: "https://sentinel.ga.gov.au/geoserver/public/wms",
            listMode: "hide-children",
            // opacity: 0.8,
            visible: false,
            sublayers: [
                {
                    title: "Latest Imagery",
                    name: "himawari8_mosaic"
                }]
        });

        global.map.add(imageryLayer);

        var hotspotLayer = new WMSLayer({
            title: "Hotspot Data (Sentinel)",
            url: "https://sentinel.ga.gov.au/geoserver/public/wms",
            listMode: "hide-children",
            visible: false,
            sublayers: [{
                title: "Current Hotspots",
                name: "hotspot_current"
            }]
        });

        global.map.add(hotspotLayer);

        // var mgrsLayer = new MapImageLayer({
        //     title: "MGRS Zones",
        //     url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/",
        //     listMode: "hide-children",
        //     visible: false
        // });

        // global.map.add(mgrsLayer);

        // var mgrsLayer = new KMLLayer({
        //     title: "MGRS Zones",
        //     url: "http://localhost:2020/data/56J/56J.kml"
        // })
        // global.map.add(mgrsLayer);

        // var mgrsLayer = new GeoJSONLayer({
        //     title: "MGRS Zones",
        //     url: "data/56J/56J.geojson"
        // })
        // global.map.add(mgrsLayer);

        var firmsLayer = new WMSLayer({
            title: "FIRM (NASA)",
            url: "https://firms.modaps.eosdis.nasa.gov/wms/key/d66e16633e88449045175b02a0789aa8/",
            // listMode: "hide-children",
            visible: false,
            sublayers: [{
                title: "VIIRS Fires - Past 24 Hours",
                name: "fires_viirs_24"
            },
            {
                title: "MODIS-Terra Fires - Past 24 Hours",
                name: "fires_terra_24"
            }]
        });

        global.map.add(firmsLayer);

        // https://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/NOAA_METAR_current_wind_speed_direction/MapServer/0
        var noaaMetarLayer = new FeatureLayer({
            // URL to the service
            // url: "https://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/NOAA_METAR_current_wind_speed_direction/MapServer/0",
            url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NOAA_METAR_current_wind_speed_direction_v1/FeatureServer/0",
            popupTemplate: {
                title: "NOAA METAR Wind",
                content: "Station: {STATION_NAME}<br>" + 
                    "Direction: {WIND_DIRECT}<br>" + 
                    "Speed: {WIND_SPEED}<br>" + 
                    "Gust: {WIND_GUST}<br>" + 
                    "MSLP: {PRESSURE}<br>" + 
                    "OBS_DATETIME: {OBS_DATETIME}<br>"
            },
            // renderer: {
            //     type: "simple", // autocasts as new SimpleRenderer()
            //     symbol: {
            //         type: "point",  // autocasts as new PointSymbol3D()
            //         symbolLayers: [{
            //           type: "icon",  // autocasts as new IconSymbol3DLayer()
            //           size: 8,  // points
            //           resource: { primitive: "triangle" },
            //           material: { color: "red" }
            //         }]
            //       },
            //     visualVariables: {
            //         axis: "heading",
            //         type: "rotation",
            //         field: "WIND_DIRECT",
            //         rotationType: "geographic"
            //     }
            // }
        });
        global.map.add(noaaMetarLayer);
        // noaaMetarLayer.when(function(whenLayer)
        // {
        //     var rotationVisualVariable = {
        //         axis: "heading",
        //         type: "rotation",
        //         field: "WIND_DIRECT",
        //         rotationType: "geographic"
        //       };
        //       whenLayer.renderer.visualVariables = [ rotationVisualVariable ];
        // });

        // https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0

        // var renderer = {
        //     type: "heatmap",
        //     colorStops: [
        //         { color: "rgba(63, 40, 102, 0)", ratio: 0 },
        //         { color: "#472b77", ratio: 0.083 },
        //         { color: "#4e2d87", ratio: 0.166 },
        //         { color: "#563098", ratio: 0.249 },
        //         { color: "#5d32a8", ratio: 0.332 },
        //         { color: "#6735be", ratio: 0.415 },
        //         { color: "#7139d4", ratio: 0.498 },
        //         { color: "#7b3ce9", ratio: 0.581 },
        //         { color: "#853fff", ratio: 0.664 },
        //         { color: "#a46fbf", ratio: 0.747 },
        //         { color: "#c29f80", ratio: 0.83 },
        //         { color: "#e0cf40", ratio: 0.913 },
        //         { color: "#ffff00", ratio: 1 }
        //     ],
        //     maxPixelIntensity: 25,
        //     minPixelIntensity: 0
        // };


        var modisLayer = new FeatureLayer({
            // URL to the service
            url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0",
            popupTemplate: {
                title: "MODIS Thermal Hotspot",
                content: "Brightness: {BRIGHTNESS}<br>" + 
                    "Brightness T31: {BRIGHT_T31}<br>" + 
                    "Scan: {SCAN}<br>" + 
                    "Track: {TRACK}<br>" + 
                    "Confidence: {CONFIDENCE}<br>" + 
                    "FRP: {FRP}<br>" + 
                    "ACQ_DATE: {ACQ_DATE}<br>"
            },
            // renderer: renderer
        });
        global.map.add(modisLayer);

        var createParams = {
            layer: modisLayer,
            view: global.view,
            field1: {
                field: "BRIGHTNESS"
            },
            field2: {
                field: "CONFIDENCE"
            },
            focus: "HH", // changes orientation of the legend
            numClasses: 3 // 3x3 grid (value can also be 2 or 4)
        };

        relationshipRendererCreator.createRenderer(createParams).then(function (createResponse)
        {
            // createResponse.renderer.uniqueValueInfos[0].symbol.color = "#FF0000";

            for(var i=0; i< createResponse.renderer.uniqueValueInfos.length;i++)
            {
                var currentUVI = createResponse.renderer.uniqueValueInfos[i];
                switch(currentUVI.value)
                {
                    case "HH":
                        {
                            currentUVI.symbol.color = "#FF0000";
                        }
                        break;
                    case "HM":
                        {
                            currentUVI.symbol.color = "#800000";
                        }
                        break;
                    case "HL":
                        {
                            currentUVI.symbol.color = "#400000";
                        }
                        break;
                    case "MH":
                        {
                            currentUVI.symbol.color = "#FFA500";
                        }
                        break;
                    case "MM":
                        {
                            currentUVI.symbol.color = "#805e00";
                        }
                        break;
                    case "ML":
                        {
                            currentUVI.symbol.color = "#402F00";
                        }
                        break;
                    case "LH":
                        {
                            currentUVI.symbol.color = "#FFFF00";
                        }
                        break;
                    case "LM":
                        {
                            currentUVI.symbol.color = "#808000";
                        }
                        break;
                    case "LL":
                        {
                            currentUVI.symbol.color = "#404000";
                        }
                        break;
                }
            }

            modisLayer.renderer = createResponse.renderer;
/*
            var updateParams = {
                renderer: createResponse.renderer,
                field1: {
                    field: "BRIGHTNESS"
                },
                field2: {
                    field: "CONFIDENCE"
                },
                focus: "HH", // changes orientation of the legend
                numClasses: 3, // 3x3 grid (value can also be 2 or 4)
                colors:[
                    "#000000",
                    "#880000",
                    "#FF0000",
                    "#000000",
                    "#008800",
                    "#00FF00",
                    "#000000",
                    "#000088",
                    "#0000FF"
                ]
            };
            try{
                relationshipRendererCreator.updateRenderer(updateParams).then(function(updateResponse)
                {
                    modisLayer.renderer = updateResponse.renderer;
                });
            }
            catch(ex)
            {
                console.log(ex,ex.stack);
            }
            */
        });

        var neowmsLayer = new WMSLayer({
            title: "neowms",
            url: "http://neowms.sci.gsfc.nasa.gov/wms/wms",
            sublayers: [
                {
                    title: "Active Fires (1 day - Terra/MODIS)",
                    name: "MOD14A1_D_FIRE"
                },
                {
                    title: "Active Fires (8 day - Terra/MODIS)",
                    name: "MOD14A1_E_FIRE"
                },
                {
                    title: "Active Fires (1 month - Terra/MODIS)",
                    name: "MOD14A1_M_FIRE"
                },
            ]
        });
        global.map.add(neowmsLayer);
/*
        var meteyeLayer = new WMSLayer({
            title: "Wind (MetEye)",
            url: "http://wvs1.bom.gov.au/mapcache/meteye",
            // listMode: "hide-children",
            sublayers: [
                // {
                //     title: "IDY03110_windkmh",
                //     name: "IDY03110_windkmh"
                // },
                // {
                //     title: "IDY03110_wind",
                //     name: "IDY03110_wind"
                // },
                // {
                //     title: "IDY03110_windspd",
                //     name: "IDY03110_windspd"
                // },
                {
                    title: "IDZ73089",
                    name: "IDZ73089"
                },
                {
                    title: "IDZ73006",
                    name: "IDZ73089"
                }
            ]
        });
        // http://wvs3.bom.gov.au/mapcache/meteye?TRANSPARENT=true&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&layers=IDZ73006%2CIDZ73089&TIMESTEP=0&BASETIME=202001070900&ISSUETIME=20200107072626&SRS=EPSG%3A4326&BBOX=108,-36,126,-18&WIDTH=256&HEIGHT=256
        // http://wvs3.bom.gov.au/mapcache/meteye?width=1920&height=977&bbox=16680203.817233719%2C-4133478.528764413%2C16826962.91154106%2C-4058799.552129897&format=image%2Fpng&request=GetMap&service=WMS&styles=&transparent=true&version=1.1.1&srs=EPSG%3A900913&layers=IDZ73006%2CIDZ73070_swell_dir%2CIDM00013%2CIDZ73068%2CIDZ73069%2CIDY03110_rain10m%2CIDZ73089%2CIDY03110_windspd%2CIDZ10030_coast%2CIDY03110_rh%2CIDBDM007%2CIDZ73070_swell2_small%2CIDY03110_dryblb
        global.map.add(meteyeLayer);
*/

        // firmsLayer.when( function ( layerWhen )
        // {
        //     // console.log(layerWhen);

        //     // layerWhen.spatialReference = SpatialReference.WGS84;

        //     layerWhen.allSublayers.items.forEach( function(item)
        //     {
        //         if(!item.title)
        //         {
        //             item.title = item.name;
        //         }
        //         console.log(item.name);
        //         console.log(item.title);
        //         console.log("");
        //     })
        // });


        // var sentinelLayer = new WMSLayer({
        //     title: "Sentinel All Layers",
        //     url: "https://sentinel.ga.gov.au/geoserver/public/wms",
        // });
        // global.map.add(sentinelLayer);
        // sentinelLayer.when( function ( hotspotThen )
        // {
        //     console.log(hotspotThen);

        //     hotspotThen.allSublayers.items.forEach( function(item)
        //     {
        //         console.log(item.name);
        //         console.log(item.title);
        //         console.log("");
        //     })
        // });
        esriConfig.geoRSSServiceUrl = "https://utility.arcgis.com/sharing/rss";

        var rssLayer = new GeoRSSLayer({
            title: "NSW RFS Major Incidents RSS Feed",
            url: "http://www.rfs.nsw.gov.au/feeds/majorIncidents.xml",
        });
        // rssLayer.when( function ( rssWhen )
        // {
        //     console.log(rssWhen);
        // });
        global.map.add(rssLayer);
    });

                                   addZoneOutline("56HKH","darkblue");

    addZoneOutline("56HJG","red"); addZoneOutline("56HKG","blue");      addZoneOutline("56HLG","yellow");

                                   addZoneOutline("56HKF","lightblue");

    
    // addZoneOutline("55HGB","magenta");

    var zoneGroupLayer = new GroupLayer({
        title: "Zones"
    })
    global.map.add(zoneGroupLayer);

    function addZoneOutline(zonePrefix, colour)
    {
        Promise.all([coordinateFormatter.load(), projection.load()]).then( function(loaded)
        {
            var locationSW = "0000000000";
            var locationNW = "000999";
            var locationNE = "9999999999";
            var locationSE = "999000";

            var swWGS84coordinate = coordinateFormatter.fromMgrs(zonePrefix + locationSW, SpatialReference.WGS84, "automatic");
            var nwWGS84coordinate = coordinateFormatter.fromMgrs(zonePrefix + locationNW, SpatialReference.WGS84, "automatic");
            var neWGS84coordinate = coordinateFormatter.fromMgrs(zonePrefix + locationNE, SpatialReference.WGS84, "automatic");
            var seWGS84coordinate = coordinateFormatter.fromMgrs(zonePrefix + locationSE, SpatialReference.WGS84, "automatic");

            var graphics = [];

            var outlineSymbol = {
                type: "simple-line",  // autocasts as new SimpleLineSymbol()
                color: colour,
                width: "2px",
                style: "short-dot"
            };

            var outlineAttributes = {
                "ZONE": zonePrefix,
                "color": colour,
            }

            var outlineExtent = new Extent({
                xmin: Math.min(swWGS84coordinate.x, nwWGS84coordinate.x),
                ymin: Math.min(swWGS84coordinate.y, seWGS84coordinate.y),
                xmax: Math.max(neWGS84coordinate.x, swWGS84coordinate.x),
                ymax: Math.max(neWGS84coordinate.y, nwWGS84coordinate.y),
                spatialReference: SpatialReference.WGS84
            })

            var outlineGraphic = new Graphic({
                geometry: outlineExtent,
                symbol: outlineSymbol,
                attributes: outlineAttributes,
                popupTemplate: {
                    title: "{ZONE}",
                    content: [{
                        // Pass in the fields to display
                        type: "fields",
                        fieldInfos: [{
                            fieldName: "ZONE",
                            label: "ZONE"
                        },{
                            fieldName: "color",
                            label: "Colout"
                        }]
                    }]
                }
            });

            var graphicsLayer = new GraphicsLayer({
                title: zonePrefix
            });

            graphicsLayer.fullExtent = outlineExtent.clone();

            graphicsLayer.add(outlineGraphic);

            zoneGroupLayer.add(graphicsLayer);
        });
    }

    var previousZone = "56HKG";

    watchUtils.watch(global.view,"stationary", function(event)
    {
        if(event == true)
        {
            Promise.all([coordinateFormatter.load(), projection.load()]).then( function(loaded)
            {
                var currentWGS84coordinate = projection.project(global.view.center, SpatialReference.WGS84);
                var currentMGRScoordinate = coordinateFormatter.toMgrs(currentWGS84coordinate, "automatic", 3, false);
                var locationPrefix = currentMGRScoordinate.substring(0,5);
                
                jQuery("#sixPrefix").val(locationPrefix);
            });
        }
    });

    jQuery("#sixButton").on("click", {}, function(event)
    {
        var sixCoord = jQuery("#sixInput").val();
        MGRStoLatLon(sixCoord);
    });
    

    function MGRStoLatLon(sixCoord)
    {
        Promise.all([coordinateFormatter.load(), projection.load()]).then( function(loaded)
        {
            
            var locationPrefix = jQuery("#sixPrefix").val();
            // var locationPrefix = "56HKG";
            try
            {
                // var currentWGS84coordinate = projection.project(global.view.center, SpatialReference.WGS84);
                // var currentMGRScoordinate = coordinateFormatter.toMgrs(currentWGS84coordinate, "automatic", 3, false);
                
                // locationPrefix = currentMGRScoordinate.substring(0,5);
                
                // jQuery("#sixPrefix").val(locationPrefix);
                // var locationPrefix = "56HKG676114";
                var locationString = locationPrefix + sixCoord;
                // var coord = coordinateFormatter.fromMgrs(locationString, SpatialReference.WGS84, "old-180-in-zone-56");
                var coord = coordinateFormatter.fromMgrs(locationString, SpatialReference.WGS84, "automatic");
                // console.log(coord);

                global.view.goTo({center: coord, zoom: 15});
            }
            catch(ex)
            {
                console.log(ex,ex.stack);
            }
        });
        // fetch("http://localhost:8888/viewer/proxy/proxy.ashx?https://geographiclib.sourceforge.io/cgi-bin/GeoConvert?input=56HKG676114700070&zone=56&prec=-2&option=Submit").then( function(fetchResult)
        // {
        //     console.log(fetchResult);
        // });
    }

    initWindy();

    function initWindy()
    {
        const options = {
            // Required: API key
            key: 'gPvjCKJzjDMPXX8JdG7gHDQpeEeulLgv', // REPLACE WITH YOUR KEY !!!
        
            // Put additional console output
            verbose: true,
        
            // Optional: Initial state of the map
            // 150.5, -34.5
            lat: -34.5,
            lon: 150.5,
            zoom: 12,
            minZoom: 1,
            maxZoom: 22
        };

        
        
        // Initialize Windy API
        windyInit(options, function(windyAPI) {
            // windyAPI is ready, and contain 'map', 'store',
            // 'pick24er' and other usefull stuff
        
            const { map } = windyAPI;

            var maxZoom = map.getMaxZoom();
            var minZoom = map.getMinZoom();

            map.eachLayer(function(layer){
                // console.log(layer);

                if(layer.options.className == "basemap-layer")
                {
                    layer.options.minZoom = 3;
                    layer.options.maxZoom = 11;
                }

                if(layer.options.className == "labels-layer")
                {
                    layer.options.minZoom = 0;
                    layer.options.maxZoom = 0;
                }
            });

            map.setMaxZoom(22);
            map.setMinZoom(3);
            map.setView([global.view.center.latitude,global.view.center.longitude],global.view.zoom, {animate: false, duration: 0});

            var windyDiv = jQuery("#windy");
            var esriOverlayDiv = jQuery(".esri-overlay-surface");

            windyDiv.detach();
            esriOverlayDiv.append(windyDiv);

            watchUtils.watch(global.view,"stationary", function(event)
            {
                var windyDiv = jQuery("#windy");
                if(event == false)
                {
                    windyDiv.hide();
                }
                else
                {
                    map.setView([global.view.center.latitude,global.view.center.longitude],global.view.zoom, {animate: false, duration: 0});
                    if(global.view.zoom > 11)
                    {
                        windyDiv.css({opacity: 1});
                    }
                    else
                    {
                        windyDiv.css({opacity: 0.5});
                    }
                    windyDiv.show();
                }
            });

            // .map is instance of Leaflet map
        
            // L.popup()
            //     .setLatLng([-34.5, 150.5])
            //     .setContent('Hello World')
            //     .openOn(map);
        });
    }

    if(false)
    {
        function LiveTrafficFires()
        {
            return new Promise( function(resolve, reject)
            {
                // fetch("https://server1.kproxy.com/servlet/redirect.srv/sruj/slsqrnfiumae/srst/p2/traffic/hazards/fire.json")

                // fetch("http://localhost:8888/viewer/proxy/proxy.ashx?https://www.livetraffic.com/traffic/hazards/fire.json"/*, {"mode": "no-cors"}*/)
                fetch("https://www.livetraffic.com/traffic/hazards/fire.json")
                .then( function (response)
                {
                    return response.json();
                })
                .then( function(myJson)
                {
                    resolve(myJson);
                }).catch( function(ex)
                {
                    reject(ex);
                });
            });
        }

        LiveTrafficFires().then(function(json)
        {
            // console.log(json);

            var graphics = [];

            var fireSymbol = {
                type: "web-style",
                name: "fire-station",
                styleName: "Esri2DPointSymbolsStyle"
            };

            for(var i =0; i < json.features.length; i++)
            {
                var currentFeature = json.features[i];
                var currentGeometry = currentFeature.geometry;
                var currentProps = currentFeature.properties;

                var attributes = {
                    "headline": currentProps.headline,
                    "adviceA": currentProps.adviceA,
                    "adviceB": currentProps.adviceB,
                }

                var currentGraphic = new Graphic({
                    geometry: new Point({
                        x: currentGeometry.coordinates[0],
                        y: currentGeometry.coordinates[1],
                        spatialReference: SpatialReference.WGS84
                    }),
                    symbol: fireSymbol,
                    attributes: attributes,
                    popupTemplate: {
                        title: "{headline}",
                        content: [{
                            // Pass in the fields to display
                            type: "fields",
                            fieldInfos: [{
                                fieldName: "headline",
                                label: "headline"
                            }, {
                                fieldName: "adviceA",
                                label: "adviceA"
                            }, {
                                fieldName: "adviceB",
                                label: "adviceB"
                            }]
                        }]
                    }
                });

                graphics.push(currentGraphic)
            }

            var graphicsLayer = new GraphicsLayer({
                title: "Live Traffic Fires"
            });
            graphicsLayer.addMany(graphics);

            global.map.add(graphicsLayer);
        });
            
    }
});