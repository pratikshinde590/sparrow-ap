import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const sidebarSchemaLiteral = {
  title: "Selected Side Bar Tab that will be shown on dashboard",
  primaryKey: "tab",
  type: "object",
  version: 1,
  properties: {
    tab: {
      type: "string",
    },
  },
  required: ["tab"],
  indexes: ["createdAt"],
} as const;

const schemaTyped = toTypedRxJsonSchema(sidebarSchemaLiteral);

export type SideBarDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const sidebarSchema: RxJsonSchema<SideBarDocType> = sidebarSchemaLiteral;
