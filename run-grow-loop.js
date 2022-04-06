/** todo */
export async function main(ns) {
	var server = ns.args[0] ?? 'n00dles';
	var runId = ns.args[1] ?? 'no id';
	ns.print('canHack #'+runId);
	while (canHack(server)) {
		await ns.grow(server);
		ns.print('canHack #'+runId);
	}
}

/** filter of servers not to hack */
function canHack(server) {
	return server != 'home';
}