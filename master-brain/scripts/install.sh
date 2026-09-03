#!/usr/bin/env bash
# Master Brain — macOS/Linux installer.  bash scripts/install.sh [projectsRoot]
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v node >/dev/null || { echo "Node.js 18+ required"; exit 1; }
[ -f "$ROOT/config.json" ] || cp "$ROOT/config.example.json" "$ROOT/config.json"
if [ -n "${1:-}" ]; then node -e "const f='$ROOT/config.json';const c=require(f);c.projectsRoot='$1';require('fs').writeFileSync(f,JSON.stringify(c,null,2)+'\n')"; fi
printf '#!/usr/bin/env bash\nexec node "%s/bin/mb.js" "$@"\n' "$ROOT" > "$ROOT/mb" && chmod +x "$ROOT/mb"
node -e "require('fs').writeFileSync('$ROOT/.mcp.json', JSON.stringify({mcpServers:{'master-brain':{command:'node',args:['$ROOT/bin/mcp.js']}}},null,2)+'\n')"
# Claude Desktop
if [ "$(uname)" = "Darwin" ]; then D="$HOME/Library/Application Support/Claude"; else D="$HOME/.config/Claude"; fi
if [ -d "$D" ]; then
  node -e "const fs=require('fs');const f='$D/claude_desktop_config.json';let o={};try{o=JSON.parse(fs.readFileSync(f,'utf8'))}catch{};o.mcpServers=o.mcpServers||{};o.mcpServers['master-brain']={command:'node',args:['$ROOT/bin/mcp.js']};fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');console.log('Claude Desktop registered:',f)"
fi
# skills
for s in start-skill master-brain; do mkdir -p "$HOME/.claude/skills/$s"; cp -R "$ROOT/skills/$s/." "$HOME/.claude/skills/$s/"; done
node "$ROOT/bin/mb.js" init
node "$ROOT/bin/mb.js" doctor
echo "Done. Next: node $ROOT/bin/mb.js serve --open"
