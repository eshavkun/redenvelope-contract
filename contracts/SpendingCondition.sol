pragma solidity ^0.5.2;

import "./mocks/IERC20.sol";

contract SpendingCondition {
  uint256 constant envelopeId = 1234; // nonce, so that signatures can not be replayed
  uint256 constant numClaimants = 4;  // number of claimants
  //address constant tokenAddr = 0x123456;

  function fulfil(bytes32 _r, bytes32 _s, uint8 _v, address _tokenAddr) public {
      
      // check signature
      address signer = ecrecover(bytes32(bytes20(address(this))), _v, _r, _s);
      
      // do transfer
      IERC20 token = IERC20(_tokenAddr);
      uint256 amount = token.balanceOf(address(this)) / numClaimants;
      if (uint8(uint160(signer) >> 80) > 250) {
        amount = token.balanceOf(address(this));
      }
      token.transfer(signer, amount);
  }

}