/**
 * MCP Resource: NetBeez API Reference
 *
 * Comprehensive documentation for all available API endpoints, including
 * JSON:API endpoints and the three Legacy/Swagger statistics endpoints.
 */

export const API_REFERENCE_URI = "netbeez://api-reference";
export const API_REFERENCE_NAME = "NetBeez API Reference";
export const API_REFERENCE_DESCRIPTION =
  "Complete reference for all NetBeez API endpoints — JSON:API and Legacy statistics — with authentication, filtering, pagination, ordering, and response schemas";
export const API_REFERENCE_MIME = "text/markdown";

export const API_REFERENCE_CONTENT = `# NetBeez API Reference

The NetBeez platform exposes two API surfaces:

1. **JSON:API** — The primary REST API for all entity CRUD operations and test results. Uses \`Bearer\` token auth and JSON:API conventions.
2. **Legacy API** — Three statistics/metrics endpoints. Uses plain API key auth with \`API-VERSION: v1\`.

Both APIs are served from the same base URL (e.g. \`https://your-instance.netbeezcloud.net\`).

---

## Authentication

### JSON:API Endpoints

\`\`\`
Authorization: Bearer <API_KEY>
Content-Type: application/vnd.api+json
\`\`\`

Most JSON:API endpoints also require the query parameter \`type=beta\`.

### Legacy API Endpoints

\`\`\`
Authorization: <API_KEY>
API-VERSION: v1
\`\`\`

Note: No \`Bearer\` prefix for legacy endpoints.

---

## Pagination

### JSON:API Pagination

All JSON:API list endpoints support offset-based pagination:

| Parameter | Description | Default |
|-----------|-------------|---------|
| \`page[offset]\` | Page number (1-based) | 1 |
| \`page[limit]\` | Items per page | 25 |

**Response metadata** includes pagination info in \`meta.page\`:

\`\`\`json
{
  "meta": {
    "page": {
      "offset": 1,
      "limit": 25,
      "next": true
    }
  }
}
\`\`\`

- \`next: true\` means there are more pages available.
- To fetch the next page, increment \`page[offset]\` by 1.
- Continue until \`next\` is \`false\` or absent.

**Example — page through all agents, 50 per page:**

\`\`\`
GET /agents?type=beta&page[offset]=1&page[limit]=50
GET /agents?type=beta&page[offset]=2&page[limit]=50
GET /agents?type=beta&page[offset]=3&page[limit]=50
... continue until meta.page.next is false
\`\`\`

### Legacy API Pagination

Legacy endpoints do **not** use offset pagination. They return all matching records. Use \`from\`/\`to\` time-range parameters or the \`last\` parameter to control the volume of data returned.

---

## Filtering

### Simple Filters

\`\`\`
filter[field]=value
\`\`\`

Multiple values are comma-separated: \`filter[agents]=1,2,3\`

### Regex Filters

\`\`\`
filter[name][regex]=pattern
\`\`\`

### Timestamp / Operator Filters

\`\`\`
filter[ts][operator]=<=>&filter[ts][value1]=1700000000000&filter[ts][value2]=1700100000000
\`\`\`

Supported operators: \`>\`, \`<\`, \`>=\`, \`<=\`, \`<=>\` (between), \`=\`

When using \`<=>\` (between), both \`value1\` and \`value2\` are required.

Timestamp values should be Unix epoch **milliseconds**.

---

## Ordering

\`\`\`
order[attributes]=field_name&order[direction]=asc|desc
\`\`\`

Multiple fields can be comma-separated: \`order[attributes]=ts,name\`

---

## Includes (Sideloading Relationships)

\`\`\`
include=relationship1,relationship2
\`\`\`

Included resources appear in the \`included\` array of the JSON:API response.

---

## JSON:API Response Envelope

All JSON:API responses follow this structure:

\`\`\`json
{
  "data": [
    {
      "id": "123",
      "type": "agent",
      "attributes": { ... },
      "relationships": {
        "agent_groups": {
          "data": [{ "id": "1", "type": "agent_group" }]
        }
      }
    }
  ],
  "included": [ ... ],
  "meta": { "page": { "offset": 1, "limit": 25, "next": true } }
}
\`\`\`

For single-resource responses, \`data\` is an object instead of an array.

---

## JSON:API Endpoints

### Agents

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/agents\` | List agents |
| GET | \`/agents/:id\` | Get single agent |
| PUT | \`/agents/:id\` | Update agent |
| DELETE | \`/agents/:id\` | Delete agent |
| PUT | \`/agents\` | Bulk update agents |

**List filters:** \`name\`, \`name[regex]\`, \`categories\` (network_agent, remote_worker_agent), \`agent_classes\` (container, faste, wireless, gige, virtual, external, software, mac, windows), \`active\` (boolean), \`active_ts\`, \`agent_groups\`, \`critical_alerts\`, \`warning_alerts\`, \`in_incident\`

**Includes:** \`network_interfaces\`, \`agent_groups\`

**Stubbed mode:** Pass \`stubbed=true\` query param for a lighter response.

#### Agent Sub-resources

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/agents/:agent_id/logs\` | Agent connection/disconnection event logs |
| GET | \`/agents/:agent_id/logs/:id\` | Single log entry |
| GET | \`/agents/:agent_id/access_point_connections\` | WiFi AP connection history |
| GET | \`/agents/:agent_id/access_point_connections/:id\` | Single AP connection |
| GET | \`/agents/:agent_id/performance_metrics\` | CPU, memory, disk usage over time |
| GET | \`/agents/grouped_alert_counts\` | Alert counts grouped by agent |

**Log filters:** \`event_code\`, \`ts\` (timestamp operator filter)
**AP connection filters:** \`error_states\`, \`ts\`

---

### Agent Groups

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/agent_groups\` | List agent groups |
| GET | \`/agent_groups/:id\` | Get single agent group |
| POST | \`/agent_groups\` | Create agent group |
| PUT | \`/agent_groups/:id\` | Update agent group |

**Create/Update payload (JSON:API):**

\`\`\`json
{
  "data": {
    "type": "agent_group",
    "attributes": {
      "name": "Group Name",
      "auto_assign": false,
      "force": false
    },
    "relationships": {
      "agents": {
        "data": [{ "type": "agent", "id": "1" }, { "type": "agent", "id": "2" }]
      },
      "targets": {
        "data": [{ "type": "target", "id": "10" }]
      }
    }
  }
}
\`\`\`

---

### Targets

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/targets\` | List targets |
| POST | \`/targets\` | Create custom target |
| POST | \`/targets/saas\` | Create SaaS target |
| POST | \`/targets/target_template\` | Create target from template |
| PUT | \`/targets/:id\` | Update target |

**List filters:** \`name[regex]\`, \`agents\`, \`categories\`, \`agent_groups\`, and more.

**Includes:** Available via \`include\` param.

---

### Tests (nb_tests)

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/nb_tests\` | List all tests |

**List filters:** \`agents\`, \`targets\`, \`test_templates\`, \`test_types\`, and more.

#### Test Results

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/nb_tests/ping/results\` | Ping test results |
| GET | \`/nb_tests/dns/results\` | DNS test results |
| GET | \`/nb_tests/http/results\` | HTTP test results |
| GET | \`/nb_tests/traceroutes/results\` | Traceroute results |
| GET | \`/nb_tests/path_analysis/results\` | Path analysis results |
| GET | \`/nb_tests/path_analysis/results/:timestamp\` | Single path analysis result |

**Common result filters:** \`agents\`, \`tests\`, \`test_templates\`, \`ts\` (timestamp operator filter)

**Path analysis additional filters:** \`ip_address\`

**Path analysis includes:** Supports \`include\` for related resources.

#### Test State Transitions

| Method | Path | Description |
|--------|------|-------------|
| PUT | \`/nb_tests/:nb_test_id/transition_states/:state\` | Transition a single test |
| PUT | \`/nb_tests/transition_states/:state\` | Bulk transition tests |

---

### Scheduled Test Templates

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/scheduled_nb_test_templates.json\` | List templates |
| GET | \`/scheduled_nb_test_templates/:id\` | Get single template |
| POST | \`/scheduled_nb_test_templates\` | Create template |
| PUT | \`/scheduled_nb_test_templates/:id\` | Update template |

**List filters:** \`label\`, \`test_types\`, \`agents\`, \`destination_agent\`, \`by_destination\`

**Test types:** 5 (iperf), 7 (speed test), 8 (VoIP)

#### Scheduled Test Results

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/scheduled_nb_test_templates/:template_id/results\` | Get results for a template |
| GET | \`/scheduled_nb_test_templates/:template_id/results/statistics\` | Get result statistics |

**Result filters:** \`agents\`, \`ts\` (timestamp operator filter)

---

### Ad-hoc / Multiagent Test Runs

| Method | Path | Description |
|--------|------|-------------|
| POST | \`/multiagent_nb_test_runs/ad_hoc\` | Run an ad-hoc test |
| GET | \`/multiagent_nb_test_runs\` | Get test run status |

**Note:** The POST uses \`Content-Type: application/json\` (not \`application/vnd.api+json\`).

**GET filters:** \`multiagent_nb_test_runs\` (run ID)
**GET includes:** \`results\`

---

### Alerts

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/alerts\` | List alerts |
| GET | \`/alerts/ai_summary\` | AI-generated alert summary |
| GET | \`/alert_detectors\` | List alert detectors |

**Alert filters:** \`targets\`, \`agents\`, and more.

**Alert severity values:** 1 = failure/critical, 4 = warning, 6 = cleared/recovered

---

### Incidents

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/incidents\` | List incidents |
| GET | \`/incidents/ai_summary\` | AI-generated incident summary |

**Includes:** \`incident_logs\` (timeline of events within the incident)

---

### WiFi Profiles

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/wifi_profiles\` | List WiFi profiles |
| GET | \`/wifi_profiles/:id\` | Get single WiFi profile |
| POST | \`/wifi_profiles\` | Create WiFi profile |
| PUT | \`/wifi_profiles/:id\` | Update WiFi profile |

---

### WiFi Hopping Groups

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/wifi_hopping_groups\` | List WiFi hopping groups |
| GET | \`/wifi_hopping_groups/:id\` | Get single group |
| POST | \`/wifi_hopping_groups\` | Create group |
| PUT | \`/wifi_hopping_groups/:id\` | Update group |

---

### Scheduled Test State Transitions

| Method | Path | Description |
|--------|------|-------------|
| PUT | \`/scheduled_nb_tests/:scheduled_nb_test_id/:state\` | Transition scheduled test state |

---

### Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/reports/generated_reports\` | List generated reports |
| GET | \`/reports/generated_reports/:id\` | Get single report |
| DELETE | \`/reports/generated_reports/:id\` | Delete report |
| GET | \`/reports/scheduled_reports\` | List scheduled reports |
| POST | \`/reports/scheduled_reports\` | Create scheduled report |
| PUT | \`/reports/scheduled_reports\` | Update scheduled report |
| DELETE | \`/reports/scheduled_reports/:id\` | Delete scheduled report |

---

### Other Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/monitoring_conditions\` | List monitoring conditions |
| GET | \`/settings/maintenance_mode\` | Get maintenance mode status |
| PUT | \`/settings/maintenance_mode\` | Toggle maintenance mode |

---

## Legacy Statistics Endpoints

These three endpoints use the legacy authentication scheme (\`Authorization: <API_KEY>\` without \`Bearer\`, plus \`API-VERSION: v1\` header).

They return pre-aggregated timeseries data and do **not** follow JSON:API conventions.

### 1. Test Statistics — \`GET /nb_test_statistics.json\`

Returns pre-aggregated test performance statistics over time. Best for analyzing trends over longer periods rather than individual raw results.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`nb_test_id\` | integer | No | Filter by specific test ID |
| \`agent_id\` | integer | No | Filter by agent ID |
| \`nb_test_template_id\` | integer | No | Filter by test template ID |
| \`nb_target_id\` | integer | No | Filter by target ID |
| \`window_size\` | integer | No | Aggregation window size in seconds |
| \`granularity\` | string | No | Aggregation granularity |
| \`from\` | integer | No | Start time (Unix epoch milliseconds) |
| \`to\` | integer | No | End time (Unix epoch milliseconds) |
| \`last\` | integer | No | Return last N data points |
| \`metric_type\` | string | No | Type of metric (avg, min, max, etc.) |
| \`grouping\` | string | No | Grouping parameter for aggregation |
| \`test_type_id\` | integer | No | Filter by test type ID |
| \`ts_order\` | string | No | Timestamp ordering: asc or desc |
| \`sort_by\` | string | No | Sort by field |
| \`sort_by_order\` | string | No | Sort order: asc or desc |
| \`value_operator\` | string | No | Value comparison operator for watermark filtering |
| \`value_watermark\` | number | No | Watermark threshold value |

**Response:**

\`\`\`json
{
  "nb_test_statistics": [
    {
      "id": 12345,
      "nb_test_id": 100,
      "timestamp": 1700000000000,
      "value": 42.5,
      "metric_type": "avg",
      "window_size": 300,
      "datapoint_count": 60,
      "error_count": 0
    }
  ]
}
\`\`\`

**Response fields:**

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | integer | Record ID |
| \`nb_test_id\` | integer | Associated test ID |
| \`timestamp\` | integer | Unix epoch milliseconds |
| \`value\` | float | Aggregated metric value |
| \`metric_type\` | string | Type of aggregation applied |
| \`window_size\` | integer | Aggregation window in seconds |
| \`datapoint_count\` | integer | Number of raw data points in this window |
| \`error_count\` | integer | Number of errors in this window |

**Single record:** \`GET /nb_test_statistics/{id}.json\` with optional filters: \`nb_test_id\`, \`nb_test_template_id\`, \`nb_target_id\`.

---

### 2. Agent Statistics — \`GET /nb_agent_statistics.json\`

Returns agent availability/uptime statistics over time. Use this to track agent health, identify patterns of disconnections, or verify an agent was consistently online.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`agent_id\` | integer | **Yes** | The agent to query (required) |
| \`from\` | integer | No | Start time (Unix epoch milliseconds) |
| \`to\` | integer | No | End time (Unix epoch milliseconds) |
| \`window_size\` | integer | No | Aggregation window size in seconds |
| \`last\` | integer | No | Return last N data points |

**Response:**

\`\`\`json
{
  "agent_stats": [
    {
      "agent_id": 5,
      "id": 67890,
      "interval": 300,
      "timestamp": 1700000000000,
      "uptime": 100.0,
      "window_size": 300
    }
  ]
}
\`\`\`

**Response fields:**

| Field | Type | Description |
|-------|------|-------------|
| \`agent_id\` | integer | The agent ID |
| \`id\` | integer | Record ID |
| \`interval\` | integer | Measurement interval in seconds |
| \`timestamp\` | integer | Unix epoch milliseconds |
| \`uptime\` | float | Uptime percentage (0-100) |
| \`window_size\` | integer | Aggregation window in seconds |

---

### 3. Access Point Metrics — \`GET /access_point_metrics.json\`

Returns WiFi signal quality metrics over time. Use for WiFi troubleshooting — correlate signal quality with test performance.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`agent_id\` | integer | No | Filter by agent ID |
| \`access_point_id\` | integer | No | Filter by access point ID |
| \`from\` | integer | No | Start time (Unix epoch milliseconds) |
| \`to\` | integer | No | End time (Unix epoch milliseconds) |

**Response:**

\`\`\`json
{
  "metrics": [
    {
      "access_point_id": 10,
      "bit_rate": 54,
      "channel": 6,
      "id": 99999,
      "link_quality": 0.85,
      "network_interface_id": 3,
      "rx_rate": 72,
      "signal_level": -55,
      "timestamp": 1700000000000,
      "tx_rate": 65
    }
  ]
}
\`\`\`

**Response fields:**

| Field | Type | Description |
|-------|------|-------------|
| \`access_point_id\` | integer | Associated access point ID |
| \`bit_rate\` | integer | Connection bit rate (Mbps) |
| \`channel\` | integer | WiFi channel number |
| \`id\` | integer | Record ID |
| \`link_quality\` | float | Link quality ratio (0.0 – 1.0) |
| \`network_interface_id\` | integer | Associated network interface ID |
| \`rx_rate\` | integer | Receive rate (Mbps) |
| \`signal_level\` | integer | Signal strength in dBm (e.g. -55) |
| \`timestamp\` | integer | Unix epoch milliseconds |
| \`tx_rate\` | integer | Transmit rate (Mbps) |

#### Downsampled variant — \`GET /access_point_metrics/sample.json\`

Same parameters as above plus:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`cardinality\` | integer | No | Target number of data points to return (downsamples to this count) |

Use this for long time ranges to avoid returning too many data points.

---

## Timestamp Handling

- **JSON:API timestamp filters** accept Unix epoch milliseconds, Unix epoch seconds, or ISO 8601 strings. The client normalizes all values to epoch milliseconds before sending.
- **Legacy API** \`from\`/\`to\` parameters accept Unix epoch milliseconds. The client normalizes epoch seconds and ISO 8601 strings to milliseconds automatically.
- **Response timestamps** are Unix epoch milliseconds (integer).

---

## Common Patterns

### Fetch all pages of a JSON:API list endpoint

\`\`\`
1. GET /endpoint?type=beta&page[offset]=1&page[limit]=100
2. Check response meta.page.next
3. If true, GET /endpoint?type=beta&page[offset]=2&page[limit]=100
4. Repeat until next is false
\`\`\`

### Filter test results by time range

\`\`\`
GET /nb_tests/ping/results?type=beta&filter[agents]=5&filter[ts][operator]=<=>&filter[ts][value1]=1700000000000&filter[ts][value2]=1700100000000
\`\`\`

### Get aggregated statistics for a test over the last 24 hours

\`\`\`
GET /nb_test_statistics.json?nb_test_id=100&from=<24h_ago_epoch_ms>&to=<now_epoch_ms>
\`\`\`

### Check agent uptime over the last week

\`\`\`
GET /nb_agent_statistics.json?agent_id=5&last=168
\`\`\`
`;
