using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace WardrobeMaker
{
    [JsonDerivedType(typeof(Top), typeDiscriminator: "Top")]
    [JsonDerivedType(typeof(Bottom), typeDiscriminator: "Bottom")]
    [JsonDerivedType(typeof(Footwear), typeDiscriminator: "Footwear")]
    public abstract class ClothingItem
    {
        public string ItemID { get; set; }
        public string Name { get; set; }
        public string ImageFilePath { get; set; }
        public string PrimaryColor { get; set; }
        public List<string> Tags { get; set; }
        public bool IsClean { get; private set; }

        public ClothingItem(string itemID, string name, string primaryColor, List<string> tags)
        {
            ItemID = itemID;
            Name = name;
            PrimaryColor = primaryColor;
            Tags = tags;
            ImageFilePath = "";
            IsClean = true;
        }

        public void ToggleLaundryStatus()
        {
            IsClean = !IsClean;
        }

        public abstract string GetDetails();
    }
}