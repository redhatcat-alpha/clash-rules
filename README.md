# Clash 全局扩展脚本

用于 Clash Verge Rev / Mihomo 的全局扩展脚本：把指定 URL 的远程规则集注册为
`rule-providers`，并将对应的 `RULE-SET` 规则插入当前订阅规则的最前面。

## 使用

1. 打开 [`global-extend-script.js`](./global-extend-script.js)。
2. 确认 `REMOTE_RULESETS` 中的 `url`，并按需修改 `PROXY_GROUP`。脚本默认查找名为
   `Proxy` 的代理组，也会兼容 `PROXY`、`节点选择`、`自动选择`、`Auto` 等常见名称。
3. 将完整脚本复制到 Clash Verge Rev 的“全局扩展脚本”并保存。

对应的纯 YAML 配置也保存在 [`rule-providers.yaml`](./rule-providers.yaml)，可用于检查
规则集地址和规则顺序；实际使用全局扩展脚本时不需要再手动合并这个文件。

`ENABLED_PROFILES` 默认为空，表示所有订阅都生效。填写订阅名称后，仅对列出的订阅生效。

## 远程规则文件要求

URL 必须能被 Clash 内核直接访问，并返回与 `behavior`、`format` 匹配的规则集。脚本
不会主动访问网络；Clash 会按照 `interval` 周期缓存和更新规则。

规则被插入到当前订阅的 `rules` 数组最前面，因此会优先于订阅中后续的冲突规则。
脚本会把逻辑目标 `PROXY` 自动解析为当前订阅中的实际代理组名称。

## 注意

- 规则集名称只能包含字母、数字、`_` 和 `-`。
- 当前报错配置的代理组实际名称是 `Proxy`，脚本已将 `PROXY` 逻辑目标自动解析为该名称。
- 如果某个订阅没有常见名称的代理组，脚本会回退到第一个可用的代理组；也可以直接修改 `PROXY_GROUP`。
