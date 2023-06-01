//assume在测试网络

const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
    ? decsribe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          const sendVaule = ethers.utils.parseEther("0.01")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("允许发钱和取钱", async () => {
              await fundMe.fund({ value: sendVaule })
              await fundMe.withdraw()
              const endBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endBalance.toString(), "0")
          })
      })
