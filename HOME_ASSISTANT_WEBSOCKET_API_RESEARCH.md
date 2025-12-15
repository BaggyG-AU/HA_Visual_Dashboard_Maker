# Home Assistant WebSocket API Research: Retrieving Lovelace Dashboard Configurations

## Executive Summary

**Problem**: Home Assistant REST API endpoints like `/api/lovelace/config` return 404 errors for dashboards in "storage" mode, despite other REST endpoints working correctly.

**Solution**: Use the **Home Assistant WebSocket API** instead. The WebSocket API provides full access to Lovelace dashboard configurations, including storage-mode dashboards that are inaccessible via REST API.

---

## Key Findings

### 1. Storage Mode vs YAML Mode

**Storage Mode** (default):
- Dashboards created via the UI
- Stored in `/config/.storage/lovelace.{dashboard_id}` files
- **NOT accessible via REST API** (this is by design)
- **Fully accessible via WebSocket API**

**YAML Mode**:
- Dashboards defined in `ui-lovelace.yaml`
- Accessible via both REST and WebSocket APIs
- Requires switching modes and losing UI editor features

### 2. Why REST API Returns 404

The lack of REST API access to storage mode Lovelace configurations was a known limitation introduced in Home Assistant 0.84 (2019) when storage mode was first implemented. This was documented in [GitHub Issue #19790](https://github.com/home-assistant/core/issues/19790) and [GitHub Issue #2406](https://github.com/home-assistant/frontend/issues/2406).

**Key Quote from Community**: "There does not appear to be any way to retrieve the JSON file for a lovelace dashboard configuration file through the official API" (REST API).

### 3. WebSocket API Is the Official Solution

The WebSocket API is the **recommended and supported method** for programmatically accessing storage-mode dashboard configurations.

---

## WebSocket API Overview

### Connection Details

**WebSocket URL**: `ws://your-home-assistant-url:8123/api/websocket` or `wss://` for SSL

**Authentication**: Requires a long-lived access token (create in Home Assistant profile → Security → Long-Lived Access Tokens)

### Authentication Flow (3 Phases)

```
1. INITIATION
   Client connects → Server sends:
   {
     "type": "auth_required",
     "ha_version": "2024.x.x"
   }

2. AUTHENTICATION
   Client sends:
   {
     "type": "auth",
     "access_token": "YOUR_LONG_LIVED_ACCESS_TOKEN"
   }

3. VERIFICATION
   Server responds with either:
   Success: {"type": "auth_ok", "ha_version": "2024.x.x"}
   Failure: {"type": "auth_invalid", "message": "Invalid access token"}
```

### Message Format

All messages after authentication must include:
- `type`: Command name
- `id`: Unique integer for correlating requests/responses

```json
{
  "id": 1,
  "type": "command_type",
  "additional": "parameters"
}
```

---

## Lovelace WebSocket Commands

### 1. List All Dashboards

**Command**: `lovelace/dashboards/list`

**Request**:
```json
{
  "id": 1,
  "type": "lovelace/dashboards/list"
}
```

**Response**:
```json
{
  "id": 1,
  "type": "result",
  "success": true,
  "result": [
    {
      "id": "lovelace",
      "url_path": "lovelace",
      "require_admin": false,
      "show_in_sidebar": true,
      "icon": null,
      "title": "Overview",
      "mode": "storage"
    },
    {
      "id": "dashboard-1",
      "url_path": "dashboard-1",
      "require_admin": false,
      "show_in_sidebar": true,
      "icon": "mdi:view-dashboard",
      "title": "My Custom Dashboard",
      "mode": "storage"
    }
  ]
}
```

### 2. Get Dashboard Configuration

**Command**: `lovelace/config`

**Request**:
```json
{
  "id": 2,
  "type": "lovelace/config",
  "url_path": null,
  "force": false
}
```

**Parameters**:
- `url_path`: Dashboard identifier
  - `null` = default dashboard (usually "lovelace")
  - String = specific dashboard path (e.g., "dashboard-1")
- `force`: Boolean to bypass cache and force reload

**Response**:
```json
{
  "id": 2,
  "type": "result",
  "success": true,
  "result": {
    "views": [
      {
        "title": "Home",
        "path": "home",
        "cards": [
          {
            "type": "entities",
            "entities": ["light.living_room"],
            "title": "Living Room"
          }
        ]
      }
    ],
    "title": "My Dashboard"
  }
}
```

### 3. List Resources (Custom Cards/Modules)

**Command**: `lovelace/resources`

**Request**:
```json
{
  "id": 3,
  "type": "lovelace/resources"
}
```

**Note**: The `lovelace/resources` and `lovelace/resources/list` commands are registered for backwards compatibility and planned for removal in Home Assistant Core 2025.1.

### 4. Subscribe to Dashboard Updates

**Command**: `subscribe_events` with `lovelace_updated` event

**Request**:
```json
{
  "id": 4,
  "type": "subscribe_events",
  "event_type": "lovelace_updated"
}
```

**Event Data**:
```json
{
  "event": {
    "event_type": "lovelace_updated",
    "data": {
      "url_path": "lovelace",
      "mode": "storage"
    }
  }
}
```

---

## Python Implementation Examples

### Basic WebSocket Connection with Asyncio

```python
import asyncio
import websockets
import json

async def connect_to_home_assistant():
    uri = "ws://homeassistant.local:8123/api/websocket"
    access_token = "YOUR_LONG_LIVED_ACCESS_TOKEN"

    async with websockets.connect(uri) as websocket:
        # Step 1: Receive auth_required
        auth_required = await websocket.recv()
        print(f"Received: {auth_required}")

        # Step 2: Send authentication
        auth_message = {
            "type": "auth",
            "access_token": access_token
        }
        await websocket.send(json.dumps(auth_message))

        # Step 3: Receive auth_ok or auth_invalid
        auth_result = await websocket.recv()
        auth_data = json.loads(auth_result)

        if auth_data["type"] != "auth_ok":
            print(f"Authentication failed: {auth_data}")
            return

        print("Authentication successful!")

        # Step 4: List all dashboards
        dashboards_request = {
            "id": 1,
            "type": "lovelace/dashboards/list"
        }
        await websocket.send(json.dumps(dashboards_request))

        dashboards_response = await websocket.recv()
        dashboards = json.loads(dashboards_response)
        print(f"Dashboards: {json.dumps(dashboards, indent=2)}")

        # Step 5: Get default dashboard configuration
        config_request = {
            "id": 2,
            "type": "lovelace/config",
            "url_path": None
        }
        await websocket.send(json.dumps(config_request))

        config_response = await websocket.recv()
        config = json.loads(config_response)
        print(f"Dashboard Config: {json.dumps(config, indent=2)}")

# Run the async function
asyncio.run(connect_to_home_assistant())
```

### Using the HomeAssistant-API Library

```python
from homeassistant_api import Client
from homeassistant_api.websocket import WebsocketClient

# Create WebSocket client
with WebsocketClient(
    url='ws://homeassistant.local:8123/api/websocket',
    token='YOUR_LONG_LIVED_ACCESS_TOKEN'
) as client:
    # Send custom WebSocket command
    response = client.send_message({
        "id": 1,
        "type": "lovelace/dashboards/list"
    })
    print(f"Dashboards: {response}")

    # Get dashboard configuration
    config = client.send_message({
        "id": 2,
        "type": "lovelace/config",
        "url_path": None
    })
    print(f"Config: {config}")
```

### Complete Example: Download All Dashboard Configs

```python
import asyncio
import websockets
import json
from pathlib import Path

class HomeAssistantDashboardDownloader:
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.websocket = None
        self.message_id = 0

    def next_id(self) -> int:
        """Generate next message ID"""
        self.message_id += 1
        return self.message_id

    async def connect(self):
        """Connect and authenticate to Home Assistant"""
        self.websocket = await websockets.connect(self.url)

        # Receive auth_required
        await self.websocket.recv()

        # Send authentication
        auth_message = {
            "type": "auth",
            "access_token": self.token
        }
        await self.websocket.send(json.dumps(auth_message))

        # Check auth result
        auth_result = json.loads(await self.websocket.recv())
        if auth_result["type"] != "auth_ok":
            raise Exception(f"Authentication failed: {auth_result}")

        print("Connected and authenticated successfully!")

    async def send_command(self, command_type: str, **params) -> dict:
        """Send a WebSocket command and wait for response"""
        message = {
            "id": self.next_id(),
            "type": command_type,
            **params
        }

        await self.websocket.send(json.dumps(message))

        # Wait for response with matching ID
        response = json.loads(await self.websocket.recv())

        if not response.get("success", False):
            raise Exception(f"Command failed: {response}")

        return response.get("result")

    async def list_dashboards(self) -> list:
        """Get list of all dashboards"""
        return await self.send_command("lovelace/dashboards/list")

    async def get_dashboard_config(self, url_path: str = None) -> dict:
        """Get configuration for a specific dashboard"""
        return await self.send_command(
            "lovelace/config",
            url_path=url_path
        )

    async def download_all_dashboards(self, output_dir: str = "./dashboards"):
        """Download all dashboard configurations to files"""
        await self.connect()

        # Create output directory
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        # Get list of dashboards
        dashboards = await self.list_dashboards()
        print(f"Found {len(dashboards)} dashboards")

        # Download each dashboard
        for dashboard in dashboards:
            dashboard_id = dashboard.get("id")
            url_path = dashboard.get("url_path")
            title = dashboard.get("title", "Unknown")
            mode = dashboard.get("mode", "unknown")

            print(f"Downloading: {title} (id={dashboard_id}, mode={mode})")

            try:
                config = await self.get_dashboard_config(url_path)

                # Save to file
                filename = output_path / f"{dashboard_id}.json"
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)

                print(f"  ✓ Saved to {filename}")

            except Exception as e:
                print(f"  ✗ Error downloading {dashboard_id}: {e}")

        await self.websocket.close()
        print("\nDownload complete!")

# Usage
async def main():
    downloader = HomeAssistantDashboardDownloader(
        url="ws://homeassistant.local:8123/api/websocket",
        token="YOUR_LONG_LIVED_ACCESS_TOKEN"
    )

    await downloader.download_all_dashboards("./downloaded_dashboards")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## WebSocket vs REST API Comparison

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Connection Type** | Request-Response (HTTP) | Persistent Bidirectional |
| **Storage Mode Dashboards** | ❌ Not Accessible (404 error) | ✅ Fully Accessible |
| **YAML Mode Dashboards** | ✅ Accessible | ✅ Accessible |
| **Real-time Updates** | ❌ Must poll | ✅ Push notifications |
| **Authentication** | Bearer token header | Long-lived access token |
| **Use Case** | Simple one-off requests | Real-time monitoring, dashboards |
| **Efficiency** | Higher overhead (each request = new connection) | Lower overhead (persistent connection) |
| **Platform Support** | Universal (HTTP) | Requires WebSocket support |

### When to Use Each:

**REST API**:
- Simple, one-off requests (e.g., turn on a light)
- Embedded devices with limited memory
- Cross-platform compatibility is critical
- YAML-mode dashboards only

**WebSocket API**:
- Real-time dashboard updates
- Continuous monitoring
- **Storage-mode dashboard access (required)**
- Bidirectional communication needs
- Event subscriptions

---

## Storage Mode Dashboard Access - Key Points

1. **Storage mode is the default** for dashboards created via the UI
2. **REST API cannot access storage-mode dashboards** - this is by design, not a bug
3. **WebSocket API is the ONLY programmatic way** to retrieve storage-mode dashboard configs
4. **Switching to YAML mode** loses the UI editor functionality
5. **Dashboard files exist** at `/config/.storage/lovelace.{dashboard_id}` but should not be accessed directly (Home Assistant may lock files or cache changes)

---

## Authentication Requirements

### Creating a Long-Lived Access Token

1. Log into Home Assistant
2. Click on your username (bottom left)
3. Scroll to "Long-Lived Access Tokens" section
4. Click "Create Token"
5. Give it a name (e.g., "Dashboard Downloader")
6. Copy the token (it won't be shown again!)

### Security Considerations

- Long-lived tokens provide **full access** to your Home Assistant instance
- Store tokens securely (environment variables, secrets manager)
- Never commit tokens to version control
- Revoke tokens when no longer needed
- Consider using short-lived tokens for production applications (via OAuth flow)

---

## Additional WebSocket Commands

Beyond Lovelace, the WebSocket API provides many other useful commands:

### Get System State
```json
{"id": 1, "type": "get_states"}
```

### Get Configuration
```json
{"id": 2, "type": "get_config"}
```

### Get Available Services
```json
{"id": 3, "type": "get_services"}
```

### Call a Service
```json
{
  "id": 4,
  "type": "call_service",
  "domain": "light",
  "service": "turn_on",
  "service_data": {
    "entity_id": "light.living_room",
    "brightness": 255
  }
}
```

### Subscribe to State Changes
```json
{
  "id": 5,
  "type": "subscribe_events",
  "event_type": "state_changed"
}
```

### Ping/Pong (Keepalive)
```json
{"id": 6, "type": "ping"}
```

Response:
```json
{"id": 6, "type": "pong"}
```

---

## Common Issues and Solutions

### Issue 1: Connection Refused
**Problem**: Cannot connect to WebSocket
**Solutions**:
- Verify Home Assistant is running
- Check the URL (ws:// for HTTP, wss:// for HTTPS)
- Ensure port 8123 is accessible
- Check firewall rules

### Issue 2: Authentication Failed
**Problem**: `auth_invalid` response
**Solutions**:
- Verify the access token is correct
- Ensure token hasn't been revoked
- Create a new long-lived access token
- Check for extra whitespace in token

### Issue 3: Command Returns Empty Result
**Problem**: Dashboard config is empty
**Solutions**:
- Verify the dashboard exists (use `lovelace/dashboards/list` first)
- Check `url_path` parameter matches dashboard ID
- Try with `force: true` to bypass cache
- Ensure you have permission to access the dashboard

### Issue 4: Connection Drops
**Problem**: WebSocket disconnects unexpectedly
**Solutions**:
- Implement automatic reconnection logic
- Use ping/pong for keepalive
- Check network stability
- Review Home Assistant logs for errors

---

## References and Sources

### Official Documentation
- [Home Assistant WebSocket API Documentation](https://developers.home-assistant.io/docs/api/websocket/)
- [Home Assistant WebSocket API Integration](https://www.home-assistant.io/integrations/websocket_api/)
- [Multiple Dashboards Documentation](https://www.home-assistant.io/dashboards/dashboards/)

### GitHub Issues and Pull Requests
- [Add API on new Lovelace UI storage mode - Issue #19790](https://github.com/home-assistant/core/issues/19790)
- [Add API on new Lovelace UI storage mode - Issue #2406](https://github.com/home-assistant/frontend/issues/2406)
- [Support multiple Lovelace dashboards - PR #32134](https://github.com/home-assistant/core/pull/32134/files)
- [Lovelace Component Source Code](https://github.com/home-assistant/core/blob/dev/homeassistant/components/lovelace/__init__.py)
- [Frontend Lovelace TypeScript](https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts)

### Community Discussions
- [API: Get lovelace dashboard JSON - Feature Request](https://community.home-assistant.io/t/api-get-lovelace-dashboard-json/820818)
- [Lovelace API Endpoint - Feature Request](https://community.home-assistant.io/t/lovelace-api-endpoint/109228)
- [Where are the Lovelace dashboard configs stored?](https://community.home-assistant.io/t/where-are-the-lovelace-dashboard-configs-stored/181554)
- [Python code to access websockets api](https://community.home-assistant.io/t/python-code-to-access-websockets-api/66744)

### Tutorials and Guides
- [Home Assistant WebSocket API: A Python Guide](https://jonbrobinson.com/blog/home-assistant-websocket-api-a)
- [Listening to the Home Assistant Websocket API with Python](https://jeroenboumans.medium.com/listening-to-the-home-assistent-websocket-api-with-python-7a074f8c81ea)
- [Powering home automation with WebSocket APIs](https://medium.com/better-practices/powering-home-automation-with-websocket-apis-8885a7601523)
- [Home Assistant with WebSocket APIs - Postman Guide](https://quickstarts.postman.com/guide/home-assistant/index.html?index=../..index)

### Python Libraries
- [HomeAssistant-API on PyPI](https://pypi.org/project/HomeAssistant-API/)
- [HomeAssistant API Documentation](https://homeassistantapi.readthedocs.io/en/latest/usage.html)
- [homeassistant-ws (Minimalist client library)](https://github.com/filp/homeassistant-ws)
- [home-assistant-js-websocket (JavaScript client)](https://github.com/home-assistant/home-assistant-js-websocket)

---

## Conclusion

The Home Assistant WebSocket API is the **official and recommended method** for programmatically retrieving Lovelace dashboard configurations, especially for storage-mode dashboards. While the REST API returns 404 errors for these dashboards, the WebSocket API provides full access with real-time updates and efficient bidirectional communication.

**Key Takeaways**:
1. Use WebSocket API for storage-mode dashboards (REST API won't work)
2. Commands: `lovelace/dashboards/list` and `lovelace/config`
3. Requires long-lived access token authentication
4. Works with Python's asyncio and websockets libraries
5. Supports real-time updates via event subscriptions

This research was compiled on 2025-12-15 and represents the current state of Home Assistant dashboard API access.
