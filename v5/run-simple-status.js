/** todo */
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? 'home';
	// disable logs
	// ns.disableLog('ALL');	
	
	while(true) {
		await getGrowThreshold(ns, hostServer);
		await getWeakenThreshold(ns, hostServer);
		await ns.sleep(1000);	
	}
}

/** todo */
async function getGrowThreshold(ns, server) {
	var maxMoney = await ns.getServerMaxMoney(server);
	ns.print(server + ' - moneyMax:           ' + maxMoney.toFixed(2));
	var moneyAvailable = await ns.getServerMoneyAvailable(server);
	ns.print(server + ' - moneyAvailable:     ' + moneyAvailable.toFixed(2));
	var growThreshold = (moneyAvailable / maxMoney).toFixed(2);
	ns.print(server + ' - moneyThreshold:     ' + growThreshold*100 + '%');
	ns.print('- - - - - - - - - - - - - - - - - - - - - - - - - - - -');
	return growThreshold;
}

/** todo */
async function getWeakenThreshold(ns, server) {
	var minSecurityLevel = await ns.getServerMinSecurityLevel(server);
	ns.print(server + ' - securityMin:          ' + minSecurityLevel.toFixed(2));
	var securityLevel = await ns.getServerSecurityLevel(server);
	ns.print(server + ' - security:             ' + securityLevel.toFixed(2));
	var weakenThreshold = (minSecurityLevel / securityLevel).toFixed(2);
	ns.print(server + ' - securityThreshold:    ' + weakenThreshold*100 + '%');
	ns.print('- - - - - - - - - - - - - - - - - - - - - - - - - - - -');
	return weakenThreshold;
}