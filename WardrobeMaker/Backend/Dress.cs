using System.Collections.Generic;

namespace WardrobeMaker
{
    public class Dress : ClothingItem
    {
        public string DressLength { get; set; }
        public string Length { get; set; }

        public Dress(string itemID, string name, string primaryColor, List<string> tags, string dressLength, string imageFilePath = "")
            : base(itemID, name, primaryColor, tags, imageFilePath)
        {
            DressLength = dressLength;
            Length = dressLength;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Dress: {Name} | Length: {DressLength} | Color: {PrimaryColor} | Status: {status}";
        }
    }
}