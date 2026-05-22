# entree

A fast, customizable personal home dashboard.

Monitor your services, view system metrics, and keep your bookmarks all on one beautiful page.

## Features

- **Service Status Monitoring** — Real-time uptime status for your services with status indicators
- **System Metrics** — Live CPU, memory, and system information updates
- **Customizable Layout** — Choose between compact, medium, and large card layouts
- **Dark/Light Theme** — Toggle between themes on the fly
- **Bookmarks** — Quick access to frequently visited links
- **Search** — Find services by name, tag, or description
- **Fast Polling** — Status updates every 5 seconds, metrics every 5 seconds

## Installation

### Docker Compose

```yaml
services:
  homepage:
    image: nemesisas14/entree:latest
    container_name: entree
    ports:
      - "3000:3000"
    volumes:
      - ./config:/config:ro
    environment:
      - CONFIG_DIR=/config
    restart: unless-stopped
```

### Docker

```bash
docker run -d \
  --name entree \
  -p 3000:3000 \
  -v ./config:/config:ro \
  -e CONFIG_DIR=/config \
  --restart unless-stopped \
  nemesisas14/entree:latest
```

## Configuration

Homepage is configured using two YAML files in the `config/` directory:

### `services.yaml`

Defines service sections and cards:

```yaml
sections:
  - id: media
    label: "🎬 Media"
    hint: "Entertainment services"
    services:
      - id: plex
        name: "Plex"
        url: "http://plex.local:32400"
        tag: "Media"
        desc: "Movie and music streaming"
        icon: "plex"
        color: "#FFB000"
        stats:
          Users: "2"
          Playing: "1"
      - id: sonarr
        name: "Sonarr"
        url: "http://sonarr.local:8989"
        tag: "Automation"
        desc: "TV series management"
        icon: "sonarr"
```

**Field Reference:**

- `id` — Unique identifier (used for status tracking)
- `name` — Display name
- `url` — Service URL (used for status checks via HEAD request)
- `tag` — Category label
- `desc` — Short description
- `icon` — Icon name (auto-fetched from selfhst CDN, or custom URL: `https://...`, or explicit selfhst prefix: `selfhst:name`)
- `color` — Hex color code for the icon background
- `stats` — Optional key-value pairs displayed on cards

### `settings.yaml`

Customizes appearance and metadata:

```yaml
hostname: "entree"
user: "John"

appearance:
  theme: "dark"          # "dark" or "light"
  background: "aurora"   # Background style
  glassBlur: 28          # Blur radius in pixels
  cardLayout: "medium"   # "compact", "medium", "large"
  metricStyle: "row"     # "row" or "side"
  showBookmarks: true

bookmarks:
  - id: github
    label: "GitHub"
    url: "https://github.com"
    color: "#333"
  - id: reddit
    label: "Reddit"
    url: "https://reddit.com"
    color: "#FF4500"
```

**Appearance Options:**

- `theme` — "dark" or "light"
- `background` — Visual style for page background
- `glassBlur` — Glassmorphism blur effect (0–100)
- `cardLayout` — Service card size ("compact" takes up minimal space, "large" shows more stats)
- `metricStyle` — Metrics arrangement ("row" for horizontal, "side" for vertical sidebar)
- `showBookmarks` — Show/hide bookmark bar

### Environment Variables

- `CONFIG_DIR` — Path to config directory inside container (default: `/config`)
- `HOST` — Server bind address (default: `0.0.0.0`)
- `PORT` — Server port (default: `3000`)


## Local Development

### Docker Compose (Recommended)

```bash
# Copy and edit the configuration files
mkdir -p config
cp config.example/services.yaml config/
cp config.example/settings.yaml config/
# Edit config/services.yaml and config/settings.yaml

# Start the container
docker compose up -d
# Visit http://localhost:3000
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
# Visit http://localhost:3000

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Docker

### Build and Run

```bash
# Build the image
docker build -t entree:latest .

# Run with config mount
docker run -p 3000:3000 \
  -v /path/to/config:/config:ro \
  entree:latest
```