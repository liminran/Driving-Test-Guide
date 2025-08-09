// 交通信号图标映射，与信号文件名关联
// 预定义一个完整的交通信号图标对象
const trafficSignalImages = {
  1: require('../../assets/signals/signal1.png'),
  2: require('../../assets/signals/signal2.png'),
  3: require('../../assets/signals/signal3.png'),
  4: require('../../assets/signals/signal4.png'),
  5: require('../../assets/signals/signal5.png'),
  6: require('../../assets/signals/signal6.png'),
  7: require('../../assets/signals/signal7.png'),
  8: require('../../assets/signals/signal8.png'),
  9: require('../../assets/signals/signal9.png'),
  10: require('../../assets/signals/signal10.png'),
  11: require('../../assets/signals/signal11.png'),
  12: require('../../assets/signals/signal12.png'),
  13: require('../../assets/signals/signal13.png'),
  14: require('../../assets/signals/signal14.png'),
  15: require('../../assets/signals/signal15.png'),
  16: require('../../assets/signals/signal16.png'),
  17: require('../../assets/signals/signal17.png'),
  18: require('../../assets/signals/signal18.png'),
  19: require('../../assets/signals/signal19.png'),
  20: require('../../assets/signals/signal20.png'),
  21: require('../../assets/signals/signal21.png'),
  22: require('../../assets/signals/signal22.png'),
  23: require('../../assets/signals/signal23.png'),
  24: require('../../assets/signals/signal24.png'),
  25: require('../../assets/signals/signal25.png'),
  26: require('../../assets/signals/signal26.png'),
  27: require('../../assets/signals/signal27.png'),
  28: require('../../assets/signals/signal28.png'),
  29: require('../../assets/signals/signal29.png'),
  30: require('../../assets/signals/signal30.png'),
  31: require('../../assets/signals/signal31.png'),
  32: require('../../assets/signals/signal32.png'),
  33: require('../../assets/signals/signal33.png'),
  34: require('../../assets/signals/signal34.png'),
  35: require('../../assets/signals/signal35.png'),
  36: require('../../assets/signals/signal36.png'),
  37: require('../../assets/signals/signal37.png'),
  38: require('../../assets/signals/signal38.png'),
  39: require('../../assets/signals/signal39.png'),
  40: require('../../assets/signals/signal40.png'),
  41: require('../../assets/signals/signal41.png'),
  42: require('../../assets/signals/signal42.png'),
  43: require('../../assets/signals/signal43.png'),
  44: require('../../assets/signals/signal44.png'),
  45: require('../../assets/signals/signal45.png'),
  46: require('../../assets/signals/signal46.png'),
  47: require('../../assets/signals/signal47.png'),
  48: require('../../assets/signals/signal48.png'),
  49: require('../../assets/signals/signal49.png'),
  50: require('../../assets/signals/signal50.png'),
  51: require('../../assets/signals/signal51.png'),
  52: require('../../assets/signals/signal52.png'),
  53: require('../../assets/signals/signal53.png'),
};

// 在文件开头添加图片映射
// 预加载所有实际存在的图片
const imageAssets = {
    '1': require('../../assets/images/image1.png'),
  '2': require('../../assets/images/image2.png'),
  '3': require('../../assets/images/image3.png'),
  '4': require('../../assets/images/image4.png'),
  '5': require('../../assets/images/image5.png'),
  '6': require('../../assets/images/image6.png'),
  '7': require('../../assets/images/image7.png'),
  '8': require('../../assets/images/image8.png'),
  '9': require('../../assets/images/image9.png'),
  '20': require('../../assets/images/image20.png'),
  '21': require('../../assets/images/image21.png'),
  '22': require('../../assets/images/image22.png'),
  '23': require('../../assets/images/image23.png'),
  '24': require('../../assets/images/image24.png'),
  '25': require('../../assets/images/image25.png'),
  '26': require('../../assets/images/image26.png'),
  '27': require('../../assets/images/image27.png'),
  '28': require('../../assets/images/image28.png'),
  '29': require('../../assets/images/image29.png'),
  '30': require('../../assets/images/image30.png'),
  '31': require('../../assets/images/image31.png'),
  '32': require('../../assets/images/image32.png'),
  '33': require('../../assets/images/image33.png'),
  '34': require('../../assets/images/image34.png'),
  '35': require('../../assets/images/image35.png'),
  '36': require('../../assets/images/image36.png'),
  '37': require('../../assets/images/image37.png'),
  '38': require('../../assets/images/image38.png'),
  '39': require('../../assets/images/image39.png'),
  '40': require('../../assets/images/image40.png'),
  '41': require('../../assets/images/image41.png'),
  '42': require('../../assets/images/image42.png'),
  '43': require('../../assets/images/image43.png'),
  '44': require('../../assets/images/image44.png'),
  '45': require('../../assets/images/image45.png'),
  '46': require('../../assets/images/image46.png'),
  '47': require('../../assets/images/image47.png'),
  '48': require('../../assets/images/image48.png'),
  '49': require('../../assets/images/image49.png'),
  '50': require('../../assets/images/image50.png'),
  '51': require('../../assets/images/image51.png'),
  '52': require('../../assets/images/image52.png'),
  '53': require('../../assets/images/image53.png'),
  '54': require('../../assets/images/image54.png'),
  '55': require('../../assets/images/image55.png'),
  '56': require('../../assets/images/image56.png'),
  '57': require('../../assets/images/image57.png'),
  '58': require('../../assets/images/image58.png'),
  '59': require('../../assets/images/image59.png'),
  '60': require('../../assets/images/image60.png'),
  '61': require('../../assets/images/image61.png'),
  '62': require('../../assets/images/image62.png'),
  '63': require('../../assets/images/image63.png'),
  '64': require('../../assets/images/image64.png'),
  '65': require('../../assets/images/image65.png'),
  '66': require('../../assets/images/image66.png'),
  '67': require('../../assets/images/image67.png'),
  '68': require('../../assets/images/image68.png'),
  '69': require('../../assets/images/image69.png'),
  '70': require('../../assets/images/image70.png'),
  '71': require('../../assets/images/image71.png'),
  '72': require('../../assets/images/image72.png'),
  '73': require('../../assets/images/image73.png'),
  '74': require('../../assets/images/image74.png'),
  '75': require('../../assets/images/image75.png'),
  '76': require('../../assets/images/image76.png'),
  '77': require('../../assets/images/image77.png'),
  '78': require('../../assets/images/image78.png'),
  '79': require('../../assets/images/image79.png'),
  '80': require('../../assets/images/image80.png'),
  '81': require('../../assets/images/image81.png'),
  '82': require('../../assets/images/image82.png'),
  '83': require('../../assets/images/image83.png'),
  '84': require('../../assets/images/image84.png'),
  '85': require('../../assets/images/image85.png'),
  '86': require('../../assets/images/image86.png'),
  '87': require('../../assets/images/image87.png'),
  '88': require('../../assets/images/image88.png'),
  '89': require('../../assets/images/image89.png'),
  '90': require('../../assets/images/image90.png'),
  '91': require('../../assets/images/image91.png'),
  '92': require('../../assets/images/image92.png'),
  '93': require('../../assets/images/image93.png'),
  '94': require('../../assets/images/image94.png'),
  '95': require('../../assets/images/image95.png'),
  '96': require('../../assets/images/image96.png'),
  '97': require('../../assets/images/image97.png'),
  '98': require('../../assets/images/image98.png'),
  '99': require('../../assets/images/image99.png'),
    '100': require('../../assets/images/image100.png'),
  '101': require('../../assets/images/image101.png'),
  '102': require('../../assets/images/image102.png'),
  '103': require('../../assets/images/image103.png'),
  '104': require('../../assets/images/image104.png'),
  '105': require('../../assets/images/image105.png'),
  '106': require('../../assets/images/image106.png'),
  '107': require('../../assets/images/image107.png'),
  '108': require('../../assets/images/image108.png'),
  '109': require('../../assets/images/image109.png'),
  '110': require('../../assets/images/image110.png'),
  '111': require('../../assets/images/image111.png'),
  '112': require('../../assets/images/image112.png'),
  '113': require('../../assets/images/image113.png'),
  '114': require('../../assets/images/image114.png'),
  '115': require('../../assets/images/image115.png'),
  '116': require('../../assets/images/image116.png'),
  '117': require('../../assets/images/image117.png'),
  '118': require('../../assets/images/image118.png'),
  '119': require('../../assets/images/image119.png'),
  '120': require('../../assets/images/image120.png'),
  '121': require('../../assets/images/image121.png'),
  '122': require('../../assets/images/image122.png'),
  '123': require('../../assets/images/image123.png'),
  '124': require('../../assets/images/image124.png'),
  '125': require('../../assets/images/image125.png'),
  '126': require('../../assets/images/image126.png'),
  '127': require('../../assets/images/image127.png'),
  '128': require('../../assets/images/image128.png'),
  '129': require('../../assets/images/image129.png'),
  '130': require('../../assets/images/image130.png'),
  '131': require('../../assets/images/image131.png'),
  '132': require('../../assets/images/image132.png'),
  '133': require('../../assets/images/image133.png'),
  '134': require('../../assets/images/image134.png'),
  '135': require('../../assets/images/image135.png'),
  '136': require('../../assets/images/image136.png'),
  '137': require('../../assets/images/image137.png'),
  '138': require('../../assets/images/image138.png'),
  '139': require('../../assets/images/image139.png'),
  '140': require('../../assets/images/image140.png'),
  '141': require('../../assets/images/image141.png'),
  '142': require('../../assets/images/image142.png'),
  '143': require('../../assets/images/image143.png'),
  '144': require('../../assets/images/image144.png'),
  '145': require('../../assets/images/image145.png'),
  '146': require('../../assets/images/image146.png'),
  '147': require('../../assets/images/image147.png'),
  '148': require('../../assets/images/image148.png'),
  '149': require('../../assets/images/image149.png'),
  '150': require('../../assets/images/image150.png'),
  '151': require('../../assets/images/image151.png'),
  '152': require('../../assets/images/image152.png'),
  '153': require('../../assets/images/image153.png'),
  '154': require('../../assets/images/image154.png'),
  '155': require('../../assets/images/image155.png'),
  '156': require('../../assets/images/image156.png'),
  '157': require('../../assets/images/image157.png'),
  '158': require('../../assets/images/image158.png'),
  '159': require('../../assets/images/image159.png'),
  '160': require('../../assets/images/image160.png'),
  '161': require('../../assets/images/image161.png'),
  '162': require('../../assets/images/image162.png'),
  '163': require('../../assets/images/image163.png'),
  '164': require('../../assets/images/image164.png'),
  '165': require('../../assets/images/image165.png'),
  '166': require('../../assets/images/image166.png'),
  '167': require('../../assets/images/image167.png'),
  '168': require('../../assets/images/image168.png'),
  '169': require('../../assets/images/image169.png'),
  '170': require('../../assets/images/image170.png'),
  '171': require('../../assets/images/image171.png'),
  '172': require('../../assets/images/image172.png'),
  '173': require('../../assets/images/image173.png'),
  '174': require('../../assets/images/image174.png'),
  '175': require('../../assets/images/image175.png'),
  '176': require('../../assets/images/image176.png'),
  '177': require('../../assets/images/image177.png'),
  '178': require('../../assets/images/image178.png'),
  '179': require('../../assets/images/image179.png'),
  '180': require('../../assets/images/image180.png'),
  '181': require('../../assets/images/image181.png'),
  '182': require('../../assets/images/image182.png'),
  '183': require('../../assets/images/image183.png'),
  '184': require('../../assets/images/image184.png'),
  '185': require('../../assets/images/image185.png'),
  '186': require('../../assets/images/image186.png'),
  '187': require('../../assets/images/image187.png'),
  '188': require('../../assets/images/image188.png'),
  '189': require('../../assets/images/image189.png'),
  '190': require('../../assets/images/image190.png'),
  '191': require('../../assets/images/image191.png'),
  '192': require('../../assets/images/image192.png'),
  '193': require('../../assets/images/image193.png'),
  '194': require('../../assets/images/image194.png'),
  '195': require('../../assets/images/image195.png'),
  '196': require('../../assets/images/image196.png'),
  '197': require('../../assets/images/image197.png'),
  '198': require('../../assets/images/image198.png'),
  '199': require('../../assets/images/image199.png'),
  '200': require('../../assets/images/image200.png'),
  '201': require('../../assets/images/image201.png'),
  '202': require('../../assets/images/image202.png'),
  '203': require('../../assets/images/image203.png'),
  '204': require('../../assets/images/image204.png'),
  '205': require('../../assets/images/image205.png'),
  '206': require('../../assets/images/image206.png'),
};

// Add static mapping for assets/image2/*.jpg
const image2Assets = {
  '100kmh.jpg': require('../../assets/image2/100kmh.jpg'),
'100meterexit.jpg': require('../../assets/image2/100meterexit.jpg'),
'120kmh.jpg': require('../../assets/image2/120kmh.jpg'),
'200meterexit.jpg': require('../../assets/image2/200meterexit.jpg'),
'300meterexit.jpg': require('../../assets/image2/300meterexit.jpg'),
'30kmh.jpg': require('../../assets/image2/30kmh.jpg'),
'3tonnemax.jpg': require('../../assets/image2/3tonnemax.jpg'),
'50kmh.jpg': require('../../assets/image2/50kmh.jpg'),
'5axel.jpg': require('../../assets/image2/5axel.jpg'),
'60kmh.jpg': require('../../assets/image2/60kmh.jpg'),
'80kmh.jpg': require('../../assets/image2/80kmh.jpg'),
'ambertrafficlight.jpg': require('../../assets/image2/ambertrafficlight.jpg'),
'automaticlevelcrossing.jpg': require('../../assets/image2/automaticlevelcrossing.jpg'),
'backofbus.jpg': require('../../assets/image2/backofbus.jpg'),
'batterynotcharging.jpg': require('../../assets/image2/batterynotcharging.jpg'),
'bewarechildren.jpg': require('../../assets/image2/bewarechildren.jpg'),
'bicyclesidewalk.jpg': require('../../assets/image2/bicyclesidewalk.jpg'),
'brokensingleline.jpg': require('../../assets/image2/brokensingleline.jpg'),
'browofhill.jpg': require('../../assets/image2/browofhill.jpg'),
'buslane.jpg': require('../../assets/image2/buslane.jpg'),
'buslaneaheadright.jpg': require('../../assets/image2/buslaneaheadright.jpg'),
'buslaneleft.jpg': require('../../assets/image2/buslaneleft.jpg'),
'buslaneright.jpg': require('../../assets/image2/buslaneright.jpg'),
'buslanetime.jpg': require('../../assets/image2/buslanetime.jpg'),
'carbicycle1.jpg': require('../../assets/image2/carbicycle1.jpg'),
'carjunction1.jpg': require('../../assets/image2/carjunction1.jpg'),
'carjunction2.jpg': require('../../assets/image2/carjunction2.jpg'),
'carjunction3.jpg': require('../../assets/image2/carjunction3.jpg'),
'carriagewayends.jpg': require('../../assets/image2/carriagewayends.jpg'),
'carsituation10.jpg': require('../../assets/image2/carsituation10.jpg'),
'carsituation12.jpg': require('../../assets/image2/carsituation12.jpg'),
'carsituation13.jpg': require('../../assets/image2/carsituation13.jpg'),
'carsituation14.jpg': require('../../assets/image2/carsituation14.jpg'),
'carsituation15.jpg': require('../../assets/image2/carsituation15.jpg'),
'carsituation16.jpg': require('../../assets/image2/carsituation16.jpg'),
'carsituation17.jpg': require('../../assets/image2/carsituation17.jpg'),
'carsituation18.jpg': require('../../assets/image2/carsituation18.jpg'),
'carsituation19.jpg': require('../../assets/image2/carsituation19.jpg'),
'carsituation2.jpg': require('../../assets/image2/carsituation2.jpg'),
'carsituation20.jpg': require('../../assets/image2/carsituation20.jpg'),
'carsituation21.jpg': require('../../assets/image2/carsituation21.jpg'),
'carsituation22.jpg': require('../../assets/image2/carsituation22.jpg'),
'carsituation23.jpg': require('../../assets/image2/carsituation23.jpg'),
'carsituation24.jpg': require('../../assets/image2/carsituation24.jpg'),
'carsituation25.jpg': require('../../assets/image2/carsituation25.jpg'),
'carsituation26.jpg': require('../../assets/image2/carsituation26.jpg'),
'carsituation27.jpg': require('../../assets/image2/carsituation27.jpg'),
'carsituation28.jpg': require('../../assets/image2/carsituation28.jpg'),
'carsituation29.jpg': require('../../assets/image2/carsituation29.jpg'),
'carsituation3.jpg': require('../../assets/image2/carsituation3.jpg'),
'carsituation30.jpg': require('../../assets/image2/carsituation30.jpg'),
'carsituation31.jpg': require('../../assets/image2/carsituation31.jpg'),
'carsituation32.jpg': require('../../assets/image2/carsituation32.jpg'),
'carsituation33.jpg': require('../../assets/image2/carsituation33.jpg'),
'carsituation34.jpg': require('../../assets/image2/carsituation34.jpg'),
'carsituation35.jpg': require('../../assets/image2/carsituation35.jpg'),
'carsituation36.jpg': require('../../assets/image2/carsituation36.jpg'),
'carsituation37.jpg': require('../../assets/image2/carsituation37.jpg'),
'carsituation38.jpg': require('../../assets/image2/carsituation38.jpg'),
'carsituation39.jpg': require('../../assets/image2/carsituation39.jpg'),
'carsituation4.jpg': require('../../assets/image2/carsituation4.jpg'),
'carsituation40.jpg': require('../../assets/image2/carsituation40.jpg'),
'carsituation41.jpg': require('../../assets/image2/carsituation41.jpg'),
'carsituation42.jpg': require('../../assets/image2/carsituation42.jpg'),
'carsituation43.jpg': require('../../assets/image2/carsituation43.jpg'),
'carsituation44.jpg': require('../../assets/image2/carsituation44.jpg'),
'carsituation45.jpg': require('../../assets/image2/carsituation45.jpg'),
'carsituation46.jpg': require('../../assets/image2/carsituation46.jpg'),
'carsituation47.jpg': require('../../assets/image2/carsituation47.jpg'),
'carsituation48.jpg': require('../../assets/image2/carsituation48.jpg'),
'carsituation49.jpg': require('../../assets/image2/carsituation49.jpg'),
'carsituation5.jpg': require('../../assets/image2/carsituation5.jpg'),
'carsituation50.jpg': require('../../assets/image2/carsituation50.jpg'),
'carsituation51.jpg': require('../../assets/image2/carsituation51.jpg'),
'carsituation52.jpg': require('../../assets/image2/carsituation52.jpg'),
'carsituation53.jpg': require('../../assets/image2/carsituation53.jpg'),
'carsituation54.jpg': require('../../assets/image2/carsituation54.jpg'),
'carsituation6.jpg': require('../../assets/image2/carsituation6.jpg'),
'carsituation7.jpg': require('../../assets/image2/carsituation7.jpg'),
'carsituation8.jpg': require('../../assets/image2/carsituation8.jpg'),
'carsituation9.jpg': require('../../assets/image2/carsituation9.jpg'),
'carslowdown.jpg': require('../../assets/image2/carslowdown.jpg'),
'carturnleft.jpg': require('../../assets/image2/carturnleft.jpg'),
'carturnright.jpg': require('../../assets/image2/carturnright.jpg'),
'cashier.jpg': require('../../assets/image2/cashier.jpg'),
'cattle.jpg': require('../../assets/image2/cattle.jpg'),
'clearing.jpg': require('../../assets/image2/clearing.jpg'),
'clearway.jpg': require('../../assets/image2/clearway.jpg'),
'closeeyesidewalk.jpg': require('../../assets/image2/closeeyesidewalk.jpg'),
'coin-basket.jpg': require('../../assets/image2/coin-basket.jpg'),
'continouswhitelinesahead.jpg': require('../../assets/image2/continouswhitelinesahead.jpg'),
'contraflowbuslane.jpg': require('../../assets/image2/contraflowbuslane.jpg'),
'crossleftlane.jpg': require('../../assets/image2/crossleftlane.jpg'),
'crossrightlane.jpg': require('../../assets/image2/crossrightlane.jpg'),
'crossroads.jpg': require('../../assets/image2/crossroads.jpg'),
'crosswinds.jpg': require('../../assets/image2/crosswinds.jpg'),
'cycletrack.jpg': require('../../assets/image2/cycletrack.jpg'),
'dangerousbend.jpg': require('../../assets/image2/dangerousbend.jpg'),
'dangerouscorner.jpg': require('../../assets/image2/dangerouscorner.jpg'),
'deer.jpg': require('../../assets/image2/deer.jpg'),
'directionalindicator.jpg': require('../../assets/image2/directionalindicator.jpg'),
'diskparking.jpg': require('../../assets/image2/diskparking.jpg'),
'driveonleft.jpg': require('../../assets/image2/driveonleft.jpg'),
'dualcarriagewayahead.jpg': require('../../assets/image2/dualcarriagewayahead.jpg'),
'endofmotorway.jpg': require('../../assets/image2/endofmotorway.jpg'),
'endofobstruction.jpg': require('../../assets/image2/endofobstruction.jpg'),
'etoll.jpg': require('../../assets/image2/etoll.jpg'),
'fallingrocks.jpg': require('../../assets/image2/fallingrocks.jpg'),
'faultbrakingsystem.jpg': require('../../assets/image2/faultbrakingsystem.jpg'),
'flagmanahead.jpg': require('../../assets/image2/flagmanahead.jpg'),
'flashingleftamberlight.jpg': require('../../assets/image2/flashingleftamberlight.jpg'),
'focuscrosswinds.jpg': require('../../assets/image2/focuscrosswinds.jpg'),
'frontturnleft.jpg': require('../../assets/image2/frontturnleft.jpg'),
'frontturnright.jpg': require('../../assets/image2/frontturnright.jpg'),
'gardaeitherside.jpg': require('../../assets/image2/gardaeitherside.jpg'),
'gardafrontproceed.jpg': require('../../assets/image2/gardafrontproceed.jpg'),
'gardastop.jpg': require('../../assets/image2/gardastop.jpg'),
'gardastopbehind.jpg': require('../../assets/image2/gardastopbehind.jpg'),
'go.jpg': require('../../assets/image2/go.jpg'),
'greenleftright.jpg': require('../../assets/image2/greenleftright.jpg'),
'greenrightlight.jpg': require('../../assets/image2/greenrightlight.jpg'),
'greentrafficlight.jpg': require('../../assets/image2/greentrafficlight.jpg'),
'guardedlevelcrossing.jpg': require('../../assets/image2/guardedlevelcrossing.jpg'),
'hardshoulder.jpg': require('../../assets/image2/hardshoulder.jpg'),
'heavyrainroad.jpg': require('../../assets/image2/heavyrainroad.jpg'),
'highbeam.jpg': require('../../assets/image2/highbeam.jpg'),
'horses.jpg': require('../../assets/image2/horses.jpg'),
'junctionlesser.jpg': require('../../assets/image2/junctionlesser.jpg'),
'keepleft.jpg': require('../../assets/image2/keepleft.jpg'),
'keepright.jpg': require('../../assets/image2/keepright.jpg'),
'loosechippings.jpg': require('../../assets/image2/loosechippings.jpg'),
'lowflyingaircraft.jpg': require('../../assets/image2/lowflyingaircraft.jpg'),
'lowoillevel.jpg': require('../../assets/image2/lowoillevel.jpg'),
'mainbearleft.jpg': require('../../assets/image2/mainbearleft.jpg'),
'majorahead.jpg': require('../../assets/image2/majorahead.jpg'),
'max10tonnes.jpg': require('../../assets/image2/max10tonnes.jpg'),
'maxheight.jpg': require('../../assets/image2/maxheight.jpg'),
'maynotcross.jpg': require('../../assets/image2/maynotcross.jpg'),
'mergingdiverging.jpg': require('../../assets/image2/mergingdiverging.jpg'),
'miniroundaboutahead.jpg': require('../../assets/image2/miniroundaboutahead.jpg'),
'motorwayahead.jpg': require('../../assets/image2/motorwayahead.jpg'),
'motorwayend.jpg': require('../../assets/image2/motorwayend.jpg'),
'motorwayentry.jpg': require('../../assets/image2/motorwayentry.jpg'),
'narrowbothsides.jpg': require('../../assets/image2/narrowbothsides.jpg'),
'narrowleft.jpg': require('../../assets/image2/narrowleft.jpg'),
'narrowright.jpg': require('../../assets/image2/narrowright.jpg'),
'nearsidethreeclosed.jpg': require('../../assets/image2/nearsidethreeclosed.jpg'),
'nearsidetwoclosed.jpg': require('../../assets/image2/nearsidetwoclosed.jpg'),
'noentry.jpg': require('../../assets/image2/noentry.jpg'),
'noentrymarking.jpg': require('../../assets/image2/noentrymarking.jpg'),
'noentryunlessclear.jpg': require('../../assets/image2/noentryunlessclear.jpg'),
'noleft.jpg': require('../../assets/image2/noleft.jpg'),
'noparkingarea.jpg': require('../../assets/image2/noparkingarea.jpg'),
'noright.jpg': require('../../assets/image2/noright.jpg'),
'nouturn.jpg': require('../../assets/image2/nouturn.jpg'),
'obstruction.jpg': require('../../assets/image2/obstruction.jpg'),
'offsidethreeclosed.jpg': require('../../assets/image2/offsidethreeclosed.jpg'),
'oncomingheadlights.jpg': require('../../assets/image2/oncomingheadlights.jpg'),
'oncomingstraight.jpg': require('../../assets/image2/oncomingstraight.jpg'),
'oncomingturnleft.jpg': require('../../assets/image2/oncomingturnleft.jpg'),
'oncomingturnright.jpg': require('../../assets/image2/oncomingturnright.jpg'),
'overhangingload.jpg': require('../../assets/image2/overhangingload.jpg'),
'overheadcables.jpg': require('../../assets/image2/overheadcables.jpg'),
'overtakeifsafetodoso.jpg': require('../../assets/image2/overtakeifsafetodoso.jpg'),
'parking.jpg': require('../../assets/image2/parking.jpg'),
'parkingnotallowedattimes.jpg': require('../../assets/image2/parkingnotallowedattimes.jpg'),
'parkingprohibited.jpg': require('../../assets/image2/parkingprohibited.jpg'),
'parkingprohibitedalltimes.jpg': require('../../assets/image2/parkingprohibitedalltimes.jpg'),
'passeitherside.jpg': require('../../assets/image2/passeitherside.jpg'),
'pedestriancrossing.jpg': require('../../assets/image2/pedestriancrossing.jpg'),
'pedestriancrossright.jpg': require('../../assets/image2/pedestriancrossright.jpg'),
'pedestrianisedstreet.jpg': require('../../assets/image2/pedestrianisedstreet.jpg'),
'pooorlylitstreet.jpg': require('../../assets/image2/pooorlylitstreet.jpg'),
'queueslikely.jpg': require('../../assets/image2/queueslikely.jpg'),
'railway.jpg': require('../../assets/image2/railway.jpg'),
'redtrafficlight.jpg': require('../../assets/image2/redtrafficlight.jpg'),
'revcounter.jpg': require('../../assets/image2/revcounter.jpg'),
'roaddivides.jpg': require('../../assets/image2/roaddivides.jpg'),
'roadnarrow.jpg': require('../../assets/image2/roadnarrow.jpg'),
'roadnarrowleft.jpg': require('../../assets/image2/roadnarrowleft.jpg'),
'roadworks.jpg': require('../../assets/image2/roadworks.jpg'),
'roadworksstop.jpg': require('../../assets/image2/roadworksstop.jpg'),
'roundaboutahead.jpg': require('../../assets/image2/roundaboutahead.jpg'),
'schoolahead.jpg': require('../../assets/image2/schoolahead.jpg'),
'schoolcrossingahead.jpg': require('../../assets/image2/schoolcrossingahead.jpg'),
'seriesdangerousbends.jpg': require('../../assets/image2/seriesdangerousbends.jpg'),
'seriesdangerouscorners.jpg': require('../../assets/image2/seriesdangerouscorners.jpg'),
'seriesofbumps.jpg': require('../../assets/image2/seriesofbumps.jpg'),
'sharedtrack.jpg': require('../../assets/image2/sharedtrack.jpg'),
'sharpascent.jpg': require('../../assets/image2/sharpascent.jpg'),
'sharpchangeright.jpg': require('../../assets/image2/sharpchangeright.jpg'),
'sharpdepression.jpg': require('../../assets/image2/sharpdepression.jpg'),
'sharpdescent.jpg': require('../../assets/image2/sharpdescent.jpg'),
'sharprise.jpg': require('../../assets/image2/sharprise.jpg'),
'sheep.jpg': require('../../assets/image2/sheep.jpg'),
'signalslowdown.jpg': require('../../assets/image2/signalslowdown.jpg'),
'signalstraighton.jpg': require('../../assets/image2/signalstraighton.jpg'),
'signalturnleft.jpg': require('../../assets/image2/signalturnleft.jpg'),
'signalturnright.jpg': require('../../assets/image2/signalturnright.jpg'),
'slipperyroad.jpg': require('../../assets/image2/slipperyroad.jpg'),
'solidwhite.jpg': require('../../assets/image2/solidwhite.jpg'),
'staggeredequal.jpg': require('../../assets/image2/staggeredequal.jpg'),
'startofobstruction.jpg': require('../../assets/image2/startofobstruction.jpg'),
'stop.jpg': require('../../assets/image2/stop.jpg'),
'stopcrossing.jpg': require('../../assets/image2/stopcrossing.jpg'),
'stopfrontbehind.jpg': require('../../assets/image2/stopfrontbehind.jpg'),
'stopredlights.jpg': require('../../assets/image2/stopredlights.jpg'),
'straightahead.jpg': require('../../assets/image2/straightahead.jpg'),
'taxirank.jpg': require('../../assets/image2/taxirank.jpg'),
'tdualcarriageway.jpg': require('../../assets/image2/tdualcarriageway.jpg'),
'temporarytrafficsignals.jpg': require('../../assets/image2/temporarytrafficsignals.jpg'),
'tjunction.jpg': require('../../assets/image2/tjunction.jpg'),
'tmajor.jpg': require('../../assets/image2/tmajor.jpg'),
'trafficmergeleft.jpg': require('../../assets/image2/trafficmergeleft.jpg'),
'trafficsignal.jpg': require('../../assets/image2/trafficsignal.jpg'),
'tramcycle.jpg': require('../../assets/image2/tramcycle.jpg'),
'tramlaneleft.jpg': require('../../assets/image2/tramlaneleft.jpg'),
'tramlaneright.jpg': require('../../assets/image2/tramlaneright.jpg'),
'tramway.jpg': require('../../assets/image2/tramway.jpg'),
'tramwaycrossing.jpg': require('../../assets/image2/tramwaycrossing.jpg'),
'tunnel.jpg': require('../../assets/image2/tunnel.jpg'),
'turnleft.jpg': require('../../assets/image2/turnleft.jpg'),
'turnleftahead.jpg': require('../../assets/image2/turnleftahead.jpg'),
'turnright.jpg': require('../../assets/image2/turnright.jpg'),
'turnrightahead.jpg': require('../../assets/image2/turnrightahead.jpg'),
'twowaytraffic.jpg': require('../../assets/image2/twowaytraffic.jpg'),
'uneven.jpg': require('../../assets/image2/uneven.jpg'),
'unevensurface.jpg': require('../../assets/image2/unevensurface.jpg'),
'unguardedlevelcrossing.jpg': require('../../assets/image2/unguardedlevelcrossing.jpg'),
'unprotectedwater.jpg': require('../../assets/image2/unprotectedwater.jpg'),
'wetskiddy.jpg': require('../../assets/image2/wetskiddy.jpg'),
'whitearrows.jpg': require('../../assets/image2/whitearrows.jpg'),
'yequal.jpg': require('../../assets/image2/yequal.jpg'),
'yield.jpg': require('../../assets/image2/yield.jpg'),
'zebracrossing.jpg': require('../../assets/image2/zebracrossing.jpg'),
};

/**
 * 获取问题的翻译版本
 * @param {Object} question - 题目对象
 * @param {string} language - 语言代码 (zh, en, cs, es)
 * @returns {Object} 处理后的题目对象
 */
const getQuestionTranslation = (question, language = 'zh') => {
  try {
    if (!question) {
      throw new Error('题目对象为空');
    }
    
    // 如果问题有翻译字段且包含请求的语言
    if (question.translations && question.translations[language]) {
      const translation = question.translations[language];
      
      // 验证翻译数据的完整性
      if (!translation.question || !translation.answers || !Array.isArray(translation.answers)) {
        throw new Error(`语言 ${language} 的翻译数据不完整`);
      }
      
      // 创建一个新的问题对象，保留原始问题的属性
      return {
        ...question,
        question: translation.question,
        answers: translation.answers.map(ans => ({
          text: ans.text,
          correct: ans.correct
        }))
      };
    }
    
    // 如果没有请求语言的翻译，尝试使用中文版本
    if (language !== 'zh' && question.translations && question.translations.zh) {
      console.warn(`未找到语言 ${language} 的翻译，使用中文版本`);
      const translation = question.translations.zh;
      
      return {
        ...question,
        question: translation.question,
        answers: translation.answers.map(ans => ({
          text: ans.text,
          correct: ans.correct
        }))
      };
    }
    
    // 如果没有任何翻译，抛出错误
    throw new Error(`题目 ${question.id || '未知'} 没有可用的翻译`);
  } catch (error) {
    console.error('获取题目翻译时出错:', error, question);
    // 返回一个带有错误信息的题目对象
    return {
      ...question,
      question: `[翻译错误] ${error.message}`,
      answers: question.answers || [],
      hasError: true
    };
  }
};

/**
 * 加载题目数据集
 * @param {number} setNumber - 题目集编号
 * @param {string} language - 语言代码 (zh, en, cs, es)
 * @returns {Promise<Array>} 题目数组
 */
export const loadQuestionSet = async (setNumber = 0, language = 'zh') => {
  try {
    // 动态导入JSON数据
    let questionSet;
    
    try {
      if (setNumber === 0) {
        questionSet = await import('../../assets/data/setofquestions0.json');
      } else if (setNumber === 1) {
        questionSet = await import('../../assets/data/setofquestions1.json');
      } else if (setNumber === 2) {
        questionSet = await import('../../assets/data/setofquestions2.json');
      } else {
        // 默认加载第2集的修复版本
        questionSet = await import('../../assets/data/setofquestions3.json');
      }
      console.log(`加载题库 ${setNumber}`);
    } catch (error) {
      console.warn(`加载题集 ${setNumber} 失败，使用默认题集2: ${error.message}`);
    }
    
    // 确保我们有可用的数据
    if (!questionSet) {
      throw new Error(`题库 ${setNumber} 数据为空`);
    }
    
    const questions = Array.isArray(questionSet.default) ? questionSet.default : questionSet;
    
    // 处理题目中的图片引用并应用翻译
    return questions.map(question => {
      // 获取翻译后的问题
      const translatedQuestion = getQuestionTranslation(question, language);
      
      // 确保answers字段格式正确
      if (translatedQuestion.answers) {
        translatedQuestion.options = translatedQuestion.answers.map((ans, idx) => ({
          id: String.fromCharCode(65 + idx), // A, B, C...
          text: ans.text,
          isCorrect: ans.correct
        }));
      }
      
      // 如果有picture属性，提取信号ID
      if (translatedQuestion.picture) {
        const signalMatch = translatedQuestion.picture.match(/signal(\d+)/i);
        if (signalMatch && signalMatch[1]) {
          const signalId = parseInt(signalMatch[1], 10);
          if (trafficSignalImages[signalId]) {
            translatedQuestion.signalImage = trafficSignalImages[signalId];
          }
        } else if (translatedQuestion.picture.includes('images/image')) {
          // 处理普通图片路径，如 "images/image47.png"
          try {
            const imageMatch = translatedQuestion.picture.match(/images\/image(\d+)\.png/i);
            if (imageMatch && imageMatch[1]) {
              const imageNumber = imageMatch[1];
              // 使用预加载的图片资源
              if (imageAssets[imageNumber]) {
                translatedQuestion.signalImage = imageAssets[imageNumber];
                console.log(`加载图片: image${imageNumber}.png`);
              } else {
                console.warn(`未预加载图片: image${imageNumber}.png`);
              }
            }
          } catch (error) {
            console.warn(`无法加载图片: ${translatedQuestion.picture}`, error);
          }
        } else if (translatedQuestion.picture.includes('image2/')) {
          // 处理 image2 目录下的 jpg 资源，如 "image2/motorwayend.jpg"
          try {
            const fileName = translatedQuestion.picture.split('/').pop();
            if (fileName && image2Assets[fileName]) {
              translatedQuestion.signalImage = image2Assets[fileName];
              console.log(`加载图片: image2/${fileName}`);
            } else {
              console.warn(`未预加载图片: image2/${fileName}`);
            }
          } catch (error) {
            console.warn(`无法加载图片: ${translatedQuestion.picture}`, error);
          }
        }
      }
      
      // 确保所有必要的字段都存在
      return {
        ...translatedQuestion,
        id: translatedQuestion.id || `temp_${setNumber}_${Math.random().toString(36).substr(2, 9)}`,
        category: translatedQuestion.category || 'general',
        answers: translatedQuestion.answers || [],
        options: translatedQuestion.options || []
      };
    });
  } catch (error) {
    console.error(`Failed to load question set ${setNumber}:`, error);
    throw error; // 抛出错误以便上层处理
  }
};

/**
 * 加载所有题目数据集
 * @param {string} language - 语言代码 (zh, en, cs, es)
 * @returns {Promise<Array>} 合并后的题目数组
 */
export const loadAllQuestionSets = async (language = 'zh') => {
  try {
    const sets = [];
    const errors = [];
    
    // 只尝试加载已知存在的题目集
    const availableSets = [0, 1, 2, 3];
    
    for (const setNumber of availableSets) {
      try {
        console.log(`尝试加载题集 ${setNumber}...`);
        const set = await loadQuestionSet(setNumber, language);
        
        if (set && Array.isArray(set)) {
          console.log(`成功加载题集 ${setNumber}, 共 ${set.length} 题`);
          sets.push(...set);
        } else {
          console.warn(`题集 ${setNumber} 加载成功但格式无效`);
          errors.push(`题目集 ${setNumber} 格式无效`);
        }
      } catch (e) {
        console.error(`题目集 ${setNumber} 加载失败:`, e.message);
        errors.push(`题目集 ${setNumber} 加载失败: ${e.message}`);
        // 继续加载其他题集，不中断流程
      }
    }
    
    // 如果至少加载了一个题集
    if (sets.length > 0) {
      console.log(`总共加载了 ${sets.length} 道题目`);
      
      if (errors.length > 0) {
        // 记录错误但不阻止应用运行
        console.warn('加载过程中出现以下错误:', errors.join('; '));
      }
      
      return sets;
    }
    
    // 如果一个题集都没加载成功，尝试返回一个最小题集
    console.error('没有成功加载任何题集，使用备用题集');
    
    try {
      const backupQuestions = await import('../../assets/data/setofquestions3.json');
      const questions = Array.isArray(backupQuestions.default) ? backupQuestions.default : backupQuestions;
      return questions;
    } catch (backupError) {
      // 如果连备用选项都失败了，抛出累积的错误
      throw new Error(`无法加载任何题库: ${errors.join('; ')}`);
    }
  } catch (error) {
    console.error('加载所有题目集时出错:', error);
    throw error; // 让上层处理
  }
};

/**
 * 获取交通信号图标
 * @param {number} signalId - 信号ID
 * @returns {object} 图标资源
 */
export const getTrafficSignalImage = (signalId) => {
  return trafficSignalImages[signalId] || null;
};

/**
 * 根据类别获取题目
 * @param {string} category - 题目类别
 * @param {string} language - 语言代码
 * @returns {Promise<Array>} 过滤后的题目数组
 */
export const getQuestionsByCategory = async (category, language = 'zh') => {
  const allQuestions = await loadAllQuestionSets(language);
  
  if (!category || category === 'all') {
    return allQuestions;
  }
  
  return allQuestions.filter(q => q.category === category);
};

/**
 * 获取所有可用的题目分类
 * @returns {Promise<Array>} 分类数组
 */
export const getAllCategories = async () => {
  try {
    const questions = await loadAllQuestionSets();
    
    if (!Array.isArray(questions) || questions.length === 0) {
      console.warn('获取分类时发现题目数据为空或无效');
      return ['general']; // 返回默认分类
    }
    
    // 使用Set去重
    const categories = Array.from(new Set(
      questions
        .filter(q => q && q.category) // 过滤掉没有分类的题目
        .map(q => q.category)
    ));
    
    // 如果没有找到任何分类，返回一个默认值
    if (categories.length === 0) {
      console.warn('未找到任何分类，使用默认分类');
      return ['general'];
    }
    
    return categories;
  } catch (error) {
    console.error('获取分类失败:', error);
    return ['general']; // 出错时返回默认分类，避免应用崩溃
  }
};

/**
 * 获取中文分类名称
 * @param {string} category - 原始类别名
 * @returns {string} 中文分类名
 */
export const getChineseCategoryName = (category) => {
  const categoryMap = {
    'traffic_signs': '交通标志',
    'rules': '交通规则',
    'safety': '安全常识',
    'vehicle': '车辆知识',
    'emergency': '应急处理',
    'all': '所有题目'
  };
  
  return categoryMap[category] || category;
};

export default {
  loadQuestionSet,
  loadAllQuestionSets,
  getTrafficSignalImage,
  getQuestionsByCategory,
  getAllCategories,
  getChineseCategoryName,
  getQuestionTranslation
};