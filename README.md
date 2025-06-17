# CLAYE

A powerful CLI tool that generates intelligent, contextual commit messages using Anthropic's Claude AI models. Save time and improve your commit message quality by letting AI analyze your code changes and generate meaningful commit messages.

## Features

- 🤖 **AI-Powered**: Uses Anthropic's Claude models to generate intelligent commit messages
- 📝 **Multiple Formats**: Generates structured commit messages with changes, reasoning, and summary
- 🔧 **Configurable**: Supports multiple Claude models (Haiku, Sonnet, Opus)
- 🛡️ **Safe**: Warns about sensitive files being committed
- 💬 **Interactive**: Lets you review and approve commit messages before applying
- ⚡ **Fast**: Quick setup and execution

## Installation

### From NPM (Recommended)

```bash
npm install -g claye
```

### From Source

```bash
git clone https://github.com/your-username/cli-ai-commits.git
cd cli-ai-commits
npm install
npm run build
npm link
```

## Setup

### 1. Get Your Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-ant-api03-...`)

### 2. Configure the CLI Tool

```bash
claye config set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

The API key will be securely stored in `~/.config/claye/.env`.

### 3. Verify Configuration

```bash
claye config get
```

## Usage

### Basic Commit Workflow

1. **Stage your changes**:

   ```bash
   git add .
   ```

2. **Generate and commit**:

   ```bash
   claye commit
   ```

3. **Review the generated message** and choose whether to commit.

### Advanced Usage

#### Custom Prompt

Provide additional context for the commit message:

```bash
claye commit "Focus on the implementation of auth"
```

#### Different AI Models

Use a specific Claude model:

```bash
claye commit --model claude-3-5-sonnet-latest
```

Available models:

- `claude-3-5-haiku-latest` (default - fastest)
- `claude-3-5-sonnet-latest` (balanced)
- `claude-3-7-sonnet-20250219` (advanced)
- `claude-4-sonnet-20250514` (most capable)
- `claude-4-opus-20250514` (most powerful)

## Commands

### `claye config`

Manage your Anthropic API key configuration.

#### Set API Key

```bash
claye config set ANTHROPIC_API_KEY=your-key-here
```

#### Get Current API Key

```bash
claye config get
```

#### Remove API Key

```bash
autocommit config unset
```

### `autocommit commit`

Generate and apply AI-powered commit messages.

#### Basic Usage

```bash
claye commit [prompt] [--model <model-name>]
```

#### Options

- `[prompt]` - Optional context or instruction for the commit message
- `--model` - Choose which Claude model to use (default: claude-3-5-haiku-latest)

#### Examples

```bash
# Basic commit
claye commit

# With custom context
claye commit "Fix critical bug in payment processing"

# Using a specific model
claye commit --model claude-3-5-sonnet-latest

# Combining both
claye commit "Add user dashboard" --model claude-4-sonnet-20250514
```
