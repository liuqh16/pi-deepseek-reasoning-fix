# pi-deepseek-reasoning-fix

Pi package that fixes the DeepSeek `reasoning_content` requirement when switching models in old sessions.

When an old session recorded with a non-thinking model is replayed with a thinking model (e.g. `deepseek-v4-pro`), the old assistant messages lack `reasoning_content`. The DeepSeek API rejects the request with:

```
Error: 400 The `reasoning_content` in the thinking mode must be passed back to the API.
```

This extension intercepts the provider payload and adds an empty `reasoning_content` field to any assistant message that doesn't have one.

## Install

```bash
pi install git:github.com/liuqh16/pi-deepseek-reasoning-fix
```

Optionally pin a ref:

```bash
pi install git:github.com/liuqh16/pi-deepseek-reasoning-fix@v0.1.0
```

## Files

- `extensions/deepseek-reasoning-fix.ts` — the extension loaded by Pi

## How it works

Listens on the `before_provider_request` event and patches the outgoing Chat Completions payload. For every assistant message missing `reasoning_content`, adds `reasoning_content: ""` so the DeepSeek API accepts the request.
