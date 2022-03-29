/** @param {NS} ns **/
export async function main(ns) {
	// parse args	
	var costThreshold = ns.args[0] ?? 100000;
	var costThresholdRate = ns.args[1] ?? 1.33;
	// disable noise
	ns.disableLog('sleep');	
	// todo	
	var upgradesAvailable = true;
	var nodeCount = await ns.hacknet.numNodes();
	while (upgradesAvailable) {
		ns.print('current cost threshold: $' + costThreshold);
		// create node
		var nodeUpdateable = await addNode(ns, costThreshold, nodeCount, 24);
		nodeCount = await ns.hacknet.numNodes();
		await ns.sleep(500);
		ns.print('current node count: ' + nodeCount);
		// upgrade nodes
		for (var i = 0; i < nodeCount; i++) {
			var nodeStats = await ns.hacknet.getNodeStats(i);
			// ns.print(nodeStats);
			await ns.sleep(500);
			var levelUpdateable = await updateLevel(ns, i, costThreshold, nodeStats.level);
			await ns.sleep(500);
			var ramUpdateable = await updateRam(ns, i, costThreshold, nodeStats.ram);
			await ns.sleep(500);
			var coreUpdateable = await updateCore(ns, i, costThreshold, nodeStats.cores);
			await ns.sleep(500);
			
			upgradesAvailable = (nodeUpdateable || levelUpdateable || ramUpdateable || coreUpdateable);
		}
		costThreshold = costThreshold * costThresholdRate;
	}
}

async function updateLevel(ns, node, costThreshold, count) {
	return await updateCheck(ns, ns.hacknet.getLevelUpgradeCost, ns.hacknet.upgradeLevel, 
							 node, costThreshold, count, 200); 
}

async function updateRam(ns, node, costThreshold, count) {
	return await updateCheck(ns, ns.hacknet.getRamUpgradeCost, ns.hacknet.upgradeRam, 
							 node, costThreshold, count, 64); 
}

async function updateCore(ns, node, costThreshold, count) {
	return await updateCheck(ns, ns.hacknet.getCoreUpgradeCost, ns.hacknet.upgradeCore, 
							 node, costThreshold, count, 16); 
}

async function updateCheck(ns, fCost, fUpgrade, node, costThreshold, count, maxCount) {
	var canUpdate = (count < maxCount);
	if (canUpdate) {
		await update(ns, fCost, fUpgrade, node, costThreshold, count, maxCount);
	} 
	await ns.sleep(500);
	return canUpdate;
}

/** todo */
async function update(ns, fCost, fUpgrade, node, costThreshold, count, maxCount) {
	// returned "at max" check
	var canUpgrade = (count < maxCount);
	// internal can update against costThreshold check
	var _canUpgrade = canUpgrade;
	while(_canUpgrade) {
		var cost = await fCost(node, 1);
		await ns.sleep(500);
		if (costThreshold > cost) {
			ns.print('updating: ' + node);
			var moneyAvailable = await ns.getServerMoneyAvailable('home');
			await ns.sleep(500);
			while(cost > moneyAvailable) {
				await ns.sleep(5000);
				moneyAvailable = await ns.getServerMoneyAvailable('home');	
				await ns.sleep(500);			
			}
			await fUpgrade(node, 1);
			count = count++;
			_canUpgrade = (count < maxCount)
		} else {
			_canUpgrade = false;
		}
	}
	return canUpgrade;
}

/** todo */
async function addNode(ns, costThreshold, count, maxCount) {
	var canUpgrade = true;
	while(canUpgrade) {
		var cost = await ns.hacknet.getPurchaseNodeCost();
		await ns.sleep(500);
		if (costThreshold > cost) {
			ns.print('adding new node');
			var moneyAvailable = await ns.getServerMoneyAvailable('home');
			await ns.sleep(500);
			while(cost > moneyAvailable) {
				await ns.sleep(5000);
				moneyAvailable = await ns.getServerMoneyAvailable('home');	
				await ns.sleep(500);			
			}
			await ns.hacknet.purchaseNode();
			canUpgrade = (count++ < maxCount)
		} else {
			canUpgrade = false;
		}
	}
	return true;
}