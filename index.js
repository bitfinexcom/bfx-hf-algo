'use strict'

module.exports = {
  // AlgoOrder: require('./lib/algo_order'),
  AOHost: require('./lib/ao_host'),
  IcebergOrder: require('./lib/iceberg'),
  TWAPOrder: require('./lib/twap'),
  AccumulateDistribute: require('./lib/accumulate_distribute'),
  // MarketMakerOrder: require('./lib/algos/market_maker'),
  // VWAPOrder: require('./lib/algos/vwap'),
  NoDataError: require('./lib/errors/no_data')
}
