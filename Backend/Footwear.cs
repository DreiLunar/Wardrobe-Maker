using System.Collections.Generic;

namespace WardrobeMaker
{
    public class Footwear : ClothingItem
    {
        public string StyleCategory { get; set; }

        public Footwear(string itemID, string name, string primaryColor, List<string> tags, string styleCategory, string imageFilePath = "")
            : base(itemID, name, primaryColor, tags, imageFilePath)

        {
            StyleCategory = styleCategory;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Footwear: {Name} | Style: {StyleCategory} | Color: {PrimaryColor} | Status: {status}";
        }
    }
}
