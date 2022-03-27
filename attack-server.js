/** @param {NS} ns **/
export async function main(ns) {
	// parse arguments
	var server = ns.args[0] ?? "n00dles";
	// nuke server
	await ns.nuke(server);
	// push scripts to server
	var scripts = await getScripts(ns);
	await pushScripts(ns, scripts, server);
}

/** validate arg size to set script var */
async function getScripts(ns) {
	var scripts = ["clone-script.js"];
	if (ns.args.length > 1) {
		scripts = ns.args.slice(1, ns.args.length);
	}
	return scripts;
}

/** push scripts to server */
async function pushScripts(ns, scripts, server) {
	// push each script
	for (var i = 0; i < scripts.length; i++) {
		var script = scripts[i];
		await ns.scp(script, server);	
	}
}