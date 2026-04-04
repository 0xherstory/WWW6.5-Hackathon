#!/bin/bash
# 用法: ./deploy.sh <registry_address> <start_block>
# 例如: ./deploy.sh 0xAbCd1234... 12345678

REGISTRY=$1
START_BLOCK=$2

if [ -z "$REGISTRY" ] || [ -z "$START_BLOCK" ]; then
  echo "用法: ./deploy.sh <registry_address> <start_block>"
  exit 1
fi

# 替换占位符
sed -i '' "s|REGISTRY_ADDRESS_PLACEHOLDER|$REGISTRY|g" subgraph.yaml
sed -i '' "s|startBlock: 0  # 部署后替换为合约部署时的区块号|startBlock: $START_BLOCK|g" subgraph.yaml

echo "✅ 已更新 subgraph.yaml"

# 认证 + 编译 + 部署
npx graph auth ac66d766e576e9c4067dd099681d7caf --studio
npx graph codegen
npx graph build
npx graph deploy girlsvault --studio

echo "✅ Subgraph 部署完成"
echo "部署后去 Graph Studio 复制 Query URL，填入 Vercel 环境变量 VITE_GRAPH_URL"
