'use strict'

module.exports = {
  // AlgoOrder: require('./lib/algo_order'),
  AOHost: require('./lib/experimental/ao_host'),
  IcebergOrder: require('./lib/experimental/iceberg'),
  TWAPOrder: require('./lib/experimental/twap'),
  AccumulateDistribute: require('./lib/experimental/accumulate_distribute'),
  // MarketMakerOrder: require('./lib/algos/market_maker'),
  // VWAPOrder: require('./lib/algos/vwap'),
  NoDataError: require('./lib/errors/no_data')
}
