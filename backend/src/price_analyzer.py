import pandas as pd
import numpy as np


class PriceAnalyzer:
    def __init__(self, daily_prices_df):
        self.df = daily_prices_df.copy()
        self.df["date"] = pd.to_datetime(self.df["date"])

    def get_price_change(self, fruit_id=None, market_id=None, window=7):
        df = self.df.copy()
        if fruit_id:
            df = df[df["fruitId"] == fruit_id]
        if market_id:
            df = df[df["marketId"] == market_id]

        df = df.sort_values(["fruitId", "marketId", "date"]).reset_index(drop=True)
        df["prevAvgPrice"] = df.groupby(["fruitId", "marketId"])["avgPrice"].shift(window)
        df["priceChangePct"] = np.where(
            df["prevAvgPrice"] > 0,
            ((df["avgPrice"] - df["prevAvgPrice"]) / df["prevAvgPrice"] * 100).round(2),
            np.nan,
        )
        return df

    def get_avg_price_by_fruit(self, date=None):
        df = self.df.copy()
        if date:
            df = df[df["date"] == pd.to_datetime(date)]
        result = df.groupby("fruitId").agg(
            avgPrice=("avgPrice", "mean"),
            maxPrice=("highPrice", "max"),
            minPrice=("lowPrice", "min"),
            totalVolume=("volume", "sum"),
            marketCount=("marketId", "nunique"),
        ).reset_index()
        result["avgPrice"] = result["avgPrice"].round(2)
        result["maxPrice"] = result["maxPrice"].round(2)
        result["minPrice"] = result["minPrice"].round(2)
        return result

    def get_avg_price_by_market(self, date=None):
        df = self.df.copy()
        if date:
            df = df[df["date"] == pd.to_datetime(date)]
        result = df.groupby("marketId").agg(
            avgPrice=("avgPrice", "mean"),
            maxPrice=("highPrice", "max"),
            minPrice=("lowPrice", "min"),
            totalVolume=("volume", "sum"),
            fruitCount=("fruitId", "nunique"),
        ).reset_index()
        result["avgPrice"] = result["avgPrice"].round(2)
        result["maxPrice"] = result["maxPrice"].round(2)
        result["minPrice"] = result["minPrice"].round(2)
        return result

    def get_price_trend(self, fruit_id, market_id=None):
        df = self.df.copy()
        df = df[df["fruitId"] == fruit_id]
        if market_id:
            df = df[df["marketId"] == market_id]

        if market_id:
            result = df.groupby("date").agg(
                avgPrice=("avgPrice", "mean"),
                highPrice=("highPrice", "max"),
                lowPrice=("lowPrice", "min"),
                volume=("volume", "sum"),
            ).reset_index()
        else:
            result = df.groupby("date").agg(
                avgPrice=("avgPrice", "mean"),
                highPrice=("highPrice", "max"),
                lowPrice=("lowPrice", "min"),
                volume=("volume", "sum"),
                marketCount=("marketId", "nunique"),
            ).reset_index()

        result["avgPrice"] = result["avgPrice"].round(2)
        result["highPrice"] = result["highPrice"].round(2)
        result["lowPrice"] = result["lowPrice"].round(2)
        result["date"] = pd.to_datetime(result["date"]).dt.strftime("%Y-%m-%d")
        return result

    def get_price_summary(self):
        latest_date = self.df["date"].max()
        prev_date = latest_date - pd.Timedelta(days=7)

        latest_df = self.df[self.df["date"] == latest_date]
        prev_df = self.df[self.df["date"] == prev_date]

        if len(latest_df) == 0 or len(prev_df) == 0:
            available_dates = sorted(self.df["date"].unique())
            if len(available_dates) >= 2:
                latest_date = available_dates[-1]
                prev_date = available_dates[max(0, len(available_dates) - 8)]
                latest_df = self.df[self.df["date"] == latest_date]
                prev_df = self.df[self.df["date"] == prev_date]

        latest_avg = latest_df.groupby("fruitId")["avgPrice"].mean()
        prev_avg = prev_df.groupby("fruitId")["avgPrice"].mean()

        summary = pd.DataFrame({
            "fruitId": latest_avg.index,
            "latestAvgPrice": latest_avg.values.round(2),
            "prevWeekAvgPrice": prev_avg.reindex(latest_avg.index).values.round(2),
        })
        summary["weeklyChangePct"] = np.where(
            summary["prevWeekAvgPrice"] > 0,
            ((summary["latestAvgPrice"] - summary["prevWeekAvgPrice"]) / summary["prevWeekAvgPrice"] * 100).round(2),
            0.0,
        )
        return summary

    def get_top_gainers_losers(self, top_n=5, window=7):
        summary = self.get_price_summary()
        summary_sorted = summary.sort_values("weeklyChangePct", ascending=False)
        gainers = summary_sorted.head(top_n).reset_index(drop=True)
        losers = summary_sorted.tail(top_n).iloc[::-1].reset_index(drop=True)
        return {"gainers": gainers, "losers": losers}

    def get_market_comparison(self, fruit_id):
        df = self.df[self.df["fruitId"] == fruit_id]
        result = df.groupby("marketId").agg(
            avgPrice=("avgPrice", "mean"),
            minPrice=("lowPrice", "min"),
            maxPrice=("highPrice", "max"),
            priceStd=("avgPrice", "std"),
            totalVolume=("volume", "sum"),
            avgVolume=("volume", "mean"),
        ).reset_index()
        for col in ["avgPrice", "minPrice", "maxPrice", "priceStd", "avgVolume"]:
            if col in result.columns:
                result[col] = result[col].round(2)
        result["totalVolume"] = result["totalVolume"].astype(int)
        return result
