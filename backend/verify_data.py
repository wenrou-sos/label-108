import pandas as pd
import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)


def check_dir(data_dir, label):
    print(f"\n====== {label} ======")
    print(f"目录: {data_dir}")
    files = ["markets.csv", "fruits.csv", "daily_prices.csv", "anomalies.csv", "weather_events.csv"]
    all_ok = True

    for f in files:
        path = os.path.join(data_dir, f)
        if os.path.exists(path):
            df = pd.read_csv(path)
            print(f"  {f}: {len(df)} 行")
            if f == "markets.csv":
                names = list(df["name"].values)
                print(f"    市场列表: {names}")
                if len(df) != 8:
                    print(f"    !!! 警告: 市场数量应为8，实际为{len(df)}")
                    all_ok = False
            elif f == "fruits.csv":
                print(f"    水果品种数: {len(df)}")
                names = list(df["name"].head(5).values)
                print(f"    前5个水果: {names}")
                if len(df) != 20:
                    print(f"    !!! 警告: 水果数量应为20，实际为{len(df)}")
                    all_ok = False
            elif f == "daily_prices.csv":
                print(f"    日期范围: {df['date'].min()} ~ {df['date'].max()}")
                print(f"    唯一日期数: {df['date'].nunique()}, 唯一水果: {df['fruitId'].nunique()}, 唯一市场: {df['marketId'].nunique()}")
                print(f"    价格统计 - highPrice: {df['highPrice'].mean():.2f}, lowPrice: {df['lowPrice'].mean():.2f}, avgPrice: {df['avgPrice'].mean():.2f}")
                print(f"    交易量: {df['volume'].mean():.0f} (平均)")
                expected = df['date'].nunique() * df['fruitId'].nunique() * df['marketId'].nunique()
                if len(df) < 14400:
                    print(f"    !!! 警告: 日价格记录应至少14400条，实际为{len(df)}")
                    all_ok = False
            elif f == "anomalies.csv":
                types = df["type"].value_counts().to_dict()
                print(f"    异常类型分布: {types}")
            elif f == "weather_events.csv":
                weather = df["weatherType"].value_counts().to_dict()
                print(f"    天气类型: {weather}")
        else:
            print(f"  {f}: 不存在!")
            all_ok = False

    hist_dir = os.path.join(data_dir, "historical_prices")
    if os.path.exists(hist_dir):
        print(f"  historical_prices/:")
        for year in ["2021.csv", "2022.csv", "2023.csv"]:
            path = os.path.join(hist_dir, year)
            if os.path.exists(path):
                df = pd.read_csv(path)
                print(f"    {year}: {len(df)} 行, 日期: {df['date'].min()} ~ {df['date'].max()}")
                if len(df) < 365 * 20 * 8 - 1000:
                    print(f"      !!! 警告: 历史记录可能不足")
                    all_ok = False
            else:
                print(f"    {year}: 不存在!")
                all_ok = False
    else:
        print(f"  historical_prices/: 目录不存在!")
        all_ok = False

    return all_ok


def main():
    backend_data = os.path.join(backend_dir, "data")
    frontend_data = os.path.join(project_root, "src", "data")

    ok1 = check_dir(backend_data, "后端数据目录 (backend/data)")
    ok2 = check_dir(frontend_data, "前端数据目录 (src/data)")

    print("\n" + "=" * 60)
    if ok1 and ok2:
        print("数据验证通过: 所有文件齐全且数据量充足!")
    else:
        print("数据验证存在问题，请检查上述警告!")
    print("=" * 60)

    return 0 if (ok1 and ok2) else 1


if __name__ == "__main__":
    sys.exit(main())
