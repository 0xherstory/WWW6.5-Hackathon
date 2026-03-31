let provider
let signer
let contract

const address = "0x7AE85E3aFB8c5B41a572990a58a6C9b557E07802"

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
				"name": "myProfile",
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
				"name": "targetProfileId",
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
			}
		],
		"name": "walletProfile",
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



async function connectWallet() {

    await window.ethereum.request({ method: "eth_requestAccounts" })

    provider = new ethers.providers.Web3Provider(window.ethereum)

    signer = provider.getSigner()

    contract = new ethers.Contract(address, abi, signer)

    loadProjects()

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

    loadProjects()

}



async function loadProjects() {

    const projects = await contract.getProjects()

    const list = document.getElementById("projects")

    list.innerHTML = ""

    const selects = [
        "profileProject",
        "teamProject",
        "viewTeamProject",
        "viewParticipantsProject"
    ]

    selects.forEach(id => {
        document.getElementById(id).innerHTML = ""
    })

    projects.forEach(p => {

        const end = new Date(p.endTime * 1000)

        const li = document.createElement("li")

        li.innerText =
            p.name +
            " | " + p.description +
            " | " + p.tags +
            " | End:" + end

        list.appendChild(li)

        selects.forEach(id => {

            const opt = document.createElement("option")

            opt.value = p.id
            opt.text = p.name

            document.getElementById(id).appendChild(opt)

        })

    })

}



async function registerProfile() {

    const project = document.getElementById("profileProject").value
    const name = document.getElementById("profileName").value
    const skills = document.getElementById("profileSkills").value
    const contact = document.getElementById("profileContact").value

    const tx = await contract.registerProfile(project, name, skills, contact, 86400)

    await tx.wait()

    alert("Profile Registered")

}



async function createTeam() {

    const project = document.getElementById("teamProject").value
    const name = document.getElementById("teamName").value
    const desc = document.getElementById("teamDesc").value
    const size = document.getElementById("teamSize").value

    const tx = await contract.createTeam(project, name, desc, size)

    await tx.wait()

    alert("Team Created")

}



async function loadTeams() {

    const project = document.getElementById("viewTeamProject").value

    const teams = await contract.getProjectTeams(project)

    const div = document.getElementById("teams")

    div.innerHTML = ""

    for (let t of teams) {

        const members = await contract.getTeamMembers(t.id)

        let text = `Team ${t.name}
${t.description}
Members:
`

        members.forEach(m => {
            text += `${m.name} | ${m.skills}\n`
        })

        const box = document.createElement("pre")
        box.innerText = text

        const btn = document.createElement("button")
        btn.innerText = "Join"

        btn.onclick = async () => {

            await contract.requestJoinTeam(t.id)

            alert("Join request sent")

        }

        div.appendChild(box)
        div.appendChild(btn)

    }

}



async function loadParticipants() {

    const project = document.getElementById("viewParticipantsProject").value

    const users = await contract.getProjectProfiles(project)

    const div = document.getElementById("participants")

    div.innerHTML = ""

    users.forEach(u => {

        const box = document.createElement("div")

        box.innerText = u.name + " | " + u.skills

        const btn = document.createElement("button")

        btn.innerText = "Match"

        btn.onclick = async () => {

            await contract.requestMatch(u.id)

            alert("Match request sent")

        }

        div.appendChild(box)
        div.appendChild(btn)

    })

}



async function loadMatchRequests() {

    const address = await signer.getAddress()

    const profileId = await contract.walletProfile(address)

    const reqs = await contract.getMatchRequests(profileId)

    const div = document.getElementById("matchRequests")

    div.innerHTML = ""

    for (let i = 0; i < reqs.length; i++) {

        const r = reqs[i]

        if (!r.handled) {

            const profile = await contract.profiles(r.fromProfile)

            const box = document.createElement("div")

            box.innerText =
                profile.name +
                " | " + profile.skills

            const btn = document.createElement("button")

            btn.innerText = "Accept"

            btn.onclick = async () => {

                await contract.approveMatch(profileId, i)

                box.innerText =
                    profile.name +
                    " | " + profile.skills +
                    " | Contact: " + profile.contact

            }

            div.appendChild(box)
            div.appendChild(btn)

        }

    }

}



async function loadJoinRequests() {

    const div = document.getElementById("joinRequests")

    div.innerHTML = ""

    const teams = await contract.getProjectTeams(1)

    for (let t of teams) {

        const reqs = await contract.getJoinRequests(t.id)

        for (let i = 0; i < reqs.length; i++) {

            const r = reqs[i]

            if (!r.handled) {

                const profile = await contract.profiles(r.profileId)

                const box = document.createElement("div")

                box.innerText =
                    profile.name +
                    " | " + profile.skills

                const btn = document.createElement("button")

                btn.innerText = "Approve"

                btn.onclick = async () => {

                    await contract.approveJoin(t.id, i)

                    box.innerText =
                        profile.name +
                        " | " + profile.skills +
                        " | Contact: " + profile.contact

                }

                div.appendChild(box)
                div.appendChild(btn)

            }

        }

    }

}
