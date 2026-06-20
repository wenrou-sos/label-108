import pandas as pd
import numpy as np


class WeatherAnalyzer:
    def __init__(self, daily_prices_df, weather_events_df):
        self.prices_df = daily_prices_df.copy()
        self.prices_df["date"] = pd.to_datetime(self.prices_df["date"])

        self.weather_df = weather_events_df.copy()
        self.weather_df["date"] = pd.to_datetime(self.weather_df["date"])

    def _expand_weather_events(self):
        expanded = []
        for _, event in self.weather_df.iterrows():
            markets = str(event["affectedMarkets"]).split(",")
            for day_offset in range(event["durationDays"]):
                event_date = event["date"] + pd.Timedelta(days=day_offset)
                for market_id in markets:
                    expanded.append({
                        "date": event_date,
                        "marketId": market_id.strip(),
                        "weatherType": event["weatherType"],
                        "impactLevel": event["impactLevel"],
                        "weatherEventId": event["id"],
                        "province": event["province"],
                    })
        return pd.DataFrame(expanded)

    def analyze_weather_impact(self, fruit_id=None, market_id=None):
        expanded_weather = self._expand_weather_events()
        prices = self.prices_df.copy()

        if fruit_id:
            prices = prices[prices["fruitId"] == fruit_id]
        if market_id:
            prices = prices[prices["marketId"] == market_id]
            expanded_weather = expanded_weather[expanded_weather["marketId"] == market_id]

        merged = prices.merge(
            expanded_weather,
            on=["date", "marketId"],
            how="left",
        )
        merged["hasWeatherEvent"] = merged["weatherType"].notna()

        overall_stats = merged.groupby("hasWeatherEvent").agg(
            avgPrice=("avgPrice", "mean"),
            priceStd=("avgPrice", "std"),
            avgVolume=("volume", "mean"),
            recordCount=("date", "count"),
        ).reset_index()

        for col in ["avgPrice", "priceStd", "avgVolume"]:
            overall_stats[col] = overall_stats[col].round(2)

        by_weather_type = merged[merged["hasWeatherEvent"]].groupby("weatherType").agg(
            avgPrice=("avgPrice", "mean"),
            priceStd=("avgPrice", "std"),
            avgVolume=("volume", "mean"),
            recordCount=("date", "count"),
        ).reset_index()

        for col in ["avgPrice", "priceStd", "avgVolume"]:
            by_weather_type[col] = by_weather_type[col].round(2)

        by_impact = merged[merged["hasWeatherEvent"]].groupby("impactLevel").agg(
            avgPrice=("avgPrice", "mean"),
            priceStd=("avgPrice", "std"),
            avgVolume=("volume", "mean"),
            recordCount=("date", "count"),
        ).reset_index()

        for col in ["avgPrice", "priceStd", "avgVolume"]:
            by_impact[col] = by_impact[col].round(2)

        normal_price = overall_stats.loc[overall_stats["hasWeatherEvent"] == False, "avgPrice"].values
        weather_price = overall_stats.loc[overall_stats["hasWeatherEvent"] == True, "avgPrice"].values

        price_impact_pct = None
        if len(normal_price) > 0 and len(weather_price) > 0 and normal_price[0] > 0:
            price_impact_pct = round((weather_price[0] - normal_price[0]) / normal_price[0] * 100, 2)

        return {
            "overallComparison": overall_stats,
            "byWeatherType": by_weather_type,
            "byImpactLevel": by_impact,
            "priceImpactPct": price_impact_pct,
        }

    def analyze_by_fruit_weather(self):
        expanded_weather = self._expand_weather_events()
        merged = self.prices_df.merge(
            expanded_weather,
            on=["date", "marketId"],
            how="left",
        )
        merged["hasWeatherEvent"] = merged["weatherType"].notna()

        normal = merged[~merged["hasWeatherEvent"]].groupby("fruitId")["avgPrice"].mean()
        weather = merged[merged["hasWeatherEvent"]].groupby("fruitId")["avgPrice"].mean()

        comparison = pd.DataFrame({
            "normalPrice": normal,
            "weatherPrice": weather,
        }).reset_index()
        comparison["weatherPrice"] = comparison["weatherPrice"].fillna(comparison["normalPrice"])
        comparison["impactPct"] = ((comparison["weatherPrice"] - comparison["normalPrice"]) / comparison["normalPrice"] * 100).round(2)
        comparison["normalPrice"] = comparison["normalPrice"].round(2)
        comparison["weatherPrice"] = comparison["weatherPrice"].round(2)

        return comparison.sort_values("impactPct", ascending=False).reset_index(drop=True)

    def get_events_in_period(self, start_date, end_date, market_id=None, weather_type=None):
        events = self.weather_df.copy()
        events = events[
            (events["date"] >= pd.to_datetime(start_date)) &
            (events["date"] <= pd.to_datetime(end_date))
        ]
        if market_id:
            events = events[events["affectedMarkets"].str.contains(market_id, na=False)]
        if weather_type:
            events = events[events["weatherType"] == weather_type]

        events["date"] = events["date"].dt.strftime("%Y-%m-%d")
        return events.reset_index(drop=True)

    def get_weather_price_correlation(self, fruit_id, market_id=None, window=3):
        expanded_weather = self._expand_weather_events()
        prices = self.prices_df.copy()
        prices = prices[prices["fruitId"] == fruit_id]
        if market_id:
            prices = prices[prices["marketId"] == market_id]
            expanded_weather = expanded_weather[expanded_weather["marketId"] == market_id]

        impact_map = {"轻微": 1, "一般": 2, "较大": 3, "严重": 4}
        expanded_weather["impactScore"] = expanded_weather["impactLevel"].map(impact_map).fillna(0)

        weather_agg = expanded_weather.groupby(["date", "marketId"])["impactScore"].max().reset_index()
        weather_agg = weather_agg.rename(columns={"impactScore": "weatherImpact"})

        merged = prices.merge(weather_agg, on=["date", "marketId"], how="left")
        merged["weatherImpact"] = merged["weatherImpact"].fillna(0)
        merged = merged.sort_values(["marketId", "date"])

        merged["weatherImpactLag"] = merged.groupby("marketId")["weatherImpact"].shift(1)
        merged["priceChange"] = merged.groupby("marketId")["avgPrice"].pct_change() * 100

        valid_data = merged.dropna(subset=["priceChange", "weatherImpactLag"])
        if len(valid_data) > 2:
            correlation = valid_data["priceChange"].corr(valid_data["weatherImpactLag"])
        else:
            correlation = np.nan

        return {
            "correlation": round(correlation, 4) if not np.isnan(correlation) else None,
            "sampleSize": len(valid_data),
            "data": merged[["date", "marketId", "avgPrice", "priceChange", "weatherImpact", "weatherImpactLag"]].dropna(),
        }

    def get_extreme_weather_analysis(self):
        expanded_weather = self._expand_weather_events()
        severe_weather = expanded_weather[expanded_weather["impactLevel"].isin(["较大", "严重"])]

        if len(severe_weather) == 0:
            return {"message": "无极端天气事件数据", "results": pd.DataFrame()}

        merged = self.prices_df.merge(
            severe_weather[["date", "marketId", "weatherType", "impactLevel"]].drop_duplicates(),
            on=["date", "marketId"],
            how="inner",
        )

        normal_prices = self.prices_df.merge(
            expanded_weather[["date", "marketId"]],
            on=["date", "marketId"],
            how="left",
            indicator=True,
        )
        normal_prices = normal_prices[normal_prices["_merge"] == "left_only"]

        comparison = pd.DataFrame({
            "extremeWeatherAvg": [merged["avgPrice"].mean()],
            "normalAvg": [normal_prices["avgPrice"].mean()],
            "extremeWeatherVolume": [merged["volume"].mean()],
            "normalVolume": [normal_prices["volume"].mean()],
            "extremeEventsCount": [len(severe_weather)],
        })

        for col in ["extremeWeatherAvg", "normalAvg", "extremeWeatherVolume", "normalVolume"]:
            comparison[col] = comparison[col].round(2)

        comparison["pricePremiumPct"] = ((comparison["extremeWeatherAvg"] - comparison["normalAvg"]) / comparison["normalAvg"] * 100).round(2)
        comparison["volumeChangePct"] = ((comparison["extremeWeatherVolume"] - comparison["normalVolume"]) / comparison["normalVolume"] * 100).round(2)

        return comparison
