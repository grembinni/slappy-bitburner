import {isAttackable} from 'bit-utils.js';

/** todo */
export async function main(ns) {
	var server = ns.args[0] ?? 'n00dles';
	if (isAttackable(server)) {
		await ns.weaken(server);
	}
}