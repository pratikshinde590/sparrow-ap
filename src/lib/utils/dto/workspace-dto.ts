import type { UserRoles } from "../enums/enums";

//------- workspace Interface ------------//
export interface WorkspacePostBody {
  name: string;
  type: string;
}

export interface WorkspacePutBody {
  name?: string;
  description?: string;
}

export interface addUsersInWorkspacePayload {
  users: string[];
  role: UserRoles;
}
