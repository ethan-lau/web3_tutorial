const {task} = require('hardhat/config')

task("deploy-fundme", "deploy and verify contract").setAction(async(taskArgs, hre) => {
    const factoryFundMe = await ethers.getContractFactory("FundMe");
    console.log('contract deploying')
    const fundMe = await factoryFundMe.deploy(60);
    await fundMe.waitForDeployment();
    console.log(`contract has deployment successfully, contract address is ${fundMe.target}`)

    // verify fundMe
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log('Waiting for 5 confirmations')
        // await fundMe.deploymentTransaction().wait(5)
        // await verfyFundMe(fundMe.target, [600])
    } else {
        console.log("verfification skipped.");
    }
})

async function verfyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args
    })
}