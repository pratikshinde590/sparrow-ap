<script lang="ts">
    import { UserRoles } from "$lib/utils/enums/enums";
    export let users;
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

<div class="user-role-container">
  <div class="selected User"></div>
  <div class="drop">
  {#each roles as role}
  <p>{role}</p>
  {/each}
  </div>
</div>

