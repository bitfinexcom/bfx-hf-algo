'use strict'

/**
 * This module implements an algorithmic order system using the Bitfinex
 * Node.JS API, and provides several official algo orders which serve as
 * reference implementations.
 *
 * The system is exchange-agnostic and relies on external adapter libraries for
 * the actual exchange API connection. For bitfinex, this adapter is provided
 * by the {@link module:bfx-hf-ext-plugin-bitfinex|bfx-hf-ext-plugin-bitfinex}
 * module.
 *
 * ### Features
 *
 * * Event-driven algorithm host ({@link module:bfx-hf-algo.AOHost|AOHost})
 * * Plugin-based exchange API connection, enabling the development of adapters
 *   for new exchanges
 * * {@link module:bfx-hf-algo.TWAP|TWAP}
 * * {@link module:bfx-hf-algo.PingPong|Ping/Pong}
 * * {@link module:bfx-hf-algo.AccumulateDistribute|Accumulate Distribute}
 * * {@link module:bfx-hf-algo.MACrossover|MA Crossover}
 * * {@link module:bfx-hf-algo.Iceberg|Iceberg}
 *
 * ### Installation
 *
 * ```bash
 * npm i --save bfx-hf-algo
 * npm i --save bfx-hf-ext-plugin-bitfinex
 * npm i --save bfx-hf-models-adapter-lowdb
 * ```
 *
 * ### DB Backend
 *
 * Algo order persistence is handled by the
 * {@link module:bfx-hf-models|bfx-hf-models} module, with supports multiple
 * database backends. Currently two official modules are provided,
 * {@link module:bfx-hf-models-adapter-lowdb|bfx-hf-models-adapter-lowdb} for
 * storage via {@npm lowdb} and
 * {@link module:bfx-hf-models-adapter-sql|bfx-hf-models-adapter-sql} utilizing
 * {@npm knex} configured for `PostgreSQL`. To implement a custom database
 * adapter, refer to
 * {@link module:bfx-hf-models-adapter-template|bfx-hf-models-adapter-template}
 * for the required structure.
 *
 * ### Exchange Interface
 *
 * {@link module:bfx-hf-algo|bfx-hf-algo} is designed to work with any exchange
 * through the use of adapter modules, providing a common API for algorithmic
 * order execution.
 * {@link module:bfx-hf-ext-plugin-bitfinex|bfx-hf-ext-plugin-bitfinex}
 * implements this API for {@link https://bitfinex.com|Bitfinex}. Refer to
 * {@link module:bfx-hf-ext-plugin-dummy|bfx-hf-ext-plugin-dummy} for the
 * required structure.
 *
 * @license Apache-2.0
 * @module bfx-hf-algo
 */

module.exports = {
  AOHost: require('./lib/ao_host'),
  Iceberg: require('./lib/iceberg'),
  TWAP: require('./lib/twap'),
  AccumulateDistribute: require('./lib/accumulate_distribute'),
  PingPong: require('./lib/ping_pong'),
  MACrossover: require('./lib/ma_crossover'),
  OCOCO: require('./lib/ococo'),
  AsyncEventEmitter: require('./lib/async_event_emitter')
}
