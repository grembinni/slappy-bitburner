/** @param {NS} ns **/
export async function main(ns) {
	// parse arguments
	var server = ns.args[0] ?? 'n00dles';
	var scripts = getScripts(ns);
	// copy scripts
	await ns.scp(scripts, server);
}

/** validate arg size to set script var */
function getScripts(ns) {
	var scripts = [ 'attack-server.js', 
					'clone-script.js', 
					'hack-server.js', 
					'hacknet-bot.js', 
					'restart-server.js', 
					'run-script.js', 
					'status-server.js', 
					'weaken-server.js'];
	if (ns.args.length > 1) {
		scripts = ns.args.slice(1, ns.args.length);
	}
	return scripts;
}