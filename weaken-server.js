/** @param {NS} ns **/
export async function main(ns) {
	// parse arguments
	const server = ns.args[0] ?? "n00dles";
	// pull security settings
	var currentLevel = await ns.getServerSecurityLevel(server);
	const minLevel = await ns.getServerMinSecurityLevel(server);
	// set thresholds
	const resetThreshold = minLevel*1.3;
	const targetThreshold = minLevel*1.05;
	// monitor
	while(true) {
		if (resetThreshold < currentLevel) {
			while (targetThreshold < currentLevel) {
				levelChange = await ns.weaken(server);
				currentLevel = currentLevel - levelChange;
			}
		} else {
			await ns.sleep(30000);
			currentLevel = await ns.getServerSecurityLevel(server);
		}
	}
}