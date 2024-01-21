import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const workspaceSchemaLiteral = {
  title: "workspace",
  primaryKey: "_id",
  type: "object",
  version: 6,
  properties: {
    _id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    owner: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
        type: {
          type: "string",
        },
      },
    },
    team: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
    },
    users: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: {
            type: "string",
          },
          id: {
            type: "number",
          },
        },
      },
    },
    environments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
          },
          name: {
            type: "string",
          },
          type: {
            type: "string",
          },
        },
      },
    },
    createdAt: {
      type: "string",
    },
    createdBy: {
      type: "string",
    },
    isActiveWorkspace: {
      type: "boolean",
      default: false,
    },
    environmentId: {
      type: "string",
      default: "",
    },
    collections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
          },
          name: {
            type: "string",
          },
        },
      },
    },
    currentEnvironmentId: {
      type: "string",
    },
    environments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          _id: {
            type: "string",
          },
          name: {
            type: "string",
          },
        },
      },
    },
  },

  required: ["_id", "name", "owner", "permissions", "createdAt", "createdBy"],
} as const;

const schemaTyped = toTypedRxJsonSchema(workspaceSchemaLiteral);

export type WorkspaceDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const workspaceSchema: RxJsonSchema<WorkspaceDocType> =
  workspaceSchemaLiteral;
