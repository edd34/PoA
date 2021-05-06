const { accounts, contract } = require('@openzeppelin/test-environment');
const Web3 = require('web3');
const { assert } = require('chai');
const { expectRevert, expectEvent, balance } = require('@openzeppelin/test-helpers');
const PoA = contract.fromArtifact('PoA'); // Loads a compiled contract

const ether = 10 ** 18; // 1 ether = 1000000000000000000 wei
const [owner, alice, bob] = accounts;

//const OurBank = contract.fromArtifact('OurBank');
describe("PoA", () => {
    it("should check that contract is deployed", async () => {
        const poa = await PoA.new({from: owner});
        assert.equal(await poa.name(), "Ohreee Proof of Attendance")
        assert.equal(await poa.symbol(), "OPoA")
    });

    it("should be possible to mint a NFT", async () => {
        const poa = await PoA.new({from: owner});
        poa.awardTicket(alice, 'sampleURI1');
        poa.awardTicket(alice, 'sampleURI2');
        poa.awardTicket(bob, 'sampleURI3');
        
        // perform assertion on total supply and balance
        assert.equal((await poa.totalSupply()).toString(), "3");
        assert.equal((await poa.balanceOf(alice)).toString(), "2");
        assert.equal((await poa.balanceOf(bob)).toString(), "1");
        
        // perform assertion on ownership
        assert.equal((await poa.ownerOf(0)).toString(), alice);
        assert.equal((await poa.ownerOf(1)).toString(), alice);
        assert.equal((await poa.ownerOf(2)).toString(), bob);
        
        // check token URI
        assert.equal((await poa.tokenURI(0)).toString(), "sampleURI1");
        assert.equal((await poa.tokenURI(1)).toString(), "sampleURI2");
        assert.equal((await poa.tokenURI(2)).toString(), "sampleURI3");
    });

    it("should be possible to transer a NFT", async () => {
        const poa = await PoA.new({from: owner});
        poa.awardTicket(alice, 'sampleURI1');

        assert.equal((await poa.totalSupply()).toString(), "1");
        assert.equal((await poa.balanceOf(alice)).toString(), "1");
        assert.equal((await poa.balanceOf(bob)).toString(), "0");
        assert.equal((await poa.ownerOf(0)).toString(), alice);

        // not possible to transfer if you're not owner of a NFT
        expectRevert(poa.safeTransferFrom(alice, bob, 0, {from: bob}))
        
        // safe transfer from alice to bob
        await poa.safeTransferFrom(alice, bob, 0, {from: alice})
        assert.equal((await poa.totalSupply()).toString(), "1");
        assert.equal((await poa.balanceOf(alice)).toString(), "0");
        assert.equal((await poa.balanceOf(bob)).toString(), "1");
        assert.equal((await poa.ownerOf(0)).toString(), bob);
    }); 
});