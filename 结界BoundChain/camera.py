import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3

# ==========================================
# 1. 基础配置与 Flask 初始化
# ==========================================
app = Flask(__name__)
CORS(app) # 允许跨域请求，因为前端 HTML 会直接调用这个接口

# 模拟本地安全存储区（实际硬件中可能是 TPM 或 TEE 环境）
KEY_FILE = "device_private_key.txt"

# ==========================================
# 2. 核心密码学模块：设备身份初始化
# ==========================================
def load_or_create_identity():
    """
    启动时加载设备的私钥。如果不存在，则生成一个新的。
    这保证了设备每次重启，其区块链上的身份（公钥地址）是不变的。
    """
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, 'r') as f:
            private_key = f.read().strip()
            account = Account.from_key(private_key)
            print(f"[*] 设备已唤醒，加载已有身份。")
    else:
        # 使用 ECDSA 算法生成新的以太坊账户
        account = Account.create()
        with open(KEY_FILE, 'w') as f:
            f.write(account.key.hex())
        print(f"[*] 首次启动，已生成全新设备身份，私钥已安全存储。")
    
    print(f"[-] 设备的区块链身份证 (公钥地址): {account.address}")
    return account

# 初始化设备账户
device_account = load_or_create_identity()

# ==========================================
# 3. 区块链查询模块 (连接 Sepolia 测试网)
# ==========================================
# 注意：这里需要替换为你的 Infura 或 Alchemy 的 Sepolia 节点 URL
# 为了先让本地逻辑跑通，我们先写好结构，后面可以填入真实的 URL 和 合约地址
RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID" 
CONTRACT_ADDRESS = "0x你的智能合约地址" # 填入你刚才在 Remix 部署的地址

# 简化的 ABI (只包含我们需要调用的 checkAccess 函数)
CONTRACT_ABI = json.loads('[{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"address","name":"_device","type":"address"}],"name":"checkAccess","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]')

def check_acl_on_chain(user_address):
    """
    (预留函数) 拿着用户的地址，去区块链上查询是否有权限。
    """
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        # 调用智能合约的 checkAccess 函数 (不消耗 Gas)
        has_access = contract.functions.checkAccess(user_address, device_account.address).call()
        return has_access
    except Exception as e:
        print(f"[!] 区块链查询失败，可能未配置 RPC URL: {e}")
        # 为了方便本地测试，如果没配置网络，暂时默认放行（正式演示时需改为 False）
        return True 

# ==========================================
# 4. Web 服务与验签模块 (监听端口)
# ==========================================
@app.route('/access', methods=['POST'])
def request_access():
    """
    核心接口：接收前端 Web 发来的访问请求、明文信息和数字签名
    """
    data = request.json
    user_address = data.get('user_address')
    message_text = data.get('message') # 前端发来的明文，例如："请求访问摄像头, 时间: 1711..."
    signature = data.get('signature')  # MetaMask 生成的签名
    
    print(f"\n[>>>] 收到来自 {user_address} 的访问请求")

    # 第一关：密码学防伪验证 (本地极速验签)
    try:
        # 按照以太坊的标准格式包装明文消息
        message_encoded = encode_defunct(text=message_text)
        # 核心网安逻辑：通过“明文”和“签名”，利用椭圆曲线算法反推出“公钥地址”
        recovered_address = Account.recover_message(message_encoded, signature=signature)
        
        # 严格比对：反推出来的地址，必须和声称的 user_address 一模一样
        if recovered_address.lower() != user_address.lower():
            print("[!] 警报：签名伪造或被篡改！")
            return jsonify({"status": "error", "message": "签名验证失败！"}), 401
        
        print("[+] 第一关通过：数字签名验证成功，请求未被篡改。")
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"签名解析错误: {str(e)}"}), 400

    # 第二关：区块链 ACL 权限验证 (查询 Sepolia)
    print("[-] 正在向区块链请求 ACL 权限验证...")
    has_access = check_acl_on_chain(user_address)
    
    if not has_access:
        print("[!] 警报：该用户无权访问此设备！")
        return jsonify({"status": "error", "message": "区块链拒绝访问：无权限！"}), 403

    # 两关全部通过，下发视频流（模拟）
    print("[*] 认证全部通过！开始推送视频流...")
    return jsonify({
        "status": "success", 
        "message": "身份认证与权限校验通过！",
        "video_stream_url": "https://dummy-video-stream.local/live"
    }), 200

if __name__ == '__main__':
    # 启动设备，监听本地 5000 端口
    print("\n==================================================")
    print("   [区块链物联网身份认证系统 - 虚拟设备端已启动]   ")
    print("==================================================")
    app.run(host='0.0.0.0', port=5000)