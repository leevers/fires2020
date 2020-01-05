
var global = {
    view: null,
    map: null
}

require(["esri/Map", "esri/WebMap", "esri/views/MapView", "esri/layers/BaseElevationLayer","esri/layers/ElevationLayer", "esri/layers/FeatureLayer", "esri/layers/WMSLayer", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/geometry/Point", "esri/widgets/LayerList", "esri/widgets/BasemapToggle", "esri/widgets/Popup", "esri/geometry/SpatialReference", "esri/geometry/coordinateFormatter"],
 function (Map, WebMap, MapView, BaseElevationLayer, ElevationLayer, FeatureLayer, WMSLayer, GraphicsLayer, Graphic, Point, LayerList, BasemapToggle, Popup, SpatialReference, coordinateFormatter)
{
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

    global.map = new Map({
        basemap: "hybrid",
        // ground: "world-elevation"
        // ground: {
        //     layers: [new ExaggeratedElevationLayer()]
        // }
    });

    // global.map = new WebMap({
    //     portalItem: { // autocasts as new PortalItem()
    //         id: "2168b5162d61432c8b3499818a2d60df"
    //     }
    // });

    global.view = new MapView({
        container: "viewDiv",
        map: global.map,
        zoom: 11,
        center: [150.5, -34.5] // longitude, latitude
    });

    // global.view.popup.autoOpenEnabled = true;

    var layerList = new LayerList({
        view: global.view,
        listItemCreatedFunction: function (event)
        {
            var item = event.item;
            if (item.layer.type != "group")
            {
                item.actionsSections = [
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
                ]
            }
        }
    });

    global.view.ui.add(layerList, {
        position: "top-right"
    });

    layerList.on("trigger-action", function (event)
    {
        // The layer visible in the view at the time of the trigger.
        var layer = event.item.layer;

        // Capture the action id.
        var id = event.action.id;

        if (id === "increase-opacity")
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

    var basemapToggle = new BasemapToggle({
        view: global.view,
        nextBasemap: "topo-vector"
    });

    global.view.ui.add(basemapToggle, {
        position: "bottom-right"
    });

    global.view.when(function (viewWhen)
    {
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
            sublayers: [{
                title: "Current Hotspots",
                name: "hotspot_current"
            }]
        });

        global.map.add(hotspotLayer);

        // https://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/NOAA_METAR_current_wind_speed_direction/MapServer/0
        const noaaMetarLayer = new FeatureLayer({
            // URL to the service
            url: "https://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/NOAA_METAR_current_wind_speed_direction/MapServer/0",
        });
        global.map.add(noaaMetarLayer);

        // https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0

        const renderer = {
            type: "heatmap",
            colorStops: [
              { color: "rgba(63, 40, 102, 0)", ratio: 0 },
              { color: "#472b77", ratio: 0.083 },
              { color: "#4e2d87", ratio: 0.166 },
              { color: "#563098", ratio: 0.249 },
              { color: "#5d32a8", ratio: 0.332 },
              { color: "#6735be", ratio: 0.415 },
              { color: "#7139d4", ratio: 0.498 },
              { color: "#7b3ce9", ratio: 0.581 },
              { color: "#853fff", ratio: 0.664 },
              { color: "#a46fbf", ratio: 0.747 },
              { color: "#c29f80", ratio: 0.83 },
              { color: "#e0cf40", ratio: 0.913 },
              { color: "#ffff00", ratio: 1 }
            ],
            maxPixelIntensity: 25,
            minPixelIntensity: 0
          };

        const modisLayer = new FeatureLayer({
            // URL to the service
            url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0",
            popupTemplate: {
                title: "TEST",
                content: "Brightness: {BRIGHTNESS}<br>" + 
                    "Brightness: {BRIGHTNESS}<br>" + 
                    "Scan: {SCAN}<br>" + 
                    "Track: {TRACK}<br>" + 
                    "Confidence: {CONFIDENCE}<br>"
            },
            renderer: renderer
        });
        global.map.add(modisLayer);


        // var meteyeLayer = new WMSLayer({
        //     title: "Wind (MetEye)",
        //     // url: "http://wvs1.bom.gov.au/mapcache/meteye",
        //     url: "http://localhost:8888/viewer/proxy/proxy.ashx?http://wvs1.bom.gov.au/mapcache/meteye",
        //     // listMode: "hide-children",
        //     // sublayers: [{
        //     //     title: "Current Hotspots",
        //     //     name: "hotspot_current"
        //     // }]
        // });

        // map.add(meteyeLayer);


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
    });

    jQuery("#sixButton").on("click", {}, function(event)
    {
        var sixCoord = jQuery("#sixInput").val();
        MGRStoLatLon(sixCoord);
    });

    function MGRStoLatLon(sixCoord)
    {
        coordinateFormatter.load().then( function(loaded)
        {
            // var locationPrefix = "56HKG676114";
            var locationPrefix = "56HKG";
            var locationString = locationPrefix + sixCoord;
            // var coord = coordinateFormatter.fromMgrs(locationString, SpatialReference.WGS84, "old-180-in-zone-56");
            var coord = coordinateFormatter.fromMgrs(locationString, SpatialReference.WGS84, "automatic");
            // console.log(coord);

            global.view.goTo({center: coord, zoom: 15});
        });
        // fetch("http://localhost:8888/viewer/proxy/proxy.ashx?https://geographiclib.sourceforge.io/cgi-bin/GeoConvert?input=56HKG676114700070&zone=56&prec=-2&option=Submit").then( function(fetchResult)
        // {
        //     console.log(fetchResult);
        // });
    }

    function LiveTrafficFires()
    {
        return new Promise( function(resolve, reject)
        {
            fetch("http://localhost:8888/viewer/proxy/proxy.ashx?https://www.livetraffic.com/traffic/hazards/fire.json")
            .then((response) =>
            {
                return response.json();
            })
            .then((myJson) =>
            {
                resolve(myJson);
            }).catch( function(ex)
            {
                reject(ex);
            });
        })
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

});