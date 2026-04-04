// 关卡 13：实战星 2 - 代码审查 Agent（完整重构）

PLANETS.push({
  id: 'p13',
  icon: '🔍',
  num: '星球 13',
  name: '实战星 2：代码审查',
  desc: '构建一个能自动审查代码、发现问题的 Agent！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔍 实战星 2</div>
            <p>飞船来到代码审查星，到处都是等待检查的代码！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！程序员写完代码后，需要有人检查——<br>
              有没有 bug？代码写得清楚吗？有没有安全漏洞？<br>
              这就是<strong>代码审查（Code Review）</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：就像老师批改作业？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：完美比喻！我们来做一个 AI 代码审查助手，<br>
              让它自动帮你找问题、给建议！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔍 代码审查要看什么？',
          html: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
              <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:12px;font-size:.82rem">
                ✅ <strong>正确性</strong><br>
                <span style="color:var(--muted)">代码逻辑对吗？<br>边界情况处理了吗？</span>
              </div>
              <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:10px;padding:12px;font-size:.82rem">
                📖 <strong>可读性</strong><br>
                <span style="color:var(--muted)">变量名清楚吗？<br>有注释吗？</span>
              </div>
              <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:12px;font-size:.82rem">
                🔒 <strong>安全性</strong><br>
                <span style="color:var(--muted)">有 SQL 注入吗？<br>用户输入验证了吗？</span>
              </div>
              <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:12px;font-size:.82rem">
                🧪 <strong>测试</strong><br>
                <span style="color:var(--muted)">有单元测试吗？<br>覆盖率够吗？</span>
              </div>
            </div>
          `
        },
        {
          type: 'quiz',
          q: '代码审查 Agent 最重要的工具是什么？',
          opts: [
            '只需要 AI，不需要工具',
            'read_file（读代码）+ run_linter（静态检查）+ check_tests（测试覆盖率）',
            '只需要运行代码看结果',
            '只需要检查变量名'
          ],
          ans: 1,
          feedback_ok: '🎯 正确！代码审查需要多个工具配合：读取代码、静态分析、测试检查，最后 AI 综合判断！',
          feedback_err: '代码审查需要多个工具：读文件、运行 linter、检查测试，AI 负责综合分析！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔍 实战星 2（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我们实现一个真正的代码审查 Agent。<br>
              它能读取 PR 的所有文件，并行审查，最后发布评论！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 代码审查 Agent 完整实现',
          code: `import anthropic
import json
from concurrent.futures import ThreadPoolExecutor

client = anthropic.Anthropic()

tools = [
    {
        "name": "read_file",
        "description": "读取代码文件内容",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "文件路径"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "run_linter",
        "description": "运行静态代码检查，返回问题列表",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "language": {"type": "string", "enum": ["python", "javascript", "typescript"]}
            },
            "required": ["path", "language"]
        }
    },
    {
        "name": "get_test_coverage",
        "description": "获取文件的测试覆盖率",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"}
            },
            "required": ["path"]
        }
    }
]

REVIEW_SYSTEM_PROMPT = """你是一个专业的代码审查员。
审查代码时，请关注：
1. 正确性：逻辑是否正确，边界情况是否处理
2. 安全性：是否有 SQL 注入、XSS、未验证的用户输入
3. 可读性：命名是否清晰，是否需要注释
4. 测试：覆盖率是否足够，测试是否有意义

输出格式：
- 严重问题（必须修复）
- 建议改进（可选）
- 总体评分（1-10）"""

def review_single_file(file_path: str) -> dict:
    """审查单个文件"""
    messages = [{"role": "user", "content": f"请审查文件：{file_path}"}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            system=REVIEW_SYSTEM_PROMPT,
            tools=tools,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            return {
                "file": file_path,
                "review": response.content[0].text
            }

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result, ensure_ascii=False)
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

def review_pr(pr_files: list[str]) -> str:
    """并行审查 PR 的所有文件"""
    # 并行审查所有文件
    with ThreadPoolExecutor(max_workers=4) as executor:
        reviews = list(executor.map(review_single_file, pr_files))

    # 汇总所有审查结果
    summary_prompt = f"""以下是 PR 中所有文件的审查结果：

{json.dumps(reviews, ensure_ascii=False, indent=2)}

请给出：
1. 整体评估（是否可以合并）
2. 最重要的 3 个问题
3. 总体评分"""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": summary_prompt}]
    )
    return response.content[0].text`,
          explanation: `
            <strong>关键设计：</strong><br>
            • <strong>ThreadPoolExecutor</strong>：并行审查多个文件，大幅减少总时间<br>
            • <strong>REVIEW_SYSTEM_PROMPT</strong>：明确审查维度和输出格式，保证结果一致性<br>
            • <strong>两阶段设计</strong>：先单文件审查，再汇总分析——分而治之<br>
            • <strong>结构化输出</strong>：严重问题/建议/评分，方便后续处理
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '误报（False Positive）：把正确代码标记为问题——需要提供项目上下文和编码规范',
            '大文件超出 Context Window：单文件超过 10K 行时需要分块审查',
            '并行请求触发 API 限流：并发数过高时需要加速率限制（rate limiter）',
            '审查结果不一致：同一代码每次审查结果不同——降低 temperature 或使用结构化输出'
          ]
        },
        {
          type: 'quiz',
          q: '为什么代码审查 Agent 要用 ThreadPoolExecutor 并行处理文件？',
          opts: [
            '因为 Python 要求这样写',
            '一个 PR 可能有几十个文件，串行审查太慢，并行可以同时处理多个文件',
            '并行可以减少 token 消耗',
            '并行可以提高审查质量'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！一个 PR 可能有 20 个文件，串行需要 20 次等待，并行只需要等最慢的那个！',
          feedback_err: '想象一个 PR 有 20 个文件，串行审查需要 20 次 API 调用的时间，并行只需要 1 次！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - CI/CD 集成的代码审查系统</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，真正的代码审查系统不是手动触发的——<br>
              它集成在 CI/CD 流水线里，每次 PR 自动运行！<br><br>
              这意味着我们需要解决：<br>
              <strong>增量审查</strong>（只看改动的部分）<br>
              <strong>上下文感知</strong>（理解整个代码库）<br>
              <strong>审查记忆</strong>（记住之前的问题，避免重复提醒）
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 GitHub Actions 集成',
          code: `# .github/workflows/ai-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整历史，用于 diff

      - name: Run AI Review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: python review_agent.py

---
# review_agent.py（在 CI 中运行）
import anthropic
import subprocess
import json
import os
from github import Github  # PyGithub

client = anthropic.Anthropic()
gh = Github(os.environ["GITHUB_TOKEN"])

def get_pr_diff() -> str:
    """获取 PR 的 git diff（只看改动部分）"""
    result = subprocess.run(
        ["git", "diff", "origin/main...HEAD", "--unified=5"],
        capture_output=True, text=True
    )
    return result.stdout

def get_repo_context() -> str:
    """获取代码库上下文（README + 主要规范）"""
    context_files = ["README.md", "CONTRIBUTING.md", ".eslintrc.json"]
    context = []
    for f in context_files:
        if os.path.exists(f):
            with open(f) as fp:
                context.append(f"=== {f} ===\\n{fp.read()[:2000]}")
    return "\\n\\n".join(context)

def review_with_context(diff: str, context: str) -> dict:
    """带上下文的增量审查"""
    prompt = f"""你是这个项目的资深代码审查员。

项目上下文：
{context}

本次 PR 的改动（git diff）：
{diff[:8000]}  # 限制长度

请审查这次改动，重点关注：
1. 改动是否符合项目规范（参考上下文）
2. 新增代码是否有 bug 或安全问题
3. 是否需要补充测试

输出 JSON 格式：
{{
  "verdict": "approve/request_changes/comment",
  "critical_issues": [],
  "suggestions": [],
  "inline_comments": [
    {{"file": "path", "line": 42, "comment": "..."}}
  ]
}}"""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    # 解析 JSON 输出
    text = response.content[0].text
    start = text.find("{")
    end = text.rfind("}") + 1
    return json.loads(text[start:end])

def post_review_to_github(review: dict):
    """把审查结果发布到 GitHub PR"""
    repo = gh.get_repo(os.environ["GITHUB_REPOSITORY"])
    pr_number = int(os.environ["PR_NUMBER"])
    pr = repo.get_pull(pr_number)

    # 发布整体评论
    body = f"""## 🤖 AI 代码审查

**结论：** {review['verdict']}

### 严重问题
{chr(10).join(f"- {i}" for i in review['critical_issues']) or "无"}

### 建议改进
{chr(10).join(f"- {s}" for s in review['suggestions']) or "无"}
"""
    pr.create_issue_comment(body)

    # 发布行内评论
    commit = pr.get_commits().reversed[0]
    for comment in review.get("inline_comments", []):
        try:
            pr.create_review_comment(
                body=comment["comment"],
                commit=commit,
                path=comment["file"],
                line=comment["line"]
            )
        except Exception:
            pass  # 行号可能不在 diff 范围内

if __name__ == "__main__":
    diff = get_pr_diff()
    context = get_repo_context()
    review = review_with_context(diff, context)
    post_review_to_github(review)`,
          explanation: `
            <strong>CI/CD 集成的关键设计：</strong><br>
            • <strong>增量审查</strong>：只看 git diff，不是整个文件——节省 token，聚焦改动<br>
            • <strong>上下文注入</strong>：把 README/规范文件注入 prompt，让 AI 理解项目风格<br>
            • <strong>结构化输出</strong>：JSON 格式便于解析和发布行内评论<br>
            • <strong>GitHub API</strong>：自动发布评论，无需人工操作
          `
        },
        {
          type: 'concept',
          title: '🏗️ 企业级审查系统架构',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>审查记忆系统（避免重复提醒）：</strong><br>
              • 把历史审查结果存入向量数据库<br>
              • 新 PR 审查前，检索相似的历史问题<br>
              • 如果同一问题已经提过 3 次，升级为"必须修复"<br><br>

              <strong>团队风格学习：</strong><br>
              • 收集团队成员的历史审查评论<br>
              • Fine-tune 或 Few-Shot 让 AI 模仿团队风格<br>
              • 避免 AI 审查和人工审查风格冲突<br><br>

              <strong>审查质量评估：</strong><br>
              • 追踪 AI 提出的问题有多少被开发者接受<br>
              • 接受率低的规则自动降权<br>
              • 定期人工校准（每月抽样 100 条）
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ CI/CD 集成的深层陷阱',
          items: [
            '审查噪音：AI 提出太多低价值建议，开发者开始忽略所有评论——需要严格的严重性分级',
            '上下文窗口限制：大型 PR（500+ 行改动）超出 Context Window——需要智能分块，保留关键上下文',
            '误报导致 CI 阻塞：AI 把正确代码标记为严重问题，阻止合并——审查结果应该是建议，不是强制门控',
            '成本失控：每个 PR 触发多次审查（每次 push 都触发），月费用可能超预期——需要去重和缓存',
            '安全风险：代码库中可能有密钥、业务逻辑，发送给第三方 API 需要评估数据安全'
          ]
        },
        {
          type: 'quiz',
          q: '为什么 CI/CD 中的代码审查 Agent 应该用 git diff 而不是完整文件？',
          opts: [
            '因为 git diff 格式更好看',
            '只审查改动部分：节省 token、聚焦真正的变化、避免对已有代码重复提问',
            '因为完整文件太大，API 不接受',
            '因为 git diff 包含更多信息'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！一个有 10,000 行的文件，这次 PR 只改了 50 行。审查全文件浪费 200 倍 token，而且会对已有代码提出无关建议。diff 让 AI 聚焦在真正的改动上！',
          feedback_err: '想象一个 10,000 行的文件只改了 50 行。审查全文件需要 10,000 行的 token，而且 AI 会对没改的代码也提建议。diff 让审查聚焦在真正的变化上！'
        }
      ]
    }
  }
});
