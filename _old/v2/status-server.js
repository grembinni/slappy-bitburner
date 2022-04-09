/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? "home";	
	// get connected servers
	const targetServers = await ns.scan(hostServer);
	log(ns, targetServers);
	while(true) {
		for (var i = 0; i < targetServers.length; i++) {
			var targetServer = targetServers[i];
			await getGrowThreshold(ns, targetServer);
			await ns.sleep(2000);
			await getWeakenThreshold(ns, targetServer);
			await ns.sleep(2000);			
		}
	}
}

/** todo */
async function getGrowThreshold(ns, server) {
	var maxMoney = await ns.getServerMaxMoney(server);
	log(ns, server + " - maxMoney: " + maxMoney);
	var moneyAvailable = await ns.getServerMoneyAvailable(server);
	log(ns, server + " - moneyAvailable: " + moneyAvailable);
	var growThreshold = (moneyAvailable / maxMoney).toFixed(2);
	log(ns, server + " - growThreshold: " + growThreshold + "%");
	return growThreshold;
}

/** todo */
async function getWeakenThreshold(ns, server) {
	var minSecurityLevel = await ns.getServerMinSecurityLevel(server);
	log(ns, server + " - minSecurityLevel: " + minSecurityLevel);
	var securityLevel = await ns.getServerSecurityLevel(server);
	log(ns, server + " - securityLevel: " + securityLevel);
	var weakenThreshold = (minSecurityLevel / securityLevel).toFixed(2);
	log(ns, server + " - weakenThreshold: " + weakenThreshold + "%");
	return weakenThreshold;
}

function log(ns, toLog) {
	// ns.tprint(toLog);
	console.log(toLog);
}