using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace WardrobeMaker
{
    public class WardrobeManager
    {
        private readonly string _dataFilePath;
        private readonly JsonSerializerOptions _jsonOptions;

        public List<ClothingItem> Inventory { get; set; }
        public List<Outfit> Lookbook { get; set; }
        public Dictionary<string, List<string>> Schedules { get; set; }

        public WardrobeManager()
        {
            Inventory = new List<ClothingItem>();
            Lookbook = new List<Outfit>();
            Schedules = new Dictionary<string, List<string>>();

            _dataFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wardrobe-data.json");
            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            LoadData();
        }

        public void AddClothing(ClothingItem item)
        {
            Inventory.Add(item);
            SaveData();
            Console.WriteLine($"[Added] {item.Name} added to inventory.");
        }

        public bool RemoveClothing(string itemId)
        {
            var item = Inventory.Find(i => i.ItemID == itemId);
            if (item != null)
            {
                Inventory.Remove(item);
                SaveData();
                return true;
            }
            return false;
        }

        public bool ToggleLaundryStatus(string itemId)
        {
            var item = Inventory.Find(i => i.ItemID == itemId);
            if (item == null)
                return false;

            item.ToggleLaundryStatus();
            SaveData();
            return true;
        }

        public bool RemoveOutfit(string outfitId)
        {
            var outfit = Lookbook.Find(o => o.OutfitID == outfitId);
            if (outfit != null)
            {
                Lookbook.Remove(outfit);
                var datesToUpdate = Schedules.Where(s => s.Value.Contains(outfitId)).Select(s => s.Key).ToList();
                foreach (var date in datesToUpdate)
                {
                    Schedules[date].Remove(outfitId);
                    if (Schedules[date].Count == 0)
                    {
                        Schedules.Remove(date);
                    }
                }

                SaveData();
                return true;
            }
            return false;
        }

        public void AddOutfit(Outfit outfit)
        {
            Lookbook.Add(outfit);
            SaveData();
        }

        public void UpdateSchedule(string date, string outfitId)
        {
            if (!Schedules.ContainsKey(date))
            {
                Schedules[date] = new List<string>();
            }

            if (!Schedules[date].Contains(outfitId))
            {
                Schedules[date].Add(outfitId);
            }

            SaveData();
        }

        public void RemoveSchedule(string date, string outfitId = null)
        {
            if (!Schedules.ContainsKey(date))
                return;

            if (outfitId != null)
            {
                Schedules[date].Remove(outfitId);
                if (Schedules[date].Count == 0)
                {
                    Schedules.Remove(date);
                }
            }
            else
            {
                Schedules.Remove(date);
            }

            SaveData();
        }

        public List<ClothingItem> GetAvailableItems(string tag = "")
        {
            List<ClothingItem> available = new List<ClothingItem>();

            foreach (var item in Inventory)
            {
                if (!item.IsClean) continue;

                if (string.IsNullOrEmpty(tag) || item.Tags.Contains(tag) || item.PrimaryColor.Equals(tag, StringComparison.OrdinalIgnoreCase))
                {
                    available.Add(item);
                }
            }

            return available;
        }

        public Outfit GenerateOutfit(string tag)
        {
            List<ClothingItem> pool = GetAvailableItems(tag);

            List<Top> cleanTops = new List<Top>();
            List<Bottom> cleanBottoms = new List<Bottom>();
            List<Dress> cleanDresses = new List<Dress>();
            List<Footwear> cleanShoes = new List<Footwear>();

            foreach (var item in pool)
            {
                if (item is Top t) cleanTops.Add(t);
                else if (item is Bottom b) cleanBottoms.Add(b);
                else if (item is Dress d) cleanDresses.Add(d);
                else if (item is Footwear f) cleanShoes.Add(f);
            }

            if (cleanShoes.Count == 0)
            {
                Console.WriteLine("[Error] No clean footwear available.");
                return null!;
            }

            Random rand = new Random();
            bool useDress = cleanDresses.Count > 0 && (cleanTops.Count == 0 || cleanBottoms.Count == 0 || rand.Next(2) == 1);

            if (useDress && cleanDresses.Count > 0)
            {
                Dress randomDress = cleanDresses[rand.Next(cleanDresses.Count)];
                Footwear randomShoes = cleanShoes[rand.Next(cleanShoes.Count)];
                string newID = "OFT-" + rand.Next(1000, 9999);
                return new Outfit(newID, "Generated Look", randomDress, randomShoes);
            }
            else if (cleanTops.Count > 0 && cleanBottoms.Count > 0)
            {
                Top randomTop = cleanTops[rand.Next(cleanTops.Count)];
                Bottom randomBottom = cleanBottoms[rand.Next(cleanBottoms.Count)];
                Footwear randomShoes = cleanShoes[rand.Next(cleanShoes.Count)];
                string newID = "OFT-" + rand.Next(1000, 9999);
                return new Outfit(newID, "Generated Look", randomTop, randomBottom, randomShoes);
            }
            else
            {
                Console.WriteLine("[Error] Not enough clean items to build a complete outfit.");
                return null!;
            }
        }

        public void SaveData()
        {
            try
            {
                var persisted = new WardrobeData
                {
                    Inventory = Inventory.Select(ToPersistedItem).ToList(),
                    Lookbook = Lookbook.Select(ToPersistedOutfit).ToList(),
                    Schedules = Schedules
                };

                Directory.CreateDirectory(Path.GetDirectoryName(_dataFilePath) ?? string.Empty);
                var json = JsonSerializer.Serialize(persisted, _jsonOptions);
                File.WriteAllText(_dataFilePath, json);
                Console.WriteLine("[Save] Wardrobe data saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Save Error] Failed to save wardrobe data: {ex.Message}");
            }
        }

        public void LoadData()
        {
            try
            {
                if (File.Exists(_dataFilePath))
                {
                    var json = File.ReadAllText(_dataFilePath);
                    var persisted = JsonSerializer.Deserialize<WardrobeData>(json, _jsonOptions);
                    if (persisted != null)
                    {
                        Inventory = persisted.Inventory.Select(ToClothingItem).Where(item => item != null).ToList()!;
                        Lookbook = persisted.Lookbook.Select(ToOutfit).Where(outfit => outfit != null).ToList()!;
                        Schedules = persisted.Schedules ?? new Dictionary<string, List<string>>();
                        return;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Load Error] Failed to load wardrobe data: {ex.Message}");
            }

            SeedDemoData();
            SaveData();
        }

        private ClothingItem ToClothingItem(PersistedClothingItem source)
        {
            return source.Type switch
            {
                "Top" => new Top(source.ItemID, source.Name, source.PrimaryColor, source.Tags ?? new List<string>(), source.Length, source.ImageFilePath ?? string.Empty)
                {
                    IsClean = source.IsClean
                },
                "Bottom" => new Bottom(source.ItemID, source.Name, source.PrimaryColor, source.Tags ?? new List<string>(), source.Length, source.ImageFilePath ?? string.Empty)
                {
                    IsClean = source.IsClean
                },
                "Dress" => new Dress(source.ItemID, source.Name, source.PrimaryColor, source.Tags ?? new List<string>(), source.Length, source.ImageFilePath ?? string.Empty)
                {
                    IsClean = source.IsClean
                },
                "Footwear" => new Footwear(source.ItemID, source.Name, source.PrimaryColor, source.Tags ?? new List<string>(), source.Length, source.ImageFilePath ?? string.Empty)
                {
                    IsClean = source.IsClean
                },
                _ => throw new InvalidOperationException($"Unknown clothing item type: {source.Type}")
            };
        }

        private PersistedClothingItem ToPersistedItem(ClothingItem item)
        {
            return new PersistedClothingItem
            {
                ItemID = item.ItemID,
                Name = item.Name,
                PrimaryColor = item.PrimaryColor,
                Tags = item.Tags,
                ImageFilePath = item.ImageFilePath,
                IsClean = item.IsClean,
                Type = item.GetType().Name,
                Length = item is Top t ? t.Length : item is Bottom b ? b.Length : item is Dress d ? d.Length : string.Empty
            };
        }

        private Outfit? ToOutfit(PersistedOutfit source)
        {
            var top = source.TopID != null ? Inventory.OfType<Top>().FirstOrDefault(i => i.ItemID == source.TopID) : null;
            var bottom = source.BottomID != null ? Inventory.OfType<Bottom>().FirstOrDefault(i => i.ItemID == source.BottomID) : null;
            var dress = source.DressID != null ? Inventory.OfType<Dress>().FirstOrDefault(i => i.ItemID == source.DressID) : null;
            var shoes = source.ShoesID != null ? Inventory.OfType<Footwear>().FirstOrDefault(i => i.ItemID == source.ShoesID) : null;

            if (shoes == null)
                return null;

            Outfit outfit;
            if (dress != null)
            {
                outfit = new Outfit(source.OutfitID, source.OutfitName, dress, shoes);
            }
            else if (top != null && bottom != null)
            {
                outfit = new Outfit(source.OutfitID, source.OutfitName, top, bottom, shoes);
            }
            else
            {
                return null;
            }

            if (!string.IsNullOrEmpty(source.ScheduledDate) && DateTime.TryParse(source.ScheduledDate, out var scheduled))
            {
                outfit.ScheduledDate = scheduled;
            }

            return outfit;
        }

        private PersistedOutfit ToPersistedOutfit(Outfit outfit)
        {
            return new PersistedOutfit
            {
                OutfitID = outfit.OutfitID,
                OutfitName = outfit.OutfitName,
                TopID = outfit.SelectedTop?.ItemID,
                BottomID = outfit.SelectedBottom?.ItemID,
                DressID = outfit.SelectedDress?.ItemID,
                ShoesID = outfit.SelectedShoes?.ItemID,
                ScheduledDate = outfit.ScheduledDate?.ToString("yyyy-MM-dd")
            };
        }

        private void SeedDemoData()
        {
            Inventory.Clear();
            Lookbook.Clear();
            Schedules.Clear();

            Inventory.Add(new Top("TOP-001", "Classic White Tee", "White", new List<string> { "casual", "basic" }, "Short", ""));
            Inventory.Add(new Top("TOP-002", "Denim Jacket", "Blue", new List<string> { "layering", "vintage" }, "Long", ""));
            Inventory.Add(new Top("TOP-003", "Black Turtleneck", "Black", new List<string> { "formal", "winter" }, "Long", ""));
            Inventory.Add(new Bottom("BOT-001", "Slim Fit Jeans", "Blue", new List<string> { "casual", "denim" }, "Slim", ""));
            Inventory.Add(new Bottom("BOT-002", "Chino Shorts", "Beige", new List<string> { "summer", "casual" }, "Regular", ""));
            Inventory.Add(new Bottom("BOT-003", "Black Dress Pants", "Black", new List<string> { "formal", "work" }, "Regular", ""));
            Inventory.Add(new Dress("DRS-001", "Summer Maxi Dress", "Red", new List<string> { "summer", "casual", "boho" }, "Maxi", ""));
            Inventory.Add(new Dress("DRS-002", "Little Black Dress", "Black", new List<string> { "formal", "party", "elegant" }, "Mini", ""));
            Inventory.Add(new Dress("DRS-003", "Floral Midi Dress", "Pink", new List<string> { "spring", "floral", "casual" }, "Midi", ""));
            Inventory.Add(new Footwear("FTW-001", "White Sneakers", "White", new List<string> { "casual", "sporty" }, "Casual", ""));
            Inventory.Add(new Footwear("FTW-002", "Brown Leather Boots", "Brown", new List<string> { "formal", "winter" }, "Dress", ""));
            Inventory.Add(new Footwear("FTW-003", "Running Shoes", "Gray", new List<string> { "sporty", "active" }, "Athletic", ""));
        }

        private class WardrobeData
        {
            public List<PersistedClothingItem> Inventory { get; set; } = new();
            public List<PersistedOutfit> Lookbook { get; set; } = new();
            public Dictionary<string, List<string>> Schedules { get; set; } = new();
        }

        private class PersistedClothingItem
        {
            public string ItemID { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string PrimaryColor { get; set; } = string.Empty;
            public List<string> Tags { get; set; } = new();
            public string ImageFilePath { get; set; } = string.Empty;
            public bool IsClean { get; set; }
            public string Type { get; set; } = string.Empty;
            public string Length { get; set; } = string.Empty;
        }

        private class PersistedOutfit
        {
            public string OutfitID { get; set; } = string.Empty;
            public string OutfitName { get; set; } = string.Empty;
            public string? TopID { get; set; }
            public string? BottomID { get; set; }
            public string? DressID { get; set; }
            public string? ShoesID { get; set; }
            public string? ScheduledDate { get; set; }
        }
    }
}
