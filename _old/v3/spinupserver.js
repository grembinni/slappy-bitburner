export async function main(ns) {
	
	// parse args
	const targetServer = ns.args[0]

	var remoteServer = targetServer + '-rs'

	// get home balance
	var currentBalance = ns.getServerMoneyAvailable('home')

	if (!ns.serverExists(remoteServer)) {

		while (currentBalance < 56320000) {

			currentBalance = ns.getServerMoneyAvailable('home')
			ns.print('Attempting to purchase server | Current home balance: ' + currentBalance)
			await ns.sleep(1000)
		}

		remoteServer = ns.purchaseServer(remoteServer, 1024)
		ns.tprint('Server ' + remoteServer + ' purchased')
	}

	ns.exec('clone-script.js', 'home', 1, remoteServer)

	await ns.sleep(1000)

	ns.exec('kill-server.js', remoteServer, 1, targetServer, remoteServer)
}