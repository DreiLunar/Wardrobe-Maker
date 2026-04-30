using System.Collections.Generic;

namespace WardrobeMaker
{
    // Inheritance
    public class Top : ClothingItem
    {
        public string SleeveType { get; set; }

        public Top(string itemID, string name, string primaryColor, List<string> tags, string sleeveType, string imageFilePath = "")
            : base(itemID, name, primaryColor, tags, imageFilePath)

        {
            SleeveType = sleeveType;
        }

        // Polymorphism
        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Top: {Name} | Sleeves: {SleeveType} | Color: {PrimaryColor} | Status: {status}";
        }
    }
}
