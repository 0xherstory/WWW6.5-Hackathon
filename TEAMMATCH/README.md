```
TeamMatch 是为组队而设计的智能合约系统，解决传统表格记录中团队成员技能不可见、个人间难以建立联系的问题。
https://teammatch2026.lovable.app/

它允许个人加入多个项目和团队，显示团队成员技能，支持个人间匹配并在匹配成功后共享联系方式，同时保证隐私和权限管理。

核心功能：
1、多项目支持
   用户可加入多个项目
   每个项目为同一用户创建独立个人身份资料（Profile）
   可自由切换活跃项目与个人身份
2、团队管理
   队长创建团队，设置最大成员数
   查看团队成员及其技能
   申请加入团队，队长批准后显示联系方式
3、个人匹配
   用户之间可发起匹配请求
   批准请求后共享联系方式
   信息永久保留，便于后续沟通
4、权限与隐私
   只有匹配或加入被批准后才能查看联系方式
   队长和项目管理员有特定操作权限
5、项目管理
   创建项目并设置持续时间
   显示项目、团队及成员信息

系统结构：
TeamMatch
│
├─ Project
│   ├─ id, name, description, tags, startTime, endTime, admin
│
├─ Profile
│   ├─ id, projectId, wallet, name, skills, contact, expireTime, active
│
├─ Team
│   ├─ id, projectId, name, description, maxMembers, captain, captainProfile, members[]
│
├─ MatchRequest
│   ├─ fromProfile, toProfile, handled
│
├─ JoinRequest
│   ├─ teamId, profileId, handled
│
├─ Functions
│   ├─ createProject(), getProjects()
│   ├─ registerProfile(), getProjectProfiles()
│   ├─ createTeam(), getProjectTeams(), getTeamMembers()
│   ├─ requestJoinTeam(), approveJoin(), getJoinRequests()
│   ├─ requestMatch(), approveMatch(), getMatchRequests()
```
