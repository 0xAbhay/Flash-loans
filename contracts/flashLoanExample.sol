// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

// flash loan reciever is a contract from AAVe which is used for recieving Flash loan in your contract
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FlashLoanExample is FlashLoanSimpleReceiverBase{
    
    event log(address asset , uint256 val);

    constructor(IPoolAddressesProvider provider)
    FlashLoanSimpleReceiverBase(provider)
    {}

    function createFlashLoan(address asset , uint256 amount) external {
        address reciever = address(this);
        bytes memory params = ""; // use this to pass arbitary data executeOperatin
        uint16 refferralCode = 0; // this is 0 because this txn was executed by user directly without any middle man

        // instance of the pool contract
        POOL.flashLoanSimple(reciever, asset, amount, params, refferralCode);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns(bool){

        // do thing linke arbitrage here
        // abi .decode (params) to decode params

        uint256 amountOwning =  amount + premium;
        IERC20(asset).approve(address(POOL), amountOwning);
        emit log(asset ,amountOwning);

        return true;


    }

}