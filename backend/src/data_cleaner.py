import pandas as pd
import numpy as np


class DataCleaner:
    def __init__(self):
        self.cleaning_stats = {}

    def clean_markets(self, df):
        original_count = len(df)
        df = df.drop_duplicates(subset=["id"])
        df = df.dropna(subset=["id", "name", "city", "province"])
        df["name"] = df["name"].str.strip()
        df["city"] = df["city"].str.strip()
        df["province"] = df["province"].str.strip()
        self.cleaning_stats["markets"] = {"removed": original_count - len(df), "remaining": len(df)}
        return df

    def clean_fruits(self, df):
        original_count = len(df)
        df = df.drop_duplicates(subset=["id"])
        df = df.dropna(subset=["id", "name", "category"])
        df["name"] = df["name"].str.strip()
        df["category"] = df["category"].str.strip()
        df["isImported"] = df["isImported"].astype(bool)
        self.cleaning_stats["fruits"] = {"removed": original_count - len(df), "remaining": len(df)}
        return df

    def clean_daily_prices(self, df):
        original_count = len(df)
        df = df.drop_duplicates(subset=["date", "fruitId", "marketId"])
        df = df.dropna(subset=["date", "fruitId", "marketId", "avgPrice"])

        numeric_cols = ["highPrice", "lowPrice", "avgPrice", "openPrice", "closePrice", "volume"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        df = df[(df["highPrice"] > 0) & (df["lowPrice"] > 0) & (df["avgPrice"] > 0)]
        df = df[(df["highPrice"] >= df["lowPrice"])]
        df = df[(df["avgPrice"] >= df["lowPrice"]) & (df["avgPrice"] <= df["highPrice"])]
        df = df[df["volume"] >= 0]

        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
        df = df.sort_values(["date", "fruitId", "marketId"]).reset_index(drop=True)

        self.cleaning_stats["daily_prices"] = {"removed": original_count - len(df), "remaining": len(df)}
        return df

    def clean_anomalies(self, df):
        original_count = len(df)
        df = df.drop_duplicates(subset=["id"])
        df = df.dropna(subset=["id", "date", "fruitId", "marketId", "type"])
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
        df = df.sort_values(["date", "fruitId", "marketId"]).reset_index(drop=True)
        self.cleaning_stats["anomalies"] = {"removed": original_count - len(df), "remaining": len(df)}
        return df

    def clean_weather_events(self, df):
        original_count = len(df)
        df = df.drop_duplicates(subset=["id"])
        df = df.dropna(subset=["id", "date", "province", "weatherType"])
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
        df = df.sort_values(["date", "province"]).reset_index(drop=True)
        self.cleaning_stats["weather_events"] = {"removed": original_count - len(df), "remaining": len(df)}
        return df

    def clean_all(self, data_dict):
        result = {}
        if "markets" in data_dict:
            result["markets"] = self.clean_markets(data_dict["markets"])
        if "fruits" in data_dict:
            result["fruits"] = self.clean_fruits(data_dict["fruits"])
        if "daily_prices" in data_dict:
            result["daily_prices"] = self.clean_daily_prices(data_dict["daily_prices"])
        if "anomalies" in data_dict:
            result["anomalies"] = self.clean_anomalies(data_dict["anomalies"])
        if "weather_events" in data_dict:
            result["weather_events"] = self.clean_weather_events(data_dict["weather_events"])
        if "historical" in data_dict:
            result["historical"] = {}
            for year, df in data_dict["historical"].items():
                cleaned = self.clean_daily_prices(df)
                result["historical"][year] = cleaned
                self.cleaning_stats[f"historical_{year}"] = self.cleaning_stats.pop("daily_prices")
        return result

    def get_stats(self):
        return self.cleaning_stats
