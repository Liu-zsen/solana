import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, TokenStandard, createAndMint } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount, signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// 从文件加载密钥对
const secretKey = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config', 'solana', 'id.json'), 'utf8'));

// 初始化 Umi
const umi = createUmi('https://devnet.helius-rpc.com/?api-key=b9b71341-3e89-407c-84f5-5f2d237c70df')
  .use(mplTokenMetadata());

// 使用 Umi 的 eddsa 创建签名者
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

async function createMyToken() {
  const mint = generateSigner(umi); // 生成新的 Token Mint 地址

  // 定义 Token 元数据（使用你的昵称）
  const metadata = {
    name: "The Jason Coin",
    symbol: "MNT",
    uri: "https://example.com/metadata.json", // 可选的元数据 URI
  };

  // 创建并铸造 Token
  await createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: percentAmount(0), // 0% 版税
    decimals: 6, // 小数位数
    amount: 10000000000000, // 铸造 100000 个 Token（注意小数位调整）
    tokenOwner: umi.identity.publicKey,
    tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi);

  console.log(`Token 创建成功！Mint 地址: ${mint.publicKey}`);
  console.log(`查看 Token: https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`);
}

createMyToken().catch(console.error);