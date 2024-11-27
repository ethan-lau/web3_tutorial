const {task} = require('hardhat/config')

task("getfund-fundme", "getfund in contract fundme").addParam("addr","fundme contract address").setAction(async(taskArgs, hre) => {
    const factoryFundMe = await ethers.getContractFactory("FundMe");
    console.log('contract connecting')
    const fundMe = factoryFundMe.attach(taskArgs.addr);

    const getFundTx = await fundMe.getFund();
    console.log(`contract getFund: ${getFundTx.address}`)
})