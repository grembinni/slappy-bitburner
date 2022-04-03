/** attack all servers */
export async function attackProvidedServers(ns, hostServer) {
	await attackServers(ns, servers);
}

/** attack provided servers */
export async function attackServers(ns, servers) {	
	ns.tprint(servers);
	var skipped = 0;
	// attack all
	for (const server of servers) {
		var success = await attackServer(ns, server);
		if (!success) {
			skipped++;
		}
	}
	ns.tprint('servers attacked: ' + servers.length);
	ns.tprint('servers skipped: ' + skipped);
}

/** attack a single server */
export async function attackServer(ns, server) {	
	ns.tprint('attacking -> ' + server);
	// open ports
	await openPorts(ns, server);
	// nuke server
	try {
		await ns.nuke(server);
		ns.tprint('nuked -> ' + server);
		return true;
	} catch(e) {
		ns.tprint('skipped -> ' + server);
		return false;
	}
}

/** calculate thread count */
async function calculateThreadCount(ns, server, script, systemUsage) {
	
	//ns.tprint(' server ' + server + ' script ' + script + ' systemUsage ' + systemUsage);
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	var scriptRam = await ns.getScriptRam(script);
	//ns.tprint(' serverMaxRam ' + serverMaxRam + ' serverUsedRam ' + serverUsedRam + ' scriptRam ' + scriptRam);	
	return parseInt(((serverMaxRam - serverUsedRam) * systemUsage) / scriptRam);
}

/** check that there are enough funds to hack */
export async function canHack(ns, server) {	
	var requiredLevel = await ns.getServerRequiredHackingLevel(server);
	var currentLevel = await ns.getHackingLevel();
	ns.print('server: ' + server + ' requiredLevel: ' + currentLevel + ' currentLevel: ' + currentLevel);
	ns.print('server: ' + server + ' canHack: ' +  (currentLevel > requiredLevel));
	return (currentLevel > requiredLevel);
}

/** check that security is low enough to hack */
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

/** copy scripts to target server */
export async function copyFiles(ns, scripts, server) {
	// parse args
	var scripts = scripts ?? [];
	var server = server ?? 'n00dles';
	// copy scripts
	await ns.scp(scripts, server);
}

/** copy scripts to target server */
export async function copyAllFiles(ns, targetServer, sourceServer, sourceDir, fileType) {	
	// parse args
	var sourceServer = sourceServer ?? 'home';
	var sourceDir = sourceDir ?? '';
	var fileType = fileType ?? '.js';
	// parse arguments
	var files = await ns.ls(sourceServer, fileType);
	files = filterFiles(ns, files, sourceDir);
	// copy scripts
	await ns.scp(files, targetServer);
}

/** calculate available memory to script **/
export async function execThreadedAutoCalculated(ns, server, script, systemUsage, _args) {
	// parse arguments
	var args = _args ?? [];
	// calculate thread count
	var threads = await calculateThreadCount(ns, server, script, systemUsage);
	// run script
	if (threads && threads > 0) {
		await ns.exec(script, server, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.tprint('not enough ram on ' + server + ' to run ' + script);
	}
}

/** filter out files in folders */
function filterFiles(ns, files, sourceDir) {
	if (sourceDir === '') {
		files = files.filter(file => !file.includes('/'));
	} else {
		files = files.filter(file => file.includes(sourceDir));
	}
	return files;
}

/** check that there are enough funds to hack */
export async function hasFunds(ns, threshold, server) {
	const maxMoney = await ns.getServerMaxMoney(server);
	const moneyAvailable = await ns.getServerMoneyAvailable(server);
	const fundThreshold = (moneyAvailable / maxMoney).toFixed(3);
	ns.print('server: ' + server + ' maxMoney: ' + maxMoney + ' moneyAvailable: ' + moneyAvailable);
	ns.print('server: ' + server + ' threshold: ' + threshold + ' fundThreshold: ' + fundThreshold);
	ns.print('server: ' + server + ' hasFunds: ' +  (threshold < fundThreshold));
	return (threshold < fundThreshold);
}

/** filter of servers not to hack */
export function isAttackable(server) {
	return server != ('home');
}

/** kill all scripts on target server */
export async function killAllScripts(ns, server) {
	await ns.killall(server);
}

/** get port count and try all available attacks */
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

/** run script on single thread **/
export async function runSingle(ns, script, _args) {
	// parse arguments
	var args = _args ?? [];
	// run script
	await ns.run(script, 1, ...args);
}

/** calculate available memory to script **/
export async function runThreadedAutoCalculated(ns, server, script, systemUsage, _args) {
	// parse arguments
	var args = _args ?? [];
	// calculate thread count
	var threads = await calculateThreadCount(ns, server, script, systemUsage);
	// run script
	var pid = 0;
	if (threads && threads > 0) {
		pid = await ns.run(script, threads, ...args);
		await ns.sleep(50);
	} else {
		ns.tprint('not enough ram on ' + server + ' to run ' + script);
	}
	return pid;
}

/** validate arg size to set script var */
export function splice(argsToSplit, splitIndex) {
	var args = [];	
	if (argsToSplit && argsToSplit.length > splitIndex) {
		args = argsToSplit.slice(splitIndex, argsToSplit.length);
	}
	return args;
}