// import ethers.js
// create main function

const {ethers} = require('hardhat')

async function main() {
    // create factory
    const factoryFundMe = await ethers.getContractFactory("FundMe");
    console.log('contract deploying')
    const fundMe = await factoryFundMe.deploy(300);
    await fundMe.waitForDeployment();
    console.log(`contract has deployment successfully, contract address is ${fundMe.target}`)

    // verify fundMe
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log('Waiting for 5 confirmations')
        await fundMe.deploymentTransaction().wait(5)
        // await verfyFundMe(fundMe.target, [600])
    } else {
        console.log("verfification skipped.");
    }

    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners()

    // fund contract with first account
    const fundTx = await fundMe.fund({value: ethers.parseEther('0.5')})
    await fundTx.wait()

    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContract}`)

    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther('0.5')})
    await fundTxWithSecondAccount.wait()

    // check balance of contract
    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`)

    //check mapping fundersToAmount
    const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
    const secondAccountBalanceInFundMe = fundMe.fundersToAmount(secondAccount.address)
    console.log(`Balance of first account ${firstAccount} is ${firstAccountBalanceInFundMe}`)
    console.log(`Balance of second account ${secondAccount} is ${secondAccountBalanceInFundMe}`)

}

async function verfyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args
    })
}

main().then().catch((error)=>{
    console.error(error)
    process.exit(1)
})