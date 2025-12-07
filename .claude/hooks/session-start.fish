#!/usr/bin/env fish

# Session start hook for Mautic development environment
# This script runs when a new Claude Code session starts

# Check for fnm and set up Node version
if command -v fnm > /dev/null
    echo "🔧 Setting up Node environment with fnm..."
    fnm use --silent 2>/dev/null
    if test $status -ne 0
        echo "⚠️  No .node-version file found. Using default Node version."
    end
else
    echo "⚠️  fnm not found. Please install fnm for Node version management."
end

# Check for bun
if command -v bun > /dev/null
    echo "✅ Bun is available"
else
    echo "⚠️  Bun not found. Please install bun: curl -fsSL https://bun.sh/install | bash"
end

# Check for uv
if command -v uv > /dev/null
    echo "✅ uv package manager is available"
else
    echo "⚠️  uv not found. Please install uv: curl -LsSf https://astral.sh/uv/install.sh | sh"
end

# Check if .env file exists
if test -f .env
    echo "✅ Environment configuration found"
else
    echo "⚠️  No .env file found. Copy .env.example to .env and configure your Mautic credentials."
end

# Install dependencies if needed
if test -f package.json
    if not test -d node_modules
        echo "📦 Installing dependencies with bun..."
        bun install
    else
        echo "✅ Dependencies installed"
    end
end

echo ""
echo "🚀 Mautic API Integration Development Environment Ready!"
echo "   Use /dev to start the development server"
echo "   Use /test to run tests"
echo "   Use /setup-mautic for API setup guidance"
echo ""
