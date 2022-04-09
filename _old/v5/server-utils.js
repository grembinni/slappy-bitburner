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
	var scripts = scripts ?? '[run-status.js]';
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
export async function killAll(ns, server) {
	await ns.killall(server);
}