/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	var server = ns.args[0] ?? "n00dles";
	// pull financial settings
	var currentMoney = await ns.getServerMoneyAvailable(server);
	const maxMoney = await ns.getServerMaxMoney(server);
	// set threshholds
	const resetThreshold = maxMoney*.85;
	const targetThreshold = maxMoney*.99;
	// monitor
    while(true) {
		if (currentMoney < resetThreshold) {
			while (currentMoney < targetThreshold) {
				var growthRate = await ns.grow(server);
				currentMoney = currentMoney + (currentMoney * growthRate);
			}
		} else {
			await ns.sleep(30000);
			currentMoney = await ns.getServerMoneyAvailable(server);
		}
	}
}