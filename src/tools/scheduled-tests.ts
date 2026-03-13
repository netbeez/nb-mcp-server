/**
 * Scheduled test template tools — list/get/create/update plus results
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JsonApiClient } from "../api/jsonapi-client.js";
import type { ScheduledNbTestTemplatePayload } from "../api/types.js";

export function registerScheduledTestTools(server: McpServer, client: JsonApiClient) {
  const buildScheduledTemplateJsonApiBody = (
    payload: Partial<ScheduledNbTestTemplatePayload>,
    id?: number
  ) => {
    const { test_type_id, agent_ids, ...rawAttributes } = payload;
    const attributes: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(rawAttributes)) {
      if (value !== undefined) {
        attributes[key] = value;
      }
    }

    const relationships: Record<string, { data: unknown }> = {};

    if (test_type_id !== undefined) {
      relationships.test_type = {
        data: {
          type: "test_type",
          id: String(test_type_id),
        },
      };
    }

    if (agent_ids !== undefined) {
      relationships.agents = {
        data: agent_ids.map((agentId) => ({
          type: "agent",
          id: String(agentId),
        })),
      };
    }

    const data: Record<string, unknown> = {
      type: "scheduled_test_template",
      attributes,
    };

    if (id !== undefined) {
      data.id = String(id);
    }

    if (Object.keys(relationships).length > 0) {
      data.relationships = relationships;
    }

    return { data };
  };

  // ─── list_scheduled_test_templates ──────────────────────
  server.tool(
    "list_scheduled_test_templates",
    `List scheduled Iperf, Network Speed, and VoIP templates. Use filters and pagination to inspect existing recurring tests before creating or updating templates.`,
    {
      label: z.string().optional().describe("Filter by template label"),
      test_type_id: z
        .union([z.literal(5), z.literal(7), z.literal(8)])
        .optional()
        .describe("Filter by test type id: 5 (Iperf), 7 (Network Speed), 8 (VoIP)"),
      agent_ids: z
        .string()
        .optional()
        .describe("Filter by source agent IDs (comma-separated)"),
      destination_agent_id: z
        .number()
        .optional()
        .describe("Filter by destination agent ID (target_is_agent)"),
      by_destination: z
        .string()
        .optional()
        .describe("Filter by destination FQDN/IP"),
      order_by: z
        .string()
        .optional()
        .describe("Order field (for example: label, created_at)"),
      order_direction: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort direction"),
      page: z.number().optional().describe("Page offset"),
      page_size: z.number().optional().describe("Results per page"),
    },
    async (params) => {
      const response = await client.listScheduledTestTemplates(params);
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

  // ─── get_scheduled_test_template ────────────────────────
  server.tool(
    "get_scheduled_test_template",
    `Get a scheduled test template by ID with its full configuration.`,
    {
      template_id: z.number().describe("Scheduled test template ID"),
    },
    async (params) => {
      const response = await client.getScheduledTestTemplate(params.template_id);
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

  const scheduledTemplateBaseSchema = {
    test_type_id: z
      .union([z.literal(5), z.literal(7), z.literal(8)])
      .describe("Test type: 5=Iperf, 7=Network Speed, 8=VoIP"),
    label: z.string().describe("Template name/label"),
    cron_schedule: z.string().describe("Cron schedule expression"),
    agent_ids: z.array(z.number()).min(1).describe("Source agent IDs"),
    target: z.string().optional().describe("Destination FQDN/IP where applicable"),
    target_is_agent: z
      .number()
      .optional()
      .describe("Destination agent ID for agent-to-agent tests"),
    secure: z.boolean().optional().describe("Secure mode where supported"),
    iperf_port: z.number().optional().describe("Iperf port"),
    iperf_time: z.number().optional().describe("Iperf duration seconds"),
    iperf_type: z
      .union([z.literal(1), z.literal(2)])
      .optional()
      .describe("Iperf protocol: 1=TCP, 2=UDP"),
    iperf_version: z.union([z.literal(2), z.literal(3)]).optional().describe("Iperf version"),
    parallel_streams: z.number().optional().describe("Iperf parallel streams"),
    reverse: z.boolean().optional().describe("Iperf reverse mode"),
    bandwidth: z.number().optional().describe("Iperf bandwidth (UDP only)"),
    speedtest_type: z
      .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
      .optional()
      .describe("Speed test provider: 1=Ookla, 2=NDT, 3=fast.com, 4=Cloudflare"),
    codec: z.string().optional().describe("VoIP codec"),
    voip_port: z.number().optional().describe("VoIP port"),
    voip_time: z.number().optional().describe("VoIP duration seconds"),
    num_of_concurrent_calls: z.number().optional().describe("VoIP concurrent calls"),
  };

  // ─── create_scheduled_test_template ─────────────────────
  server.tool(
    "create_scheduled_test_template",
    `Create a scheduled Iperf, Network Speed, or VoIP test template using JSON:API payload semantics.`,
    scheduledTemplateBaseSchema,
    async (params) => {
      const payload: ScheduledNbTestTemplatePayload = { ...params };
      const response = await client.createScheduledTestTemplate(
        buildScheduledTemplateJsonApiBody(payload)
      );
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

  // ─── update_scheduled_test_template ─────────────────────
  server.tool(
    "update_scheduled_test_template",
    `Update an existing scheduled test template using JSON:API payload semantics. Provide fields to change.`,
    {
      template_id: z.number().describe("Scheduled template ID"),
      test_type_id: z
        .union([z.literal(5), z.literal(7), z.literal(8)])
        .optional()
        .describe("Test type: 5=Iperf, 7=Network Speed, 8=VoIP"),
      label: z.string().optional().describe("Template name/label"),
      cron_schedule: z.string().optional().describe("Cron schedule expression"),
      agent_ids: z.array(z.number()).min(1).optional().describe("Source agent IDs"),
      target: z.string().optional().describe("Destination FQDN/IP where applicable"),
      target_is_agent: z
        .number()
        .optional()
        .describe("Destination agent ID for agent-to-agent tests"),
      secure: z.boolean().optional().describe("Secure mode where supported"),
      iperf_port: z.number().optional().describe("Iperf port"),
      iperf_time: z.number().optional().describe("Iperf duration seconds"),
      iperf_type: z
        .union([z.literal(1), z.literal(2)])
        .optional()
        .describe("Iperf protocol: 1=TCP, 2=UDP"),
      iperf_version: z.union([z.literal(2), z.literal(3)]).optional().describe("Iperf version"),
      parallel_streams: z.number().optional().describe("Iperf parallel streams"),
      reverse: z.boolean().optional().describe("Iperf reverse mode"),
      bandwidth: z.number().optional().describe("Iperf bandwidth (UDP only)"),
      speedtest_type: z
        .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
        .optional()
        .describe("Speed test provider: 1=Ookla, 2=NDT, 3=fast.com, 4=Cloudflare"),
      codec: z.string().optional().describe("VoIP codec"),
      voip_port: z.number().optional().describe("VoIP port"),
      voip_time: z.number().optional().describe("VoIP duration seconds"),
      num_of_concurrent_calls: z.number().optional().describe("VoIP concurrent calls"),
    },
    async (params) => {
      const { template_id, ...rest } = params;
      const payload: Partial<ScheduledNbTestTemplatePayload> = { ...rest };
      const response = await client.updateScheduledTestTemplate(
        template_id,
        buildScheduledTemplateJsonApiBody(payload, template_id)
      );
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

  // ─── get_scheduled_test_results ─────────────────────────
  server.tool(
    "get_scheduled_test_results",
    `Get results for a scheduled test template (Iperf, Network Speed Test, VoIP). Scheduled tests run at defined intervals and produce key-value result pairs (e.g., download_speed, upload_speed, latency, jitter, MOS score). Returns timestamped results filtered by agent and time range.

Use this for bandwidth testing results, VoIP quality metrics, or Iperf throughput analysis. These are distinct from continuous monitoring tests (ping/dns/http/traceroute) — they run on a schedule and measure throughput/quality.`,
    {
      template_id: z
        .number()
        .describe("The scheduled test template ID"),
      filter_agents: z
        .string()
        .optional()
        .describe("Filter by agent IDs (comma-separated)"),
      filter_ts_operator: z
        .string()
        .optional()
        .describe("Timestamp filter operator: >, <, >=, <=, <=>, ="),
      filter_ts_value1: z
        .string()
        .optional()
        .describe("Timestamp filter value"),
      filter_ts_value2: z
        .string()
        .optional()
        .describe("Second timestamp value (for between operator)"),
      order_by: z
        .string()
        .optional()
        .describe("Order results by field"),
      order_direction: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort direction"),
      page: z.number().optional().describe("Page offset"),
      page_size: z.number().optional().describe("Results per page"),
    },
    async (params) => {
      const response = await client.getScheduledTestResults(params.template_id, {
        filters: {
          agents: params.filter_agents,
        },
        timestampFilters: {
          ts:
            params.filter_ts_operator && params.filter_ts_value1
              ? {
                  operator: params.filter_ts_operator as any,
                  value1: params.filter_ts_value1,
                  value2: params.filter_ts_value2,
                }
              : undefined,
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
}
