/**
 * Agent group tools — list/get/create/update
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JsonApiClient } from "../api/jsonapi-client.js";
import type { AgentGroupPayload } from "../api/types.js";

export function registerAgentGroupTools(server: McpServer, client: JsonApiClient) {
  // ─── list_agent_groups ───────────────────────────────────
  server.tool(
    "list_agent_groups",
    `List agent groups for bulk target assignment and organization.`,
    {
      filter_name: z.string().optional().describe("Filter by exact group name"),
      filter_name_regex: z
        .string()
        .optional()
        .describe("Filter by group name regex"),
      order_by: z.string().optional().describe("Order by field"),
      order_direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
      page: z.number().optional().describe("Page offset"),
      page_size: z.number().optional().describe("Results per page"),
    },
    async (params) => {
      const response = await client.listAgentGroups({
        filters: {
          name: params.filter_name,
          "name[regex]": params.filter_name_regex,
        },
        order: params.order_by
          ? { attributes: params.order_by, direction: params.order_direction || "desc" }
          : undefined,
        pagination: { page: params.page, page_size: params.page_size },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  // ─── get_agent_group ─────────────────────────────────────
  server.tool(
    "get_agent_group",
    `Get a single agent group with relationships and attributes.`,
    {
      agent_group_id: z.number().describe("Agent group ID"),
      include: z
        .string()
        .optional()
        .describe("Optional relationships to include (comma-separated)"),
    },
    async (params) => {
      const response = await client.getAgentGroup(params.agent_group_id, {
        include: params.include,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  const writeSchema = {
    name: z.string().describe("Agent group name"),
    agent_ids: z.array(z.number()).describe("Member agent IDs"),
    nb_target_ids: z.array(z.number()).optional().describe("Optional target IDs"),
    auto_assign: z.boolean().optional().describe("Enable auto assign behavior"),
    force: z.boolean().optional().describe("Force update behavior where supported"),
  };

  // ─── create_agent_group ──────────────────────────────────
  server.tool(
    "create_agent_group",
    `Create an agent group using JSON:API payload semantics.`,
    writeSchema,
    async (params) => {
      const payload: AgentGroupPayload = { ...params };
      const response = await client.createAgentGroup(payload);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  // ─── update_agent_group ──────────────────────────────────
  server.tool(
    "update_agent_group",
    `Update an agent group by ID using JSON:API payload semantics.`,
    {
      agent_group_id: z.number().describe("Agent group ID"),
      ...writeSchema,
    },
    async (params) => {
      const { agent_group_id, ...rest } = params;
      const payload: AgentGroupPayload = { ...rest };
      const response = await client.updateAgentGroup(agent_group_id, payload);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );
}
