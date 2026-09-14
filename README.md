# Clash 全局扩展脚本

用于 Clash Verge Rev / Mihomo 的全局扩展脚本：把指定 URL 的远程规则集注册为
`rule-providers`，并将对应的 `RULE-SET` 规则插入当前订阅规则的最前面。

## 使用

1. 打开 [`global-extend-script.js`](./global-extend-script.js)。
2. 确认 `REMOTE_RULESETS` 中的 `url`，并按需修改 `PROXY_GROUP`。脚本默认使用名为
`Proxy` 的代理组，也会兼容历史配置中的 `PROXY`、`节点选择`、`自动选择`、`Auto` 等名称。
3. 将完整脚本复制到 Clash Verge Rev 的“全局扩展脚本”并保存。

对应的规则集 YAML 配置保存在 [`rule-providers.yaml`](./rule-providers.yaml)，基础运行参数
参考见 [`default-config.yaml`](./default-config.yaml)。全局扩展脚本会把规则集和规则合并到
当前订阅，不需要手动复制这两个 YAML 文件。

默认代理组参考见 [`default-config.yaml`](./default-config.yaml) 的“代理组”部分。脚本只会在
订阅完全没有代理组、但存在节点或代理提供者时自动创建 `Proxy` 和 `Auto`，不会覆盖已有
代理组配置。

`ENABLED_PROFILES` 默认为空，表示所有订阅都生效。填写订阅名称后，仅对列出的订阅生效。

## 远程规则文件要求

URL 必须能被 Clash 内核直接访问，并返回与 `behavior`、`format` 匹配的规则集。脚本
不会主动访问网络；Clash 会按照 `interval` 周期缓存和更新规则。

规则被插入到当前订阅的 `rules` 数组最前面，因此会优先于订阅中后续的冲突规则。
脚本会把逻辑目标 `Proxy` 自动解析为当前订阅中的实际代理组名称。

## 注意

- 规则集名称只能包含字母、数字、`_` 和 `-`。
- 当前配置的代理组实际名称是 `Proxy`，脚本会生成 `...,Proxy`，不会生成 `...,PROXY`。
- 如果订阅只有旧名称 `PROXY`，脚本会自动将代理组、代理组引用和旧规则目标迁移为 `Proxy`。
- 如果某个订阅没有常见名称的代理组，脚本会回退到第一个可用的代理组；也可以直接修改 `PROXY_GROUP`。
- 默认 `Auto` 使用 `url-test`，每 300 秒测速一次，延迟差小于 50 ms 时不切换节点。
- `default-config.yaml` 中的节点名只是当前配置示例，使用其他订阅时必须替换为实际节点名。
- `default-config.yaml` 中的 `proxies: []` 只是占位写法，不能用它覆盖订阅返回的节点列表。

默认配置中的字段说明参考 mihomo 官方文档：[通用配置](https://wiki.metacubex.one/en/config/general/)、
[DNS](https://wiki.metacubex.one/en/config/dns/)、[TUN](https://wiki.metacubex.one/en/config/inbound/tun/)
和[代理组](https://wiki.metacubex.one/en/config/proxy-groups/)。
