import { userLogout } from "$lib/services/auth.service";
import { WorkspaceService } from "$lib/services/workspace.service";
import { isLoggout, isResponseError, setUser } from "$lib/store/auth.store";

import { clearAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { TabRepository } from "$lib/repositories/tab.repository";
import { resizeWindowOnLogOut } from "../window-resize";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { ActiveSideBarTabReposistory } from "$lib/repositories/active-sidebar-tab.repository";
import { RxDB, type WorkspaceDocument } from "$lib/database/app.database";
import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
import { requestResponseStore } from "$lib/store/request-response-section";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import { environmentType } from "$lib/utils/enums/environment.enum";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";
import { generateSampleEnvironment } from "$lib/utils/sample/environment.sample";
import type { addUsersInWorkspacePayload } from "$lib/utils/dto";

export class HeaderDashboardViewModel {
  constructor() {}
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private workspaceService = new WorkspaceService();
  private collectionRepository = new CollectionRepository();
  private activeSideBarTabRepository = new ActiveSideBarTabReposistory();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  private environmentTabRepository = new EnvironmentTabRepository();

  public getWorkspaceDocument = (elem: WorkspaceDocument) => {
    return {
      _id: elem.get("_id"),
      name: elem.get("name"),
      collections: elem.get("collections"),
    };
  };
  get workspaces() {
    return this.workspaceRepository.getWorkspaces();
  }

  get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  // Function to set a workspace as active
  public activateWorkspace = (id: string): void => {
    this.workspaceRepository.setActiveWorkspace(id);
    return;
  };

  public addWorkspace = (workspace) => {
    this.workspaceRepository.addWorkspace(workspace);
  };

  public updateWorkspace = (
    workspaceId: string,
    name: string,
    description?: string,
  ) => {
    this.workspaceRepository.updateWorkspace(workspaceId, {
      name,
      description,
    });
  };

  public updateCollectionInWorkspace = (workspaceId: string, collectionObj) => {
    this.workspaceRepository.updateCollectionInWorkspace(
      workspaceId,
      collectionObj,
    );
  };

  public updateEnvironmentInWorkspace = (
    workspaceId: string,
    environmentObj,
  ) => {
    this.workspaceRepository.updateEnvironmentInWorkspace(
      workspaceId,
      environmentObj,
    );
  };

  public modifyWorkspace = async (
    componentData,
    collectionsMethods: CollectionsMethods,
    newWorkspaceName: string,
    tabName: string,
  ) => {
    if (newWorkspaceName) {
      const workspace = await this.workspaceService.updateWorkspace(
        componentData.id,
        {
          name: newWorkspaceName,
        },
      );

      tabName = workspace?.data?.data.name;
      this.updateWorkspace(componentData.id, tabName);

      collectionsMethods.updateTab(
        tabName,
        "name",
        componentData.path.workspaceId,
      );
      collectionsMethods.updateTab(
        true,
        "save",
        componentData.path.workspaceId,
      );
    }
  };

  public modifyWorkspaceDescription = async (
    componentData,
    collectionsMethods: CollectionsMethods,
    tabName: string,
    workspaceDescription: string,
  ) => {
    if (workspaceDescription) {
      const workspace = await this.workspaceService.updateWorkspace(
        componentData.id,
        {
          description: workspaceDescription,
        },
      );
      tabName = workspace?.data?.data.name;
      this.updateWorkspace(componentData.id, tabName, workspaceDescription);
      collectionsMethods.updateTab(
        workspaceDescription,
        "description",
        componentData.path.workspaceId,
      );
      collectionsMethods.updateTab(
        true,
        "save",
        componentData.path.workspaceId,
      );
    }
  };

  // sync workspace data with backend server
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    const response = await this.workspaceService.fetchWorkspaces(userId);
    if (response?.isSuccessful && response?.data?.data) {
      const data = response.data.data.map((elem, index) => {
        const {
          _id,
          name,
          description,
          createdAt,
          createdBy,
          collection,
          team,
          admins,
          environments,
          users,
        } = elem;
        return {
          _id,
          name,
          description,
          collections: collection ? collection : [],
          isActiveWorkspace: !index ? true : false,
          createdAt,
          createdBy,
          team,
          admins,
          environments,
          users,
        };
      });

      await this.workspaceRepository.bulkInsertData(data);
      return;
    }
  };

  // logout to frontend - clears local db, store, and cookies.
  public clientLogout = async (): Promise<void> => {
    setUser(null);
    await requestResponseStore.clearTabs();
    await RxDB.getInstance().destroyDb();
    await RxDB.getInstance().getDb();
    resizeWindowOnLogOut();
    isLoggout.set(true);
    isResponseError.set(false);
    clearAuthJwt();
  };

  // logout to backend - expires jwt - auth and refresh tokens
  public logout = async (): Promise<boolean> => {
    const response = await userLogout();
    if (response.isSuccessful) {
      await this.clientLogout();
      return true;
    } else {
      notifications.error(response.message);
      return false;
    }
  };

  public createWorkspace = async (workspace) => {
    const response = await this.workspaceService.createWorkspace(workspace);
    return response;
  };

  public refreshEnvironment = async (data, workspaceId) => {
    this.environmentRepository.refreshEnvironment(data, workspaceId);
    if (data) {
      data.forEach((environment) => {
        if (environment.type === environmentType.GLOBAL) {
          const sampleEnvironment = generateSampleEnvironment(
            environment.id,
            workspaceId,
            new Date().toString(),
          );
          sampleEnvironment.name = environment.name;
          sampleEnvironment.isActive = true;
          sampleEnvironment.type = environmentType.GLOBAL;
          sampleEnvironment.variable = environment.variable;
          this.environmentTabRepository.createTab(
            sampleEnvironment,
            workspaceId,
          );
        }
      });
    }
    return;
  };

  public getServerEnvironments = async (workspaceId: string) => {
    return await this.environmentService.fetchAllEnvironments(workspaceId);
  };

  public addUsersInWorkspace = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspacePayload,
  ) => {
    const response = await this.workspaceService.addUsersInWorkspace(
      workspaceId,
      addUsersInWorkspaceDto,
    );
    return response;
  };
  public getUserDetailsOfWorkspace = async (workspaceId: string) => {
    const userDetails =
      await this.workspaceService.getUserDetailsOfWorkspace(workspaceId);
    return userDetails;
  };
  public updateUsersInWorkspace = async (
    workspaceId: string,
    users: addUsersInWorkspacePayload,
  ) => {
    const response = await this.workspaceRepository.addUserInWorkspace(
      workspaceId,
      users,
    );
    return response;
  };
}
