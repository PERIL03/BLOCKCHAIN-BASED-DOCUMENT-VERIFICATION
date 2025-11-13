Local demo helper

Purpose

These scripts start/stop a local demo for the Blockchain Document Verification project. The demo consists of:

- Hardhat node (local JSON-RPC at http://127.0.0.1:8545)
- Deploying the DocumentRegistry contract to the local node
- Backend server (reads `.env` from repo root for configuration)
- localtunnel to expose the backend to the internet for quick demos

Files

- `scripts/start-demo.sh` — start the demo (Hardhat, deploy, backend, localtunnel). Writes logs to `/tmp/final_fullstack_demo_logs`.
- `scripts/stop-demo.sh` — stop background processes started by the demo scripts.

Usage

1. Make sure you have Node >= 18 and npm available.
2. From the repo root run:

```bash
chmod +x scripts/start-demo.sh scripts/stop-demo.sh
./scripts/start-demo.sh
```

3. The script will print the localtunnel URL (if available) and location of logs. If localtunnel is not installed, the script will use `npx localtunnel@2` temporarily.

4. To stop the demo:

```bash
./scripts/stop-demo.sh
```

Caveats and security

- The `.env` in the repo root is used by the backend. Do not commit real secrets to this repository. Rotate credentials if they were exposed.
- localtunnel produces a public URL that forwards traffic to your machine. Keep this in mind when exposing the demo.

