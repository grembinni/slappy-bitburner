import {scanServer} from 'cerebro.js';
import {attackServers, isAttackable} from 'attack-utils.js';
import {filterArray} from 'bit-utils.js';

/**
 * Attack all servers. Repeat attacks until all servers are unlocked.
 */
export async function main(ns) {
	await attackAllServers(ns);
}

/** 
 * attack all servers 
 */
async function attackAllServers(ns) {
}