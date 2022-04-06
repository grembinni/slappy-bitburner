/** 
 * Auto generates hacknet nodes base on available resources.
 */
export async function main(ns) {
	// parse args	
	var costThreshold = ns.args[0] ?? 1000;
	var costThresholdRate = ns.args[1] ?? 1.33;
	// disable noise
	ns.disableLog('ALL');	
	// todo	
	var upgradesAvailable = true;
	var nodeCount = await ns.hacknet.numNodes();
	while (upgradesAvailable) {
		ns.print('current cost threshold: $' + costThreshold);
		// create node
		var nodeUpdateable = await addNode(ns, costThreshold, nodeCount, 18);
		nodeCount = await ns.hacknet.numNodes();
		ns.print('current node count: ' + nodeCount);
		// upgrade nodes
		for (var i = 0; i < nodeCount; i++) {
			var nodeStats = await ns.hacknet.getNodeStats(i);
			var levelUpdateable = await updateLevel(ns, i, costThreshold, nodeStats.level);
			var ramUpdateable = await updateRam(ns, i, costThreshold, nodeStats.ram);
			var coreUpdateable = await updateCore(ns, i, costThreshold, nodeStats.cores);
			
			upgradesAvailable = (nodeUpdateable || levelUpdateable || ramUpdateable || coreUpdateable);
		}
		costThreshold = (costThreshold * costThresholdRate).toFixed(3);
	}
}

async function updateLevel(ns, node, costThreshold, count) {
	return await update(ns, ns.hacknet.getLevelUpgradeCost, ns.hacknet.upgradeLevel, 
						node, costThreshold, count, 200); 
}

async function updateRam(ns, node, costThreshold, count) {
	return await update(ns, ns.hacknet.getRamUpgradeCost, ns.hacknet.upgradeRam, 
						node, costThreshold, count, 64); 
}

async function updateCore(ns, node, costThreshold, count) {
	return await update(ns, ns.hacknet.getCoreUpgradeCost, ns.hacknet.upgradeCore, 
						node, costThreshold, count, 16); 
}

/** todo */
async function update(ns, fCost, fUpgrade, node, costThreshold, count, maxCount) {
	// returned "at max" check
	var canUpgrade = (count < maxCount);
	// internal can update against costThreshold check
	var _canUpgrade = canUpgrade;
	while(_canUpgrade) {
		var cost = await fCost(node, 1);
		await ns.sleep(50);
		if (costThreshold > cost) {
			ns.print('updating: ' + node);			
			await isMoneyAvailable(ns, cost);
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
	// returned "at max" check
	var canUpgrade = (count < maxCount);
	// internal can update against costThreshold check
	var _canUpgrade = canUpgrade;
	while(_canUpgrade) {
		var cost = await ns.hacknet.getPurchaseNodeCost();
		await ns.sleep(50);
		if (costThreshold > cost) {
			ns.print('adding new node');
			await isMoneyAvailable(ns, cost);
			await ns.hacknet.purchaseNode();
			_canUpgrade = (count++ < maxCount)
		} else {
			_canUpgrade = false;
		}
	}
	return canUpgrade;
}

/** todo */
async function isMoneyAvailable(ns, cost) {
	var moneyAvailable = await ns.getServerMoneyAvailable('home');
	await ns.sleep(50);
	while(cost > moneyAvailable) {
		await ns.sleep(5000);
		moneyAvailable = await ns.getServerMoneyAvailable('home');	
		await ns.sleep(50);			
	}
}