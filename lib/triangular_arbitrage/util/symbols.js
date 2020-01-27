/* eslint-disable */
const { pair_ccy1 , pair_ccy2, pair_join } = require('@bitfinex/lib-js-util-symbol')
/* eslint-enable */

// 20200110122643
// https://api.bitfinex.com/v1/symbols
// TODO - should dynamically get these
// but we need a better way to provide pre-loaded data

const symbols = [
  'btcusd',
  'ltcusd',
  'ltcbtc',
  'ethusd',
  'ethbtc',
  'etcbtc',
  'etcusd',
  'rrtusd',
  'rrtbtc',
  'zecusd',
  'zecbtc',
  'xmrusd',
  'xmrbtc',
  'dshusd',
  'dshbtc',
  'btceur',
  'btcjpy',
  'xrpusd',
  'xrpbtc',
  'iotusd',
  'iotbtc',
  'ioteth',
  'eosusd',
  'eosbtc',
  'eoseth',
  'sanusd',
  'sanbtc',
  'saneth',
  'omgusd',
  'omgbtc',
  'omgeth',
  'neousd',
  'neobtc',
  'neoeth',
  'etpusd',
  'etpbtc',
  'etpeth',
  'qtmusd',
  'qtmbtc',
  'qtmeth',
  'avtusd',
  'avtbtc',
  'avteth',
  'edousd',
  'edobtc',
  'edoeth',
  'btgusd',
  'btgbtc',
  'datusd',
  'datbtc',
  'dateth',
  'qshusd',
  'qshbtc',
  'qsheth',
  'yywusd',
  'yywbtc',
  'yyweth',
  'gntusd',
  'gntbtc',
  'gnteth',
  'sntusd',
  'sntbtc',
  'snteth',
  'ioteur',
  'batusd',
  'batbtc',
  'bateth',
  'mnausd',
  'mnabtc',
  'mnaeth',
  'funusd',
  'funbtc',
  'funeth',
  'zrxusd',
  'zrxbtc',
  'zrxeth',
  'tnbusd',
  'tnbbtc',
  'tnbeth',
  'spkusd',
  'spkbtc',
  'spketh',
  'trxusd',
  'trxbtc',
  'trxeth',
  'rcnusd',
  'rcnbtc',
  'rcneth',
  'rlcusd',
  'rlcbtc',
  'rlceth',
  'aidusd',
  'aidbtc',
  'aideth',
  'sngusd',
  'sngbtc',
  'sngeth',
  'repusd',
  'repbtc',
  'repeth',
  'elfusd',
  'elfbtc',
  'elfeth',
  'necusd',
  'necbtc',
  'neceth',
  'btcgbp',
  'etheur',
  'ethjpy',
  'ethgbp',
  'neoeur',
  'neojpy',
  'neogbp',
  'eoseur',
  'eosjpy',
  'eosgbp',
  'iotjpy',
  'iotgbp',
  'iosusd',
  'iosbtc',
  'ioseth',
  'aiousd',
  'aiobtc',
  'aioeth',
  'requsd',
  'reqbtc',
  'reqeth',
  'rdnusd',
  'rdnbtc',
  'rdneth',
  'lrcusd',
  'lrcbtc',
  'lrceth',
  'waxusd',
  'waxbtc',
  'waxeth',
  'daiusd',
  'daibtc',
  'daieth',
  'agiusd',
  'agibtc',
  'agieth',
  'bftusd',
  'bftbtc',
  'bfteth',
  'mtnusd',
  'mtnbtc',
  'mtneth',
  'odeusd',
  'odebtc',
  'odeeth',
  'antusd',
  'antbtc',
  'anteth',
  'dthusd',
  'dthbtc',
  'dtheth',
  'mitusd',
  'mitbtc',
  'miteth',
  'stjusd',
  'stjbtc',
  'stjeth',
  'xlmusd',
  'xlmeur',
  'xlmjpy',
  'xlmgbp',
  'xlmbtc',
  'xlmeth',
  'xvgusd',
  'xvgeur',
  'xvgjpy',
  'xvggbp',
  'xvgbtc',
  'xvgeth',
  'bciusd',
  'bcibtc',
  'mkrusd',
  'mkrbtc',
  'mkreth',
  'kncusd',
  'kncbtc',
  'knceth',
  'poausd',
  'poabtc',
  'poaeth',
  'evtusd',
  'lymusd',
  'lymbtc',
  'lymeth',
  'utkusd',
  'utkbtc',
  'utketh',
  'veeusd',
  'veebtc',
  'veeeth',
  'dadusd',
  'dadbtc',
  'dadeth',
  'orsusd',
  'orsbtc',
  'orseth',
  'aucusd',
  'aucbtc',
  'auceth',
  'poyusd',
  'poybtc',
  'poyeth',
  'fsnusd',
  'fsnbtc',
  'fsneth',
  'cbtusd',
  'cbtbtc',
  'cbteth',
  'zcnusd',
  'zcnbtc',
  'zcneth',
  'senusd',
  'senbtc',
  'seneth',
  'ncausd',
  'ncabtc',
  'ncaeth',
  'cndusd',
  'cndbtc',
  'cndeth',
  'ctxusd',
  'ctxbtc',
  'ctxeth',
  'paiusd',
  'paibtc',
  'seeusd',
  'seebtc',
  'seeeth',
  'essusd',
  'essbtc',
  'esseth',
  'atmusd',
  'atmbtc',
  'atmeth',
  'hotusd',
  'hotbtc',
  'hoteth',
  'dtausd',
  'dtabtc',
  'dtaeth',
  'iqxusd',
  'iqxbtc',
  'iqxeos',
  'wprusd',
  'wprbtc',
  'wpreth',
  'zilusd',
  'zilbtc',
  'zileth',
  'bntusd',
  'bntbtc',
  'bnteth',
  'absusd',
  'abseth',
  'xrausd',
  'xraeth',
  'manusd',
  'maneth',
  'bbnusd',
  'bbneth',
  'niousd',
  'nioeth',
  'dgxusd',
  'dgxeth',
  'vetusd',
  'vetbtc',
  'veteth',
  'utnusd',
  'utneth',
  'tknusd',
  'tkneth',
  'gotusd',
  'goteur',
  'goteth',
  'xtzusd',
  'xtzbtc',
  'cnnusd',
  'cnneth',
  'boxusd',
  'boxeth',
  'trxeur',
  'trxgbp',
  'trxjpy',
  'mgousd',
  'mgoeth',
  'rteusd',
  'rteeth',
  'yggusd',
  'yggeth',
  'mlnusd',
  'mlneth',
  'wtcusd',
  'wtceth',
  'csxusd',
  'csxeth',
  'omnusd',
  'omnbtc',
  'intusd',
  'inteth',
  'drnusd',
  'drneth',
  'pnkusd',
  'pnketh',
  'dgbusd',
  'dgbbtc',
  'bsvusd',
  'bsvbtc',
  'babusd',
  'babbtc',
  'wlousd',
  'wloxlm',
  'vldusd',
  'vldeth',
  'enjusd',
  'enjeth',
  'onlusd',
  'onleth',
  'rbtusd',
  'rbtbtc',
  'ustusd',
  'euteur',
  'eutusd',
  'gsdusd',
  'udcusd',
  'tsdusd',
  'paxusd',
  'rifusd',
  'rifbtc',
  'pasusd',
  'paseth',
  'vsyusd',
  'vsybtc',
  'zrxdai',
  'mkrdai',
  'omgdai',
  'bttusd',
  'bttbtc',
  'btcust',
  'ethust',
  'clousd',
  'clobtc',
  'impusd',
  'impeth',
  'ltcust',
  'eosust',
  'babust',
  'scrusd',
  'screth',
  'gnousd',
  'gnoeth',
  'genusd',
  'geneth',
  'atousd',
  'atobtc',
  'atoeth',
  'wbtusd',
  'xchusd',
  'eususd',
  'wbteth',
  'xcheth',
  'euseth',
  'leousd',
  'leobtc',
  'leoust',
  'leoeos',
  'leoeth',
  'astusd',
  'asteth',
  'foausd',
  'foaeth',
  'ufrusd',
  'ufreth',
  'zbtusd',
  'zbtust',
  'okbusd',
  'uskusd',
  'gtxusd',
  'kanusd',
  'okbust',
  'okbeth',
  'okbbtc',
  'uskust',
  'usketh',
  'uskbtc',
  'uskeos',
  'gtxust',
  'kanust',
  'ampusd',
  'algusd',
  'algbtc',
  'algust',
  'btcxch',
  'swmusd',
  'swmeth',
  'triusd',
  'trieth',
  'loousd',
  'looeth',
  'ampust',
  'dusk:usd',
  'dusk:btc',
  'uosusd',
  'uosbtc',
  'rrbusd',
  'rrbust',
  'dtxusd',
  'dtxust',
  'ampbtc',
  'fttusd',
  'fttust',
  'paxust',
  'udcust',
  'tsdust',
  'btc:cnht',
  'ust:cnht',
  'cnh:cnht',
  'chzusd',
  'chzust',
  'btcf0:ustf0',
  'ethf0:ustf0'
]

let symbolsMap = {}
symbols.forEach((symb) => {
  symbolsMap[symb] = symb
})

let ccyMap = {}
symbols.forEach((sym) => {
  let cc1 = pair_ccy1(sym)
  let cc2 = pair_ccy2(sym)
  ccyMap[cc1] = cc1
  ccyMap[cc2] = cc2
})

/**
 * Returns true if the currency exists in the list of supported
 * symbols on bitfinex
 * @param {string} ccy
 */
function doesCcyExist (ccy) {
  return !!ccyMap[ccy.toLowerCase()]
}

function doesPairExist (pair) {
  return !!symbolsMap[pair.toLowerCase()]
}

/**
 * Returns the ending currency after the order has
 * been executed
 * @param {Order} order
 */
function getOrderFinalCurrency (order) {
  if (order.amountOrigin < 0) {
    // sell
    return getQuote(order.symbol)
  } else {
    // buy
    return getBase(order.symbol)
  }
}

/**
 * Gets all of the available intermediate pairs for
 * triangular arbitrage.
 * @param {string} pair
 * @param {boolean} isBuy (true = buy, false = sell)
 */
function getIntermediatePairsForPair (pair, isBuy) {
  /* This function has to be quite complicated since it needs
  to calculate all round trip pairs. Ect:

  This works:
  BTCUSD
  ETHBTC
  ETHUSD

  But this doesnt:
  XRPUSD
  ETHXRP <--- market does not exist
  */
  return Object.keys(ccyMap).map((ccy) => {
    let { interMarket, finalMarket } = getRoundTripSymbols(pair, ccy, isBuy)
    if (doesPairExist(interMarket) && doesPairExist(finalMarket)) {
      return interMarket.toUpperCase()
    }
  })
    // filter out null markets
    .filter((x) => x)
}

/**
 * Gets all of the available intermediate currencies for
 * triangular arbitrage.
 * @param {string} pair
 * @param {boolean} isBuy (true = buy, false = sell)
 */
function getIntermediateCurrenciesForPair (pair, isBuy) {
  let ccys = {}
  getIntermediatePairsForPair(pair, isBuy).forEach((pair) => {
    ccys[pair_ccy1(pair)] = null
  })
  return Object.keys(ccys)
}

function getRoundTripSymbols (pair, midCcy, isBuy) {
  const baseCcy = pair_ccy1(pair)
  const quoteCcy = pair_ccy2(pair)
  if (isBuy) {
    return {
      startMarket: pair,
      intermediateMarket: pair_join(midCcy, baseCcy),
      finalMarket: pair_join(midCcy, quoteCcy)
    }
  } else {
    return {
      startMarket: pair,
      intermediateMarket: pair_join(midCcy, quoteCcy),
      finalMarket: pair_join(midCcy, baseCcy)
    }
  }
}

function getBase (symbol) {
  return pair_ccy1(symbol.replace('t', ''))
}

function getQuote (symbol) {
  return pair_ccy2(symbol.replace('t', ''))
}

module.exports = {
  Symbols: symbols,
  doesCcyExist,
  doesPairExist,
  getIntermediatePairsForPair,
  getIntermediateCurrenciesForPair,
  getRoundTripSymbols,
  getOrderFinalCurrency,
  getBase,
  getQuote
}
