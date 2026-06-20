import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

MARKETS = [
    {"id": "BJ001", "name": "北京新发地", "city": "北京", "province": "北京", "lat": 39.8234, "lng": 116.3189},
    {"id": "GZ001", "name": "广州江南", "city": "广州", "province": "广东", "lat": 23.1707, "lng": 113.2694},
    {"id": "SH001", "name": "上海辉展", "city": "上海", "province": "上海", "lat": 31.1884, "lng": 121.4482},
    {"id": "HN001", "name": "河南万邦", "city": "郑州", "province": "河南", "lat": 34.7466, "lng": 113.7746},
    {"id": "SZ001", "name": "深圳海吉星", "city": "深圳", "province": "广东", "lat": 22.6892, "lng": 114.0493},
    {"id": "CD001", "name": "成都濛阳", "city": "成都", "province": "四川", "lat": 30.9927, "lng": 104.0778},
    {"id": "WH001", "name": "武汉光霞", "city": "武汉", "province": "湖北", "lat": 30.5066, "lng": 114.3140},
    {"id": "XA001", "name": "西安朱雀", "city": "西安", "province": "陕西", "lat": 34.2321, "lng": 108.9493},
]

FRUITS = [
    {"id": "F01", "name": "苹果", "category": "仁果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "山东,陕西,甘肃,辽宁"},
    {"id": "F02", "name": "梨", "category": "仁果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "河北,山东,安徽,新疆"},
    {"id": "F03", "name": "葡萄", "category": "浆果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "新疆,河北,山东,辽宁"},
    {"id": "F04", "name": "柑橘", "category": "柑橘类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "广东,广西,福建,浙江"},
    {"id": "F05", "name": "进口香蕉", "category": "芭蕉科", "isImported": True, "domesticCounterpart": "国产香蕉", "mainOrigins": "厄瓜多尔,菲律宾,哥斯达黎加"},
    {"id": "F05D", "name": "国产香蕉", "category": "芭蕉科", "isImported": False, "domesticCounterpart": "", "mainOrigins": "广东,广西,海南,云南"},
    {"id": "F06", "name": "西瓜", "category": "瓜类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "山东,河南,新疆,江苏"},
    {"id": "F07", "name": "草莓", "category": "浆果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "山东,辽宁,四川,江苏"},
    {"id": "F08", "name": "荔枝", "category": "热带水果", "isImported": False, "domesticCounterpart": "", "mainOrigins": "广东,广西,福建,海南"},
    {"id": "F09", "name": "进口芒果", "category": "热带水果", "isImported": True, "domesticCounterpart": "国产芒果", "mainOrigins": "泰国,越南,菲律宾"},
    {"id": "F09D", "name": "国产芒果", "category": "热带水果", "isImported": False, "domesticCounterpart": "", "mainOrigins": "广西,海南,云南,广东"},
    {"id": "F10", "name": "桃子", "category": "核果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "山东,河北,河南,江苏"},
    {"id": "F11", "name": "进口樱桃", "category": "核果类", "isImported": True, "domesticCounterpart": "国产樱桃", "mainOrigins": "智利,美国,澳大利亚"},
    {"id": "F11D", "name": "国产樱桃", "category": "核果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "山东,辽宁,陕西,四川"},
    {"id": "F12", "name": "进口菠萝", "category": "热带水果", "isImported": True, "domesticCounterpart": "国产菠萝", "mainOrigins": "菲律宾,泰国,哥斯达黎加"},
    {"id": "F12D", "name": "国产菠萝", "category": "热带水果", "isImported": False, "domesticCounterpart": "", "mainOrigins": "广东,广西,海南,云南"},
    {"id": "F13", "name": "进口猕猴桃", "category": "浆果类", "isImported": True, "domesticCounterpart": "国产猕猴桃", "mainOrigins": "新西兰,意大利,智利"},
    {"id": "F13D", "name": "国产猕猴桃", "category": "浆果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "陕西,四川,河南,贵州"},
    {"id": "F14", "name": "进口火龙果", "category": "热带水果", "isImported": True, "domesticCounterpart": "国产火龙果", "mainOrigins": "越南,泰国,马来西亚"},
    {"id": "F14D", "name": "国产火龙果", "category": "热带水果", "isImported": False, "domesticCounterpart": "", "mainOrigins": "广西,广东,海南,贵州"},
    {"id": "F15", "name": "进口橙子", "category": "柑橘类", "isImported": True, "domesticCounterpart": "国产橙子", "mainOrigins": "美国,澳大利亚,南非"},
    {"id": "F15D", "name": "国产橙子", "category": "柑橘类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "江西,湖南,广东,四川"},
    {"id": "F16", "name": "柚子", "category": "柑橘类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "福建,广东,广西,浙江"},
    {"id": "F17", "name": "进口柠檬", "category": "柑橘类", "isImported": True, "domesticCounterpart": "国产柠檬", "mainOrigins": "美国,意大利,阿根廷"},
    {"id": "F17D", "name": "国产柠檬", "category": "柑橘类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "四川,云南,广东,广西"},
    {"id": "F18", "name": "进口蓝莓", "category": "浆果类", "isImported": True, "domesticCounterpart": "国产蓝莓", "mainOrigins": "智利,秘鲁,美国"},
    {"id": "F18D", "name": "国产蓝莓", "category": "浆果类", "isImported": False, "domesticCounterpart": "", "mainOrigins": "山东,辽宁,贵州,云南"},
    {"id": "F19", "name": "榴莲", "category": "热带水果", "isImported": True, "domesticCounterpart": "", "mainOrigins": "泰国,马来西亚,越南"},
    {"id": "F20", "name": "山竹", "category": "热带水果", "isImported": True, "domesticCounterpart": "", "mainOrigins": "泰国,马来西亚,印度尼西亚"},
]

BASE_PRICES = {
    "F01": 8.5, "F02": 6.2, "F03": 12.8, "F04": 5.5, "F05": 9.8, "F05D": 6.8,
    "F06": 3.8, "F07": 18.5, "F08": 15.6, "F09": 18.5, "F09D": 12.5, "F10": 7.8,
    "F11": 45.0, "F11D": 28.0, "F12": 8.5, "F12D": 5.8, "F13": 15.8, "F13D": 9.5,
    "F14": 10.5, "F14D": 7.2, "F15": 12.5, "F15D": 7.5, "F16": 5.2,
    "F17": 13.5, "F17D": 8.5, "F18": 38.0, "F18D": 22.0, "F19": 55.0, "F20": 38.0,
}

SEASONAL_FACTORS = {
    "F01": {1: 1.3, 2: 1.25, 3: 1.1, 4: 1.0, 5: 0.95, 6: 0.9, 7: 0.85, 8: 0.9, 9: 1.0, 10: 1.05, 11: 1.15, 12: 1.25},
    "F02": {1: 1.2, 2: 1.15, 3: 1.05, 4: 1.0, 5: 0.95, 6: 0.9, 7: 0.95, 8: 1.0, 9: 1.1, 10: 1.15, 11: 1.2, 12: 1.2},
    "F03": {1: 1.5, 2: 1.45, 3: 1.3, 4: 1.1, 5: 0.9, 6: 0.75, 7: 0.7, 8: 0.75, 9: 0.9, 10: 1.1, 11: 1.3, 12: 1.45},
    "F04": {1: 1.25, 2: 1.2, 3: 1.1, 4: 1.0, 5: 0.95, 6: 0.9, 7: 0.85, 8: 0.9, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.25},
    "F05": {1: 1.15, 2: 1.1, 3: 1.05, 4: 1.0, 5: 1.0, 6: 1.05, 7: 1.1, 8: 1.12, 9: 1.08, 10: 1.03, 11: 1.0, 12: 1.08},
    "F05D": {1: 1.08, 2: 1.05, 3: 1.0, 4: 0.98, 5: 1.0, 6: 1.05, 7: 1.08, 8: 1.1, 9: 1.05, 10: 1.0, 11: 0.98, 12: 1.03},
    "F06": {1: 2.0, 2: 1.8, 3: 1.4, 4: 1.1, 5: 0.8, 6: 0.65, 7: 0.6, 8: 0.7, 9: 0.9, 10: 1.3, 11: 1.7, 12: 1.9},
    "F07": {1: 1.8, 2: 1.6, 3: 1.2, 4: 0.8, 5: 0.6, 6: 0.7, 7: 0.9, 8: 1.1, 9: 1.3, 10: 1.5, 11: 1.7, 12: 1.8},
    "F08": {1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2, 5: 1.5, 6: 1.3, 7: 1.0, 8: 0.8, 9: 0.8, 10: 0.9, 11: 1.0, 12: 1.0},
    "F09": {1: 1.4, 2: 1.5, 3: 1.4, 4: 1.25, 5: 1.1, 6: 0.9, 7: 0.75, 8: 0.85, 9: 1.0, 10: 1.15, 11: 1.25, 12: 1.35},
    "F09D": {1: 1.2, 2: 1.3, 3: 1.25, 4: 1.15, 5: 1.0, 6: 0.85, 7: 0.7, 8: 0.75, 9: 0.9, 10: 1.05, 11: 1.15, 12: 1.2},
    "F10": {1: 1.8, 2: 1.7, 3: 1.4, 4: 1.1, 5: 0.8, 6: 0.7, 7: 0.75, 8: 0.9, 9: 1.1, 10: 1.4, 11: 1.6, 12: 1.75},
    "F11": {1: 0.7, 2: 0.8, 3: 1.0, 4: 1.4, 5: 1.7, 6: 1.6, 7: 1.3, 8: 1.1, 9: 1.0, 10: 0.9, 11: 0.8, 12: 0.75},
    "F11D": {1: 0.75, 2: 0.85, 3: 1.05, 4: 1.3, 5: 1.5, 6: 1.4, 7: 1.2, 8: 1.05, 9: 0.95, 10: 0.85, 11: 0.8, 12: 0.78},
    "F12": {1: 1.15, 2: 1.1, 3: 1.05, 4: 1.0, 5: 0.95, 6: 0.92, 7: 0.95, 8: 1.0, 9: 1.05, 10: 1.1, 11: 1.13, 12: 1.12},
    "F12D": {1: 1.08, 2: 1.05, 3: 1.0, 4: 0.98, 5: 0.95, 6: 0.93, 7: 0.95, 8: 1.0, 9: 1.03, 10: 1.05, 11: 1.08, 12: 1.07},
    "F13": {1: 1.5, 2: 1.45, 3: 1.3, 4: 1.1, 5: 0.95, 6: 0.85, 7: 0.9, 8: 1.0, 9: 1.1, 10: 1.25, 11: 1.4, 12: 1.48},
    "F13D": {1: 1.35, 2: 1.3, 3: 1.2, 4: 1.05, 5: 0.9, 6: 0.82, 7: 0.88, 8: 0.95, 9: 1.05, 10: 1.18, 11: 1.28, 12: 1.35},
    "F14": {1: 1.15, 2: 1.1, 3: 1.05, 4: 1.0, 5: 0.95, 6: 0.9, 7: 0.92, 8: 0.98, 9: 1.03, 10: 1.08, 11: 1.12, 12: 1.13},
    "F14D": {1: 1.08, 2: 1.05, 3: 1.0, 4: 0.97, 5: 0.93, 6: 0.9, 7: 0.92, 8: 0.96, 9: 1.0, 10: 1.04, 11: 1.07, 12: 1.08},
    "F15": {1: 1.4, 2: 1.35, 3: 1.2, 4: 1.05, 5: 0.95, 6: 0.9, 7: 0.85, 8: 0.9, 9: 1.0, 10: 1.15, 11: 1.28, 12: 1.38},
    "F15D": {1: 1.25, 2: 1.2, 3: 1.1, 4: 1.0, 5: 0.93, 6: 0.88, 7: 0.85, 8: 0.88, 9: 0.95, 10: 1.05, 11: 1.15, 12: 1.22},
    "F16": {1: 1.2, 2: 1.15, 3: 1.05, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.05, 10: 1.1, 11: 1.15, 12: 1.2},
    "F17": {1: 1.2, 2: 1.15, 3: 1.1, 4: 1.05, 5: 1.0, 6: 1.0, 7: 0.98, 8: 0.98, 9: 1.0, 10: 1.05, 11: 1.12, 12: 1.18},
    "F17D": {1: 1.12, 2: 1.08, 3: 1.05, 4: 1.0, 5: 0.97, 6: 0.97, 7: 0.95, 8: 0.95, 9: 0.98, 10: 1.0, 11: 1.05, 12: 1.1},
    "F18": {1: 1.7, 2: 1.6, 3: 1.4, 4: 1.15, 5: 0.85, 6: 0.65, 7: 0.58, 8: 0.7, 9: 0.95, 10: 1.25, 11: 1.5, 12: 1.65},
    "F18D": {1: 1.5, 2: 1.4, 3: 1.25, 4: 1.05, 5: 0.8, 6: 0.62, 7: 0.55, 8: 0.65, 9: 0.85, 10: 1.1, 11: 1.3, 12: 1.45},
    "F19": {1: 1.1, 2: 1.2, 3: 1.3, 4: 1.25, 5: 1.15, 6: 1.0, 7: 0.9, 8: 0.85, 9: 0.9, 10: 1.0, 11: 1.05, 12: 1.1},
    "F20": {1: 1.1, 2: 1.2, 3: 1.3, 4: 1.25, 5: 1.15, 6: 1.0, 7: 0.9, 8: 0.85, 9: 0.9, 10: 1.0, 11: 1.05, 12: 1.1},
}

MARKET_PREMIUM = {
    "BJ001": 1.1, "GZ001": 1.05, "SH001": 1.12, "HN001": 0.95,
    "SZ001": 1.08, "CD001": 0.98, "WH001": 1.0, "XA001": 0.97,
}


def get_markets_dataframe():
    return pd.DataFrame(MARKETS)


def get_fruits_dataframe():
    return pd.DataFrame(FRUITS)


def generate_daily_prices(start_date=None, days=90, seed=42):
    np.random.seed(seed)
    random.seed(seed)

    if start_date is None:
        start_date = datetime.now() - timedelta(days=days - 1)

    dates = [start_date + timedelta(days=i) for i in range(days)]
    records = []

    for date in dates:
        month = date.month
        for fruit in FRUITS:
            fruit_id = fruit["id"]
            base_price = BASE_PRICES[fruit_id]
            seasonal_factor = SEASONAL_FACTORS[fruit_id][month]

            for market in MARKETS:
                market_id = market["id"]
                market_premium = MARKET_PREMIUM[market_id]

                daily_noise = np.random.normal(0, 0.03)
                weekend_effect = 1.05 if date.weekday() >= 5 else 1.0

                avg_price = base_price * seasonal_factor * market_premium * (1 + daily_noise) * weekend_effect
                avg_price = round(max(0.5, avg_price), 2)

                high_price = round(avg_price * (1 + np.random.uniform(0.05, 0.15)), 2)
                low_price = round(avg_price * (1 - np.random.uniform(0.05, 0.15)), 2)
                open_price = round(avg_price * (1 + np.random.uniform(-0.05, 0.05)), 2)
                close_price = round(avg_price * (1 + np.random.uniform(-0.03, 0.03)), 2)
                volume = int(np.random.uniform(5000, 50000))

                records.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "fruitId": fruit_id,
                    "marketId": market_id,
                    "highPrice": high_price,
                    "lowPrice": low_price,
                    "avgPrice": avg_price,
                    "openPrice": open_price,
                    "closePrice": close_price,
                    "volume": volume,
                })

    return pd.DataFrame(records)


def generate_historical_prices(years=[2021, 2022, 2023], seed_base=100):
    historical_data = {}
    for i, year in enumerate(years):
        start_date = datetime(year, 1, 1)
        days = 365
        df = generate_daily_prices(start_date=start_date, days=days, seed=seed_base + i)
        historical_data[year] = df
    return historical_data


def generate_anomalies(daily_prices_df, num_anomalies=120, seed=2024):
    np.random.seed(seed)
    random.seed(seed)

    anomalies = []
    sample_indices = np.random.choice(len(daily_prices_df), size=num_anomalies, replace=False)

    anomaly_types = ["price_spike", "price_drop", "volume_surge", "supply_shortage"]
    anomaly_reasons = {
        "price_spike": ["极端天气影响运输", "节日需求激增", "主产区受灾减产", "进口通关延迟"],
        "price_drop": ["集中上市供过于求", "品质下滑", "替代水果冲击", "出口减少转内销"],
        "volume_surge": ["节假日备货", "促销活动", "批发市场搬迁", "大客户集中采购"],
        "supply_shortage": ["物流受阻", "产地封控", "检验检疫加强", "货源紧张"],
    }
    severity_levels = ["低", "中", "高", "严重"]

    for idx in sample_indices:
        row = daily_prices_df.iloc[idx]
        anomaly_type = random.choice(anomaly_types)
        reason = random.choice(anomaly_reasons[anomaly_type])
        severity = random.choice(severity_levels)

        price_change_pct = np.random.uniform(20, 60) if anomaly_type in ["price_spike", "price_drop"] else np.random.uniform(5, 25)
        if anomaly_type == "price_drop":
            price_change_pct = -price_change_pct

        anomalies.append({
            "id": f"ANOM{idx:05d}",
            "date": row["date"],
            "fruitId": row["fruitId"],
            "marketId": row["marketId"],
            "type": anomaly_type,
            "priceChangePct": round(price_change_pct, 2),
            "severity": severity,
            "reason": reason,
            "description": f"{row['date']} {row['marketId']}市场{row['fruitId']}价格异常波动",
        })

    return pd.DataFrame(anomalies)


def generate_weather_events(days=90, start_date=None, num_events=60, seed=3000):
    np.random.seed(seed)
    random.seed(seed)

    if start_date is None:
        start_date = datetime.now() - timedelta(days=days - 1)

    weather_types = ["暴雨", "高温", "寒潮", "台风", "大雾", "冰雹", "暴雪", "干旱"]
    impact_levels = ["轻微", "一般", "较大", "严重"]
    province_map = {
        "北京": ["BJ001"],
        "广东": ["GZ001", "SZ001"],
        "上海": ["SH001"],
        "河南": ["HN001"],
        "四川": ["CD001"],
        "湖北": ["WH001"],
        "陕西": ["XA001"],
    }
    provinces = list(province_map.keys())

    events = []
    for i in range(num_events):
        event_date = start_date + timedelta(days=random.randint(0, days - 1))
        province = random.choice(provinces)
        affected_markets = province_map[province]
        weather_type = random.choice(weather_types)
        impact = random.choice(impact_levels)
        duration = random.randint(1, 7)

        events.append({
            "id": f"WX{i:05d}",
            "date": event_date.strftime("%Y-%m-%d"),
            "province": province,
            "affectedMarkets": ",".join(affected_markets),
            "weatherType": weather_type,
            "impactLevel": impact,
            "durationDays": duration,
            "description": f"{province}{event_date.strftime('%Y-%m-%d')}发生{weather_type}天气，影响{len(affected_markets)}个市场，持续{duration}天",
        })

    return pd.DataFrame(events)


def save_all_data(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    hist_dir = os.path.join(output_dir, "historical_prices")
    os.makedirs(hist_dir, exist_ok=True)

    markets_df = get_markets_dataframe()
    fruits_df = get_fruits_dataframe()
    daily_prices_df = generate_daily_prices()
    anomalies_df = generate_anomalies(daily_prices_df)
    weather_events_df = generate_weather_events()
    historical_data = generate_historical_prices()

    markets_df.to_csv(os.path.join(output_dir, "markets.csv"), index=False, encoding="utf-8-sig")
    fruits_df.to_csv(os.path.join(output_dir, "fruits.csv"), index=False, encoding="utf-8-sig")
    daily_prices_df.to_csv(os.path.join(output_dir, "daily_prices.csv"), index=False, encoding="utf-8-sig")
    anomalies_df.to_csv(os.path.join(output_dir, "anomalies.csv"), index=False, encoding="utf-8-sig")
    weather_events_df.to_csv(os.path.join(output_dir, "weather_events.csv"), index=False, encoding="utf-8-sig")

    for year, df in historical_data.items():
        df.to_csv(os.path.join(hist_dir, f"{year}.csv"), index=False, encoding="utf-8-sig")

    print(f"数据已生成并保存到: {output_dir}")
    print(f"  markets.csv: {len(markets_df)} 行")
    print(f"  fruits.csv: {len(fruits_df)} 行")
    print(f"  daily_prices.csv: {len(daily_prices_df)} 行")
    print(f"  anomalies.csv: {len(anomalies_df)} 行")
    print(f"  weather_events.csv: {len(weather_events_df)} 行")
    for year, df in historical_data.items():
        print(f"  historical_prices/{year}.csv: {len(df)} 行")

    return {
        "markets": markets_df,
        "fruits": fruits_df,
        "daily_prices": daily_prices_df,
        "anomalies": anomalies_df,
        "weather_events": weather_events_df,
        "historical": historical_data,
    }
