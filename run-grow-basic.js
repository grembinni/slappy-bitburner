/** todo */
export async function main(ns) {
	var server = ns.args[0] ?? 'n00dles';
	await ns.weaken(server);
}