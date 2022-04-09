/** @param {NS} ns **/
export async function main(ns) {

	await ns.run('status.js', 1, 'home');
	await ns.sleep(50);
	await ns.run('netbot.js', 1, 'home');
	await ns.sleep(50);
	await ns.run('attack.js', 1, 'home');
	await ns.sleep(50);
	await ns.run('restart.js', 1, 'home');
	await ns.sleep(50);
	await ns.run('kill.js', 1, 'iron-gym');
}