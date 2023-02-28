const {expect} = require('chai');
const { ethers, upgrades } = require('hardhat');
const {helpers } = require('@nomicfoundation/hardhat-network-helpers');


describe('Exchange',()=>{
    let token,crowdfund,deployer,creator,user;

    beforeEach(async()=>{
        const Token = await ethers.getContractFactory('MyToken');
        const Crowdfund= await ethers.getContractFactory("CrowdFund");

        [deployer,creator ,user]= await ethers.getSigners();


        token = await upgrades.deployProxy(Token);
        let duration = 30 * 86400 * 1000;
        duration = duration.toString();


        // console.log(`duration will be fond as ${Date.now() + duration}`);


        crowdfund = await upgrades.deployProxy(Crowdfund, [token.address, duration] )


    });




    describe('For creator of the campaign',()=>{

        it('Create a campaign',async()=>{

            // console.log(`Hey how aree you`);

            const goal= 200;
            let startingTimestamp = Date.now();
            startingTimestamp = startingTimestamp + (5 * 60 * 1000);
            let endingTimestamp = startingTimestamp + (5 * 60 * 1000);


            // console.log(`goal is ${goal} and starting timestamp is ${startingTimestamp} and ending Timestamp is ${endingTimestamp}`)
            let duration = 30 * 86400 ;
            duration = duration.toString();
            // console.log(`duration will be fond as ${startingTimestamp + duration}`)

            startingTimestamp = startingTimestamp / 1000;
            startingTimestamp = Math.ceil(startingTimestamp);


            endingTimestamp = endingTimestamp / 1000;
            endingTimestamp = Math.ceil(endingTimestamp);

            await crowdfund.connect(creator).createCampaign(
              goal.toString(),
              startingTimestamp.toString(),
              endingTimestamp.toString()
            );

            const campaign = await crowdfund.getaCampaign('1');

            expect(campaign[5].toString()).to.be.equal(creator.address);

        })

        it('Cancel a campaign',async()=>{

          // console.log(`Hey how aree you`);

          const goal= 200;
          let startingTimestamp = Date.now();
          startingTimestamp = startingTimestamp + (5* 60 * 1000);
          let endingTimestamp = startingTimestamp + (5 * 60 * 1000);

          // console.log(`goal is ${goal} and starting timestamp is ${startingTimestamp} and ending Timestamp is ${endingTimestamp}`)
          let duration = 30 * 86400 ;
          duration = duration.toString();
          // console.log(`duration will be fond as ${startingTimestamp + duration}`)

          startingTimestamp = startingTimestamp / 1000;
          startingTimestamp = Math.ceil(startingTimestamp);


          endingTimestamp = endingTimestamp / 1000;
          endingTimestamp = Math.ceil(endingTimestamp);

          await crowdfund.connect(creator).createCampaign(
            goal.toString(),
            startingTimestamp.toString(),
            endingTimestamp.toString()
          );

          let campaign = await crowdfund.getaCampaign('1');

          expect(campaign[5].toString()).to.be.equal(creator.address);


          await crowdfund.connect(creator).cancelCampaign('1');

          campaign = await crowdfund.getaCampaign('1');

          const zeroAddress = ethers.constants.AddressZero;
          // console.log(`zero address is ${zeroAddress}`);

          expect(campaign[5].toString()).to.be.equal(zeroAddress);


      })

      it('claim the funds',async()=>{
        
        const goal= 200;
        let startingTimestamp = Date.now();
        startingTimestamp = startingTimestamp + (60 * 1000);
        let endingTimestamp = startingTimestamp + (2 * 60 * 1000);


        // console.log(`goal is ${goal} and starting timestamp is ${startingTimestamp} and ending Timestamp is ${endingTimestamp}`)
        let duration = 30 * 86400 ;
        duration = duration.toString();
        // console.log(`duration will be fond as ${startingTimestamp + duration}`)

        startingTimestamp = startingTimestamp / 1000;
        startingTimestamp = Math.ceil(startingTimestamp);


        endingTimestamp = endingTimestamp / 1000;
        endingTimestamp = Math.ceil(endingTimestamp);

        await crowdfund.connect(creator).createCampaign(
          goal.toString(),
          startingTimestamp.toString(),
          endingTimestamp.toString()
        );

        let campaign = await crowdfund.getaCampaign('1');

        expect(campaign[5].toString()).to.be.equal(creator.address);



        await token.connect(creator).mint(user.address,'10000');

        
        
        let timestamp = await crowdfund.getTimestamp();
        // console.log(`timestamp before is : ${timestamp}`);
        await ethers.provider.send("evm_increaseTime", [ 65 ]); // 2 days
        await ethers.provider.send("evm_mine") 

        timestamp = await crowdfund.getTimestamp();
        // console.log(`timestamp after is : ${timestamp}`);
      

        await token.connect(user).approve(crowdfund.address,'210');
        
        await crowdfund.connect(user).pledgeFunds('1','210');
        campaign = await crowdfund.getaCampaign('1');
        expect(campaign[2].toString()).to.be.equal('210');

        await ethers.provider.send("evm_increaseTime", [ 125 ]); // 2 days



        await crowdfund.connect(creator).claimFunds('1');

        campaign = await crowdfund.getaCampaign('1');
        expect(campaign[6]).to.be.equal(true);
        

        
        

      });


    })

    describe('For User',()=>{
      let i = 0; 

        beforeEach(async()=>{
            const goal= 200;
            let startingTimestamp = Date.now() + 65 + 125;
            startingTimestamp= startingTimestamp + (20 * 60 * 1000);
            startingTimestamp = startingTimestamp + (i * 25 * 60 * 1000);
            
            let endingTimestamp = startingTimestamp + (20 * 60 * 1000);
            startingTimestamp = startingTimestamp.toString();
            endingTimestamp = endingTimestamp.toString();


            const timestamp = await crowdfund.getTimestamp();
            // console.log(`starting timestamp is : ${startingTimestamp}`);
            // console.log(`timestamp we got is : ${timestamp}`);


            // console.log(`goal is ${goal} and starting timestamp is ${startingTimestamp} and ending Timestamp is ${endingTimestamp}`)
            let duration = 30 * 86400 ;
            duration = duration.toString();
            // console.log(`duration will be fond as ${startingTimestamp + duration}`)

            
            startingTimestamp = startingTimestamp / 1000;
            startingTimestamp = Math.ceil(startingTimestamp);


            endingTimestamp = endingTimestamp / 1000;
            endingTimestamp = Math.ceil(endingTimestamp);

            await crowdfund.connect(creator).createCampaign(
              goal.toString(),
              startingTimestamp.toString(),
              endingTimestamp.toString()
            );


            // console.log(`creator address is ${creator.address}`);
            // console.log(`user address is ${user.address}`);
            // console.log(`crowdfund address is ${crowdfund.address}`);
            // console.log(`token address is ${token.address}`);
            // console.log(await token.owner());

            await token.connect(creator).mint(user.address,'10000');
            ++i;
            
        });

        it('pledge funds to the campaign',async()=>{
          let timestamp = await crowdfund.getTimestamp();
          // console.log(`timestamp before is : ${timestamp}`);
          await ethers.provider.send("evm_increaseTime", [25 * 60 ]); // 2 days
          await ethers.provider.send("evm_mine") 

          timestamp = await crowdfund.getTimestamp();
          // console.log(`timestamp after is : ${timestamp}`);
        

          await token.connect(user).approve(crowdfund.address,'100');
          
          await crowdfund.connect(user).pledgeFunds('1','100');
          let campaign = await crowdfund.getaCampaign('1');
          expect(campaign[2].toString()).to.be.equal('100');
          
        })

        it('unpledge funds to the campaign',async()=>{
          let timestamp = await crowdfund.getTimestamp();
          // console.log(`timestamp before is : ${timestamp}`);
          await ethers.provider.send("evm_increaseTime", [25 * 60 ]); // 2 days
          await ethers.provider.send("evm_mine") 

          timestamp = await crowdfund.getTimestamp();
          // console.log(`timestamp after is : ${timestamp}`);
        

          await token.connect(user).approve(crowdfund.address,'100');
          
          await crowdfund.connect(user).pledgeFunds('1','100');
          let campaign = await crowdfund.getaCampaign('1');
          expect(campaign[2].toString()).to.be.equal('100');

          // const campaign = await crowdfund.getaCampaign('1');
          // console.log(campaign);

          let amount = await crowdfund.getindividualPledgedAmount('1', user.address);
          // console.log(`amount is : ${amount.toString()}`);


          await crowdfund.connect(user).unpledgeFunds('1',amount.toString());

          campaign = await crowdfund.getaCampaign('1');
          expect(campaign[2].toString()).to.be.equal('0');

          amount = await crowdfund.getindividualPledgedAmount('1', user.address);
          amount = amount.toString();

          expect(amount).to.be.equal('0');
          
        })



        it('gets the refund',async ()=>{

          let timestamp = await crowdfund.getTimestamp();
          // console.log(`timestamp before is : ${timestamp}`);
          await ethers.provider.send("evm_increaseTime", [25 * 60 ]); // 2 days
          await ethers.provider.send("evm_mine") 

          timestamp = await crowdfund.getTimestamp();
          // console.log(`timestamp after is : ${timestamp}`);
        

          await token.connect(user).approve(crowdfund.address,'100');
          
          await crowdfund.connect(user).pledgeFunds('1','100');
          let campaign = await crowdfund.getaCampaign('1');
          expect(campaign[2].toString()).to.be.equal('100');


          await ethers.provider.send("evm_increaseTime",[20 * 60]);
          await ethers.provider.send("evm_mine") 

          let amount = await crowdfund.getindividualPledgedAmount('1', user.address);
          amount = amount.toString();
          // console.log(`amount is : ${amount.toString()}`);

          expect(amount).to.be.equal('100');
          
          await crowdfund.connect(user).refund('1');

          amount = await crowdfund.getindividualPledgedAmount('1', user.address);
          amount = amount.toString();
          // console.log(`amount is : ${amount.toString()}`);

          expect(amount).to.be.equal('0');



        });

        


    });
});