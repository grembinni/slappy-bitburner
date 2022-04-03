/** 
 * Attacks all servers with available software.
 * Returns an array of all servers that were successfully hacked.
 */
export async function attackServers(ns, servers) {	
	ns.print(servers);
	var skipped = 0;
	var attackedServers = [];
	// attack all
	for (const server of servers) {
		var success = await attackServer(ns, server);
		if (success) {
			attackedServers.push(server); // push to attacked array
		} else {
			skipped++; // count for logging
		}
	}
	ns.print('servers attacked: ' + servers.length);
	ns.tprint('servers attacked: ' + servers.length);
	ns.print('servers skipped: ' + skipped);
	ns.tprint('servers skipped: ' + skipped);
	return attackedServers;
}

/** 
 * Attacks server with available software.
 * Returns a boolean indicating if the server was successfully hacked.
 */
export async function attackServer(ns, server) {	
	// ns.tprint('attacking -> ' + server);
	// open ports
	await openPorts(ns, server);
	// nuke server
	try {
		await ns.nuke(server);
		ns.print('server: ' + server + ' NUKED! ');
		return true;
	} catch(e) {
		ns.print('server: ' + server + ' ## skipped ##');
		ns.tprint('server: ' + server + ' ## skipped ##');
		return false;
	}
}

/** 
 * Check that hacking level is effective against the server. 
 */
export async function canHack(ns, server) {	
	var requiredLevel = await ns.getServerRequiredHackingLevel(server);
	var currentLevel = await ns.getHackingLevel();
	ns.print('server: ' + server + ' requiredLevel: ' + currentLevel + ' currentLevel: ' + currentLevel);
	ns.print('server: ' + server + ' canHack: ' +  (currentLevel > requiredLevel));
	return (currentLevel > requiredLevel);
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
	ns.print('server: ' + hostServer + ' targetServer: ' + targetServer + ' files: ' + files);
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

/** 
 * Filter of servers not to hack. 
 */
export function isAttackable(server) {
	return server != ('home');
}

/** 
 * Kill all scripts on target server.
 */
export async function killAllScripts(ns, server) {
	await ns.killall(server);
}

/** 
 * Get port count and try all available attacks exe's.
 */
export async function openPorts(ns, server) {	
	var numPortsRequired = await ns.getServerNumPortsRequired(server);
	for(var i = 0; i < numPortsRequired; i++) {
		if (ns.fileExists('BruteSSH.exe')) {
			await ns.brutessh(server);
		}
		if (ns.fileExists('FTPCrack.exe')) {
			await ns.ftpcrack(server);
		}	
		if (ns.fileExists('relaySMTP.exe')) {
			await ns.relaysmtp(server);
		}	
		if (ns.fileExists('HTTPWorm.exe')) {
			await ns.httpworm(server);
		}
		if (ns.fileExists('SQLInject.exe')) {
			await ns.sqlinject(server);
		}
	}
}

/** 
 * Run script on single thread 
 */
export async function runSingle(ns, script, args) {
	// parse arguments
	var args = args ?? [];
	// run script
	await ns.run(script, 1, ...args);
}

/** 
 * Split array at index or return empty array. 
 */
export function splice(argsToSplit, splitIndex) {
	var args = [];	
	if (argsToSplit && argsToSplit.length > splitIndex) {
		args = argsToSplit.slice(splitIndex, argsToSplit.length);
	}
	return args;
}

/**
 * Get available RAM for server.
 */
export async function calculateAvailableRam(ns, server) {	
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	ns.print('server: ' + server + ', available RAM: ' + (serverMaxRam - serverUsedRam));
	return (serverMaxRam - serverUsedRam);
}

/** 
 * Calculate RAM available for each instance running on the server.
 */
export async function calculateRamPerInstance(ns, server, numOfInstances, percentOfResources) {
	var numOfInstances = numOfInstances ?? 20;
	var percentOfResources = percentOfResources ?? .9;
	var availableRam = await calculateAvailableRam(ns, server);
	availableRam = (availableRam * percentOfResources).toFixed(3);
	ns.print('server: ' + server + ' availableRam: ' + availableRam + ' percentOfResources: ' + percentOfResources);
	ns.print('server: ' + server + ' numOfInstances: ' + numOfInstances + ' ramPerInstance: ' + (availableRam / numOfInstances).toFixed(3));
	return (availableRam / numOfInstances).toFixed(3);
}

/** 
 * Calculate thread count for each instance running on the server.
 */
export async function calculateThreadsPerInstance(ns, server, script, numOfInstances, percentOfResources) {
	ns.print('server: ' + server + ' script: ' + script + ' numOfInstances: ' + numOfInstances + ' percentOfResources: ' + percentOfResources);
	var numOfInstances = numOfInstances ?? 20;
	var percentOfResources = percentOfResources ?? .9;
	var availableRAM = await calculateRamPerInstance(ns, server, numOfInstances, percentOfResources);
	var scriptRam = await ns.getScriptRam(script);
	ns.print('server: ' + server + 'availableRAM: ' + availableRAM + ' threadsPerInstance: ' + parseInt(availableRAM / scriptRam));
	if (availableRAM < scriptRam) {
		ns.print('server: ' + server + ' not enough ram to run ' + script);
		ns.tprint('server: ' + server + ' not enough ram to run ' + script);
		return 0;
	}
	return parseInt(availableRAM / scriptRam);
}

/** 
 * Executed threaded script call on remote server.
 */
export async function execThreaded(ns, server, script, threads, _args) {
	// parse arguments
	var args = _args ?? [];
	// run script
	if (threads > 0) {
		await ns.exec(script, server, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.print('server: ' + server + ' not enough threads to run ' + script);
		ns.tprint('server: ' + server + ' not enough threads to run ' + script);
	}
}

/** 
 * Run threaded script call on current server.
 */
export async function runThreaded(ns, server, script, threads, _args) {
	// parse arguments
	var args = _args ?? [];
	// run script
	var pid = 0;
	if (threads && threads > 0) {
		pid = await ns.run(script, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.print('server: ' + server + ' not enough threads to run ' + script);
		ns.tprint('server: ' + server + ' not enough threads to run ' + script);
	}
	return pid;
}