import {runSingle} from 'script-utils.js';

export async function main(ns) {
	await runSingle(ns, 'status-bot.js');
	await ns.sleep(500);
	await runSingle(ns, 'attack-bot.js');
	await ns.sleep(500);
	// await runSingle(ns, 'swarm-bot.js');
	await runSingle(ns, 'hive-bot.js');
	await ns.sleep(500);
	await runSingle(ns, 'sabotage-bot.js');
	await ns.sleep(500);
	await runSingle(ns, 'net-bot.js');
}