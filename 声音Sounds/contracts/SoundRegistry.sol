// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SoundRegistry {
    struct Sound {
        address owner;
        string contentUri;
        uint256 createdAt;
    }

    uint256 public nextId;
    mapping(uint256 => Sound) private sounds;

    event SoundCreated(uint256 indexed soundId, address indexed owner, string contentUri);

    function createSound(string calldata contentUri) external returns (uint256 soundId) {
        require(bytes(contentUri).length > 0, "EMPTY_CONTENT_URI");

        soundId = nextId;
        sounds[soundId] = Sound({owner: msg.sender, contentUri: contentUri, createdAt: block.timestamp});
        nextId = soundId + 1;
        emit SoundCreated(soundId, msg.sender, contentUri);
    }

    function getSound(uint256 soundId) external view returns (Sound memory) {
        Sound memory sound = sounds[soundId];
        require(sound.owner != address(0), "SOUND_NOT_FOUND");
        return sound;
    }
}