const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HerRiseMain - Learning Task Functionality", function() {
    let herRiseToken;
    let herRiseMain;
    let owner;
    let user1;
    let user2;

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy HerRiseToken
        const HerRiseToken = await ethers.getContractFactory("HerRiseToken");
        herRiseToken = await HerRiseToken.deploy();
        await herRiseToken.waitForDeployment();

        // Deploy HerRiseMain
        const HerRiseMain = await ethers.getContractFactory("HerRiseMain");
        herRiseMain = await HerRiseMain.deploy(await herRiseToken.getAddress());
        await herRiseMain.waitForDeployment();

        // Set HerRiseMain as a minter
        await herRiseToken.setMinter(await herRiseMain.getAddress(), true);
    });

    describe("Task Management", function() {
        it("should allow owner to add a task", async function() {
            const reward = ethers.parseEther("10");
            await herRiseMain.addTask("Test Task", "Test Description", reward);

            const task = await herRiseMain.tasks(1);
            expect(task.title).to.equal("Test Task");
            expect(task.description).to.equal("Test Description");
            expect(task.reward).to.equal(reward);
            expect(task.isActive).to.equal(true);
            expect(await herRiseMain.taskCount()).to.equal(1);
        });

        it("should not allow non-owner to add a task", async function() {
            const reward = ethers.parseEther("10");
            await expect(
                herRiseMain.connect(user1).addTask("Test Task", "Test Description", reward)
            ).to.be.reverted;
        });
    });

    describe("Task Completion", function() {
        beforeEach(async function() {
            // Add a task
            const reward = ethers.parseEther("10");
            await herRiseMain.addTask("Learning Task", "Learn about DeFi", reward);
        });

        it("should allow user to complete a task and receive reward", async function() {
            const balanceBefore = await herRiseToken.balanceOf(user1.address);
            const reputationBefore = await herRiseMain.reputationScore(user1.address);

            await expect(herRiseMain.connect(user1).completeTask(1))
                .to.emit(herRiseMain, "TaskCompleted")
                .withArgs(user1.address, 1, ethers.parseEther("10"))
                .to.emit(herRiseMain, "ReputationUpdated")
                .withArgs(user1.address, 10);

            const balanceAfter = await herRiseToken.balanceOf(user1.address);
            const reputationAfter = await herRiseMain.reputationScore(user1.address);

            expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("10"));
            expect(reputationAfter - reputationBefore).to.equal(10n);
            expect(await herRiseMain.userTasksCompleted(user1.address)).to.equal(1);
            expect(await herRiseMain.hasCompleted(user1.address, 1)).to.equal(true);
        });

        it("should prevent duplicate task completion", async function() {
            await herRiseMain.connect(user1).completeTask(1);

            await expect(
                herRiseMain.connect(user1).completeTask(1)
            ).to.be.revertedWith("Task already completed");
        });

        it("should reject completion of non-existent task", async function() {
            await expect(
                herRiseMain.connect(user1).completeTask(999)
            ).to.be.revertedWith("Task does not exist");
        });

        it("should track multiple task completions correctly", async function() {
            // Add more tasks
            await herRiseMain.addTask("Task 2", "Description 2", ethers.parseEther("15"));
            await herRiseMain.addTask("Task 3", "Description 3", ethers.parseEther("20"));

            // Complete all tasks
            await herRiseMain.connect(user1).completeTask(1);
            await herRiseMain.connect(user1).completeTask(2);
            await herRiseMain.connect(user1).completeTask(3);

            expect(await herRiseMain.userTasksCompleted(user1.address)).to.equal(3);
            expect(await herRiseMain.reputationScore(user1.address)).to.equal(30);
            
            const balance = await herRiseToken.balanceOf(user1.address);
            expect(balance).to.equal(ethers.parseEther("45")); // 10 + 15 + 20
        });

        it("should allow different users to complete the same task", async function() {
            await herRiseMain.connect(user1).completeTask(1);
            await herRiseMain.connect(user2).completeTask(1);

            expect(await herRiseMain.hasCompleted(user1.address, 1)).to.equal(true);
            expect(await herRiseMain.hasCompleted(user2.address, 1)).to.equal(true);
            expect(await herRiseMain.userTasksCompleted(user1.address)).to.equal(1);
            expect(await herRiseMain.userTasksCompleted(user2.address)).to.equal(1);
        });
    });

    describe("hasCompleted Query", function() {
        beforeEach(async function() {
            await herRiseMain.addTask("Task 1", "Description 1", ethers.parseEther("10"));
        });

        it("should return false for uncompleted task", async function() {
            expect(await herRiseMain.hasCompleted(user1.address, 1)).to.equal(false);
        });

        it("should return true for completed task", async function() {
            await herRiseMain.connect(user1).completeTask(1);
            expect(await herRiseMain.hasCompleted(user1.address, 1)).to.equal(true);
        });
    });

    describe("getUserStats Integration", function() {
        it("should include task completion data in user stats", async function() {
            // Add and complete tasks
            await herRiseMain.addTask("Task 1", "Description 1", ethers.parseEther("10"));
            await herRiseMain.addTask("Task 2", "Description 2", ethers.parseEther("15"));
            
            await herRiseMain.connect(user1).completeTask(1);
            await herRiseMain.connect(user1).completeTask(2);

            const stats = await herRiseMain.getUserStats(user1.address);
            expect(stats.tasksCompleted).to.equal(2);
            expect(stats.reputation).to.equal(20);
        });
    });

    describe("Profit Distribution", function() {
        beforeEach(async function() {
            // Give users tokens from faucet
            await herRiseToken.connect(user1).faucet();
            await herRiseToken.connect(user2).faucet();

            // Create a pool
            await herRiseMain.connect(owner).createPool(
                "Test Pool",
                "Low Risk Strategy",
                10,
                ethers.parseEther("100")
            );

            // Users approve and join pool
            await herRiseToken.connect(user1).approve(
                await herRiseMain.getAddress(),
                ethers.parseEther("300")
            );
            await herRiseMain.connect(user1).joinPool(1, ethers.parseEther("300"));

            await herRiseToken.connect(user2).approve(
                await herRiseMain.getAddress(),
                ethers.parseEther("200")
            );
            await herRiseMain.connect(user2).joinPool(1, ethers.parseEther("200"));
        });

        it("should distribute profit proportionally to pool members", async function() {
            const totalProfit = ethers.parseEther("100");
            
            const user1BalanceBefore = await herRiseToken.balanceOf(user1.address);
            const user2BalanceBefore = await herRiseToken.balanceOf(user2.address);

            await expect(herRiseMain.distributeProfit(1, totalProfit))
                .to.emit(herRiseMain, "ProfitDistributed")
                .withArgs(1, totalProfit);

            const user1BalanceAfter = await herRiseToken.balanceOf(user1.address);
            const user2BalanceAfter = await herRiseToken.balanceOf(user2.address);

            // User1 deposited 300, User2 deposited 200, total 500
            // User1 should get 60% (60 tokens), User2 should get 40% (40 tokens)
            const user1Profit = user1BalanceAfter - user1BalanceBefore;
            const user2Profit = user2BalanceAfter - user2BalanceBefore;

            expect(user1Profit).to.equal(ethers.parseEther("60"));
            expect(user2Profit).to.equal(ethers.parseEther("40"));
        });

        it("should update earnedProfit for members", async function() {
            const totalProfit = ethers.parseEther("100");
            
            await herRiseMain.distributeProfit(1, totalProfit);

            const user1Info = await herRiseMain.getUserPoolInfo(1, user1.address);
            const user2Info = await herRiseMain.getUserPoolInfo(1, user2.address);

            expect(user1Info.earnedProfit).to.equal(ethers.parseEther("60"));
            expect(user2Info.earnedProfit).to.equal(ethers.parseEther("40"));
        });

        it("should reject profit distribution for inactive pool", async function() {
            // This test would require a way to deactivate pools, which isn't implemented
            // Skipping for now as it's not in the current requirements
        });

        it("should reject profit distribution for pool with no deposits", async function() {
            // Create a pool with no deposits (only creator with 0 deposit)
            await herRiseMain.connect(owner).createPool(
                "Empty Pool",
                "Strategy",
                10,
                ethers.parseEther("100")
            );

            await expect(
                herRiseMain.distributeProfit(2, ethers.parseEther("100"))
            ).to.be.revertedWith("No deposits in pool");
        });

        it("should only allow owner to distribute profit", async function() {
            await expect(
                herRiseMain.connect(user1).distributeProfit(1, ethers.parseEther("100"))
            ).to.be.reverted;
        });

        it("should handle multiple profit distributions correctly", async function() {
            // First distribution
            await herRiseMain.distributeProfit(1, ethers.parseEther("100"));
            
            // Second distribution
            await herRiseMain.distributeProfit(1, ethers.parseEther("50"));

            const user1Info = await herRiseMain.getUserPoolInfo(1, user1.address);
            const user2Info = await herRiseMain.getUserPoolInfo(1, user2.address);

            // Total: 150 profit, user1 gets 60% = 90, user2 gets 40% = 60
            expect(user1Info.earnedProfit).to.equal(ethers.parseEther("90"));
            expect(user2Info.earnedProfit).to.equal(ethers.parseEther("60"));
        });
    });

    describe("getUserStats", function() {
        beforeEach(async function() {
            // Give users tokens
            await herRiseToken.connect(user1).faucet();
            await herRiseToken.connect(user2).faucet();

            // Create pools
            await herRiseMain.connect(owner).createPool(
                "Pool 1",
                "Strategy 1",
                10,
                ethers.parseEther("100")
            );
            await herRiseMain.connect(owner).createPool(
                "Pool 2",
                "Strategy 2",
                10,
                ethers.parseEther("50")
            );

            // Add tasks
            await herRiseMain.addTask("Task 1", "Description 1", ethers.parseEther("10"));
            await herRiseMain.addTask("Task 2", "Description 2", ethers.parseEther("15"));
        });

        it("should return correct stats for user with no activity", async function() {
            const stats = await herRiseMain.getUserStats(user1.address);
            
            expect(stats.totalInvested).to.equal(0);
            expect(stats.totalProfit).to.equal(0);
            expect(stats.tasksCompleted).to.equal(0);
            expect(stats.reputation).to.equal(0);
            expect(stats.poolsJoined).to.equal(0);
        });

        it("should aggregate investment across multiple pools", async function() {
            // User1 joins both pools
            await herRiseToken.connect(user1).approve(
                await herRiseMain.getAddress(),
                ethers.parseEther("500")
            );
            await herRiseMain.connect(user1).joinPool(1, ethers.parseEther("300"));
            await herRiseMain.connect(user1).joinPool(2, ethers.parseEther("150"));

            const stats = await herRiseMain.getUserStats(user1.address);
            
            expect(stats.totalInvested).to.equal(ethers.parseEther("450"));
            expect(stats.poolsJoined).to.equal(2);
        });

        it("should aggregate profit across multiple pools", async function() {
            // Setup: users join pools
            await herRiseToken.connect(user1).approve(
                await herRiseMain.getAddress(),
                ethers.parseEther("500")
            );
            await herRiseMain.connect(user1).joinPool(1, ethers.parseEther("300"));
            await herRiseMain.connect(user1).joinPool(2, ethers.parseEther("100"));

            await herRiseToken.connect(user2).approve(
                await herRiseMain.getAddress(),
                ethers.parseEther("300")
            );
            await herRiseMain.connect(user2).joinPool(1, ethers.parseEther("200"));
            await herRiseMain.connect(user2).joinPool(2, ethers.parseEther("100"));

            // Distribute profits to both pools
            await herRiseMain.distributeProfit(1, ethers.parseEther("100")); // Pool 1: 500 total deposits
            await herRiseMain.distributeProfit(2, ethers.parseEther("50"));  // Pool 2: 200 total deposits

            const stats = await herRiseMain.getUserStats(user1.address);
            
            // Pool 1: user1 has 300/500 = 60% of 100 = 60
            // Pool 2: user1 has 100/200 = 50% of 50 = 25
            // Total profit: 85
            expect(stats.totalProfit).to.equal(ethers.parseEther("85"));
        });

        it("should include task completion and reputation data", async function() {
            await herRiseMain.connect(user1).completeTask(1);
            await herRiseMain.connect(user1).completeTask(2);

            const stats = await herRiseMain.getUserStats(user1.address);
            
            expect(stats.tasksCompleted).to.equal(2);
            expect(stats.reputation).to.equal(20);
        });

        it("should return comprehensive stats for active user", async function() {
            // User joins pools
            await herRiseToken.connect(user1).approve(
                await herRiseMain.getAddress(),
                ethers.parseEther("500")
            );
            await herRiseMain.connect(user1).joinPool(1, ethers.parseEther("300"));
            await herRiseMain.connect(user1).joinPool(2, ethers.parseEther("100"));

            // Complete tasks
            await herRiseMain.connect(user1).completeTask(1);
            await herRiseMain.connect(user1).completeTask(2);

            // Distribute profit
            await herRiseToken.connect(user2).approve(
                await herRiseMain.getAddress(),
                ethers.parseEther("200")
            );
            await herRiseMain.connect(user2).joinPool(1, ethers.parseEther("200"));
            await herRiseMain.distributeProfit(1, ethers.parseEther("100"));

            const stats = await herRiseMain.getUserStats(user1.address);
            
            expect(stats.totalInvested).to.equal(ethers.parseEther("400"));
            expect(stats.totalProfit).to.equal(ethers.parseEther("60")); // 300/500 of 100
            expect(stats.tasksCompleted).to.equal(2);
            expect(stats.reputation).to.equal(20);
            expect(stats.poolsJoined).to.equal(2);
        });
    });
});
