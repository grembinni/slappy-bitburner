/ @param {NS} ns /
export async function main(ns) {

    ns.disableLog('hasRootAccess')
    ns.disableLog('sleep')
    ns.disableLog('scan')

    // parse args
    const hostServer = ns.args[0]
    var secondArgument = ns.args[1]

    if(secondArgument === undefined) {
        secondArgument = ""
    }

    const hackedServers = secondArgument.split(', ')

    // get connected servers
    var unhackedServers = await ns.scan(hostServer)
    unhackedServers = unhackedServers.filter(e => e !== 'home')
    unhackedServers = removeInfectedServers(unhackedServers, hackedServers)
    var targetServers = unhackedServers

    infectTargetServers(ns, targetServers)
    await rootAccessStatus(ns, unhackedServers, targetServers)
}

function infectTargetServers(ns, targetServers) {

    for (var i = 0; i < targetServers.length; i++) {

        startScript(ns, 'root-access-attack.js', 'home', targetServers[i], 1)
    }
}

async function rootAccessStatus(ns, unhackedServers, targetServers) {

    while (unhackedServers.length > 0) {

        for (var i = 0; i < targetServers.length; i++) {

            var targetServer = targetServers[i]

            if (ns.hasRootAccess(targetServer)) {

                unhackedServers = unhackedServers.filter(e => e !== targetServer)
                startScript(ns, 'root-access-infector.js', 'home', targetServer, 1)
                ns.print('Root access on ' + targetServer)
            } else {

                ns.print('Attack attempted on ' + targetServer)
            }

            await ns.sleep(1000)
        }
    }
}

function removeInfectedServers(unhackedServers, hackedServers) {

    for (var i = 0; i < unhackedServers; i++) {

        if (hackedServers.includes(unhackedServers[i])) {

            unhackedServers = unhackedServers.filter(e => e !== unhackedServers[i])
        }
    }

    return unhackedServers
}

function startScript(ns, script, hostServer, targetServer, threads) {

    ns.exec(script, hostServer, threads, targetServer)
}