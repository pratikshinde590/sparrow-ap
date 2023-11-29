import { rxdb } from "$lib/database/app.database";
// import type { Observable } from "rxjs";
// import { string } from "yup";

export class SideBarRepository {
  constructor() {}
  public getCurrentSideBarTab = async () => {
    return rxdb.sidebar.find().$;
  };

  public addCurrentSideBarTab = async (data: string) => {
    return rxdb.sidebar.insert({ tab: data });
  };

  public updateCurrentSideBarTab = async (data: string) => {
    return rxdb.sidebar.incrementalUpsert({ tab: data });
  };

  //   public updateCurrentSideBarTab = async (data: string) => {
  //     const tab = await rxdb.sidebar.find({

  //     });
  //     // tab. ({
  //     //   tab: data,
  //     // });
  //   };
}
