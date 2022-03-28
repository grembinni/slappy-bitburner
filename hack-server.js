/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	var server = ns.args[0] ?? "n00dles";
	// hack
	while (await canHack(server)) {
		var threshold = await hasFunds(ns, server);
		if ( .7 < threshold) {
			await ns.hack(server);
		} else {
			await ns.sleep(50000);
		}
	}
}

/** filter of servers not to hack */
 async function canHack(server) {
	return server != "home";
}

async function hasFunds(ns, server) {	
	var maxMoney = await ns.getServerMaxMoney(server);
	var moneyAvailable = await ns.getServerMoneyAvailable(server);
	return (moneyAvailable / maxMoney).toFixed(2);
}