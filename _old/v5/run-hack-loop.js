import {isAttackable} from 'bit-utils.js';

/** todo */
export async function main(ns) {
	var server = ns.args[0];
	while (isAttackable(server)) {
		await ns.hack(server);
	}
}