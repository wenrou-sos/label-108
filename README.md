# 果价通 - 全国水果批发市场价格行情看板系统

## 项目简介

果价通是一个专业的水果批发市场价格行情看板系统，汇总全国主要批发市场每日报价数据，提供价格趋势分析、异常检测、季节性分析、天气影响分析及进口国产对比等核心功能。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **UI组件库**: Chakra UI 2.x
- **图表库**: Recharts
- **状态管理**: Zustand
- **路由**: React Router v7
- **样式**: Tailwind CSS v4
- **CSV解析**: PapaParse

### 后端
- **语言**: Python 3.10+
- **数据处理**: pandas, numpy
- **科学计算**: scipy
- **异常检测**: 3σ算法 + 价格变动检测

## 项目结构

```
label-108/
├── public/
│   └── data/                    # 前端静态数据文件
│       ├── fruits.csv           # 水果品种数据
│       ├── markets.csv          # 批发市场数据
│       ├── daily_prices.csv     # 每日价格数据
│       ├── anomalies.csv        # 异常事件数据
│       ├── weather_events.csv   # 天气事件数据
│       └── historical_prices/   # 历史价格数据
│           ├── 2021.csv
│           ├── 2022.csv
│           └── 2023.csv
├── src/
│   ├── components/              # React组件
│   │   ├── charts/              # 图表组件
│   │   ├── StatCard.tsx         # 统计卡片
│   │   └── DashboardLayout.tsx  # 布局组件
│   ├── pages/                   # 页面组件
│   │   ├── Dashboard.tsx        # 综合看板
│   │   ├── TrendAnalysis.tsx    # 价格趋势分析
│   │   ├── AnomalyDetection.tsx # 异常检测
│   │   ├── SeasonalAnalysis.tsx # 季节性分析
│   │   ├── WeatherImpact.tsx    # 天气影响分析
│   │   └── ImportCompare.tsx    # 进口国产对比
│   ├── hooks/                   # 自定义Hooks
│   ├── store/                   # 状态管理
│   ├── utils/                   # 工具函数
│   ├── types/                   # TypeScript类型定义
│   └── theme/                   # Chakra UI主题配置
├── backend/                     # 后端Python代码
│   ├── src/
│   │   ├── data_generator.py    # 数据生成器
│   │   ├── data_cleaner.py      # 数据清洗
│   │   ├── price_analyzer.py    # 价格分析
│   │   ├── anomaly_detector.py  # 异常检测算法
│   │   ├── seasonal_analyzer.py # 季节性分析
│   │   └── weather_analyzer.py  # 天气分析
│   ├── data/                    # 生成的数据文件
│   ├── generate_data.py         # 数据生成入口脚本
│   ├── verify_data.py           # 数据验证脚本
│   └── requirements.txt         # Python依赖
└── dist/                        # 构建输出目录
```

## 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Python 3.10+

### 前端开发环境搭建

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **访问应用**
打开浏览器访问 `http://localhost:5173`

4. **构建生产版本**
```bash
npm run build
```

5. **预览生产构建**
```bash
npm run preview
```

### 后端数据生成

1. **安装Python依赖**
```bash
cd backend
pip install -r requirements.txt
```

2. **生成模拟数据**
```bash
python generate_data.py
```

脚本会自动：
- 生成90天的日价格数据
- 生成3年历史价格数据
- 生成异常事件数据
- 生成天气事件数据
- 自动将数据复制到前端 `public/data/` 目录

## 功能模块说明

### 1. 综合看板
- 实时显示今日均价指数及涨跌幅
- 异常预警数量统计
- 监测品种数统计
- 涨幅榜/跌幅榜 Top 5
- 价格行情明细表

### 2. 价格趋势分析
- K线图展示价格走势（最高价、最低价、开盘价、收盘价）
- 支持7天、30天、90天时间周期切换
- 多市场价格对比折线图
- 成交量柱状图
- 支持图表缩放和平移

### 3. 价格异常检测
- 自动识别价格异常波动（3σ算法）
- 按严重程度分级（高/中/低风险）
- 异常事件列表及原因标注
- 支持按品种、市场筛选

### 4. 季节性价格分析
- 叠加展示近3年同一品种的价格走势
- 当前价格在历史价格中的分位水平计算
- 同比/环比价格变动
- 季节性价格因子分析

### 5. 产地天气影响分析
- 时间轴标注主要产区天气预警
- 天气类型：霜冻、冰雹、台风、暴雨、干旱、高温
- 天气事件后价格滞后影响分析
- 按严重程度和天气类型筛选

### 6. 进口与国产对比
- 进口水果与国产同类价格对比
- 溢价金额及溢价率计算
- 价格走势与溢价率趋势图
- 供应量与品质等级对比

## 数据说明

### 覆盖市场（8个）
- 北京新发地
- 广州江南
- 上海辉展
- 河南万邦
- 深圳海吉星
- 成都濛阳
- 武汉光霞
- 西安朱雀

### 覆盖品种（29个）
- 国产水果：苹果、梨、葡萄、柑橘、西瓜、草莓、荔枝、桃子、柚子等
- 进口水果：进口香蕉、进口芒果、进口樱桃、进口菠萝、进口猕猴桃、进口火龙果、进口橙子、进口柠檬、进口蓝莓、榴莲、山竹
- 国产同类：国产香蕉、国产芒果、国产樱桃、国产菠萝、国产猕猴桃、国产火龙果、国产橙子、国产柠檬、国产蓝莓

## 部署说明

### 前端部署

#### 方式一：静态文件部署

1. 构建生产版本
```bash
npm run build
```

2. 将 `dist/` 目录下的所有文件部署到任意静态文件服务器（Nginx、Apache、OSS等）

3. Nginx配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /data/ {
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 方式二：Vercel / Netlify 部署

直接连接Git仓库，设置构建命令 `npm run build`，输出目录 `dist` 即可。

### 后端部署

本系统后端为离线数据处理模块，无需持续运行。如需定期更新数据：

1. 设置定时任务（crontab）
```bash
# 每天凌晨2点生成新数据
0 2 * * * cd /path/to/backend && python generate_data.py
```

2. 如需提供API服务，可基于Flask/FastAPI封装：

```python
from fastapi import FastAPI
import pandas as pd

app = FastAPI()

@app.get("/api/prices")
def get_prices(fruitId: str = None, marketId: str = None):
    df = pd.read_csv("data/daily_prices.csv")
    if fruitId:
        df = df[df["fruitId"] == fruitId]
    if marketId:
        df = df[df["marketId"] == marketId]
    return df.to_dict("records")
```

## 使用说明

### 基本操作

1. **品种筛选**：点击页面顶部的"品种筛选"按钮，可选择关注的水果品种
2. **市场筛选**：点击"市场筛选"按钮，可选择查看特定批发市场的数据
3. **时间周期**：点击时间周期按钮（近7天/近30天/近90天），切换数据展示的时间范围
4. **刷新数据**：点击"刷新"按钮重新加载数据

### 图表交互

- **缩放**：使用鼠标滚轮或拖拽选择区域进行缩放
- **平移**：按住Shift键拖拽图表进行平移
- **悬停详情**：鼠标悬停在图表数据点上查看详细数值
- **图例切换**：点击图例可显示/隐藏对应的数据系列

### 异常检测说明

系统使用3σ原则进行异常检测：
- 价格偏离均值超过3倍标准差视为异常
- 价格单日涨跌幅超过20%视为异常
- 成交量异常波动也会被检测到

异常严重程度分级：
- **高风险**：价格变动超过40%
- **中风险**：价格变动20%-40%
- **低风险**：价格变动10%-20%

## 性能指标

- 页面加载时间：< 3秒
- 图表渲染时间：< 500ms
- 数据计算准确率：> 85%
- 支持同时展示数据点：> 10000个

## 常见问题

### Q: 数据是实时的吗？
A: 当前版本使用模拟数据，数据为静态CSV文件。如需接入实时数据，可对接各批发市场的API接口。

### Q: 如何添加新的水果品种？
A: 修改 `backend/src/data_generator.py` 中的 `FRUITS` 和 `BASE_PRICES` 配置，然后重新运行数据生成脚本。

### Q: 如何修改市场列表？
A: 修改 `backend/src/data_generator.py` 中的 `MARKETS` 配置，然后重新生成数据。

### Q: 支持移动端访问吗？
A: 支持，系统采用响应式设计，适配手机、平板、桌面等多种设备。

### Q: 如何更换主题色？
A: 修改 `src/theme/index.ts` 中的颜色配置，Chakra UI会自动应用。

## 开发者信息

本项目使用 React + Chakra UI + Python 技术栈开发，代码结构清晰，易于扩展。

---

© 2024 果价通 - 水果价格监测平台
