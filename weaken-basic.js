import {isAttackable} from 'attack-utils.js';

/** todo */
export async function main(ns) {
	var server = ns.args[0];
	if(isAttackable(server)) {
		await ns.weaken(server);
	}
}