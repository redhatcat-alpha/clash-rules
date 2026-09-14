// Clash Verge Rev / Mihomo 全局扩展脚本
//
// 用法：确认 REMOTE_RULESETS 中的 url，并按需修改 PROXY_GROUP，然后将本文件
// 内容粘贴到“全局扩展脚本”。
//
// 脚本本身不会发起网络请求。Clash 会根据 rule-providers.url 定期拉取规则，
// 因此订阅更新时无需重新修改脚本。

// 空数组：应用到所有订阅；填写订阅名称后，只应用到指定订阅。
const ENABLED_PROFILES = [];

// 代理规则的逻辑目标。脚本会优先查找这个名称，并兼容大小写差异。
// 当前配置使用的代理组名称是 "Proxy"（大小写敏感）。
const PROXY_GROUP = "Proxy";

// 当订阅完全没有 proxy-groups，但有可用节点时，自动创建下面这两个默认组。
// 已有 proxy-groups 的订阅不会被这段默认配置覆盖。
const DEFAULT_AUTO_GROUP = "Auto";
const DEFAULT_TEST_URL = "http://www.gstatic.com/generate_204";
const DEFAULT_TEST_INTERVAL = 300;
const DEFAULT_TEST_TOLERANCE = 50;

// 每个规则集都会被添加到当前配置的 rule-providers，并按 PREPEND_RULES
// 中的顺序插入 rules 最前面。
const REMOTE_RULESETS = [
  {
    // 只能使用字母、数字、下划线和短横线；同名规则集会被本脚本接管。
    name: "reject",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    behavior: "domain",
    path: "./ruleset/reject.yaml",
    proxy: "REJECT",
    interval: 86400,
  },
  {
    name: "icloud",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    behavior: "domain",
    path: "./ruleset/icloud.yaml",
    proxy: "DIRECT",
    interval: 86400,
  },
  {
    name: "apple",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    behavior: "domain",
    path: "./ruleset/apple.yaml",
    proxy: "DIRECT",
    interval: 86400,
  },
  {
    name: "google",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
    behavior: "domain",
    path: "./ruleset/google.yaml",
    proxy: "Proxy",
    interval: 86400,
  },
  {
    name: "proxy",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    behavior: "domain",
    path: "./ruleset/proxy.yaml",
    proxy: "Proxy",
    interval: 86400,
  },
  {
    name: "direct",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    behavior: "domain",
    path: "./ruleset/direct.yaml",
    proxy: "DIRECT",
    interval: 86400,
  },
  {
    name: "private",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    behavior: "domain",
    path: "./ruleset/private.yaml",
    proxy: "DIRECT",
    interval: 86400,
  },
  {
    name: "gfw",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    behavior: "domain",
    path: "./ruleset/gfw.yaml",
    proxy: "Proxy",
    interval: 86400,
  },
  {
    name: "tld-not-cn",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    behavior: "domain",
    path: "./ruleset/tld-not-cn.yaml",
    proxy: "Proxy",
    interval: 86400,
  },
  {
    name: "telegramcidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    behavior: "ipcidr",
    path: "./ruleset/telegramcidr.yaml",
    proxy: "Proxy",
    interval: 86400,
  },
  {
    name: "cncidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    behavior: "ipcidr",
    path: "./ruleset/cncidr.yaml",
    proxy: "DIRECT",
    interval: 86400,
  },
  {
    name: "lancidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    behavior: "ipcidr",
    path: "./ruleset/lancidr.yaml",
    proxy: "DIRECT",
    interval: 86400,
  },
  {
    name: "applications",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
    behavior: "classical",
    path: "./ruleset/applications.yaml",
    proxy: "DIRECT",
    interval: 86400,
  },
];

// 这些规则会整体覆盖订阅中同名 RULE-SET 的引用，并置于订阅规则之前。
const PREPEND_RULES = [
  "RULE-SET,applications,DIRECT",
  "DOMAIN,clash.razord.top,DIRECT",
  "DOMAIN,yacd.haishan.me,DIRECT",
  "RULE-SET,private,DIRECT",
  "RULE-SET,reject,REJECT",
  "RULE-SET,icloud,DIRECT",
  "RULE-SET,apple,DIRECT",
  "RULE-SET,google,Proxy",
  "RULE-SET,proxy,Proxy",
  "RULE-SET,direct,DIRECT",
  "RULE-SET,lancidr,DIRECT",
  "RULE-SET,cncidr,DIRECT",
  "RULE-SET,telegramcidr,Proxy",
  "GEOIP,LAN,DIRECT",
  "GEOIP,CN,DIRECT",
  "MATCH,Proxy",
];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidProviderName(name) {
  return /^[A-Za-z0-9_-]+$/.test(name);
}

function shouldApply(profileName) {
  if (ENABLED_PROFILES.length === 0) {
    return true;
  }

  if (!isNonEmptyString(profileName)) {
    return false;
  }

  return ENABLED_PROFILES.indexOf(profileName) !== -1;
}

function findProxyGroup(config) {
  var groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];
  var candidates = [PROXY_GROUP, "PROXY", "Proxy", "节点选择", "自动选择", "Auto"];

  for (var i = 0; i < candidates.length; i += 1) {
    for (var j = 0; j < groups.length; j += 1) {
      if (groups[j] && isNonEmptyString(groups[j].name) &&
          groups[j].name.toLowerCase() === candidates[i].toLowerCase()) {
        return groups[j].name;
      }
    }
  }

  // 没有常见名称时，使用第一个可用的代理组，保证全局脚本能跨订阅工作。
  for (var k = 0; k < groups.length; k += 1) {
    var type = groups[k] && groups[k].type;
    if (groups[k] && isNonEmptyString(groups[k].name) &&
        ["select", "url-test", "fallback", "load-balance", "smart"].indexOf(type) !== -1) {
      return groups[k].name;
    }
  }

  return null;
}

function resolveProxyTarget(target, proxyGroup) {
  if (String(target || "").toUpperCase() === "PROXY") {
    return proxyGroup;
  }

  return target;
}

function renameLegacyProxyGroup(config) {
  var groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];
  var hasPreferredGroup = groups.some(function (group) {
    return group && group.name === PROXY_GROUP;
  });

  // 用户明确要求使用 Proxy；只有旧组名 PROXY 存在时才自动迁移，避免覆盖同名组。
  if (hasPreferredGroup) {
    return;
  }

  var legacyGroup = groups.filter(function (group) {
    return group && group.name === "PROXY";
  })[0];

  if (!legacyGroup) {
    return;
  }

  legacyGroup.name = PROXY_GROUP;

  // 同步更新其他代理组中对旧组名的引用。
  groups.forEach(function (group) {
    if (group && Array.isArray(group.proxies)) {
      group.proxies = group.proxies.map(function (name) {
        return name === "PROXY" ? PROXY_GROUP : name;
      });
    }
  });

  // 同步更新订阅原有规则中的旧目标，避免改名后留下无效引用。
  if (Array.isArray(config.rules)) {
    config.rules = config.rules.map(function (rule) {
      if (typeof rule !== "string") {
        return rule;
      }

      var fields = rule.split(",");
      var ruleType = (fields[0] || "").trim().toUpperCase();
      var targetIndex = ruleType === "MATCH" ? 1 : 2;

      if (fields.length > targetIndex && fields[targetIndex] === "PROXY") {
        fields[targetIndex] = PROXY_GROUP;
      }

      return fields.join(",");
    });
  }
}

function getNodeNames(config) {
  var proxies = Array.isArray(config.proxies) ? config.proxies : [];

  return proxies.filter(function (proxy) {
    return proxy && isNonEmptyString(proxy.name);
  }).map(function (proxy) {
    return proxy.name;
  });
}

function getProxyProviderNames(config) {
  var providers = config["proxy-providers"] || {};

  return Object.keys(providers).filter(function (name) {
    return isNonEmptyString(name);
  });
}

function ensureDefaultProxyGroups(config) {
  var groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];

  // 只在完全没有代理组时创建默认组，避免修改用户已有的分组结构。
  if (groups.length > 0) {
    return;
  }

  var nodeNames = getNodeNames(config);
  var providerNames = getProxyProviderNames(config);

  // 没有节点或代理提供者时无法组成测速组，交给 Clash 原配置处理。
  if (nodeNames.length === 0 && providerNames.length === 0) {
    return;
  }

  var autoGroup = {
    name: DEFAULT_AUTO_GROUP,
    type: "url-test",
    url: DEFAULT_TEST_URL,
    interval: DEFAULT_TEST_INTERVAL,
    tolerance: DEFAULT_TEST_TOLERANCE,
  };

  // 订阅直接提供 proxies 时使用 proxies；使用 proxy-providers 时使用 use。
  if (nodeNames.length > 0) {
    autoGroup.proxies = nodeNames;
  } else {
    autoGroup.use = providerNames;
  }

  config["proxy-groups"] = [
    {
      name: PROXY_GROUP,
      type: "select",
      proxies: [DEFAULT_AUTO_GROUP, "DIRECT"],
    },
    autoGroup,
  ];
}

function createProvider(source) {
  var provider = {
    type: "http",
    behavior: source.behavior || "classical",
    url: source.url,
    path: source.path || "./rules/" + source.name + ".yaml",
    interval: source.interval || 86400,
  };

  // format 不是所有旧版 Clash 都需要，所以仅在显式填写时输出。
  if (isNonEmptyString(source.format)) {
    provider.format = source.format;
  }

  return provider;
}

function createRule(source) {
  return "RULE-SET," + source.name + "," + source.proxy;
}

// Clash Verge Rev 的全局扩展脚本入口。
function main(config, profileName) {
  if (!config || !shouldApply(profileName)) {
    return config;
  }

  var providers = config["rule-providers"] || {};
  var injectedProviderMap = {};
  var providerProxyMap = {};
  renameLegacyProxyGroup(config);
  ensureDefaultProxyGroups(config);
  var oldRules = Array.isArray(config.rules) ? config.rules : [];
  var proxyGroup = findProxyGroup(config);

  REMOTE_RULESETS.forEach(function (source) {
    var target = resolveProxyTarget(source && source.proxy, proxyGroup);

    if (!source ||
        !isValidProviderName(source.name) ||
        !/^https?:\/\//i.test(source.url || "") ||
        !isNonEmptyString(target)) {
      console.log("Skip invalid remote ruleset: " + JSON.stringify(source));
      return;
    }

    // 同名规则集由本脚本接管，避免使用订阅中同名但内容不同的定义。
    providers[source.name] = createProvider(source);
    injectedProviderMap[source.name] = true;
    providerProxyMap[source.name] = target;
  });

  var injectedRules = PREPEND_RULES.filter(function (rule) {
    var fields = rule.split(",");
    var ruleType = (fields[0] || "").trim().toUpperCase();
    var providerName = (fields[1] || "").trim();

    return ruleType !== "RULE-SET" || injectedProviderMap[providerName];
  }).map(function (rule) {
    var fields = rule.split(",");
    var ruleType = (fields[0] || "").trim().toUpperCase();
    var providerName = (fields[1] || "").trim();

    if (ruleType === "RULE-SET" && providerProxyMap[providerName]) {
      return createRule({ name: providerName, proxy: providerProxyMap[providerName] });
    }

    // MATCH 的策略组位于第 2 段，DOMAIN/GEOIP 等规则位于第 3 段。
    var targetIndex = ruleType === "MATCH" ? 1 : 2;
    if (fields.length > targetIndex &&
        String(fields[targetIndex]).toUpperCase() === "PROXY") {
      fields[targetIndex] = proxyGroup || "DIRECT";
      return fields.join(",");
    }

    return rule;
  });

  if (injectedRules.length === 0) {
    return config;
  }

  // 去重使脚本即使被重复执行也不会不断追加相同规则。
  var remainingRules = oldRules.filter(function (rule) {
    if (typeof rule !== "string") {
      return true;
    }

    var fields = rule.split(",");
    var ruleType = (fields[0] || "").trim().toUpperCase();
    var providerName = (fields[1] || "").trim();

    // 清理所有指向同名规则集的旧 RULE-SET，即使旧规则指向了别的策略组。
    return !(ruleType === "RULE-SET" && injectedProviderMap[providerName]);
  });

  config["rule-providers"] = providers;
  // 放在最前面，远程规则优先于订阅中后面的冲突规则。
  config.rules = injectedRules.concat(remainingRules);

  return config;
}
