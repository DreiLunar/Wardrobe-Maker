using System.Collections.Generic;

namespace WardrobeMaker
{
    // Inheritance
    public class Bottom : ClothingItem
    {
        public string FitType { get; set; }

        public Bottom(string itemID, string name, string primaryColor, List<string> tags, string fitType, string imageFilePath = "")
            : base(itemID, name, primaryColor, tags, imageFilePath)

        {
            FitType = fitType;
        }

        // Polymorphism
        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Bottom: {Name} | Fit: {FitType} | Color: {PrimaryColor} | Status: {status}";
        }
    }
}
