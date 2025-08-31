//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AngeloNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    //msg.sender yung nag deploy yung owner ng contract
    constructor() ERC721("AngeloNFT", "ANFT") Ownable(msg.sender) {}

    // function ng pang mint
    // safeMint para yung able lang mag mint na ibang contracts
    //pag may onlyOwner meaning yung may ari lang ng cotnract pwede mag mint
    function mint() public {
        _safeMint(msg.sender, nextTokenId);
        nextTokenId++;
    }
}
