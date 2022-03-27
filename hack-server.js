/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	var server = ns.args[0] ?? "n00dles";
	// hack
	while (await canHack(server)) {
		await ns.hack(server);
	}
}

/** filter of servers not to hack */
 async function canHack(server) {
	return server != "home";
}