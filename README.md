# AI Box (Lima Sandbox)

Spin up sandbox Lima VMs for AI-assisted app work, with your current directory mounted at `/workspace`, Node.js + Copilot CLI + Claude Code + Docker installed, and shared Copilot state.

## What this gives you

- Ubuntu-based VM per sandbox instance
- Your current directory mounted writable at `/workspace`
- Per-VM Copilot state mounted from the host
- Per-VM Claude Code state mounted from the host
- No implicit host home-directory mount inside the VM
- `node`, `npm`, GitHub Copilot CLI, Claude Code, and Docker Engine installed in the VM
- Host port forwarding for guest ports `1024-65535`

## Prerequisites

- Node.js on the host
- Lima installed (`limactl`)
- OpenSSH client (`ssh`)

## Quick start

```bash
node ./ai-box.js ai-box-1
limactl shell --workdir /workspace ai-box-1
```

If you skip the name, it uses `ai-box`:

```bash
node ./ai-box.js
```

## Start script

`node ./ai-box.js [name]` creates the VM if it does not exist, starts it if needed, and gives the VM exactly three mounts:

- your current host directory at `/workspace`
- the per-instance Copilot state directory at `/home/<vm-user>.guest/.copilot`
- the per-instance Claude Code state directory at `/home/<vm-user>.guest/.claude`

The VM template disables Lima's bundled containerd setup and uses Ubuntu so the packaged GitHub Copilot CLI works out of the box.

## How workspace mounting works

- The script creates the instance with `--mount-none` and then sets an explicit mount list.
- Guest workspace path: `/workspace`
- Host home directories are not mounted by default anymore.

## Copilot shared state

- Host path: `~/.ai-box/<instance-name>/.copilot`
- Guest path: `/home/<vm-user>.guest/.copilot`

## Claude Code shared state

- Host path: `~/.ai-box/<instance-name>/.claude`
- Guest path: `/home/<vm-user>.guest/.claude`
- Holds Claude Code settings and, on Linux, the `.credentials.json` login, so auth/config persists across VM recreations.
- `CLAUDE_CONFIG_DIR` is set to this directory in the VM, so the global config file lands at `~/.claude/.claude.json` (inside the mount) instead of the default `~/.claude.json` (outside it) — that state persists too.

## Port forwarding

`lima-copilot.yaml` forwards guest ports `1024-65535` to the same host ports.  
This is intended for local app/dev servers inside the VM.

## SSH / editor connection details

- Lima provides SSH hosts named `lima-<instance-name>`.
- To open a shell in the mounted workspace, run `limactl shell --workdir /workspace <instance-name>`.
- If you want direct `ssh lima-<instance-name>`, add `Include ~/.lima/*/ssh.config` to `~/.ssh/config`.

## Troubleshooting

- `Required command not found: limactl`: install Lima first.
- `Required command not found: node`: install Node.js on the host.
- VM exists but broken provisioning: `limactl delete -f <name>` then `node ./ai-box.js <name>`.
- Existing VMs keep the mount layout they were created with. Recreate the VM if you need the `/workspace`-only mount behavior.
- Ports not reachable: confirm app inside VM binds on `0.0.0.0` or loopback expected by your setup.
