// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SemaphoreProtocol} from "../src/SemaphoreProtocol.sol";
import {SimpleTest} from "./utils/SimpleTest.sol";

contract SemaphoreProtocolTest is SimpleTest {
    SemaphoreProtocol internal protocol;

    address internal issuer = address(0xA11CE);
    address internal author = address(0xB0B);
    address internal reader = address(0xCAFE);
    address internal invitee = address(0xD00D);

    function setUp() public {
        protocol = new SemaphoreProtocol();

        vm.prank(author);
        protocol.joinNetwork();
        vm.prank(reader);
        protocol.joinNetwork();
        vm.prank(invitee);
        protocol.joinNetwork();
    }

    function testJoinNetworkGrantsMembership() public view {
        assertEq(protocol.isMember(author), true, "author should become member");
        assertEq(protocol.isMember(reader), true, "reader should become member");
    }

    function testInviteClaimStillGrantsMembership() public {
        address guest = address(0xE11E);

        vm.prank(address(this));
        protocol.issueInviteCode(keccak256(bytes("ALPHA-7F3K")), uint64(block.timestamp + 7 days));

        vm.prank(guest);
        protocol.claimInviteCode("ALPHA-7F3K");

        assertEq(protocol.isMember(guest), true, "guest should become member after claiming");
    }

    function testSignalCreationResponseApprovalAndEchoFlow() public {
        string[] memory tags = new string[](2);
        tags[0] = "loneliness";
        tags[1] = "poetry";

        vm.prank(author);
        uint256 signalId = protocol.createSignal(
            0,
            "QmPubSignal1",
            "QmEncSignal1",
            "When did you last feel heard?",
            tags
        );

        vm.prank(reader);
        uint256 responseId = protocol.submitResponse(signalId, "QmResponse1");

        vm.prank(author);
        protocol.approveReader(signalId, responseId, uint64(block.timestamp + 1 days));

        assertEq(protocol.hasActiveAccess(signalId, reader), true, "reader should have access");
        uint256[] memory inviteIds = protocol.getReadInvitesForRecipient(reader);
        assertEq(inviteIds.length, 1, "approval should create one read invite");

        vm.prank(reader);
        protocol.replyToInvite(
            inviteIds[0],
            SemaphoreProtocol.ReplyType.PrivateMessage,
            "QmPrivateGift1"
        );

        uint256[] memory echoIds = protocol.getEchoesForSignal(signalId);
        assertEq(echoIds.length, 1, "invite reply should create one echo");

        uint256 echoId = echoIds[0];
        SemaphoreProtocol.Echo memory echo = protocol.getEcho(echoId);
        assertEq(echo.signalId, signalId, "echo should point to signal");
        assertEq(echo.sender, reader, "echo sender mismatch");
    }

    function testPrivateSignalVisibilityIsStoredOnChain() public {
        string[] memory tags = new string[](1);
        tags[0] = "memory";

        vm.prank(author);
        uint256 signalId = protocol.createSignalWithVisibility(
            0,
            "QmPrivateHint1",
            "QmPrivateContent1",
            "What stays only on my page?",
            tags,
            SemaphoreProtocol.SignalVisibility.PersonalOnly
        );

        SemaphoreProtocol.SignalVisibility visibility = protocol.getSignalVisibility(signalId);
        assertEq(
            uint256(visibility),
            uint256(SemaphoreProtocol.SignalVisibility.PersonalOnly),
            "private signal visibility mismatch"
        );
    }

    function testDerivedSignalRequiresAccess() public {
        string[] memory tags = new string[](1);
        tags[0] = "growth";

        vm.prank(author);
        uint256 signalId = protocol.createSignal(
            0,
            "QmPubSignal1",
            "QmEncSignal1",
            "When did you last feel heard?",
            tags
        );

        vm.expectRevert(SemaphoreProtocol.AccessDenied.selector);
        vm.prank(reader);
        protocol.createSignal(
            signalId,
            "QmPubSignal2",
            "QmEncSignal2",
            "What would you tell your lonelier self across time?",
            tags
        );

        vm.prank(reader);
        uint256 responseId = protocol.submitResponse(signalId, "QmResponse2");

        vm.prank(author);
        protocol.approveReader(signalId, responseId, uint64(block.timestamp + 1 days));

        vm.prank(reader);
        uint256 childSignalId = protocol.createSignal(
            signalId,
            "QmPubSignal2",
            "QmEncSignal2",
            "What would you tell your lonelier self across time?",
            tags
        );

        uint256[] memory children = protocol.getSignalChildren(signalId);
        assertEq(children.length, 1, "parent should have one child");
        assertEq(children[0], childSignalId, "child signal mismatch");
    }

    function testReadInviteReplyAndDeactivatePreserveChain() public {
        string[] memory tags = new string[](1);
        tags[0] = "memory";

        vm.prank(author);
        uint256 parentSignalId = protocol.createSignal(
            0,
            "QmPubSignal1",
            "QmEncSignal1",
            "When did you last feel heard?",
            tags
        );

        vm.prank(author);
        uint256 inviteId = protocol.sendReadInvite(parentSignalId, invitee, "QmExcerpt1");

        vm.prank(invitee);
        protocol.replyToInvite(
            inviteId,
            SemaphoreProtocol.ReplyType.NewSignal,
            "QmInviteReplySignal1"
        );

        uint256[] memory childIds = protocol.getSignalChildren(parentSignalId);
        assertEq(childIds.length, 1, "invite reply should create one derived signal");

        vm.prank(author);
        protocol.deactivateSignal(parentSignalId);

        (, , , , , , , , , bool active) = protocol.getSignal(parentSignalId);
        assertEq(active, false, "parent should be inactive");

        (, , uint256 parentId, , , , , , , bool childActive) = protocol.getSignal(childIds[0]);
        assertEq(parentId, parentSignalId, "child should preserve parent link");
        assertEq(childActive, true, "child should stay active");
    }

    function testApprovedAccessExpires() public {
        string[] memory tags = new string[](1);
        tags[0] = "work";

        vm.prank(author);
        uint256 signalId = protocol.createSignal(
            0,
            "QmPubSignal1",
            "QmEncSignal1",
            "When did you last feel heard?",
            tags
        );

        vm.prank(reader);
        uint256 responseId = protocol.submitResponse(signalId, "QmResponse1");

        vm.prank(author);
        protocol.approveReader(signalId, responseId, uint64(block.timestamp + 1 days));

        vm.warp(block.timestamp + 2 days);
        assertEq(protocol.hasActiveAccess(signalId, reader), false, "access should expire");
    }
}
