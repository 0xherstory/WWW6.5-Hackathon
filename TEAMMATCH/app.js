console.log("TeamMatch Stable Version")

const address = "0x9Fa632F1E10abE0Ba31fd5017D4d212B352E24E6"
const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "teamId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "requestIndex",
				"type": "uint256"
			}
		],
		"name": "approveJoin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "profileId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "requestIndex",
				"type": "uint256"
			}
		],
		"name": "approveMatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "tags",
				"type": "string"
			}
		],
		"name": "createProject",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "projectId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "profileId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "maxMembers",
				"type": "uint256"
			}
		],
		"name": "createTeam",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "ProfileCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "ProjectCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "projectId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "skills",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "contact",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			}
		],
		"name": "registerProfile",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "teamId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "profileId",
				"type": "uint256"
			}
		],
		"name": "requestJoinTeam",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "fromProfile",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "toProfile",
				"type": "uint256"
			}
		],
		"name": "requestMatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "TeamCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "teamId",
				"type": "uint256"
			}
		],
		"name": "getJoinRequests",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "teamId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "profileId",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "handled",
						"type": "bool"
					}
				],
				"internalType": "struct TeamMatch.JoinRequest[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "profileId",
				"type": "uint256"
			}
		],
		"name": "getMatchRequests",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "fromProfile",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "toProfile",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "handled",
						"type": "bool"
					}
				],
				"internalType": "struct TeamMatch.MatchRequest[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "projectId",
				"type": "uint256"
			}
		],
		"name": "getProjectProfiles",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "projectId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "skills",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "contact",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "expireTime",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "active",
						"type": "bool"
					}
				],
				"internalType": "struct TeamMatch.Profile[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getProjects",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "tags",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "startTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "admin",
						"type": "address"
					}
				],
				"internalType": "struct TeamMatch.Project[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "projectId",
				"type": "uint256"
			}
		],
		"name": "getProjectTeams",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "projectId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "maxMembers",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "captain",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "captainProfile",
						"type": "uint256"
					},
					{
						"internalType": "uint256[]",
						"name": "members",
						"type": "uint256[]"
					}
				],
				"internalType": "struct TeamMatch.Team[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "teamId",
				"type": "uint256"
			}
		],
		"name": "getTeamMembers",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "projectId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "skills",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "contact",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "expireTime",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "active",
						"type": "bool"
					}
				],
				"internalType": "struct TeamMatch.Profile[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "joinRequests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "teamId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "profileId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "handled",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "matchRequests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "fromProfile",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "toProfile",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "handled",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "profileCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "profiles",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "projectId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "skills",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "contact",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "expireTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "projectCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "projects",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tags",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "admin",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "teamCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "teams",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "projectId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "maxMembers",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "captain",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "captainProfile",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "walletProfiles",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

let provider
let signer
let contract
let activeProfileId = 0
let activeProjectId = 0

let profilesByProject = {} // 存储每个 project 的 profileId

async function connectWallet() {

    await window.ethereum.request({ method: "eth_requestAccounts" })

    provider = new ethers.providers.Web3Provider(window.ethereum)
    signer = provider.getSigner()
    contract = new ethers.Contract(address, abi, signer)

    await loadProjects()
    await loadActiveProfileSelector()
}

async function createProject() {

    const name = document.getElementById("projectName").value
    const desc = document.getElementById("projectDesc").value
    const tags = document.getElementById("projectTags").value
    const hours = document.getElementById("projectDuration").value

    const duration = hours * 3600

    const tx = await contract.createProject(name, desc, duration, tags)
    await tx.wait()

    alert("Project Created")

    await loadProjects()
    await loadActiveProfileSelector()
}

// Projects 显示结束时间
async function loadProjects() {

    const projects = await contract.getProjects()

    const list = document.getElementById("projects")
    list.innerHTML = ""

    const select = document.getElementById("profileProject")
    select.innerHTML = ""

    projects.forEach(p => {

        const li = document.createElement("li")
        const endDate = new Date(p.endTime * 1000).toLocaleString()
        li.innerText = `${p.name} | ${p.description} | ${p.tags} | End: ${endDate}`
        list.appendChild(li)

        const opt = document.createElement("option")
        opt.value = p.id
        opt.text = p.name
        select.appendChild(opt)

    })
}

async function registerProfile() {

    const project = document.getElementById("profileProject").value
    const name = document.getElementById("profileName").value
    const skills = document.getElementById("profileSkills").value
    const contact = document.getElementById("profileContact").value

    const tx = await contract.registerProfile(project, name, skills, contact, 86400)

    await tx.wait()

    alert("Profile Created")

    await loadActiveProfileSelector()
}

// Active Profile 下拉选择
async function loadActiveProfileSelector() {

    const projects = await contract.getProjects()
    const selectProject = document.getElementById("activeProject")
    selectProject.innerHTML = ""

    profilesByProject = {}

    for (let p of projects) {

        const opt = document.createElement("option")
        opt.value = p.id
        opt.text = p.name
        selectProject.appendChild(opt)

        // 获取当前项目的 profiles
        const profiles = await contract.getProjectProfiles(p.id)
        if (profiles.length > 0) {
            profilesByProject[p.id] = profiles[0].id
        }
    }

    // 自动设置 activeProfileId 和 activeProjectId
    selectProject.onchange = () => {
        activeProjectId = parseInt(selectProject.value)
        activeProfileId = profilesByProject[activeProjectId] || 0
        alert("Active Project switched, active profile updated")
    }

    if (projects.length > 0) {
        activeProjectId = parseInt(projects[0].id)
        activeProfileId = profilesByProject[activeProjectId] || 0
    }

    alert("Active Profile Selector Loaded")
}

async function createTeam() {

    const name = document.getElementById("teamName").value
    const desc = document.getElementById("teamDesc").value
    const size = document.getElementById("teamSize").value

    const tx = await contract.createTeam(activeProjectId, activeProfileId, name, desc, size)

    await tx.wait()

    alert("Team created")
}

async function loadTeams() {

    const teams = await contract.getProjectTeams(activeProjectId)

    const div = document.getElementById("teams")
    div.innerHTML = ""

    for (let t of teams) {

        const members = await contract.getTeamMembers(t.id)

        let text = `Team ${t.name}
${t.description}
Members:
`

        members.forEach(m => {
            text += m.name + " | " + m.skills + "\n"
        })

        const box = document.createElement("pre")
        box.innerText = text

        const btn = document.createElement("button")
        btn.innerText = "Join"

        btn.onclick = async () => {

            const tx = await contract.requestJoinTeam(t.id, activeProfileId)
            await tx.wait()

            alert("Join request sent")

        }

        div.appendChild(box)
        div.appendChild(btn)

    }
}

// Participants 保持原样
async function loadParticipants() {

    const users = await contract.getProjectProfiles(activeProjectId)

    const div = document.getElementById("participants")
    div.innerHTML = ""

    users.forEach(u => {

        const box = document.createElement("div")
        box.innerText = u.name + " | " + u.skills

        const btn = document.createElement("button")
        btn.innerText = "Match"

        btn.onclick = async () => {

            const tx = await contract.requestMatch(activeProfileId, u.id)
            await tx.wait()

            alert("Match request sent")

        }

        div.appendChild(box)
        div.appendChild(btn)

    })
}

// Match Requests 批准后显示联系方式，信息不消失
async function loadMatchRequests() {

    const reqs = await contract.getMatchRequests(activeProfileId)

    const div = document.getElementById("matchRequests")
    // div.innerHTML="" 不清空，保持历史显示

    for (let i = 0; i < reqs.length; i++) {

        const r = reqs[i]

        const profileFrom = await contract.profiles(r.fromProfile)

        const existing = document.getElementById("match_" + r.fromProfile)
        if (existing) continue // 已经显示过

        const box = document.createElement("div")
        box.id = "match_" + r.fromProfile
        box.innerText = `${profileFrom.name} | ${profileFrom.skills}`
        if (r.handled) {
            box.innerText += ` | Contact: ${profileFrom.contact}`
        }

        const btn = document.createElement("button")
        btn.innerText = r.handled ? "Approved" : "Accept"
        btn.disabled = r.handled

        btn.onclick = async () => {

            const tx = await contract.approveMatch(activeProfileId, i)
            await tx.wait()

            box.innerText += ` | Contact: ${profileFrom.contact}`
            btn.innerText = "Approved"
            btn.disabled = true

        }

        div.appendChild(box)
        div.appendChild(btn)

    }
}

// Join Requests 批准后显示联系方式，信息不消失
async function loadJoinRequests() {

    const div = document.getElementById("joinRequests")
    // div.innerHTML="" 不清空

    const teams = await contract.getProjectTeams(activeProjectId)

    for (let t of teams) {

        const reqs = await contract.getJoinRequests(t.id)

        for (let i = 0; i < reqs.length; i++) {

            const r = reqs[i]

            const profile = await contract.profiles(r.profileId)

            const existing = document.getElementById("join_" + t.id + "_" + r.profileId)
            if (existing) continue

            const box = document.createElement("div")
            box.id = "join_" + t.id + "_" + r.profileId
            box.innerText = `Team ${t.name} | ${profile.name} | ${profile.skills}`
            if (r.handled) {
                box.innerText += ` | Contact: ${profile.contact}`
            }

            const btn = document.createElement("button")
            btn.innerText = r.handled ? "Approved" : "Approve"
            btn.disabled = r.handled

            btn.onclick = async () => {

                const tx = await contract.approveJoin(t.id, i)
                await tx.wait()

                box.innerText += ` | Contact: ${profile.contact}`
                btn.innerText = "Approved"
                btn.disabled = true

            }

            div.appendChild(box)
            div.appendChild(btn)

        }
    }
}
