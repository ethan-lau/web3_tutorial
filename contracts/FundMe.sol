// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值，生产商可以提款
// 4. 在锁定期内，没有达到目标值，投资人在锁定期以后退款

contract FundMe {
    mapping (address => uint256) public fundersToAmount;

    uint256 constant MINIMUM_VALUE = 100 * 10 ** 18; // USD

    AggregatorV3Interface internal dataFeed;

    uint256 constant target = 100 * 10 ** 18;

    address public owner;

    uint256 deploymentTimestamp;
    uint256 lockTime;

    constructor(uint256 _lockTime) {
        // sepolia testnet
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        require(block.timestamp < deploymentTimestamp + lockTime, "window is closed");
        fundersToAmount[msg.sender] = msg.value;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmout) internal view returns(uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmout * ethPrice / (10 ** 8);
    }

    function getFund() external windowClosed onlyOwner {
        require(convertEthToUsd(address(this).balance) >= target, "Target is not reached.");

        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "tx is fail");
    }

    function refund() external windowClosed {
        require(convertEthToUsd(address(this).balance) < target, "Target is reached.");
        
        bool success;
        (success, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    modifier windowClosed() {
        require(block.timestamp >= deploymentTimestamp + lockTime, "window is not closed");
        _;
    }

    modifier onlyOwner() {
        require(fundersToAmount[msg.sender] != 0, "there is no fund for you.");
        _;
    }

}