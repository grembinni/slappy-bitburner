/** 
 * TODO
 */
export async function buildServerRefs(ns, servers) {	
	ns.print(servers);
	var serverRefs = [];
	// attack all
	for (const server of servers) {
		var root = await ns.hasRootAccess(server);
		var money = await ns.getServerMaxMoney(server);
		var ram = await ns.getServerMaxRam(server);
		var security = await ns.getServerMinSecurityLevel(server);
		var hackLevel = await ns.getServerRequiredHackingLevel(server);
		serverRefs.push(buildServerRef(ns, server, root, money, ram, hackLevel, security));
	}
	return serverRefs;
}

/** 
 * TODO
 */
export function buildServerRef(ns, serverName, root, money, ram, hackLevel, security) {	
	ns.print('server: ' + serverName + ', maxMoney: ' + money + ', maxRam: ' + ram + ', minSecurity: ' + security + ', requiredHackingLevel: ' + hackLevel + ', rootAccess: ' + root);
	return { 
		"maxMoney": money,
		"maxRam": ram,
		"minSecurity": security,
		"requiredHackingLevel": hackLevel,
		"rootAccess": root,
		"serverName": serverName
	};
}

/**
 * Get available RAM for server.
 */
export async function calcAvailableRam(ns, server) {	
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	ns.print('server: ' + server + ', available RAM: ' + (serverMaxRam - serverUsedRam));
	return (serverMaxRam - serverUsedRam);
}

/** 
 * Calculate RAM available for each instance running on the server.
 */
export async function calcRamPerInst(ns, server, numOfInstances, percentOfResources) {
	var numOfInstances = numOfInstances ?? 1;
	var percentOfResources = percentOfResources ?? .9;
	var availableRam = await calcAvailableRam(ns, server);
	availableRam = (availableRam * percentOfResources).toFixed(3);
	ns.print('server: ' + server + ' availableRam: ' + availableRam + ' percentOfResources: ' + percentOfResources);
	// ns.print('server: ' + server + ' numOfInstances: ' + numOfInstances + ' ramPerInstance: ' + (availableRam / numOfInstances).toFixed(3));
	return (availableRam / numOfInstances).toFixed(3);
}

/** 
 * Calculate thread count for each instance running on the server.
 */
export async function calcThreadsPerInst(ns, server, script, numOfInstances, percentOfResources) {
	ns.print('server: ' + server + ' script: ' + script + ' numOfInstances: ' + numOfInstances + ' percentOfResources: ' + percentOfResources);
	var numOfInstances = numOfInstances ?? 1;
	var percentOfResources = percentOfResources ?? .9;
	var availableRAM = await calcRamPerInst(ns, server, numOfInstances, percentOfResources);
	var scriptRam = await ns.getScriptRam(script);
	ns.print('server: ' + server + 'availableRAM: ' + availableRAM + ' threadsPerInstance: ' + parseInt(availableRAM / scriptRam));
	if (availableRAM < scriptRam) {
		ns.print('server: ' + server + ' not enough ram to run ' + script);
		// ns.tprint('server: ' + server + ' not enough ram to run ' + script);
		return 0;
	}
	return parseInt(availableRAM / scriptRam);
}

/** 
 * Check that hacking level is effective against the server. 
 */
export async function canHack(ns, server) {	
	var requiredLevel = await ns.getServerRequiredHackingLevel(server);
	var currentLevel = await ns.getHackingLevel();
	ns.print('server: ' + server + ' requiredLevel: ' + requiredLevel + ' currentLevel: ' + currentLevel);
	ns.print('server: ' + server + ' canHack: ' +  (currentLevel >= requiredLevel));
	return (currentLevel >= requiredLevel);
}

/** 
 * Check that security is low enough to hack effectively. 
 */
export async function canWeaken(ns, threshold, server) {	
	// pull security settings
	const currentLevel = await ns.getServerSecurityLevel(server);
	const minLevel = await ns.getServerMinSecurityLevel(server);
	// set thresholds
	const targetThreshold = minLevel*threshold;
	ns.print('server: ' + server + ' currentLevel: ' + currentLevel + ' minLevel: ' + minLevel);
	ns.print('server: ' + server + ' threshold: ' + threshold + ' targetThreshold: ' + targetThreshold);
	ns.print('server: ' + server + ' canWeaken: ' +  (targetThreshold <= currentLevel));
	return (targetThreshold <= currentLevel);
}

/** 
 * Copy all files for the provided file type to the target server. 
 */
export async function copyAllFiles(ns, hostServer, targetServer, fileType) {	
	// parse args
	var fileType = fileType ?? '.js';
	// parse arguments
	var files = await ns.ls(hostServer, fileType);
	files = files.filter(file => !file.includes('/'));
	// copy scripts
	ns.print('server: ' + hostServer + ' targetServer: ' + targetServer + ' files: ' + files.length);
	await ns.scp(files, targetServer);
}

/** 
 * Check that there are enough funds to hack. 
 */
export async function hasFunds(ns, threshold, server) {
	const maxMoney = await ns.getServerMaxMoney(server);
	const moneyAvailable = await ns.getServerMoneyAvailable(server);
	const fundThreshold = (moneyAvailable / maxMoney).toFixed(3);
	ns.print('server: ' + server + ' maxMoney: ' + maxMoney + ' moneyAvailable: ' + moneyAvailable);
	ns.print('server: ' + server + ' threshold: ' + threshold + ' fundThreshold: ' + fundThreshold);
	ns.print('server: ' + server + ' hasFunds: ' +  (threshold < fundThreshold));
	return (threshold < fundThreshold);
}

/** todo */
export async function waitForMoney(ns, cost) {
	var moneyAvailable = await ns.getServerMoneyAvailable('home');
	while(cost > moneyAvailable) {
		ns.print('waiting for: ' + cost);
		await ns.sleep(60000);
		moneyAvailable = await ns.getServerMoneyAvailable('home');			
	}
}