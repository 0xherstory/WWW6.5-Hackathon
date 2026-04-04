export type Commitment = {
  id: number;
  creator: string;
  title: string;
  durationDays: number;
  reminder: string;
  createdAt: number;
  active: boolean;
  witnesses?: WitnessPerson[];
  witnessCount?: number;
};

export type CheckIn = {
  id: number;
  commitmentId: number;
  creator: string;
  content: string;
  mood: string;
  proofURI: string;
  createdAt: number;
};

export type WitnessPerson = {
  address: string;
  name?: string;
};

export type WitnessRecord = {
  id: string;
  type: "received" | "given";
  witnessName?: string;
  targetUserName?: string;
  witnessAddress?: string;
  targetUserAddress?: string;
  commitmentTitle: string;
  createdAt: number;
};

export type CommitmentStatus = "ongoing" | "completed";

export type CommitmentWithProgress = Commitment & {
  checkedDays: number;
  progressText: string;
  status: CommitmentStatus;
  checkIns: CheckIn[];
};
