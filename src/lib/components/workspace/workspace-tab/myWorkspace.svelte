<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "../../header/header-dashboard/HeaderDashboard.ViewModel";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Tooltip from "../../tooltip/Tooltip.svelte";
  import InviteMemberPopup from "../../Modal/InviteMemberPopup.svelte";
  import icons from "$lib/assets/app.asset";
  import { user } from "$lib/store/auth.store";
  import { isWorkspaceCreatedFirstTime } from "$lib/store/workspace.store";
  import type { Observable } from "rxjs";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  export let collectionsMethods: CollectionsMethods;
  import WorkspaceSideBar from "../WorkspaceSidebar.svelte";
  import WorkspaceSetting from "../WorkspaceSetting.svelte";
  export let activeTab;
  const _viewModel = new HeaderDashboardViewModel();
  let tabName: string = "";
  let workspaceDescription: string = "";
  let componentData: NewTab;
  let newWorkspaceName: string;
  let ownerName: string;
  let noOfCollections = 0;
  let loggedInUserEmail: string = "";

  let isActiveInvitePopup = false;
  let currentWorkspaceDetails = {
    id: "",
    name: "",
  };
  // type TAB="ABOUT"|"SETTING"
  let currentTab: "ABOUT" | "SETTING" = "ABOUT";
  let users: {}[] = [];

  let currentWorkspaceTeamName: string;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;
  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    if (event) {
      tabName = event?.name;
      workspaceDescription = event.description ?? "";
      componentData = event;
    }
  });
  const handleInvitePopup = (showPopup: boolean) => {
    isActiveInvitePopup = showPopup;
  };
  export let _collectionListViewModel: CollectionListViewModel;
  const collections: Observable<CollectionDocument[]> =
    _collectionListViewModel.collection;

  const handleWorkspaceInput = (event) => {
    newWorkspaceName = event.target.value;
    collectionsMethods.updateTab(false, "save", componentData.path.workspaceId);
  };

  const handleWorkspaceDescription = (event) => {
    workspaceDescription = event.target.value;
    collectionsMethods.updateTab(
      workspaceDescription,
      "description",
      componentData.path.workspaceId,
    );
  };

  const onRenameBlur = async () => {
    await _viewModel.modifyWorkspace(
      componentData,
      collectionsMethods,
      newWorkspaceName,
      tabName,
    );
  };

  const onUpdateBlur = async () => {
    await _viewModel.modifyWorkspaceDescription(
      componentData,
      collectionsMethods,
      tabName,
      workspaceDescription,
    );
  };
  const collectionSubscribe = collections.subscribe(
    (collectionArr: CollectionDocument[]) => {
      if (collectionArr) {
        noOfCollections = collectionArr.length;
      }
    },
  );

  let name: string = "";
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      if (value.personalWorkspaces) {
        name = value.personalWorkspaces[0]?.name;
      }
      if (!name) {
        name = value?.email;
      }
      loggedInUserEmail = value.email;
    }
  });
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    (value: WorkspaceDocument) => {
      if (value) {
        (currentWorkspaceDetails.id = value._data._id),
          (currentWorkspaceDetails.name = value._data.name);
        currentWorkspaceTeamName = value._data?.team?.name;
        users = value._data.users;
        ownerName = value._data?.owner?.name;
        if (ownerName) {
          name = ownerName;
          // firstLetter = name[0];
        } else {
          name = name;
        }
      }
    },
  );
  // Not required for now may be used in future if things breaks
  // const userUnsubscribe = user.subscribe(async (value) => {
  //   if (value) {
  //     await _viewModel.refreshWorkspaces(value._id);
  //   }
  // });

  let isWorkspaceNameVisibility: boolean;
  const unsubscribeisWorkspaceCreatedFirstTime =
    isWorkspaceCreatedFirstTime.subscribe((value) => {
      isWorkspaceNameVisibility = value;
    });

  onDestroy(() => {
    unsubscribeisWorkspaceCreatedFirstTime();
    unsubscribeUser();
    tabSubscribe();
    // Not required for now may be used in future if things breaks
    // userUnsubscribe();
  });
  let autofocus = isWorkspaceNameVisibility;

  let inputElement;
  onMount(() => {
    if (autofocus) {
      inputElement.select();
    }
  });

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldWorkspace",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  const onUpdateWorkspaceDescription = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "updateDescriptionFieldWorkspace",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
  const handleWorkspaceTab = (tab: "ABOUT" | "SETTING") => {
    currentTab = tab;
  };
</script>

<div class="main-container d-flex">
  {#if currentTab === "ABOUT"}
    <div
      class="my-workspace d-flex flex-column"
      style="width:calc(100% - 280px); margin-top: 15px;"
    >
      <div class="d-flex aling-items-center justify-content-between gap-2 mb-5">
        <input
          type="text"
          value={tabName}
          id="renameInputFieldWorkspace"
          {autofocus}
          class="bg-backgroundColor form-control border-0 text-left w-100 ps-2 py-0 fs-5 input-outline"
          on:input={(event) => {
            handleWorkspaceInput(event);
          }}
          on:blur={onRenameBlur}
          on:keydown={onRenameInputKeyPress}
          bind:this={inputElement}
        />

        <Tooltip>
          <button
            class="btn btn-primary rounded border-0 py-1"
            on:click={() => {
              handleInvitePopup(true);
            }}>Invite</button
          >
        </Tooltip>
        {#if isActiveInvitePopup}
          <InviteMemberPopup
            {handleInvitePopup}
            {currentWorkspaceDetails}
            teamName={currentWorkspaceTeamName}
            addUsersInWorkspace={_viewModel.addUsersInWorkspace}
            updateUsersInWorkspace={_viewModel.updateUsersInWorkspace}
          ></InviteMemberPopup>
        {/if}
      </div>
      <div class="d-flex align-items-start ps-0 h-100">
        <textarea
          value={workspaceDescription}
          id="updateDescriptionFieldWorkspace"
          {autofocus}
          class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
          on:input={(event) => {
            handleWorkspaceDescription(event);
          }}
          on:blur={onUpdateBlur}
          on:keydown={onUpdateWorkspaceDescription}
          bind:this={inputElement}
          placeholder="This is your personal workspace.Start typing. Describe the objectives of the workspace and how it is meant to be used.  Or create a comprehensive API documentation by including links to your collections and requests."
        />
      </div>
    </div>
  {:else if currentTab === "SETTING"}
    <WorkspaceSetting
      getUserDetailsOfWorkspace={_viewModel.getUserDetailsOfWorkspace}
      {loggedInUserEmail}
      {currentWorkspaceDetails}
    ></WorkspaceSetting>
  {/if}
  <WorkspaceSideBar {handleWorkspaceTab} {noOfCollections} {name}
  ></WorkspaceSideBar>
</div>

<style>
  .main-container {
    height: calc(100vh - 80px);
    background-color: var(--background-color);
  }
  .my-workspace {
    padding: 20px;
  }

  .btn-primary {
    z-index: 5;
  }

  textarea::placeholder {
    font-size: 12px;
    color: var(--text-color);
  }

  .input-outline {
    border-radius: 0%;
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }
</style>
