"use client";

export type MockUser = {
  username: string;
  status: string;
  avatar?: string;
  streak?: number;
  totalStudyTime?: string;
  checkInStatus?: string;
};

export const mockUser: MockUser = {
  username: "ONEWIND0316",
  status: "登录中",
};
