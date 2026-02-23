/**
 * 微信小程序JavaScriptSDK
 *
 * @version 1.1
 * @date 2019-01-20
 */

var ERROR_CONF = {
  KEY_ERR: 311,
  KEY_ERR_MSG: "key格式错误",
  PARAM_ERR: 310,
  PARAM_ERR_MSG: "请求参数信息有误",
  SYSTEM_ERR: 600,
  SYSTEM_ERR_MSG: "系统错误",
  WX_ERR_CODE: 1000,
  WX_OK_CODE: 200,
};
var BASE_URL = "https://apis.map.qq.com/ws/";
var URL_SEARCH = BASE_URL + "place/v1/search";
var URL_SUGGESTION = BASE_URL + "place/v1/suggestion";
var URL_GET_GEOCODER = BASE_URL + "geocoder/v1/";
var URL_CITY_LIST = BASE_URL + "district/v1/list";
var URL_AREA_LIST = BASE_URL + "district/v1/getchildren";
var URL_DISTANCE = BASE_URL + "distance/v1/";
var EARTH_RADIUS = 6378136.49;
var Utils = {
  /**
   * 得到终点query字符串
   * @param {Array|String} 检索数据
   */
  location2query(data) {
    if (typeof data == "string") {
      return data;
    }
    var query = "";
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      if (!!query) {
        query += ";";
      }
      if (d.location) {
        query = query + d.location.lat + "," + d.location.lng;
      }
      if (d.latitude && d.longitude) {
        query = query + d.latitude + "," + d.longitude;
      }
    }
    return query;
  },

  /**
   * 计算角度
   */
  rad(d) {
    return (d * Math.PI) / 180.0;
  },
  /**
   * 处理终点location数组
   * @return 返回终点数组
   */
  getEndLocation(location) {
    var to = location.split(";");
    var endLocation = [];
    for (var i = 0; i < to.length; i++) {
      endLocation.push({
        lat: parseFloat(to[i].split(",")[0]),
        lng: parseFloat(to[i].split(",")[1]),
      });
    }
    return endLocation;
  },

  /**
   * 计算两点间直线距离
   * @param a 表示纬度差
   * @param b 表示经度差
   * @return 返回的是距离，单位m
   */
  getDistance(latFrom, lngFrom, latTo, lngTo) {
    var radLatFrom = this.rad(latFrom);
    var radLatTo = this.rad(latTo);
    var a = radLatFrom - radLatTo;
    var b = this.rad(lngFrom) - this.rad(lngTo);
    var distance =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLatFrom) *
              Math.cos(radLatTo) *
              Math.pow(Math.sin(b / 2), 2),
        ),
      );
    distance = distance * EARTH_RADIUS;
    distance = Math.round(distance * 10000) / 10000;
    return parseFloat(distance.toFixed(0));
  },
  /**
   * 使用微信接口进行定位
   */
  getWXLocation(success, fail, complete) {
    wx.getLocation({
      type: "gcj02",
      success: success,
      fail: fail,
      complete: complete,
    });
  },

  /**
   * 获取location参数
   */
  getLocationParam(location) {
    if (typeof location == "string") {
      var locationArr = location.split(",");
      if (locationArr.length === 2) {
        location = {
          latitude: location.split(",")[0],
          longitude: location.split(",")[1],
        };
      } else {
        location = {};
      }
    }
    return location;
  },

  /**
   * 回调函数默认处理
   */
  polyfillParam(param) {
    param.success = param.success || function () {};
    param.fail = param.fail || function () {};
    param.complete = param.complete || function () {};
  },

  /**
   * 验证param对应的key值是否为空
   *
   * @param {Object} param 接口参数
   * @param {String} key 对应参数的key
   */
  checkParamKeyEmpty(param, key) {
    if (!param[key]) {
      var errconf = this.buildErrorConfig(
        ERROR_CONF.PARAM_ERR,
        ERROR_CONF.PARAM_ERR_MSG + key + "参数格式有误",
      );
      param.fail(errconf);
      param.complete(errconf);
      return true;
    }
    return false;
  },

  /**
   * 验证参数中是否存在检索词keyword
   *
   * @param {Object} param 接口参数
   */
  checkKeyword(param) {
    return !this.checkParamKeyEmpty(param, "keyword");
  },

  /**
   * 验证location值
   *
   * @param {Object} param 接口参数
   */
  checkLocation(param) {
    var location = this.getLocationParam(param.location);
    if (!location || !location.latitude || !location.longitude) {
      var errconf = this.buildErrorConfig(
        ERROR_CONF.PARAM_ERR,
        ERROR_CONF.PARAM_ERR_MSG + " location参数格式有误",
      );
      param.fail(errconf);
      param.complete(errconf);
      return false;
    }
    return true;
  },

  /**
   * 构造错误数据结构
   * @param {Number} errCode 错误码
   * @param {Number} errMsg 错误描述
   */
  buildErrorConfig(errCode, errMsg) {
    return {
      status: errCode,
      message: errMsg,
    };
  },

  /**
   *
   * 数据处理函数
   * 根据传入参数不同处理不同数据
   * @param {String} feature 功能名称
   * search 地点搜索
   * suggest关键词提示
   * reverseGeocoder逆地址解析
   * geocoder地址解析
   * getCityList获取城市列表：父集
   * getDistrictByCityId获取区县列表：子集
   * calculateDistance距离计算
   * @param {Object} param 接口参数
   * @param {Object} data 数据
   */
  handleData(param, data, feature) {
    if (feature === "search") {
      var searchResult = data.data;
      var searchSimplify = [];
      for (var i = 0; i < searchResult.length; i++) {
        searchSimplify.push({
          id: searchResult[i].id || null,
          title: searchResult[i].title || null,
          latitude:
            (searchResult[i].location && searchResult[i].location.lat) || null,
          longitude:
            (searchResult[i].location && searchResult[i].location.lng) || null,
          address: searchResult[i].address || null,
          category: searchResult[i].category || null,
          tel: searchResult[i].tel || null,
          adcode:
            (searchResult[i].ad_info && searchResult[i].ad_info.adcode) || null,
          city:
            (searchResult[i].ad_info && searchResult[i].ad_info.city) || null,
          district:
            (searchResult[i].ad_info && searchResult[i].ad_info.district) ||
            null,
          province:
            (searchResult[i].ad_info && searchResult[i].ad_info.province) ||
            null,
        });
      }
      param.success(data, {
        searchResult: searchResult,
        searchSimplify: searchSimplify,
      });
    } else if (feature === "suggest") {
      var suggestResult = data.data;
      var suggestSimplify = [];
      for (var i = 0; i < suggestResult.length; i++) {
        suggestSimplify.push({
          adcode: suggestResult[i].adcode || null,
          address: suggestResult[i].address || null,
          category: suggestResult[i].category || null,
          city: suggestResult[i].city || null,
          district: suggestResult[i].district || null,
          id: suggestResult[i].id || null,
          latitude:
            (suggestResult[i].location && suggestResult[i].location.lat) ||
            null,
          longitude:
            (suggestResult[i].location && suggestResult[i].location.lng) ||
            null,
          province: suggestResult[i].province || null,
          title: suggestResult[i].title || null,
          type: suggestResult[i].type || null,
        });
      }
      param.success(data, {
        suggestResult: suggestResult,
        suggestSimplify: suggestSimplify,
      });
    } else if (feature === "reverseGeocoder") {
      var reverseGeocoderResult = data.result;
      var reverseGeocoderSimplify = {
        address: reverseGeocoderResult.address || null,
        latitude:
          (reverseGeocoderResult.location &&
            reverseGeocoderResult.location.lat) ||
          null,
        longitude:
          (reverseGeocoderResult.location &&
            reverseGeocoderResult.location.lng) ||
          null,
        adcode:
          (reverseGeocoderResult.ad_info &&
            reverseGeocoderResult.ad_info.adcode) ||
          null,
        city:
          (reverseGeocoderResult.address_component &&
            reverseGeocoderResult.address_component.city) ||
          null,
        district:
          (reverseGeocoderResult.address_component &&
            reverseGeocoderResult.address_component.district) ||
          null,
        nation:
          (reverseGeocoderResult.address_component &&
            reverseGeocoderResult.address_component.nation) ||
          null,
        province:
          (reverseGeocoderResult.address_component &&
            reverseGeocoderResult.address_component.province) ||
          null,
        street:
          (reverseGeocoderResult.address_component &&
            reverseGeocoderResult.address_component.street) ||
          null,
        street_number:
          (reverseGeocoderResult.address_component &&
            reverseGeocoderResult.address_component.street_number) ||
          null,
        recommend:
          (reverseGeocoderResult.formatted_addresses &&
            reverseGeocoderResult.formatted_addresses.recommend) ||
          null,
        rough:
          (reverseGeocoderResult.formatted_addresses &&
            reverseGeocoderResult.formatted_addresses.rough) ||
          null,
      };
      if (reverseGeocoderResult.pois) {
        //判断是否返回周边poi
        var pois = reverseGeocoderResult.pois;
        var poisSimplify = [];
        for (var i = 0; i < pois.length; i++) {
          poisSimplify.push({
            id: pois[i].id || null,
            title: pois[i].title || null,
            latitude: (pois[i].location && pois[i].location.lat) || null,
            longitude: (pois[i].location && pois[i].location.lng) || null,
            address: pois[i].address || null,
            category: pois[i].category || null,
            adcode: (pois[i].ad_info && pois[i].ad_info.adcode) || null,
            city: (pois[i].ad_info && pois[i].ad_info.city) || null,
            district: (pois[i].ad_info && pois[i].ad_info.district) || null,
            province: (pois[i].ad_info && pois[i].ad_info.province) || null,
          });
        }
        param.success(data, {
          reverseGeocoderResult: reverseGeocoderResult,
          reverseGeocoderSimplify: reverseGeocoderSimplify,
          pois: pois,
          poisSimplify: poisSimplify,
        });
      } else {
        param.success(data, {
          reverseGeocoderResult: reverseGeocoderResult,
          reverseGeocoderSimplify: reverseGeocoderSimplify,
        });
      }
    } else if (feature === "geocoder") {
      var geocoderResult = data.result;
      var geocoderSimplify = {
        title: geocoderResult.title || null,
        latitude:
          (geocoderResult.location && geocoderResult.location.lat) || null,
        longitude:
          (geocoderResult.location && geocoderResult.location.lng) || null,
        adcode:
          (geocoderResult.ad_info && geocoderResult.ad_info.adcode) || null,
        province:
          (geocoderResult.address_components &&
            geocoderResult.address_components.province) ||
          null,
        city:
          (geocoderResult.address_components &&
            geocoderResult.address_components.city) ||
          null,
        district:
          (geocoderResult.address_components &&
            geocoderResult.address_components.district) ||
          null,
        street:
          (geocoderResult.address_components &&
            geocoderResult.address_components.street) ||
          null,
        street_number:
          (geocoderResult.address_components &&
            geocoderResult.address_components.street_number) ||
          null,
        level: geocoderResult.level || null,
      };
      param.success(data, {
        geocoderResult: geocoderResult,
        geocoderSimplify: geocoderSimplify,
      });
    } else if (feature === "getCityList") {
      var provinceResult = data.result[0];
      var cityResult = data.result[1];
      var districtResult = data.result[2];
      param.success(data, {
        provinceResult: provinceResult,
        cityResult: cityResult,
        districtResult: districtResult,
      });
    } else if (feature === "getDistrictByCityId") {
      var districtByCity = data.result[0];
      param.success(data, districtByCity);
    } else if (feature === "calculateDistance") {
      var calculateDistanceResult = data.result.elements;
      var distance = [];
      for (var i = 0; i < calculateDistanceResult.length; i++) {
        distance.push(calculateDistanceResult[i].distance);
      }
      param.success(data, {
        calculateDistanceResult: calculateDistanceResult,
        distance: distance,
      });
    } else {
      param.success(data);
    }
  },

  /**
   * 构造微信请求参数，公共属性处理
   *
   * @param {Object} param 接口参数
   * @param {Object} param 配置项
   * @param {String} feature 方法名
   */
  buildWxRequestConfig(param, options, feature) {
    var that = this;
    options.header = { "content-type": "application/json" };
    options.method = "GET";
    options.success = function (res) {
      var data = res.data;
      if (data.status === 0) {
        that.handleData(param, data, feature);
      } else {
        param.fail(data);
      }
    };
    options.fail = function (res) {
      res.statusCode = ERROR_CONF.WX_ERR_CODE;
      param.fail(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
    };
    options.complete = function (res) {
      var statusCode = +res.statusCode;
      switch (statusCode) {
        case ERROR_CONF.WX_ERR_CODE: {
          param.complete(
            that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg),
          );
          break;
        }
        case ERROR_CONF.WX_OK_CODE: {
          var data = res.data;
          if (data.status === 0) {
            param.complete(data);
          } else {
            param.complete(that.buildErrorConfig(data.status, data.message));
          }
          break;
        }
        default: {
          param.complete(
            that.buildErrorConfig(
              ERROR_CONF.SYSTEM_ERR,
              ERROR_CONF.SYSTEM_ERR_MSG,
            ),
          );
        }
      }
    };
    return options;
  },

  /**
   * 处理用户参数是否传入坐标进行不同的处理
   */
  locationProcess(param, locationsuccess, locationfail, locationcomplete) {
    var that = this;
    locationfail =
      locationfail ||
      function (res) {
        res.statusCode = ERROR_CONF.WX_ERR_CODE;
        param.fail(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
      };
    locationcomplete =
      locationcomplete ||
      function (res) {
        if (res.statusCode == ERROR_CONF.WX_ERR_CODE) {
          param.complete(
            that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg),
          );
        }
      };
    if (!param.location) {
      that.getWXLocation(locationsuccess, locationfail, locationcomplete);
    } else if (that.checkLocation(param)) {
      var location = Utils.getLocationParam(param.location);
      locationsuccess(location);
    }
  },
};

function getPathFromUrl(url) {
  if (!url) return "";
  var idx = url.indexOf("/ws/");
  return idx >= 0 ? url.slice(idx) : url;
}

function buildSig(path, params, sigKey) {
  if (!sigKey || !path) return "";
  var keys = Object.keys(params || {}).filter(function (key) {
    return params[key] !== undefined && params[key] !== null && key !== "sig";
  });
  keys.sort();
  var query = keys
    .map(function (key) {
      return key + "=" + params[key];
    })
    .join("&");
  var raw = path + "?" + query + sigKey;
  return md5(raw).toLowerCase();
}

function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      }
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function H(x, y, z) {
    return x ^ y ^ z;
  }
  function I(x, y, z) {
    return y ^ (x | ~z);
  }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(str) {
    var lWordCount;
    var lMessageLength = str.length;
    var lNumberOfWordsTempOne = lMessageLength + 8;
    var lNumberOfWordsTempTwo =
      (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
    var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
    var lWordArray = new Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    var WordToHexValue = "",
      WordToHexValueTemp = "",
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = "0" + lByte.toString(16);
      WordToHexValue =
        WordToHexValue +
        WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
  }
  function Utf8Encode(str) {
    str = str.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < str.length; n++) {
      var c = str.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  var x = [];
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  var S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  var S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  var S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881d05);
    a = II(a, b, c, d, x[k + 9], S41, 0xd9d4d039);
    d = II(d, a, b, c, x[k + 12], S42, 0xe6db99e5);
    c = II(c, d, a, b, x[k + 15], S43, 0x1fa27cf8);
    b = II(b, c, d, a, x[k + 2], S44, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 7], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 10], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 13], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 0], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 5], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 8], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 11], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 14], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 1], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 4], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 7], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 10], S44, 0x4e0811a1);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  return (
    WordToHex(a) +
    WordToHex(b) +
    WordToHex(c) +
    WordToHex(d)
  ).toLowerCase();
}

class QQMapWX {
  /**
   * 构造函数
   *
   * @param {Object} options 接口参数,key 为必选参数
   */
  constructor(options) {
    if (!options.key) {
      throw Error("key值不能为空");
    }
    this.key = options.key;
    this.sigKey = options.sigKey || "";
  }

  /**
   * POI周边检索
   *
   * @param {Object} options 接口参数对象
   *
   * 参数对象结构可以参考
   * @see http://lbs.qq.com/webservice_v1/guide-search.html
   */
  search(options) {
    var that = this;
    options = options || {};

    Utils.polyfillParam(options);

    if (!Utils.checkKeyword(options)) {
      return;
    }

    var requestParam = {
      keyword: options.keyword,
      orderby: options.orderby || "_distance",
      page_size: options.page_size || 10,
      page_index: options.page_index || 1,
      output: "json",
      key: that.key,
    };

    if (options.address_format) {
      requestParam.address_format = options.address_format;
    }

    if (options.filter) {
      requestParam.filter = options.filter;
    }

    var distance = options.distance || "1000";
    var auto_extend = options.auto_extend || 1;
    var region = null;
    var rectangle = null;

    //判断城市限定参数
    if (options.region) {
      region = options.region;
    }

    //矩形限定坐标(暂时只支持字符串格式)
    if (options.rectangle) {
      rectangle = options.rectangle;
    }

    var locationsuccess = function (result) {
      if (region && !rectangle) {
        //城市限定参数拼接
        requestParam.boundary =
          "region(" +
          region +
          "," +
          auto_extend +
          "," +
          result.latitude +
          "," +
          result.longitude +
          ")";
      } else if (rectangle && !region) {
        //矩形搜索
        requestParam.boundary = "rectangle(" + rectangle + ")";
      } else {
        requestParam.boundary =
          "nearby(" +
          result.latitude +
          "," +
          result.longitude +
          "," +
          distance +
          "," +
          auto_extend +
          ")";
      }
      var requestConfig = Utils.buildWxRequestConfig(
        options,
        {
          url: URL_SEARCH,
          data: requestParam,
        },
        "search",
      );
      if (that.sigKey) {
        requestConfig.data.sig = buildSig(
          getPathFromUrl(URL_SEARCH),
          requestConfig.data,
          that.sigKey,
        );
      }
      wx.request(requestConfig);
    };
    Utils.locationProcess(options, locationsuccess);
  }

  /**
   * sug模糊检索
   *
   * @param {Object} options 接口参数对象
   *
   * 参数对象结构可以参考
   * http://lbs.qq.com/webservice_v1/guide-suggestion.html
   */
  getSuggestion(options) {
    var that = this;
    options = options || {};
    Utils.polyfillParam(options);

    if (!Utils.checkKeyword(options)) {
      return;
    }

    var requestParam = {
      keyword: options.keyword,
      region: options.region || "全国",
      region_fix: options.region_fix || 0,
      policy: options.policy || 0,
      page_size: options.page_size || 10, //控制显示条数
      page_index: options.page_index || 1, //控制页数
      get_subpois: options.get_subpois || 0, //返回子地点
      output: "json",
      key: that.key,
    };
    //长地址
    if (options.address_format) {
      requestParam.address_format = options.address_format;
    }
    //过滤
    if (options.filter) {
      requestParam.filter = options.filter;
    }
    //排序
    if (options.location) {
      var locationsuccess = function (result) {
        requestParam.location = result.latitude + "," + result.longitude;
        var requestConfig = Utils.buildWxRequestConfig(
          options,
          {
            url: URL_SUGGESTION,
            data: requestParam,
          },
          "suggest",
        );
        if (that.sigKey) {
          requestConfig.data.sig = buildSig(
            getPathFromUrl(URL_SUGGESTION),
            requestConfig.data,
            that.sigKey,
          );
        }
        wx.request(requestConfig);
      };
      Utils.locationProcess(options, locationsuccess);
    } else {
      var requestConfig = Utils.buildWxRequestConfig(
        options,
        {
          url: URL_SUGGESTION,
          data: requestParam,
        },
        "suggest",
      );
      if (that.sigKey) {
        requestConfig.data.sig = buildSig(
          getPathFromUrl(URL_SUGGESTION),
          requestConfig.data,
          that.sigKey,
        );
      }
      wx.request(requestConfig);
    }
  }

  /**
   * 逆地址解析
   *
   * @param {Object} options 接口参数对象
   *
   * 请求参数结构可以参考
   * http://lbs.qq.com/webservice_v1/guide-gcoder.html
   */
  reverseGeocoder(options) {
    var that = this;
    options = options || {};
    Utils.polyfillParam(options);
    var requestParam = {
      coord_type: options.coord_type || 5,
      get_poi: options.get_poi || 0,
      output: "json",
      key: that.key,
    };
    if (options.poi_options) {
      requestParam.poi_options = options.poi_options;
    }

    var locationsuccess = function (result) {
      requestParam.location = result.latitude + "," + result.longitude;
      var requestConfig = Utils.buildWxRequestConfig(
        options,
        {
          url: URL_GET_GEOCODER,
          data: requestParam,
        },
        "reverseGeocoder",
      );
      if (that.sigKey) {
        requestConfig.data.sig = buildSig(
          getPathFromUrl(URL_GET_GEOCODER),
          requestConfig.data,
          that.sigKey,
        );
      }
      wx.request(requestConfig);
    };
    Utils.locationProcess(options, locationsuccess);
  }

  /**
   * 地址解析
   *
   * @param {Object} options 接口参数对象
   *
   * 请求参数结构可以参考
   * http://lbs.qq.com/webservice_v1/guide-geocoder.html
   */
  geocoder(options) {
    var that = this;
    options = options || {};
    Utils.polyfillParam(options);

    if (Utils.checkParamKeyEmpty(options, "address")) {
      return;
    }

    var requestParam = {
      address: options.address,
      output: "json",
      key: that.key,
    };

    //城市限定
    if (options.region) {
      requestParam.region = options.region;
    }

    var requestConfig = Utils.buildWxRequestConfig(
      options,
      {
        url: URL_GET_GEOCODER,
        data: requestParam,
      },
      "geocoder",
    );
    if (that.sigKey) {
      requestConfig.data.sig = buildSig(
        getPathFromUrl(URL_GET_GEOCODER),
        requestConfig.data,
        that.sigKey,
      );
    }
    wx.request(requestConfig);
  }

  /**
   * 获取城市列表
   *
   * @param {Object} options 接口参数对象
   *
   * 请求参数结构可以参考
   * http://lbs.qq.com/webservice_v1/guide-region.html
   */
  getCityList(options) {
    var that = this;
    options = options || {};
    Utils.polyfillParam(options);
    var requestParam = {
      output: "json",
      key: that.key,
    };

    var requestConfig = Utils.buildWxRequestConfig(
      options,
      {
        url: URL_CITY_LIST,
        data: requestParam,
      },
      "getCityList",
    );
    if (that.sigKey) {
      requestConfig.data.sig = buildSig(
        getPathFromUrl(URL_CITY_LIST),
        requestConfig.data,
        that.sigKey,
      );
    }
    wx.request(requestConfig);
  }

  /**
   * 获取对应城市ID的区县列表
   *
   * @param {Object} options 接口参数对象
   *
   * 请求参数结构可以参考
   * http://lbs.qq.com/webservice_v1/guide-region.html
   */
  getDistrictByCityId(options) {
    var that = this;
    options = options || {};
    Utils.polyfillParam(options);

    if (Utils.checkParamKeyEmpty(options, "id")) {
      return;
    }

    var requestParam = {
      id: options.id || "",
      output: "json",
      key: that.key,
    };

    var requestConfig = Utils.buildWxRequestConfig(
      options,
      {
        url: URL_AREA_LIST,
        data: requestParam,
      },
      "getDistrictByCityId",
    );
    if (that.sigKey) {
      requestConfig.data.sig = buildSig(
        getPathFromUrl(URL_AREA_LIST),
        requestConfig.data,
        that.sigKey,
      );
    }
    wx.request(requestConfig);
  }

  /**
   * 用于单起点到多终点的路线距离(非直线距离)计算：
   * 支持两种距离计算方式：步行和驾车。
   * 起点到终点最大限制直线距离10公里。
   *
   * 新增直线距离计算。
   *
   * @param {Object} options 接口参数对象
   *
   * 请求参数结构可以参考
   * http://lbs.qq.com/webservice_v1/guide-distance.html
   */
  calculateDistance(options) {
    var that = this;
    options = options || {};
    Utils.polyfillParam(options);

    if (Utils.checkParamKeyEmpty(options, "to")) {
      return;
    }

    var requestParam = {
      mode: options.mode || "walking",
      to: Utils.location2query(options.to),
      output: "json",
      key: that.key,
    };

    if (options.from) {
      options.location = options.from;
    }

    //计算直线距离
    if (requestParam.mode == "straight") {
      var locationsuccess = function (result) {
        var locationTo = Utils.getEndLocation(requestParam.to); //处理终点坐标
        var data = {
          message: "query ok",
          result: {
            elements: [],
          },
          status: 0,
        };
        for (var i = 0; i < locationTo.length; i++) {
          data.result.elements.push({
            //将坐标存入
            distance: Utils.getDistance(
              result.latitude,
              result.longitude,
              locationTo[i].lat,
              locationTo[i].lng,
            ),
            duration: 0,
            from: {
              lat: result.latitude,
              lng: result.longitude,
            },
            to: {
              lat: locationTo[i].lat,
              lng: locationTo[i].lng,
            },
          });
        }
        var calculateResult = data.result.elements;
        var distanceResult = [];
        for (var i = 0; i < calculateResult.length; i++) {
          distanceResult.push(calculateResult[i].distance);
        }
        return options.success(data, {
          calculateResult: calculateResult,
          distanceResult: distanceResult,
        });
      };

      Utils.locationProcess(options, locationsuccess);
    } else {
      var locationsuccess = function (result) {
        requestParam.from = result.latitude + "," + result.longitude;
        var requestConfig = Utils.buildWxRequestConfig(
          options,
          {
            url: URL_DISTANCE,
            data: requestParam,
          },
          "calculateDistance",
        );
        if (that.sigKey) {
          requestConfig.data.sig = buildSig(
            getPathFromUrl(URL_DISTANCE),
            requestConfig.data,
            that.sigKey,
          );
        }
        wx.request(requestConfig);
      };

      Utils.locationProcess(options, locationsuccess);
    }
  }
}

module.exports = QQMapWX;
