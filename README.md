# AI Box (Lima Sandbox)

Spin up sandbox Lima VMs for AI-assisted app work, with your current directory mounted via `--mount`, Node.js + Copilot CLI installed, and shared Copilot state.

## What this gives you

- Ubuntu-based VM per sandbox instance
- Your current directory mounted writable with Lima `--mount`
- Per-VM Copilot state mounted from the host
- `node`, `npm`, and GitHub Copilot CLI installed in the VM
- Host port forwarding for guest ports `1024-65535`

## Prerequisites

- Node.js on the host
- Lima installed (`limactl`)
- OpenSSH client (`ssh`)

## Quick start

```bash
node ./ai-box.js ai-box-1
limactl shell ai-box-1
```

If you skip the name, it uses `ai-box`:

```bash
node ./ai-box.js
```

## Start script

`node ./ai-box.js [name]` creates the VM if it does not exist, starts it if needed, and mounts the current directory with `--mount <cwd>:w`.

The VM template disables Lima's bundled containerd setup and uses Ubuntu so the packaged GitHub Copilot CLI works out of the box.

## How workspace mounting works

- The script passes the current directory to `limactl create --mount <cwd>:w`.

## Copilot shared state

- Host path: `~/.ai-box/<instance-name>/.copilot`
- Guest path: `/home/<vm-user>.guest/.copilot`

## Port forwarding

`lima-copilot.yaml` forwards guest ports `1024-65535` to the same host ports.  
This is intended for local app/dev servers inside the VM.

## SSH / editor connection details

- Lima provides SSH hosts named `lima-<instance-name>`.
- To open a shell, run `limactl shell <instance-name>`.
- If you want direct `ssh lima-<instance-name>`, add `Include ~/.lima/*/ssh.config` to `~/.ssh/config`.

## Troubleshooting

- `Required command not found: limactl`: install Lima first.
- `Required command not found: node`: install Node.js on the host.
- VM exists but broken provisioning: `limactl delete -f <name>` then `node ./ai-box.js <name>`.
- Ports not reachable: confirm app inside VM binds on `0.0.0.0` or loopback expected by your setup.
