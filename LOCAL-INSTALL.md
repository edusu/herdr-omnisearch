# Local install from this fork (guide for agents)

You are an agent asked to install OmniSearch for the Herdr app from this
checkout. Follow the steps in order. Steps marked **Ask** need the person's
answer before you continue.

This installs two things:

- the `herdr-omnisearch` command, pinned to the commit checked out here;
- the app mod (`omnisearch/mods/omnisearch`), the popup that calls it.

It does not install the Herdr TUI plugin (`herdr plugin install`). That path
is in [INSTALL.md](INSTALL.md) and is only useful to someone who works in the
herdr TUI.

## Before you start

1. Read `~/.config/herdr-app/AGENTS.md` (how the app treats mods and keys)
   and [omnisearch/RECIPE.md](omnisearch/RECIPE.md), section "Watch out".
2. Check the requirements and stop if one is missing:

   ```bash
   python3 --version   # 3.9 or newer
   uv --version
   hc --version        # herdr-core 0.1.15 or newer
   git status --short  # must be empty: only committed code is installed
   ```

3. Tell the person what this does before changing anything: the mod runs
   `herdr-omnisearch` on this computer and on every connected machine, and
   the command keeps the visible screen of each agent terminal in a local
   SQLite index. Nothing is sent over the network.

## 1. Install the command, pinned

```bash
cd /path/to/this/checkout
uv tool install --force "git+file://$PWD@$(git rev-parse HEAD)"
herdr-omnisearch doctor
```

`uv` builds from that exact commit, so later commits or pulls change nothing
until this step is run again. `~/.local/bin` must be on the `PATH` that
herdr-core sees.

## 2. Add the mod

```bash
dest=~/.config/herdr-app/mods/omnisearch
[ -e "$dest" ] && echo "already installed" || {
  mkdir "$dest"
  cp omnisearch/mods/omnisearch/main.js omnisearch/mods/omnisearch/mod.json "$dest"/
}
```

Copy the files; do not symlink the checkout. If the folder already exists,
this is an update: go to [Update](#update) instead of overwriting silently.

## 3. Bind the key

Merge one binding into both the `global` and `terminal` sections of
`~/.config/herdr-app/keys.json`, keeping every other key as it is:

```json
"cmd-shift-f": "mod.open:omnisearch"
```

Use `cmd-shift-f` on macOS and `ctrl-shift-f` on Linux. If the key is
already bound, **Ask** which key to use instead. The file is applied live.

## 4. Ask: search old sessions?

**Ask** the person this, and do nothing here until they answer:

> Do you want OmniSearch to search your old agent sessions too? It copies the
> user and assistant messages of your Claude Code, Codex, OpenCode and omp
> histories into a local SQLite catalog (no tool payloads, no reasoning).
> Without it, only open terminals are searched, by what is on screen.

If yes, find the config directory in the `plugin_config:` line of
`herdr-omnisearch doctor`, then set `enabled = true` under `[archive]` in
its `config.ini`. Create the file when it does not exist; edit it in place
when it does:

```bash
cfg="$(herdr-omnisearch doctor | sed -n 's/^plugin_config: //p')"
mkdir -p "$cfg"
[ -e "$cfg/config.ini" ] || printf '[archive]\nenabled = true\n' > "$cfg/config.ini"
herdr-omnisearch archive-catalog-index
```

The first build reads every history file once. For scale: 172 sessions
(2.4 GB of history) produced a 16 MB catalog. Later
refreshes only reread changed files and start on their own when the popup
opens.

If no, skip this step. The Sessions tab then says archive search is off.

## 5. Optional settings

Mention these only if they apply; the defaults are right for most setups. All
go in the same `config.ini`; [config.example.ini](config.example.ini) has
every key.

- **Fewer histories.** `[archive] agents = claude, codex` limits which
  agents are cataloged, and `[archive.<agent>] sessions = <glob>` limits
  which files.
- **Resume command.** `[archive.<agent>] resume = claude --resume {session_id}`
  is what Enter runs on an old session. Change it when the person always
  starts the agent with extra flags or through a wrapper.
- **Other machines.** A connected machine is searched only if it has the
  command too. Repeat step 1 there, and step 4 for its own histories. The mod
  and the key live only on the computer running the app.

## 6. Verify

```bash
herdr-app check ~/.config/herdr-app/mods/omnisearch
herdr-omnisearch doctor
herdr-omnisearch app-search --refresh --limit 5 --
```

The first must say `check passed`. The last must print JSON with `"error": null` and one row per open
agent terminal. Then ask the person to press the key: the popup opens with
the field focused, and Tab switches to Sessions.

Report which commit was installed (`git rev-parse --short HEAD`) and whether
archive search is on.

## Update

After new commits are merged into the checked-out branch:

```bash
uv tool install --force "git+file://$PWD@$(git rev-parse HEAD)"
cp omnisearch/mods/omnisearch/main.js omnisearch/mods/omnisearch/mod.json \
  ~/.config/herdr-app/mods/omnisearch/
```

Update the command and the mod together: the mod depends on the JSON that
`app-search` prints.

## Uninstall

**Ask** before running this; the last two lines delete the indexes and the
config.

```bash
herdr-omnisearch purge --yes
uv tool uninstall herdr-omnisearch
rm -r ~/.config/herdr-app/mods/omnisearch
rm -r ~/.local/share/herdr-omnisearch ~/.config/herdr-omnisearch
```

Then remove the `mod.open:omnisearch` bindings from `keys.json`.
