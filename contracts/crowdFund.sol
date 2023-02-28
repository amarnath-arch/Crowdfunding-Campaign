// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "hardhat/console.sol";


contract CrowdFund is Initializable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // state varaibles
    CountersUpgradeable.Counter private campaignIdCounter;

    IERC20Upgradeable public  token;
    uint256 campaingsMaxDuration;



    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }


     function initialize(address _token, uint256 _campaignMaxDuration) initializer public {
        token = IERC20Upgradeable(_token);
        campaingsMaxDuration = _campaignMaxDuration;
        __Ownable_init();
    } 



    // structs

    struct Campaign {
        uint256 campaignId;                 // id of the campaign
        uint256 campaignGoal;               // goal of the campaign
        uint256 pledgedAmount;              // pledged amount of the campaign
        uint256 staringTimestamp;           // campaign started At
        uint256 endingTimestamp;            // campaign ended At
        address owner;                      // owner or creator of the campaign
        bool isClaimed;                     // whether the campaign has been claimed or not
    }


    // mappings
    

    // mapping from campaign id to campaign 
    mapping (uint256 => Campaign) idToCampaign;
    
    // pledged amount of each user corresponding each campaign
    mapping (uint256 => mapping(address => uint256)) individualPledgedAmount;


    /*                                 =============== functions ====================          */




    /*     function to get a campaign by its id                                 */
    /// @param _campaignId --> id of the campaign (while creating the campaign)

    function getaCampaign(
        uint256 _campaignId
    ) external 
      view 
      returns(Campaign memory){
        return idToCampaign[_campaignId];
    }





    /*     function to get individual pledged amount to a particular campaign                     */
    /// @param _campaignId --> id of the campaign (while creating the campaign)
    /// @param _user --> address of the user

    function getindividualPledgedAmount(
        uint256 _campaignId,
        address _user
    ) external 
      view 
      returns(uint256){
        return individualPledgedAmount[_campaignId][_user];
    }





    /*     function to create a campaign or launch a campaign                                  */
    /// @param _campaignGoal --> goal of the campaign
    /// @param _startingTime --> when the campaign will start 
    /// @param _endingTime --> when the campaign will end


    function createCampaign(
        uint256 _campaignGoal,
        uint256 _startingTime,
        uint256 _endingTime
    ) external {
        

        // conditions
        require(_startingTime >= block.timestamp , "invalid Starting Time");
        require(_endingTime > _startingTime, "invalid endingTime ");

        require(_endingTime <= (_startingTime + campaingsMaxDuration) , "Invalid Duration of the campaign");

        // logic 

        campaignIdCounter.increment();

        idToCampaign[campaignIdCounter.current()] = Campaign({
                campaignId          :   campaignIdCounter.current(),
                campaignGoal        :   _campaignGoal,    
                pledgedAmount       :   0,       
                staringTimestamp    :   _startingTime, 
                endingTimestamp     :   _endingTime,    
                owner               :   msg.sender,             
                isClaimed           :   false
        });

        

        // emit an event

        emit Create(campaignIdCounter.current(), msg.sender, _campaignGoal, _startingTime, _endingTime);
    }




    /*   ```````` function to cancel campaign        ```````                           */
    /// @param _campaignId --> id of the campaign (while creating the campaign)


    function cancelCampaign(
        uint256 _campaignId
    ) external {

        // conditions
        Campaign memory campaign = idToCampaign[_campaignId];

        require(msg.sender == campaign.owner , "Not Authorized!!" );
        require(campaign.staringTimestamp > block.timestamp , "campaign has already been started or initialized");
        
        // logic 
        delete idToCampaign[_campaignId];

        emit Cancel(_campaignId);
    }




    /*         `````` function to pledge funds to the campaign  ````````````                            */
    /// @param _campaignId --> id of the campaign (while creating the campaign)
    /// @param _amount --> amount to pledge to the campaign


    function pledgeFunds(
        uint256 _campaignId, 
        uint256 _amount
    ) external {

        Campaign storage campaign = idToCampaign[_campaignId];
        

        // conditions
        require(campaign.owner != msg.sender, "Owner cannot pledge the funds");
        
        require(block.timestamp >= campaign.staringTimestamp , "Wait for the Campaign to start! ");
        require(block.timestamp <= campaign.endingTimestamp  , "Campaign has been ended!");

        // logic 
        campaign.pledgedAmount += _amount;
        individualPledgedAmount[_campaignId][msg.sender] += _amount;


        require(token.transferFrom(msg.sender, address(this), _amount),"Transfer from failed!...");


        // emit  event 
        emit Pledge(_campaignId, msg.sender, _amount);

    }





    /*    ``````````  function to unpledge the funds ``````````````````                                   */
    /// @param _campaignId --> id of the campaign (while creating the campaign)
    /// @param _amount --> amount to pledge to the campaign


    function unpledgeFunds (
        uint256 _campaignId,
        uint256 _amount
    ) external {

        // conditions
        require(individualPledgedAmount[_campaignId][msg.sender] >= _amount, "You cannot unpledge the provided amount");

        Campaign storage campaign = idToCampaign[_campaignId];
        require(block.timestamp <= campaign.endingTimestamp, "Campaign ended.");


        // logic 
        campaign.pledgedAmount -= _amount;
        individualPledgedAmount[_campaignId][msg.sender] -= _amount;
        
        require(token.transfer(msg.sender, _amount),"Token transfer failed");

        emit Unpledge(_campaignId, msg.sender, _amount);
    }






    /*   `````````` function to claim funds for the campaign owner if it has reached its goal ````````````                           */
    /// @param _campaignId --> id of the campaign (while creating the campaign)

    function claimFunds (uint256 _campaignId) external {
        Campaign storage campaign = idToCampaign[_campaignId];
        
        
        require(msg.sender == campaign.owner, "Not Authorized to claim the funds!...");
        require(block.timestamp > campaign.endingTimestamp, "Wait for campaign to end!...");
        require(campaign.pledgedAmount >= campaign.campaignGoal, "Campaign hasn't reached the goal!...");
        require(!campaign.isClaimed, "Already Claimed!...");

        campaign.isClaimed = true;
        require(token.transfer(msg.sender, campaign.pledgedAmount),"Token transfer failed");

        emit Claim(_campaignId);
    }




    /*    `````````` function to get refunds for users if goal hasn't met  ````````````                                   */
    /// @param _campaignId --> id of the campaign (while creating the campaign)


    function refund (uint256 _campaignId) external {
        Campaign storage campaign = idToCampaign[_campaignId];
        require(block.timestamp > campaign.endingTimestamp, "Wait for campaign to end!...");
        require(campaign.pledgedAmount < campaign.campaignGoal, "Campaign has reached it's goal!...");

        uint refundAmount = individualPledgedAmount[_campaignId][msg.sender];
        individualPledgedAmount[_campaignId][msg.sender]=0;

        require(token.transfer(msg.sender, refundAmount),"Token transfer failed");

        emit Refund(_campaignId, msg.sender, refundAmount);
    }


   /*                                 =============== events ====================          */
   
    event Create(
        uint256 id,
        address indexed creator,
        uint256 campaignGoal,
        uint256 staringTimestamp,
        uint256 endingTimestamp
    );

    event Cancel(uint256 id);
    event Claim(uint256 id);
    event Refund(uint256 indexed id, address indexed caller, uint256 amount);
    event Pledge(uint256 indexed id, address indexed caller, uint256 amount);
    event Unpledge(uint256 indexed id, address indexed caller, uint256 amount);





    function getTimestamp() view external returns(uint256){
        return block.timestamp;
    }



    

}