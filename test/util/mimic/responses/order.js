'use strict'

module.exports = function ({ id, gid, cid, amount, status }) {
  return [
    id,
    gid,
    cid,
    'tAAABBB',
    1624612619335,
    1624612619337,
    amount,
    5,
    'EXCHANGE LIMIT',
    null,
    null,
    null,
    0,
    status, // ACTIVE | CANCELED | EXECUTED
    null,
    null,
    5,
    0,
    0,
    0,
    null,
    null,
    null,
    0,
    0,
    null,
    null,
    null,
    'API>BFX',
    null,
    null,
    {
      _HF: 1,
      label: 'Bracket | 5 @ 5  | triggers 5 @ 5 (stop 5)',
      aff_code: 'xZvWHMNR'
    }
  ]
}
