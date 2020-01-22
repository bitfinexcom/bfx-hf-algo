'use strict'

module.exports = {
  AOHost: require('./lib/ao_host'),
  Iceberg: require('./lib/iceberg'),
  TWAP: require('./lib/twap'),
  AccumulateDistribute: require('./lib/accumulate_distribute'),
  PingPong: require('./lib/ping_pong'),
  MACrossover: require('./lib/ma_crossover'),
  OCOCO: require('./lib/ococo'),
  NoDataError: require('./lib/errors/no_data')
}
