const { network } = require("hardhat")
const {developmentChains,DECIMALS,INITIAL_ANSER} = require("../helper-hardhat-config")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if(developmentChains.includes(network.name)){
        log("本地网络,部署mocks")
        await deploy("MockV3Aggregator",{
            contract:"MockV3Aggregator",
            from:deployer,
            args:[DECIMALS,INITIAL_ANSER],
            log:true

        })
        log("mocks部署完成")
        log(`谁部署的:${deployer}`)
        log("_________________________________")

    }

   
}
module.exports.tags = ["all","mocks"]
