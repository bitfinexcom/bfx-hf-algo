'use strict'

/**
 * This module implements an algorithmic order system using the Bitfinex
 * Node.JS API, and provides several official algo orders which serve as
 * reference implementations.
 *
 * The system is exchange-agnostic and relies on external adapter libraries for
 * the actual exchange API connection. For bitfinex, this adapter is provided
 * by the {@link external:bfx-hf-ext-plugin-bitfinex} module.
 *
 * ### DB Backends
 *
 * Algo order persistence is handled by the {@link external:bfx-hf-models}
 * module, with supports multiple database backends. Currently two official
 * modules are provided:
 *
 * * {@link external:bfx-hf-models-adapter-lowdb} for storage via `lowdb`
 * * {@link external:bfx-hf-models-adapter-sql} for storage via `knex`
 *   configured for `PostgreSQL`.
 *
 * {@link external:bfx-hf-models-adapter-template} provides an example of the
 * structure required to implement a custom database adapter.
 *
 * ### Exchange Interfaces
 *
 * `bfx-hf-algo` is designed to work with any exchange through the use of
 * adapter modules, providing a common API for algorithmic order execution.
 *
 * * {@link external:bfx-hf-ext-plugin-bitfinex} implements this API for
 *   {@link https://bitfinex.com|Bitfinex}.
 * * {@link external:bfx-hf-ext-plugin-dummy} provides an example of the
 *   required structure.
 *
 * @license Apache-2.0
 * @module bfx-hf-algo
 */

/**
 * @external bfx-hf-ext-plugin-bitfinex
 * @see https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex
 */

/**
 * @external bfx-hf-models
 * @see https://github.com/bitfinexcom/bfx-hf-models
 */

/**
 * @external bfx-hf-models-adapter-lowdb
 * @see https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb
 */

/**
 * @external bfx-hf-models-adapter-sql
 * @see https://github.com/bitfinexcom/bfx-hf-models-adapter-sql
 */

/**
 * @external bfx-hf-models-adapter-template
 * @see https://github.com/bitfinexcom/bfx-hf-models-adapter-template
 */

/**
 * @external bfx-hf-ext-plugin-dummy
 * @see https://github.com/bitfinexcom/bfx-hf-ext-plugin-dummy
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
