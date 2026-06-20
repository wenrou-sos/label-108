import os
import sys
import shutil

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_generator import save_all_data
from src.data_cleaner import DataCleaner
from src.price_analyzer import PriceAnalyzer
from src.anomaly_detector import AnomalyDetector
from src.seasonal_analyzer import SeasonalAnalyzer
from src.weather_analyzer import WeatherAnalyzer


def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(backend_dir, "data")
    frontend_data_dir = os.path.join(backend_dir, "..", "public", "data")
    frontend_historical_dir = os.path.join(frontend_data_dir, "historical_prices")

    print("=" * 60)
    print("水果批发市场数据生成工具")
    print("=" * 60)

    print("\n[1/5] 生成原始模拟数据...")
    raw_data = save_all_data(data_dir)

    print("\n[2/5] 执行数据清洗...")
    cleaner = DataCleaner()
    cleaned_data = cleaner.clean_all(raw_data)
    stats = cleaner.get_stats()
    print("数据清洗统计:")
    for name, info in stats.items():
        print(f"  {name}: 移除 {info['removed']} 条, 剩余 {info['remaining']} 条")

    hist_dir = os.path.join(data_dir, "historical_prices")
    os.makedirs(hist_dir, exist_ok=True)

    cleaned_data["markets"].to_csv(os.path.join(data_dir, "markets.csv"), index=False, encoding="utf-8-sig")
    cleaned_data["fruits"].to_csv(os.path.join(data_dir, "fruits.csv"), index=False, encoding="utf-8-sig")
    cleaned_data["daily_prices"].to_csv(os.path.join(data_dir, "daily_prices.csv"), index=False, encoding="utf-8-sig")
    cleaned_data["anomalies"].to_csv(os.path.join(data_dir, "anomalies.csv"), index=False, encoding="utf-8-sig")
    cleaned_data["weather_events"].to_csv(os.path.join(data_dir, "weather_events.csv"), index=False, encoding="utf-8-sig")

    for year, df in cleaned_data["historical"].items():
        df.to_csv(os.path.join(hist_dir, f"{year}.csv"), index=False, encoding="utf-8-sig")

    print("\n[3/5] 执行价格分析示例...")
    try:
        analyzer = PriceAnalyzer(cleaned_data["daily_prices"])
        summary = analyzer.get_price_summary()
        print(f"  价格概览: {len(summary)} 个水果品种已分析")
        top = analyzer.get_top_gainers_losers(top_n=3)
        print(f"  Top3 涨幅: {list(top['gainers']['fruitId'].values)}")
        print(f"  Top3 跌幅: {list(top['losers']['fruitId'].values)}")
    except Exception as e:
        print(f"  价格分析警告: {e}")

    print("\n[4/5] 执行异常检测示例...")
    try:
        detector = AnomalyDetector(cleaned_data["daily_prices"])
        anomaly_summary = detector.get_anomaly_summary()
        print(f"  检测到异常事件总数: {anomaly_summary['totalAnomalies']}")
    except Exception as e:
        print(f"  异常检测警告: {e}")

    print("\n[5/5] 复制数据到前端目录...")
    os.makedirs(frontend_data_dir, exist_ok=True)
    os.makedirs(frontend_historical_dir, exist_ok=True)

    files_to_copy = ["markets.csv", "fruits.csv", "daily_prices.csv", "anomalies.csv", "weather_events.csv"]
    for filename in files_to_copy:
        src = os.path.join(data_dir, filename)
        dst = os.path.join(frontend_data_dir, filename)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"  复制 {filename}")

    for year in [2021, 2022, 2023]:
        src = os.path.join(hist_dir, f"{year}.csv")
        dst = os.path.join(frontend_historical_dir, f"{year}.csv")
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"  复制 historical_prices/{year}.csv")

    print("\n" + "=" * 60)
    print("数据生成完成!")
    print(f"后端数据目录: {data_dir}")
    print(f"前端数据目录: {frontend_data_dir}")
    print("=" * 60)

    print("\n数据概览:")
    print(f"  markets.csv: {len(cleaned_data['markets'])} 条市场记录")
    print(f"  fruits.csv: {len(cleaned_data['fruits'])} 条水果记录")
    print(f"  daily_prices.csv: {len(cleaned_data['daily_prices'])} 条日价格记录 (90天×20品种×8市场=14400)")
    print(f"  anomalies.csv: {len(cleaned_data['anomalies'])} 条异常事件")
    print(f"  weather_events.csv: {len(cleaned_data['weather_events'])} 条天气事件")
    for year, df in cleaned_data["historical"].items():
        print(f"  historical_prices/{year}.csv: {len(df)} 条历史记录")


if __name__ == "__main__":
    main()
