/* ============================================================
   鎏行者 · 数字旅程
   ------------------------------------------------------------
   【使用说明】
   1. 在下方 CONFIG 中填入你的 DeepSeek API Key (platform.deepseek.com)
   2. 将图片文件放到 assets/images/ 目录下（文件名见 README）
   3. 直接用浏览器打开 index.html 即可
   ============================================================ */

// ========== 配置 ==========
const CONFIG = {
  // ↓↓↓↓↓ 在下面一行填入你的 DeepSeek API Key ↓↓↓↓↓
  DEEPSEEK_API_KEY: "在这里填入你的API Key",
  API_URL: "https://api.deepseek.com/v1/chat/completions",
  MODEL: "deepseek-chat",
};

const SYSTEM_PROMPT = `你是「鎏行者」的旅程叙述者。鎏行者是一位生活在11世纪西夏王朝的丝路行者，原型为西夏鎏金铜牛文物。

【角色设定】
- 鎏行者是西夏人，熟悉党项族文化，懂汉语、藏语和粟特语
- 他体态浑厚，头戴西域头巾，额饰鎏金纹样，手持卷轴，背挎行囊，腰间悬金币
- 性格沉稳而好奇，见过很多，但仍对世界保持敬畏

【丝路历史背景知识库】
- 西夏王朝：1038-1227年，党项族建立，都城兴庆府（今银川）
- 主要丝路城市：长安、敦煌、玉门关、楼兰、龟兹、疏勒、于阗、撒马尔罕、木鹿、巴格达
- 常见货物：丝绸、茶叶、瓷器（东行）；香料、玻璃、宝石、马匹（西来）
- 常见人物：粟特商人、取经僧、色目人、回鹘商队

【叙事风格要求】
- 具体有细节，带游历感和历史感
- 不空泛说教，像一个真正走过这段路的人在讲
- 文字有温度，偶尔带一点疲惫和惊喜交织的旅人情绪
- 每次生成必须不同，体现「千人千面」

【输出格式】
必须严格按照以下JSON格式输出，不要有任何其他内容：
{
  "title": "旅程标题（不超过12字，诗意，可作为卡片上的一句话引言）",
  "narrative": "核心叙事（200-300字，具体经历，沿途城市、遇到的人、发生的事）",
  "cultural_egg": "文化彩蛋（80-120字，揭示旅程中某个细节背后的历史文化知识，用「行者手记」的口吻）",
  "days": "旅程天数（数字字符串，如 27）",
  "partner": "同行伙伴（不超过8字，如：骆驼商队、粟特商人、回鹘向导）",
  "treasure": "收获宝藏（不超过12字，如：西域香料 × 3 / 粟特银币 × 2）"
}`;

// ========== 状态 ==========
const state = {
  step: 1,
  name: "",
  start: null,
  end: null,
  identity: null,
  mood: null,
  result: null,
};

// ========== 工具函数 ==========
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.hidden = true; }, 2500);
}

/* 图片占位处理 */
function initImageFallbacks() {
  $$("img").forEach(img => {
    const markMissing = () => {
      img.classList.add("is-missing");
      const parent = img.parentElement;
      if (parent) parent.classList.add("is-empty");
    };
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener("error", markMissing);
  });
}

/* 导航 */
function initNav() {
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  // 活动菜单
  const links = $$(".nav-links a");
  links.forEach(a => a.addEventListener("click", () => {
    links.forEach(x => x.classList.remove("is-active"));
    a.classList.add("is-active");
  }));
}

/* 步骤切换 */
function goToStep(n) {
  if (n < 1 || n > 3) return;
  state.step = n;

  $$(".step-panel").forEach(p => {
    p.classList.toggle("is-active", Number(p.dataset.panel) === n);
  });
  $$(".step-item").forEach(item => {
    const s = Number(item.dataset.step);
    item.classList.toggle("is-active", s === n);
    item.classList.toggle("is-done", s < n);
  });
  $$(".step-line").forEach((line, idx) => {
    line.classList.toggle("is-done", idx + 1 < n);
  });
}

/* 卡片选择 */
function initCardSelectors() {
  // 路线（chip-row）
  $$(".chip-row").forEach(grid => {
    const field = grid.dataset.field;
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      grid.querySelectorAll(".chip").forEach(c => c.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      state[field] = btn.dataset.value;
      updateNextBtn(1);
    });
  });

  // 身份 / 心境（mini-grid）
  $$(".mini-grid").forEach(grid => {
    const field = grid.dataset.field;
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".mini-card");
      if (!btn) return;
      grid.querySelectorAll(".mini-card").forEach(c => c.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      state[field] = btn.dataset.value;
      if (field === "identity") updateNextBtn(2);
      if (field === "mood")     updateNextBtn(3);
    });
  });
}

function updateNextBtn(step) {
  if (step === 1) {
    $('[data-next="2"]').disabled = !(state.start && state.end);
  } else if (step === 2) {
    $('[data-next="3"]').disabled = !state.identity;
  } else if (step === 3) {
    $("#btn-generate").disabled = !state.mood;
  }
}

function initStepButtons() {
  $$("[data-next]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      goToStep(Number(btn.dataset.next));
    });
  });
  $$("[data-prev]").forEach(btn => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.prev)));
  });
}

/* ============================================================
   DeepSeek API
   ============================================================ */
async function generateJourney({ name, start, end, identity, mood }) {
  const userPrompt = `请为旅行者「${name || '匿名行者'}」生成一段丝路旅程：
起点：${start}
终点：${end}
旅行身份：${identity}
旅程心境：${mood}

请根据这些信息生成一段真实可信、细节丰富的旅程故事，并严格按照要求的JSON格式输出全部字段。`;

  const response = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CONFIG.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1200,
      temperature: 0.9
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`API 请求失败：${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  const clean = text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  const jsonStr = match ? match[0] : clean;

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error("解析失败，模型输出格式异常：\n" + text);
  }
}

/* ============================================================
   打字机
   ============================================================ */
function typewriter(el, text, speed = 30) {
  return new Promise(resolve => {
    el.textContent = "";
    el.classList.add("typing");
    let i = 0;
    const tick = () => {
      if (i >= text.length) {
        el.classList.remove("typing");
        resolve();
        return;
      }
      el.textContent += text.charAt(i++);
      setTimeout(tick, speed);
    };
    tick();
  });
}

/* ============================================================
   mock 数据
   ============================================================ */
function mockJourney(s, name) {
  const partners = {
    "商旅行者": "骆驼商队",
    "文化使者": "粟特向导",
    "边境护卫": "西夏兵士",
    "医药行商": "胡僧同伴"
  };
  const treasures = {
    "商旅行者": "西域香料 × 3",
    "文化使者": "佛经卷轴 × 2",
    "边境护卫": "粟特银币 × 5",
    "医药行商": "塞外草药 × 4"
  };
  const quotes = {
    "探险求知": "今日的我，充满希望与勇气",
    "思乡归途": "走过万里，终念故土月色",
    "初次出发": "一步踏出，便是新的天地",
    "历经沧桑": "风沙染白鬓，道心愈明"
  };

  return {
    title: quotes[s.mood] || "今日的我，充满希望与勇气",
    narrative: `从${s.start}启程那日，晨雾未散。这一身${s.identity === '商旅行者' ? '丝绸和香料' : s.identity === '文化使者' ? '佛经与典籍' : s.identity === '边境护卫' ? '弓弩与刀剑' : '草药与医书'}装满了三匹骆驼的驮架。出关之后，风沙便成了每日的常客。行过戈壁七日，才见到${s.end === '撒马尔罕' ? '粟特商人的青绿穹顶' : s.end === '巴格达' ? '阿拔斯王朝的金色宣礼塔' : s.end === '木鹿' ? '木鹿城外的棕榈林' : s.end === '疏勒' ? '疏勒城头的回鹘旗' : '于阗的玉石集市'}。一路遇见讲粟特语的商队、诵经的僧侣、以一壶马奶酒换我半块西夏茶砖的牧人。${s.mood === '历经沧桑' ? '走过这一路，我已记不清是第几次翻越葱岭。' : s.mood === '初次出发' ? '这是我第一次出关，连脚底的水泡都觉得新鲜。' : s.mood === '思乡归途' ? '越走越远，越想起兴庆府的家。' : '每一处陌生风物都被我写满卷轴。'}`,
    cultural_egg: `行者手记：${s.end}在11世纪是丝路上最活跃的节点之一。西夏商队用茶砖和丝绸换取大食的玻璃与香料，路上驿站多由粟特人经营——他们会说多种语言，是这条路上真正的"沟通者"。`,
    days: String(15 + Math.floor(Math.random() * 30)),
    partner: partners[s.identity] || "骆驼商队",
    treasure: treasures[s.identity] || "西域香料 × 3"
  };
}

/* ============================================================
   生成流程
   ============================================================ */
async function handleGenerate() {
  // 校验 —— 如果还没走完三步，先用默认值补齐（快速模式）
  if (!state.start)    state.start = "敦煌";
  if (!state.end)      state.end = "撒马尔罕";
  if (!state.identity) state.identity = "商旅行者";
  if (!state.mood)     state.mood = "探险求知";

  // 名字
  const nameInput = $("#traveler-name");
  state.name = (nameInput.value || "").trim() || "匿名行者";

  const btns = [$("#btn-generate"), $("#btn-generate-quick")];
  const loading = $("#loading");
  const card = $("#journey-card");

  const keyEmpty = !CONFIG.DEEPSEEK_API_KEY ||
                   CONFIG.DEEPSEEK_API_KEY.includes("填入") ||
                   CONFIG.DEEPSEEK_API_KEY.length < 10;

  btns.forEach(b => b && (b.disabled = true));
  loading.hidden = false;
  card.hidden = true;

  try {
    let result;
    if (keyEmpty) {
      await new Promise(r => setTimeout(r, 1400));
      result = mockJourney(state, state.name);
      showToast("演示数据 · 请在 app.js 中填入 API Key");
    } else {
      result = await generateJourney({ ...state });
    }
    state.result = result;
    await renderResult(result);
  } catch (err) {
    console.error(err);
    showToast("生成失败，请检查网络或 API Key");
    alert("生成失败：\n" + err.message);
  } finally {
    loading.hidden = true;
    btns.forEach(b => b && (b.disabled = false));
    // 保持最终步骤按钮禁用态与 state 一致
    updateNextBtn(state.step);
  }
}

async function renderResult(r) {
  const card = $("#journey-card");
  card.hidden = false;

  // 静态字段直接填
  $("#jc-name").textContent     = state.name;
  $("#jc-start").textContent    = state.start;
  $("#jc-end").textContent      = state.end;
  $("#jc-days").textContent     = `${r.days || "—"}天`;
  $("#jc-partner").textContent  = r.partner || "骆驼商队";
  $("#jc-treasure").textContent = r.treasure || "西域珍宝";

  // 滚动到卡片
  card.scrollIntoView({ behavior: "smooth", block: "center" });

  // 打字机
  await typewriter($("#jc-title"),     `"${r.title}"`,            80);
  await typewriter($("#jc-narrative"), r.narrative || "",         22);
  await typewriter($("#jc-egg"),       r.cultural_egg || "",      26);
}

/* ============================================================
   保存 / 分享 / 再启
   ============================================================ */
function initResultButtons() {
  $("#btn-restart").addEventListener("click", () => {
    state.start = state.end = state.identity = state.mood = state.result = null;
    $("#traveler-name").value = "";
    state.name = "";
    $$(".chip, .mini-card").forEach(c => c.classList.remove("is-selected"));
    $$("[data-next]").forEach(b => b.disabled = true);
    $("#btn-generate").disabled = true;
    $("#journey-card").hidden = true;
    goToStep(1);
    $("#generator").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#btn-save").addEventListener("click", () => copyJourney("save"));
  $("#btn-share").addEventListener("click", () => copyJourney("share"));

  // 输入名字也可直接生成
  $("#btn-generate-quick").addEventListener("click", handleGenerate);
}

async function copyJourney(mode) {
  if (!state.result) {
    showToast("请先生成一段旅程");
    return;
  }
  const r = state.result;
  const text =
`【鎏行者 · 丝旅程卡】${mode === 'share' ? ' ✦ 分享' : ''}

旅行者：${state.name}
"${r.title}"

出发地：${state.start}
目的地：${state.end}
旅程时长：${r.days}天
同行伙伴：${r.partner}
收获宝藏：${r.treasure}

── 旅程故事 ──
${r.narrative}

── 行者手记 · 文化注释 ──
${r.cultural_egg}

————————
鎏行者 · 数字旅程
毕业设计 · 西夏文物数字化文创开发`;

  try {
    await navigator.clipboard.writeText(text);
    showToast(mode === "share" ? "分享文本已复制" : "卡片已复制到剪贴板");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("已复制到剪贴板");
  }
}

/* ============================================================
   启动
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initImageFallbacks();
  initNav();
  initCardSelectors();
  initStepButtons();
  initResultButtons();
  $("#btn-generate").addEventListener("click", handleGenerate);
});
