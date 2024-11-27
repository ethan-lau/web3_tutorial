// import ethers.js
// create main function

const {ethers} = require('hardhat')

const fundMeAddr = '0x792904bF4a2E06fc1730D92a5b2f2dA0AEf16bB5';

async function main() {
    const factoryFundMe = await ethers.getContractFactory("FundMe");
    console.log('contract connecting')
    const fundMe = factoryFundMe.attach(fundMeAddr);

    fundMe.getFund();
    console.log('contract getFund')
}

main()