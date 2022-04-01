/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	var server = ns.args[0] ?? 'n00dles';
	var hackThreshold = ns.args[1] ?? .8;

	// hack or grow
	while (canHack(server)) {
		var fundThreshold = await hasFunds(ns, server);
		if ( hackThreshold < fundThreshold) {
			await ns.hack(server);
		} else {
			await ns.grow(server);
		}
	}
}

/** filter of servers not to hack */
function canHack(server) {
	
	return server != 'home';
}

/** check the funds on the target server */
async function hasFunds(ns, server) {	
	var maxMoney = await ns.getServerMaxMoney(server);
	var moneyAvailable = await ns.getServerMoneyAvailable(server);
	return (moneyAvailable / maxMoney).toFixed(3);
}