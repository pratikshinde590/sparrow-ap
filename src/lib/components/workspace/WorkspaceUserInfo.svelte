<script lang="ts">
  import { UserRoles } from "$lib/utils/enums/enums";
  export let name: string;
  export let email: string;
  export let role: string;
  export let hasPermission: boolean;
  let selected=role;

  const roles = [
    {
      id: "1",
      role: UserRoles.ADMIN,
      info: "Add & edit resources within a workspace,add & remove members to workspace",
    },
    {
      id: "2",
      role: UserRoles.EDITOR,
      info: "Add & edit resources within a workspace",
    },
    {
      id: "3",
      role: UserRoles.VIEWER,
      info: "View Resources within a workspace.",
    },
  ];
 

  
</script>

<div class="team-details d-flex w-100% justify-content-between">
  <div class="user-info">
    <p
      class="profile-circle bg-dullBackgroundr text-white text-center d-flex align-items-center justify-content-center"
      style="width: 36px; height:36px;border-radius:50%;border:2px solid #45494D ;"
    >
      {name[0]}
    </p>
    <div class="user-info-details" style="position: relative">
      <p>{name}</p>
      <p class="user-email" style="position:absolute;bottom:0;">{email}</p>
    </div>
  </div>
  <div></div>
  <div class="user-info-role">
    <select  bind:value={selected} style="border:none;background:none;" class="select-option">
      {#each roles as color}
        <option>{color.role}</option>
      {/each}
    </select>
  </div>
</div>

<style>
  .profile-circle {
    border-radius: 50%;
  }
  .user-email {
    position: absolute;
    bottom: 0;
    color: var(--button-color);
  }
  .user-info {
    display: flex;
    gap: 5px;
    justify-content: center;
  }
  .user-info-details {
    display: flex;
    gap: 2px;
    font-size: 12px;
    flex-direction: column;
  }
  .user-info-role {
    font-size: 14px;
    margin-top: 5px;
  }
  .select-option:focus{
    border:2px solid #85C2FF;
  }
  select{
    border:2px solid #85C2FF;
  }
</style>
