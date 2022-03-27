/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	var server = ns.args[0];

	while (await canHack(ns, server)) {
		await hasMoney(ns, server);
		await attemptWeaken(ns, server);
		await ns.hack(server);
	}
}

/** Check if server can be hacked. Lower security if needed. */
 async function hasMoney(ns, server) {
	
	var hasMoney = false;
    //ns.tprint(server);
	var moneyAvailable = await ns.getServerMoneyAvailable(server);
	var maxMoney = await ns.getServerMaxMoney(server);
	var currentThreshold = moneyAvailable / maxMoney;
	var resetThreshold = maxMoney*.5;
	var targetThreshold = maxMoney*.8;
    //ns.tprint(moneyAvailable, maxMoney);
	if (currentThreshold < resetThreshold) {
		while (currentThreshold < targetThreshold) {
			await attemptWeaken(ns, server);
			var growthRate = await ns.grow(server);
			moneyAvailable = moneyAvailable + (moneyAvailable * growthRate);
			currentThreshold = moneyAvailable / maxMoney;
		}
		hasMoney = true;
	}

    return hasMoney;
}

/** Check if server can be hacked. Lower security if needed. */
 async function canHack(ns, server) {
	if (server === "home") {
		return false;
	}
	var canHack = false;
    //ns.tprint(server);
	var requiredHackingLevel = await ns.getServerRequiredHackingLevel(server);
	var hackingLevel = await ns.getHackingLevel();
    //ns.tprint(requiredHackingLevel, hackingLevel);

    if (hackingLevel >= requiredHackingLevel) {
		await attemptWeaken(ns, server);
		canHack = true;
	}

    return canHack;
}

/** Lower server security if needed. */
 async function attemptWeaken(ns, server) {
    //ns.tprint(server);
	var serverSecurityLevel = await ns.getServerSecurityLevel(server);
	var serverMinSecurityLevel = await ns.getServerMinSecurityLevel(server);
	var resetSecurityLevel = serverMinSecurityLevel*1.3;
	var targetSecurityLevel = serverMinSecurityLevel*1.1;
	//ns.tprint(serverSecurityLevel, serverMinSecurityLevel);
	if (resetSecurityLevel < serverSecurityLevel) {
		while (targetSecurityLevel < serverSecurityLevel) {
			securityLevelChange = await ns.weaken(server);
			serverSecurityLevel = serverSecurityLevel - securityLevelChange;
		}
	}
}