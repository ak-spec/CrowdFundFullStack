// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CrowdFundManager {
    
    uint public noOfCampaigns;
    uint public noOfDeletedCampaigns;
    //Status of a campaign that has been launched is tracked through an enum
    enum Status {
        Ongoing,
        Cancelled,
        Success,
        Failed
    }

    //The Campaign struct tracks the attributes of a campaign
    struct Campaign {
        uint id;
        string name;
        string description;
        address owner; //owner is the benefactor/organisation who is raising money
        uint endTime; //time that the campaign stops accepting donations/contributions
        uint targetAmt;
        uint currAmt;
        Status status;
    }

    //This mapping maps the id of the campaign(uint) to the Campaign struct.
    mapping (uint => Campaign) public campaigns;
    //Another mapping to track the funders of a certain campaign.
    mapping (uint => mapping(address => uint)) public fundersToAmt;
    //tracks whether a campaign exists.
    mapping (uint => bool) public isValidCampaign;

    //events to notify the front-end about the outcome of the campaigns.
    event Success(uint indexed successfullCampaign);
    event AbleToDelete(uint indexed deletableCampaign);
    event Cancelled(uint indexed cancelledCampaign);
    event Failed(uint indexed failedCampaign);

    function launch(string memory name, string memory desc, uint duration, uint targetAmt) public {
        uint endTime = block.timestamp + duration;
        Campaign memory myCampaign = Campaign(noOfCampaigns, name, desc, msg.sender, endTime, targetAmt, 0, Status(0));
        campaigns[noOfCampaigns] = myCampaign;
        isValidCampaign[noOfCampaigns] = true;
        noOfCampaigns = noOfCampaigns + 1;
    }

    function getCampaigns() public view returns(Campaign[] memory) {
        uint noOfValidCampaigns = noOfCampaigns - noOfDeletedCampaigns;
        Campaign[] memory allCampaigns = new Campaign[](noOfValidCampaigns);
        uint index = 0;
        for(uint i=0; i < noOfCampaigns; i++){
            if(isValidCampaign[i]){
                Campaign storage item = campaigns[i];
                allCampaigns[index] = item;
                index = index + 1;
            }
        }
        return allCampaigns;
    }

    function fund(uint id) external payable {
        require(isValidCampaign[id], "Campaign does not exist!");
        require(campaigns[id].status == Status(0), "Campaign is not ongoing!"); //checks that users contribute to an ongoing campaign!.
        Campaign storage mycampaign = campaigns[id];
        mycampaign.currAmt += msg.value;
        fundersToAmt[id][msg.sender] += msg.value;
    }

    function withdraw(uint id) external {
        Campaign storage myCampaign = campaigns[id];
        //checks that current time is greater than the endTime of campaign
        require(block.timestamp > myCampaign.endTime && myCampaign.status != Status(1), "Campaign is still ongoing or has been cancelled!");
        //targetamt acheived
        if(myCampaign.currAmt >= myCampaign.targetAmt){
            myCampaign.currAmt = 0;
            //pays the owner/benefactor of campaign
            payable(myCampaign.owner).transfer(address(this).balance);
            myCampaign.status = Status(2);
            //let people know that this campaign can now be deleted
            emit Success(id);
        }else{
            myCampaign.status = Status(3);
            //let people know that it has failed
            emit Failed(id);
        }
    }

    function refund(uint id) external {
        Campaign storage myCampaign = campaigns[id];
        // contributors can only withdraw funds if the campaign has been cancelled or failed !
        require(myCampaign.status == Status(1) || myCampaign.status == Status(3), "Not able to refund.");
        require(fundersToAmt[id][msg.sender] > 0, "You did not contribute to this campaign!");
        uint amt = fundersToAmt[id][msg.sender];
        fundersToAmt[id][msg.sender] = 0;
        myCampaign.currAmt -= amt;
        if(myCampaign.currAmt == 0){
            //let people know that this campaign can now be deleted
            emit AbleToDelete(id);
        }
        payable(msg.sender).transfer(amt);
    }

    function cancelCampaign(uint id) external {
        Campaign storage myCampaign = campaigns[id];
        require(myCampaign.owner == msg.sender, "Not owner");
        require(block.timestamp < myCampaign.endTime);
        myCampaign.status = Status(1);
        emit Cancelled(id);
    }

    function deleteCampaign(uint id) external {
        require(isValidCampaign[id] && campaigns[id].status != Status(0), "Invalid campaign or cannot delete ongoing campaign!");
        Campaign memory myCampaign = campaigns[id];
        require(myCampaign.currAmt == 0, "refund to contributors not complete/funds not withdrawn!");
        delete campaigns[id];
        isValidCampaign[id] = false;
        noOfDeletedCampaigns = noOfDeletedCampaigns + 1;
    }

    fallback() external payable {
    }

    receive() external payable {
    }
}
