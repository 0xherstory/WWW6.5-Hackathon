// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TeamMatch {

uint public projectCount;
uint public profileCount;
uint public teamCount;

struct Project{
uint id;
string name;
string description;
string tags;
uint startTime;
uint endTime;
address admin;
}

struct Profile{
uint id;
uint projectId;
address wallet;
string name;
string skills;
string contact;
uint expireTime;
bool active;
}

struct Team{
uint id;
uint projectId;
string name;
string description;
uint maxMembers;
address captain;
uint[] members;
}

struct MatchRequest{
uint fromProfile;
uint toProfile;
bool handled;
}

struct JoinRequest{
uint teamId;
uint profileId;
bool handled;
}

mapping(uint=>Project) public projects;
mapping(uint=>Profile) public profiles;
mapping(address=>uint) public walletProfile;

mapping(uint=>Team) public teams;

mapping(uint=>MatchRequest[]) public matchRequests;
mapping(uint=>JoinRequest[]) public joinRequests;

event ProjectCreated(uint id,string name);
event ProfileCreated(uint id,string name);
event TeamCreated(uint id,string name);

function createProject(
string memory name,
string memory description,
uint duration,
string memory tags
) public {

projectCount++;

projects[projectCount] = Project(
projectCount,
name,
description,
tags,
block.timestamp,
block.timestamp + duration,
msg.sender
);

emit ProjectCreated(projectCount,name);
}

function getProjects() public view returns(Project[] memory){

Project[] memory list = new Project[](projectCount);

for(uint i=1;i<=projectCount;i++){
list[i-1] = projects[i];
}

return list;
}

function registerProfile(
uint projectId,
string memory name,
string memory skills,
string memory contact,
uint duration
) public {

require(walletProfile[msg.sender]==0,"profile exists");

profileCount++;

profiles[profileCount] = Profile(
profileCount,
projectId,
msg.sender,
name,
skills,
contact,
block.timestamp + duration,
true
);

walletProfile[msg.sender]=profileCount;

emit ProfileCreated(profileCount,name);
}

function getProjectProfiles(uint projectId) public view returns(Profile[] memory){

uint count;

for(uint i=1;i<=profileCount;i++){
if(profiles[i].projectId==projectId && profiles[i].active){
count++;
}
}

Profile[] memory list = new Profile[](count);

uint index;

for(uint i=1;i<=profileCount;i++){

if(profiles[i].projectId==projectId && profiles[i].active){

list[index] = profiles[i];
index++;

}
}

return list;
}

function createTeam(
uint projectId,
string memory name,
string memory description,
uint maxMembers
) public {

uint profileId = walletProfile[msg.sender];
require(profileId!=0,"register first");

teamCount++;

Team storage t = teams[teamCount];

t.id = teamCount;
t.projectId = projectId;
t.name = name;
t.description = description;
t.maxMembers = maxMembers;
t.captain = msg.sender;

t.members.push(profileId);

emit TeamCreated(teamCount,name);
}

function getProjectTeams(uint projectId) public view returns(Team[] memory){

uint count;

for(uint i=1;i<=teamCount;i++){
if(teams[i].projectId==projectId){
count++;
}
}

Team[] memory list = new Team[](count);

uint index;

for(uint i=1;i<=teamCount;i++){

if(teams[i].projectId==projectId){
list[index] = teams[i];
index++;
}

}

return list;
}

function requestJoinTeam(uint teamId) public {

uint profileId = walletProfile[msg.sender];
require(profileId!=0,"no profile");

joinRequests[teamId].push(
JoinRequest(teamId,profileId,false)
);
}

function approveJoin(uint teamId,uint requestIndex) public {

Team storage t = teams[teamId];
require(msg.sender==t.captain,"not captain");

JoinRequest storage r = joinRequests[teamId][requestIndex];
require(!r.handled);

t.members.push(r.profileId);
r.handled=true;
}

function requestMatch(uint targetProfileId) public {

uint myProfile = walletProfile[msg.sender];

matchRequests[targetProfileId].push(
MatchRequest(myProfile,targetProfileId,false)
);
}

function approveMatch(uint myProfile,uint requestIndex) public {

MatchRequest storage r = matchRequests[myProfile][requestIndex];
require(!r.handled);

r.handled=true;
}

function getMatchRequests(uint profileId) public view returns(MatchRequest[] memory){
return matchRequests[profileId];
}

function getJoinRequests(uint teamId) public view returns(JoinRequest[] memory){
return joinRequests[teamId];
}

function getTeamMembers(uint teamId) public view returns(Profile[] memory){

Team storage t = teams[teamId];

Profile[] memory list = new Profile[](t.members.length);

for(uint i=0;i<t.members.length;i++){
list[i] = profiles[t.members[i]];
}

return list;
}

}
