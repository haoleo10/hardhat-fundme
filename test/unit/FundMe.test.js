const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let MockV3Aggregator
          const sendValue = ethers.utils.parseEther("0.01")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", function () {
              it("aggregator的地址设置的正确吗", async () => {
                  const response = await fundMe.getpriceFeed()
                  assert.equal(response, MockV3Aggregator.address)
              })
          })

          describe("fund", function () {
              it("测试钱不够的情况", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("钱够的情况,发送的钱==mapping中该账户所对应的钱数", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAggressToAmountFundede(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("添加发送钱的人到mapping", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })

          describe("withdraw", function () {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("从一个funder withdraw ETH", async () => {
                  //arrange

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //act
                  const transactionResponse = await fundMe.withdraw()

                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt

                  const GasValue = gasUsed.mul(effectiveGasPrice)

                  const endingFumdMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  //console.log(endingDeployerBalance, endingFumdMeBalance)
                  assert.equal(endingFumdMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(GasValue).toString()
                  )
              })

              it("从多个funders取钱", async () => {
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const currentConnected = await fundMe.connect(accounts[i])
                      await currentConnected.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  const transactionResponse = await fundMe.withdraw()

                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt

                  const GasValue = gasUsed.mul(effectiveGasPrice)

                  const endingFumdMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(GasValue).toString()
                  )
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("只允许owner取钱", async () => {
                  const accounts = await ethers.getSigners()

                  //accounts[2]是random attaker
                  const account = await fundMe.connect(accounts[2])

                  expect(account.withdraw()).to.be.revertedWith(
                      "FundMe_NotOwner"
                  )
              })
          })
      })
