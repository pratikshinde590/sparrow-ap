import constants from "$lib/utils/constants";
import { makeRequest, getAuthHeaders } from "$lib/api/api.common";
import type {
  WorkspacePostBody,
  WorkspacePutBody,
  addUsersInWorkspacePayload,
} from "$lib/utils/dto";
const apiUrl: string = constants.API_URL;

export class WorkspaceService {
  constructor() {}
  public fetchWorkspaces = async (userId: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fetchTeamsWorkspaces = async (teamId: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/team/${teamId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public updateWorkspace = async (
    workspaceId: string,
    workspace: WorkspacePutBody,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${apiUrl}/api/workspace/${workspaceId}`,
      {
        body: workspace,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteWorkspace = async (workspaceId: string) => {
    const response = await makeRequest(
      "DELETE",
      `${apiUrl}/api/workspace/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public createWorkspace = async (workspace: WorkspacePostBody) => {
    const response = await makeRequest("POST", `${apiUrl}/api/workspace`, {
      body: workspace,
      headers: getAuthHeaders(),
    });
    return response;
  };

  public addUsersInWorkspace = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspacePayload,
  ) => {
    const response = await makeRequest(
      "POST",
      `${"http://localhost:9000"}/api/workspace/${workspaceId}/user`,
      {
        body: addUsersInWorkspaceDto,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public getUserDetailsOfWorkspace = async (workspaceId: string) => {
    const response = await makeRequest(
      "GET",
      `${"http://localhost:9000"}/api/workspace/${workspaceId}/users`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
