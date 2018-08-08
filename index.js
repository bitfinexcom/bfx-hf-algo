'use strict'

module.exports = {
  AlgoOrder: require('./lib/algo_order'),
  IcebergOrder: require('./lib/algos/iceberg'),
  MarketMakerOrder: require('./lib/algos/market_maker'),
  TWAPOrder: require('./lib/algos/twap'),
  VWAPOrder: require('./lib/algos/vwap'),
  NoDataError: require('./lib/errors/no_data')
}
