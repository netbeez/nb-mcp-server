/**
 * Target tools — list/get plus create/update write operations
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JsonApiClient } from "../api/jsonapi-client.js";

export function registerTargetTools(server: McpServer, client: JsonApiClient) {
  const bodySchema = z.union([z.record(z.unknown()), z.string()]);

  const parseBody = (body: Record<string, unknown> | string): unknown => {
    if (typeof body !== "string") {
      return body;
    }
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error(`Invalid JSON in body: ${(error as Error).message}`);
    }
  };

  // ─── list_targets ───────────────────────────────────────
  server.tool(
    "list_targets",
    `List all monitoring targets (hosts, URLs, IPs being monitored). Returns targets with their associated test templates and alert counts. Use this to see what is being monitored, find targets with open incidents, or filter by agent/category/connectivity type.`,
    {
      filter_name_regex: z
        .string()
        .optional()
        .describe("Filter targets by name using regex pattern"),
      filter_agents: z
        .string()
        .optional()
        .describe("Filter by agent IDs (comma-separated)"),
      filter_categories: z
        .string()
        .optional()
        .describe("Filter by category: network_agent or remote_worker_agent"),
      filter_agent_classes: z
        .string()
        .optional()
        .describe("Filter by agent class (comma-separated)"),
      filter_agent_groups: z
        .string()
        .optional()
        .describe("Filter by agent group IDs (comma-separated)"),
      filter_open_incident: z
        .boolean()
        .optional()
        .describe("Filter to only targets with open incidents (true) or without (false)"),
      filter_wifi: z
        .boolean()
        .optional()
        .describe("Filter to targets monitored over WiFi"),
      filter_wired: z
        .boolean()
        .optional()
        .describe("Filter to targets monitored over wired connections"),
      include: z
        .string()
        .optional()
        .describe("Relationships to include: test_templates"),
      page: z.number().optional().describe("Page offset"),
      page_size: z.number().optional().describe("Results per page"),
    },
    async (params) => {
      const response = await client.listTargets({
        filters: {
          "name[regex]": params.filter_name_regex,
          agents: params.filter_agents,
          categories: params.filter_categories,
          agent_classes: params.filter_agent_classes,
          agent_groups: params.filter_agent_groups,
          open_incident: params.filter_open_incident,
          wifi: params.filter_wifi,
          wired: params.filter_wired,
        },
        include: params.include,
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

  // ─── create_target ──────────────────────────────────────
  server.tool(
    "create_target",
    `Create a custom monitoring target using a raw JSON:API payload. The caller must provide the full JSON:API document (attributes, test templates, relationships, and monitoring conditions as needed).`,
    {
      body: bodySchema.describe("Raw JSON:API payload object or JSON string."),
    },
    async (params) => {
      const response = await client.createTarget(parseBody(params.body));
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

  // ─── create_target_saas ─────────────────────────────────
  server.tool(
    "create_target_saas",
    `Create a target from a built-in SaaS application using a raw JSON:API payload.`,
    {
      body: bodySchema.describe("Raw JSON:API payload object or JSON string."),
    },
    async (params) => {
      const response = await client.createTargetSaaS(parseBody(params.body));
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

  // ─── create_target_from_template ───────────────────────
  server.tool(
    "create_target_from_template",
    `Create a target from simplified templates (Website, DNS, VPN, Gateway) using a raw JSON:API payload.`,
    {
      body: bodySchema.describe("Raw JSON:API payload object or JSON string."),
    },
    async (params) => {
      const response = await client.createTargetFromTemplate(parseBody(params.body));
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

  // ─── update_target ──────────────────────────────────────
  server.tool(
    "update_target",
    `Update an existing target by ID using a raw JSON:API payload.`,
    {
      target_id: z.number().describe("Target ID to update."),
      body: bodySchema.describe("Raw JSON:API payload object or JSON string."),
    },
    async (params) => {
      const response = await client.updateTarget(params.target_id, parseBody(params.body));
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

  // ─── get_target ─────────────────────────────────────────
  server.tool(
    "get_target",
    `Get detailed information about a specific monitoring target by its ID. Returns the target with its test templates, test configuration, and associated tests. Use this after list_targets to drill into a specific target's monitoring setup.`,
    {
      target_id: z
        .number()
        .describe("The numeric ID of the target"),
      include: z
        .string()
        .optional()
        .describe("Relationships to include: test_templates"),
    },
    async (params) => {
      // Use filter[ids] to get a specific target
      const response = await client.listTargets({
        filters: { ids: String(params.target_id) },
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
}
