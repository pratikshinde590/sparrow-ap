<script lang="ts">
  import { SearchIcon } from "$lib/assets/app.asset";
  import { onMount } from "svelte";
  import WorkspaceUserInfo from "./WorkspaceUserInfo.svelte";
  import { UserRoles } from "$lib/utils/enums/enums";
  export let currentWorkspaceDetails;
  export let loggedInUserEmail: string;
  let users: any[] = [];
  let loggedInUser: any;
  let hasPermission: boolean = false;
  export let getUserDetailsOfWorkspace: (workspaceId: string) => any;
  const getUserDetails = async () => {
    const response = await getUserDetailsOfWorkspace(
      currentWorkspaceDetails.id,
    );
    users = response.data.data;
    loggedInUser = users.map((dataObj: any, index: number) => {
      if (dataObj.email === loggedInUserEmail) {
        users.splice(index, 1);
        return dataObj;
      }
    })[0];
    if (loggedInUser.role === UserRoles.ADMIN) {
      hasPermission = true;
    }
    users.sort((a, b) => a.role.localeCompare(b.role));
  };
  onMount(() => {
    getUserDetails();
  });
</script>

<div
  class="my-workspace d-flex flex-column"
  style="width:calc(100% - 280px); margin-top: 15px;padding:24px;"
>
  <div class="workspace-setting-header">
    <p class="workspace-name" style="font-size: 18px;">
      {currentWorkspaceDetails.name}
    </p>
    <div class="workspace-setting-buttons">
      <button class="workspace-setting-button-del"> Delete Workspace </button>
      <button class="workspace-setting-button-inv"> Invite</button>
    </div>
  </div>

  <div
    class="search-bar ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
  >
    <SearchIcon />
    <input
      type="search"
      style=" font-size: 14px;font-weight:500;background:none;"
      class="border-0 w-100 h-100"
      placeholder="Search APIs in {currentWorkspaceDetails.name || ''}"
      on:input={() => {}}
    />
  </div>
  <div class="mt-4">
    <WorkspaceUserInfo
      name={loggedInUser?.name + "(YOU)"}
      role={loggedInUser?.role}
      email={loggedInUser?.email}
      hasPermission={hasPermission}

    ></WorkspaceUserInfo>
  </div>
  <hr style="margin-top:-5px;" />
  <div>
    {#each users as user}
      <WorkspaceUserInfo hasPermission={hasPermission} name={user.name} role={user.role} email={user.email}
      ></WorkspaceUserInfo>
    {/each}
  </div>
</div>

<style>
  .workspace-setting-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    line-height: 18px;
  }
  .workspace-setting-buttons {
    display: flex;
    gap: 10px;
  }
  .workspace-setting-button-del {
    background-color: var(--border-color);
    border: none;
    padding: 5px 15px 5px 15px;
    border-radius: 4px;
  }

  .workspace-setting-button-del:hover {
    background-color: #616364;
  }
  .workspace-setting-button-inv {
    background-color: var(--send-button);
    border: none;
    padding: 5px 15px 5px 15px;
    border-radius: 4px;
  }
  .workspace-setting-button-inv:hover {
    background-color: var(--send1-hoverbutton);
  }
  .search-bar {
    border: 1px solid var(--border-color);
  }
  .search-bar:hover {
    outline: 1px solid;
  }
  .search-bar {
    width: 50%;
    padding: 8px;
  }

  .search-bar > input:focus {
    outline: none;
    border: none;
  }

  @media (max-width: 1000px) {
    .workspace-setting-header {
      display: flex;
      flex-direction: column;
    }
    .search-bar {
      margin-top: 15px;
      width: 80%;
    }
  }
</style>
