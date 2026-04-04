import { ProjectCreated } from "../generated/GirlsVaultRegistry/GirlsVaultRegistry";
import { GirlsVaultProject } from "../generated/templates";
import { Project } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleProjectCreated(event: ProjectCreated): void {
  let project = new Project(event.params.projectAddress.toHexString());
  project.address = event.params.projectAddress.toHexString();
  project.name = event.params.name;
  project.creator = event.params.creator.toHexString();
  project.createdAt = event.block.timestamp;
  project.totalDonated = BigInt.fromI32(0);
  project.totalReleased = BigInt.fromI32(0);
  project.emergencyApproved = false;
  project.save();

  // 启动对这个项目合约的事件监听
  GirlsVaultProject.create(event.params.projectAddress);
}
