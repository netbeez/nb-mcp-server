/**
 * Alert detector tools — list_alert_detectors
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JsonApiClient } from "../api/jsonapi-client.js";

export function registerAlertDetectorTools(server: McpServer, client: JsonApiClient) {
  // ─── list_alert_detectors ───────────────────────────────
  server.tool(
    "list_alert_detectors",
    `List alert detector definitions configured in NetBeez. Alert detectors are rules that evaluate test results or agent heartbeats and trigger alerts when conditions are met.

Types: AgentUpDown (agent reachability), UpDown (test pass/fail), Watermark (fixed threshold), Baseline (dynamic threshold relative to historical performance), BaselineWatermark (combined).
Alerting entity: "Agent" (monitors agent connectivity) or "NbTest" (monitors test results).

Use this to discover which alerting rules exist, understand what thresholds are configured, or find detectors assigned to specific tests/agents. Cross-reference alert_detector IDs with list_alerts to understand which rules triggered specific alerts.`,
    {
      filter_default: z
        .string()
        .optional()
        .describe('Filter by whether the detector attaches to targets by default: "true" or "false"'),
      filter_alert_detector_types: z
        .string()
        .optional()
        .describe("Filter by detector type (comma-separated): AgentUpDown, Baseline, BaselineWatermark, UpDown, Watermark"),
      filter_alerting_entity_types: z
        .string()
        .optional()
        .describe("Filter by alerting entity type (comma-separated): Agent, NbTest"),
      filter_test_types: z
        .string()
        .optional()
        .describe("Filter by test type (comma-separated): Ping, HTTP, DNS, Traceroute"),
      filter_tests: z
        .string()
        .optional()
        .describe("Filter by test IDs (comma-separated)"),
      filter_agents: z
        .string()
        .optional()
        .describe("Filter by agent IDs (comma-separated)"),
      order_by: z
        .string()
        .optional()
        .describe("Order results by attribute: id, name"),
      order_direction: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Order direction: asc or desc"),
      page: z.number().optional().describe("Page offset"),
      page_size: z.number().optional().describe("Results per page"),
    },
    async (params) => {
      const response = await client.listAlertDetectors({
        filters: {
          default: params.filter_default,
          alert_detector_types: params.filter_alert_detector_types,
          alerting_entity_types: params.filter_alerting_entity_types,
          test_types: params.filter_test_types,
          tests: params.filter_tests,
          agents: params.filter_agents,
        },
        order:
          params.order_by
            ? { attributes: params.order_by, direction: params.order_direction ?? "asc" }
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
