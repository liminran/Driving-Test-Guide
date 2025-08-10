# 离线签名兑换码使用说明

本方案无需服务器，部署在 GitHub Pages 即可完成“设备绑定 + 3年有效 + 防伪”的兑换码激活。

## 一、原理
- 你在本地用私钥签发兑换码（JWS: RS256）。
- 前端内置公钥，收到兑换码后用 WebCrypto 验签，同时校验：
  - 码中 deviceId 必须等于当前设备的 `deviceId`
  - 码在 `expiresAt` 之前
  - 通过后在本地永久开通“终身版”

## 二、准备
1. 生成密钥对
   ```bash
   node scripts/generate-keys-and-code.js gen-key
   # 生成 private.pem 与 public.pem
   ```
2. 将 `public.pem` 的内容粘贴到 `src/utils/premiumSigned.js` 中的 `PUBLIC_KEY_PEM`（替换占位内容）。
3. 重新构建/部署到 GitHub Pages。

## 三、获取用户设备ID
- 用户打开应用（GitHub Pages），进入“设置 → 会员中心”，页面会显示“本设备ID”。
- 让用户把该 `deviceId` 发给你。

## 四、签发兑换码（离线）
- 在你的电脑上运行：
  ```bash
  # 生成三年有效的终身兑换码，绑定到该设备
  node scripts/generate-keys-and-code.js sign --device <设备ID> --years 3 --plan lifetime --out code.txt
  ```
- 把 `code.txt` 中的那段长字符串发给用户。

## 五、用户激活
- 用户在“会员中心 → 兑换码激活”输入刚才收到的兑换码并提交。
- 前端将：验签 → 校验设备ID/有效期 → 通过后自动开通终身版。

## 六、常见问题
- 更换浏览器/清空本地存储是否影响？
  - 兑换码是绑定设备ID（你定义的ID），不是浏览器存储；如果用户换环境但仍为同一设备ID，仍然可以使用同一码激活成功。
  - 若设备ID策略基于本地生成且不可跨环境，则更换环境会被视为新设备。可在 `getOrCreateDeviceId` 中替换为更稳定的指纹方案。
- 想吊销已发出去的码？
  - 纯静态前端无法集中吊销。需配合后端黑名单 API 或重新换公钥/版本。
- 想支持非 Web（原生App）的离线验签？
  - 需在原生端使用对应的加密库完成 RS256 验签，或改用对称HMAC并谨慎放置Key（风险较大）。

## 七、安全建议
- 妥善保管 `private.pem`（只在你本地）。
- 公钥可公开，放在前端即可。
- 发行时最好使用安全的传输方式把兑换码发给用户（邮件/私信），并尽量避免在公开场合泄露。
