# fires 2020

## About
A small project created to bring many informative layers together in a single map.

## GitHub Pages
- https://leevers.github.io/fires2020/

## GitHub Repo
- https://github.com/leevers/fires2020

## TODO
- RFS Polygon outlines
- Hotspot Data
- Weather Data
- Traffic Data

## Technologies
- jQuery 1.12.4
  - https://jquery.com/
- ArcGIS js API 4.14
  - https://developers.arcgis.com/javascript/

## 6 Digit Coord
This was developed to easily go to coordinates used by fire services and heard over scanners ( e.g. https://www.broadcastify.com/listen/feed/31709 ), these are based on MGRS, the app should work out the MGRS zone based on the users current location and append the entered 6 or 8 digit coordinates to go to the area.

## Data
 - RFS Major Incidents RSS Feed - http://www.rfs.nsw.gov.au/feeds/majorIncidents.xml
 - Latest Imagery (Himawari8) - https://sentinel.ga.gov.au/geoserver/public/wms - himawari8_mosaic
 - Hotspot Data (Sentinel) - https://sentinel.ga.gov.au/geoserver/public/wms - hotspot_current
 - NOAA METAR Wind - https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NOAA_METAR_current_wind_speed_direction_v1/FeatureServer/0
 - MODIS Thermal Hotspot - https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0